const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const babel = require('@babel/core')
const compiler = require('vue-template-compiler')
const { v4 } = require('uuid')

const loadModule = (source, imports = {}) => {
    const code = babel.transformSync(source, {
        babelrc: false,
        configFile: false,
        plugins: ['@babel/plugin-transform-modules-commonjs']
    }).code
    const module = { exports: {} }
    vm.runInNewContext(code, {
        module,
        exports: module.exports,
        require: name => {
            if (!(name in imports)) throw new Error(`Unexpected import: ${name}`)
            return imports[name]
        }
    })
    return module.exports
}

const root = path.resolve(__dirname, '..')
const utilitySource = fs.readFileSync(path.join(root, 'src/utils/unknownSerial.js'), 'utf8')
const serial = loadModule(utilitySource, { '@/utils/uuid': { newUuid: v4 } })

const first = serial.newUnknownSerial()
const second = serial.newUnknownSerial()
assert.notStrictEqual(first, second)
assert(serial.isUnknownSerial(first))
assert.strictEqual(serial.displaySerialNumber(first), 'Unknown')
assert.strictEqual(serial.displaySerialNumber('ABC-123'), 'ABC-123')
assert(!serial.isUnknownSerial('_UNKNOWN_invalid'))

const componentSource = fs.readFileSync(path.join(root, 'src/views/Common/SerialNumberField.vue'), 'utf8')
const component = loadModule(compiler.parseComponent(componentSource).script.content, {
    '@/utils/unknownSerial': serial
}).default
const emitted = []
const field = {
    value: 'ABC-123',
    previousSerial: '',
    $emit: (event, value) => emitted.push({ event, value })
}
Object.defineProperty(field, 'unknown', { get: () => component.computed.unknown.call(field) })
component.methods.toggleUnknown.call(field, true)
assert.strictEqual(emitted[0].event, 'input')
assert(serial.isUnknownSerial(emitted[0].value))
field.value = emitted[0].value
assert(field.unknown)
component.methods.toggleUnknown.call(field, false)
assert.strictEqual(emitted[1].value, 'ABC-123')

field.value = first
field.previousSerial = ''
component.methods.toggleUnknown.call(field, false)
assert.strictEqual(emitted[2].value, '')

console.log('Unknown serial utility and checkbox behavior: OK')
