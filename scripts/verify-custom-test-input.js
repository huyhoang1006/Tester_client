const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const babel = require('@babel/core')

const source = fs.readFileSync(path.join(__dirname, '../src/views/Common/CustomInput.vue'), 'utf8')
const script = source.match(/<script>([\s\S]*?)<\/script>/)[1]
const compiled = babel.transformSync(script, {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs']
}).code
const moduleExports = {}
vm.runInNewContext(compiled, {
    exports: moduleExports,
    require: () => ({ __esModule: true, default: {} })
})
const input = moduleExports.default

const edit = (measurement, previous, typed, number) => {
    let emitted
    const field = { value: typed }
    const context = {
        measurement,
        number,
        text: undefined,
        value: previous,
        normalizeAnalogDraft: input.methods.normalizeAnalogDraft,
        roundToFourDecimals: input.methods.roundToFourDecimals,
        $emit: (_, value) => { emitted = value },
        $nextTick: callback => callback(),
        $refs: { elInput: { $refs: { input: field } } }
    }
    input.methods.handleInput.call(context, typed)
    return { emitted, displayed: field.value }
}

assert.strictEqual(edit({ type: 'analog' }, '', 'A12').emitted, '')
assert.strictEqual(edit({ type: 'analog' }, '12', '12x').displayed, '12')
assert.strictEqual(edit({ type: 'analog' }, '', '-2,5').emitted, '-2.5')
assert.strictEqual(edit({ type: 'analog' }, '', '1e-3').emitted, '1e-3')
assert.strictEqual(edit({ type: 'analog' }, '1', '1e9999').emitted, '1')
assert.strictEqual(edit({ type: 'string' }, '', 'Phase A').emitted, 'Phase A')
assert.strictEqual(edit({ type: 'analog' }, '', '12ab', 'positive').emitted, '12')

console.log('Config-driven analog input validation passed')
