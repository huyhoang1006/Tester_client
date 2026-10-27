const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const babel = require('@babel/core')

const loadModule = (file, imports = {}) => {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
    const code = babel.transformSync(source, {
        babelrc: false,
        configFile: false,
        plugins: ['@babel/plugin-transform-modules-commonjs']
    }).code
    const exports = {}
    vm.runInNewContext(code, {
        exports,
        require: name => {
            if (!(name in imports)) throw new Error(`Unexpected import: ${name}`)
            return imports[name]
        },
        console: { log() {}, error() {} },
        URL
    }, { filename: file })
    return exports
}

const { classifyApiError } = loadModule('src/utils/apiError.js')
const config = { url: '/api/job/tests/transformer', baseURL: 'http://example.test:32340', serviceName: 'Job service', method: 'post' }
const failure = (overrides = {}) => ({ config, message: 'Network Error', ...overrides })

assert.strictEqual(classifyApiError(failure(), false).kind, 'offline')
assert.strictEqual(classifyApiError(failure(), true).kind, 'connection')
assert.strictEqual(classifyApiError(failure({ code: 'ECONNABORTED' }), true).kind, 'timeout')
assert.strictEqual(classifyApiError(failure({ response: { status: 404 } }), true).kind, 'not-found')
assert.strictEqual(classifyApiError(failure({ response: { status: 503 } }), true).kind, 'unavailable')
assert.strictEqual(classifyApiError(failure({ response: { status: 500 } }), true).kind, 'server-error')
assert.strictEqual(classifyApiError(failure({ response: { status: 400 } }), true), null)
assert.strictEqual(classifyApiError(failure({ code: 'ERR_CANCELED' }), true), null)
assert.strictEqual(classifyApiError(new TypeError('Invalid response'), true), null)
assert.match(classifyApiError(failure({ response: { status: 404 } }), true).message, /POST \/api\/job\/tests\/transformer/)

const notices = []
const interceptors = {}
const fakeClient = {
    defaults: { baseURL: 'http://asset.test' },
    interceptors: {
        request: { use: (success, failureHandler) => { interceptors.request = { success, failureHandler } } },
        response: { use: (success, failureHandler) => { interceptors.response = { success, failureHandler } } }
    }
}
loadModule('src/utils/client.js', {
    axios: { __esModule: true, default: { create: () => fakeClient } },
    '@/store': { __esModule: true, default: { state: { serviceAddr: 'http://asset.test' } } },
    '@/router': { __esModule: true, default: {} },
    './helper': { afterLogout() {} },
    '@/utils/workspaceRestore': { markRestoreAfterLogin() {} },
    'element-ui': { Loading: {}, Message: { error: notice => notices.push(notice) } },
    '@/utils/serverId': { stripServerIdsDeep() {} },
    '@/utils/authError': { markAuthExpiredError: error => error },
    '@/utils/apiError': { classifyApiError, formatApiError: error => error.message },
    '@/utils/sso': {
        getSsoApiBase() {}, getStoredAccessToken() {}, getStoredRefreshToken() {},
        SSO_TOKEN_HEADER: 'X-Token', storeSsoTokens() {}
    }
})

const checkInterceptors = async () => {
    await interceptors.response.failureHandler(failure({
        response: { status: 404 }, config: { ...config, suppressGlobalApiError: true }
    })).catch(() => {})
    assert.strictEqual(notices.length, 0)

    await interceptors.response.failureHandler(failure({
        config: { ...config, suppressGlobalApiError: true }
    })).catch(() => {})
    assert.strictEqual(notices.length, 1)
    assert.match(notices[0].message, /Cannot connect to Job service/)

    await interceptors.response.failureHandler(failure({ response: { status: 503 } })).catch(() => {})
    assert.strictEqual(notices.length, 2)
    assert.match(notices[1].message, /HTTP 503/)
}

let childOrganisations = { message: 'Route not found' }
const messages = []
const tree = loadModule('src/views/TreeNode/Server/mixin/fetchChildrenServer.js', {
    vue: { __esModule: true, default: { set: (object, key, value) => { object[key] = value } } },
    '@/api/demo': {
        getChildOrganisation: async () => childOrganisations,
        getChildSubstation: async () => []
    },
    '@/api/demo/Job.js': {}
}).default
const node = { id: '1', mrid: '1', mode: 'organisation', name: 'Root', parentName: '', parentArr: [] }
const context = { $message: { error: message => messages.push(message) } }

;(async () => {
    await checkInterceptors()
    await tree.methods.fetchChildrenServer.call(context, node)
    assert.strictEqual(node.childrenLoadError, true)
    assert.strictEqual(node.children.length, 0)
    assert.strictEqual(messages.length, 1)
    assert.match(messages[0], /expected a list/)

    childOrganisations = [{ id: '2', name: 'Child' }]
    await tree.methods.fetchChildrenServer.call(context, node)
    assert.strictEqual(node.childrenLoadError, false)
    assert.strictEqual(node.children.length, 1)
    assert.strictEqual(node.children[0].name, 'Child')
    console.log('API error classification and server-tree retry passed')
})().catch(error => {
    console.error(error)
    process.exitCode = 1
})
