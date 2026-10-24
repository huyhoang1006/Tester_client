const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const babel = require('@babel/core')

const load = (file, dependencies = {}) => {
    const source = babel.transformSync(fs.readFileSync(file, 'utf8'), {
        babelrc: false,
        configFile: false,
        plugins: ['@babel/plugin-transform-modules-commonjs']
    }).code
    const module = { exports: {} }
    vm.runInNewContext(source, {
        module,
        exports: module.exports,
        require: name => {
            if (!dependencies[name]) throw new Error(`Unexpected dependency: ${name}`)
            return dependencies[name]
        }
    }, { filename: file })
    return module.exports
}

const root = path.join(__dirname, '..')
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const config = readJson(path.join(root, 'src/config/test-definitions/CircuitBreaker/PowerFrequencyVoltageWithstand.json'))
const assetKinds = ['CircuitBreaker', 'CurrentTransformer', 'VoltageTransformer']
for (const assetKind of assetKinds) {
    const definition = readJson(path.join(root, `src/config/test-definitions/${assetKind}/PowerFrequencyVoltageWithstand.json`))
    const procedure = readJson(path.join(root, `src/config/procedures/${assetKind}.json`))
        .procedure.find(entry => entry.code === definition.testCode)
    assert.strictEqual(procedure.mrid, definition.testId)
    assert.deepStrictEqual(
        definition.columns.map(column => [column.code, column.mrid, column.type]),
        config.columns.map(column => [column.code, column.mrid, column.type])
    )
    const condition = readJson(path.join(root, `src/config/testing-condition/${assetKind}/PowerFrequencyVoltageWithstand.json`))
    assert.strictEqual(condition.testId, definition.testId)
    assert.deepStrictEqual(
        condition.columns.map(column => column.code),
        ['reference_temp', 'ambient_temp', 'humidity', 'weather']
    )
}
const terminals = ['A', 'B', 'C', 'GND']
const terminalSelect = load(path.join(root, 'src/views/JobView/Common/terminalSelect.js'))
const test = load(path.join(root, 'src/views/JobView/Common/powerFrequencyTest.js'), {
    './index': {
        buildEmptyTestRow: columns => Object.fromEntries(columns.map(col => [col.code, {
            value: '', type: col.type, unit: col.unit || '', measurement_id: col.mrid
        }])),
        buildEmptyTestCondition: columns => Object.fromEntries(columns.map(col => [col.code, {
            value: '', type: col.type, unit: col.unit || '', measurement_id: col.mrid
        }]))
    },
    './terminalSelect': terminalSelect,
    './terminalOptions': { buildCircuitBreakerTerminals: () => terminals }
})

const data = test.createPowerFrequencyTest(config,
    readJson(path.join(root, 'src/config/testing-condition/CircuitBreaker/PowerFrequencyVoltageWithstand.json')))
assert.deepStrictEqual(Object.keys(data.rowDataExampleCondition),
    ['reference_temp', 'ambient_temp', 'humidity', 'weather'])
assert.strictEqual(data.table.table1.length, 3)
for (const row of data.table.table1) {
    const sides = terminalSelect.readSides(row, terminals)
    assert.strictEqual(sides.terminal1.length, 1)
    assert.strictEqual(sides.terminal2.length, 3)
    row.test_voltage.value = 50
    row.frequency.value = 50
    row.duration.value = 1
}
const workTask = { testTypeCode: config.testCode, data }
assert.strictEqual(test.validatePowerFrequencyTestRows([workTask]).valid, true)

data.table.table1[0].measurement.value = 'Phase A – B+C+Earth'
assert.strictEqual(terminalSelect.readSides(data.table.table1[0], terminals).terminal1[0], 'A')
assert.deepStrictEqual(Array.from(terminalSelect.readSides(data.table.table1[0], terminals).terminal2), ['B', 'C', 'GND'])
assert.strictEqual(test.validatePowerFrequencyTestRows([workTask]).valid, true)

data.table.table1[0].frequency.value = 'not a number'
assert.strictEqual(test.validatePowerFrequencyTestRows([workTask]).valid, false)
data.table.table1[0].frequency.value = 0
assert.strictEqual(test.validatePowerFrequencyTestRows([workTask]).valid, false)
data.table.table1[0].frequency.value = 50
data.table.table1[0].measurement.value = 'A'
assert.strictEqual(test.validatePowerFrequencyTestRows([workTask]).valid, false)
data.table.table1[0].measurement.value = 'X - B'
assert.strictEqual(test.validatePowerFrequencyTestRows([workTask]).valid, false)

console.log('Power-frequency terminal and numeric validation: OK')
