const assert = require('assert')
const http = require('http')
const {createBrowserSso} = require('../src/utils/ssoBrowser')

const redirect = 'http://127.0.0.1:43821/oauth2/callback?attempt=test-attempt'
const target = 'https://sso.example/login?state=test-state&popup=true'
const request = url => new Promise((resolve, reject) => {
    http.get(url, res => {
        res.resume()
        res.on('end', () => resolve(res.statusCode))
    }).on('error', reject)
})
const nextTurn = () => new Promise(resolve => setImmediate(resolve))

async function main() {
    let focused = 0
    let fallback = 0
    const browser = createBrowserSso({
        openExternal: async url => {
            assert(!new URL(url).searchParams.has('popup'))
            assert.strictEqual(await request(redirect.replace('test-attempt', 'wrong') + '&code=bad&state=test-state'), 404)
            assert.strictEqual(await request(redirect + '&code=bad&state=wrong'), 404)
            assert.strictEqual(await request(redirect + '&code=valid&state=test-state'), 200)
        },
        openPopup: async () => { fallback++; return {success: true} },
        focusApp: () => focused++
    })
    const result = await browser.open(target, redirect, true)
    assert.strictEqual(result.code, 'valid')
    assert.strictEqual(result.success, true)
    assert.strictEqual(focused, 1)
    assert.strictEqual(fallback, 0)
    await nextTurn()

    const popup = createBrowserSso({
        openExternal: async () => { throw new Error('No browser') },
        openPopup: async () => { fallback++; return {success: true, code: 'popup'} },
        focusApp: () => {}
    })
    assert.strictEqual((await popup.open(target, redirect, true)).code, 'popup')
    assert.strictEqual(fallback, 1)
    await nextTurn()

    let launched
    const ready = new Promise(resolve => { launched = resolve })
    const pending = createBrowserSso({openExternal: async () => launched(), openPopup: () => assert.fail(), focusApp: () => {}})
    const canceled = pending.open(target, redirect, true)
    await ready
    pending.cancel()
    assert.strictEqual((await canceled).canceled, true)
    await nextTurn()

    const timeout = createBrowserSso({openExternal: async () => {}, openPopup: () => assert.fail(), focusApp: () => {}, timeoutMs: 20})
    assert.match((await timeout.open(target, redirect, true)).message, /timed out/)
    await nextTurn()

    const logout = createBrowserSso({openExternal: async () => { await request(redirect + '&state=test-state') }, openPopup: () => assert.fail(), focusApp: () => {}})
    assert.strictEqual((await logout.open(target, redirect, false)).success, true)
    await nextTurn()

    for (const query of ['&state=test-state', '&state=test-state&error=access_denied']) {
        const rejected = createBrowserSso({openExternal: async () => { await request(redirect + query) }, openPopup: () => assert.fail(), focusApp: () => {}})
        assert.strictEqual((await rejected.open(target, redirect, true)).success, false)
        await nextTurn()
    }

    let popupOpened, popupClosed = false
    const popupReady = new Promise(resolve => { popupOpened = resolve })
    let resolvePopup
    const cancelPopup = createBrowserSso({
        openExternal: async () => { throw new Error('No browser') },
        openPopup: () => new Promise(resolve => { resolvePopup = resolve; popupOpened() }),
        closePopup: () => { popupClosed = true; resolvePopup({canceled: true}) },
        focusApp: () => {}
    })
    const popupAttempt = cancelPopup.open(target, redirect, true)
    await popupReady
    cancelPopup.cancel()
    assert.strictEqual((await popupAttempt).canceled, true)
    assert(popupClosed)
    await nextTurn()

    const occupied = http.createServer()
    await new Promise(resolve => occupied.listen(43821, '127.0.0.1', resolve))
    try {
        const blocked = await pending.open(target, redirect, true)
        assert.match(blocked.message, /in use/)
    } finally { await new Promise(resolve => occupied.close(resolve)) }
    assert.strictEqual((await pending.open('file:///bad', redirect, true)).success, false)
    console.log('SSO browser checks passed: callback isolation, state, browser-first, fallback, cancel, timeout, logout, occupied port, invalid URL.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
