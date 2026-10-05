const http = require('http')

// The listener is local only and exists for a single SSO attempt.
const createBrowserSso = ({openExternal, openPopup, closePopup = () => {}, focusApp, timeoutMs = 300000}) => {
    let cancel = null
    const stop = () => { if (cancel) cancel() }
    const open = (targetUrl, redirectUri, expectCode) => {
        stop()
        let target, redirect
        try {
            target = new URL(targetUrl)
            redirect = new URL(redirectUri)
            if (!['http:', 'https:'].includes(target.protocol)
                || redirect.origin !== 'http://127.0.0.1:43821'
                || redirect.pathname !== '/oauth2/callback'
                || !redirect.searchParams.get('attempt')) throw new Error('Invalid SSO URL')
        } catch (error) {
            return Promise.resolve({success: false, message: error.message})
        }
        return new Promise(resolve => {
            let settled = false
            const sockets = new Set()
            const server = http.createServer((req, res) => {
                let callback
                try { callback = new URL(req.url, redirect.origin) }
                catch (error) { res.writeHead(400); res.end(); return }
                if (req.method !== 'GET' || req.headers.host !== redirect.host
                    || callback.pathname !== redirect.pathname
                    || callback.searchParams.get('attempt') !== redirect.searchParams.get('attempt')
                    || (target.searchParams.has('state')
                        && callback.searchParams.get('state') !== target.searchParams.get('state'))) {
                    res.writeHead(404, {'Connection': 'close'})
                    res.end()
                    return
                }
                const error = callback.searchParams.get('error')
                const code = callback.searchParams.get('code')
                const success = !error && (!expectCode || !!code)
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
                    'Content-Security-Policy': "default-src 'none'", 'Connection': 'close'})
                res.end('<!doctype html><title>AT Energy SSO</title><h1>'
                    + (success ? (expectCode ? 'Authorization received' : 'Signed out') : 'Sign-in failed')
                    + '</h1><p>'
                    + (success && expectCode
                        ? 'Return to AT Energy to finish signing in. The application is requesting your session from the login server.'
                        : 'You can close this tab and return to AT Energy.')
                    + '</p>')
                finish({success, code: code || null, message: error
                    ? callback.searchParams.get('error_description') || error
                    : success ? undefined : 'SSO callback did not contain an authorization code'})
                focusApp()
            })
            server.on('connection', socket => {
                sockets.add(socket)
                socket.on('close', () => sockets.delete(socket))
            })
            const cleanup = (final = true) => {
                clearTimeout(timer)
                server.close()
                for (const socket of sockets) socket.end()
                if (final && cancel === cancelAttempt) cancel = null
            }
            const finish = result => {
                if (settled) return
                settled = true
                cleanup()
                resolve(result)
            }
            const cancelAttempt = () => {
                finish({success: false, canceled: true})
                closePopup()
            }
            cancel = cancelAttempt
            const timer = setTimeout(() => finish({success: false, message: 'SSO sign-in timed out'}), timeoutMs)
            server.on('error', error => finish({success: false,
                message: error.code === 'EADDRINUSE' ? 'SSO callback port 43821 is in use. Close the other application and retry.' : error.message}))
            server.listen(43821, '127.0.0.1', async () => {
                if (settled) { server.close(); return }
                try {
                    target.searchParams.delete('popup')
                    await openExternal(target.toString())
                } catch (error) {
                    if (settled) return
                    // Only a browser-launch failure enables the embedded fallback.
                    cleanup(false)
                    try { finish(await openPopup(targetUrl, redirectUri, expectCode)) }
                    catch (popupError) { finish({success: false, message: popupError.message}) }
                }
            })
        })
    }
    return {open, cancel: stop}
}

module.exports = {createBrowserSso}
