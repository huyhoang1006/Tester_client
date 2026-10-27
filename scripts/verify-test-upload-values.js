const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const babel = require('@babel/core')

const source = fs.readFileSync(path.join(__dirname, '../src/utils/testSyncPayload.js'), 'utf8')
const compiled = babel.transformSync(source, {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs']
}).code
const moduleRef = { exports: {} }
vm.runInNewContext(compiled, {
    module: moduleRef,
    exports: moduleRef.exports,
    require: name => {
        if (name === '@/utils/serverId') return { toServerId: id => id, stripServerIdsDeep: () => {} }
        if (name === '@/views/TreeNode/Common/Fetch/testDate') return { parseTestDate: () => null }
        throw new Error(`Unexpected dependency: ${name}`)
    }
})

const { validateTestMeasurementValues } = moduleRef.exports
const cell = (type, value) => ({ type, value })
const payload = {
    testList: [{
        testTypeName: 'Short-circuit impedance prim',
        testCondition: { condition: { weather: cell('string', 'Cloudy') } },
        data: { table1: [{ tap: cell('analog', 'CT-001') }] }
    }]
}

assert.throws(() => validateTestMeasurementValues(payload), error =>
    error.message.includes('table1 row 1 / tap') && error.message.includes('CT-001'))
payload.testList[0].data.table1[0].tap.value = 1
assert.doesNotThrow(() => validateTestMeasurementValues(payload))
payload.testList[0].data.table1[0].tap.value = ''
assert.doesNotThrow(() => validateTestMeasurementValues(payload))
payload.testList[0].testCondition.condition.temperature = cell('analog', 'not-a-number')
assert.throws(() => validateTestMeasurementValues(payload), /testing conditions \/ temperature/)

console.log('Test upload numeric validation passed')
