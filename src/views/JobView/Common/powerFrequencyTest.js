import { buildEmptyTestRow, buildEmptyTestCondition } from './index'
import { readSides } from './terminalSelect'
import { buildCircuitBreakerTerminals } from './terminalOptions'

export const createPowerFrequencyTest = (definition, condition) => {
    const example = buildEmptyTestRow(definition.columns)
    const terminalPairs = [
        ['A', ['B', 'C', 'GND']],
        ['B', ['A', 'C', 'GND']],
        ['C', ['A', 'B', 'GND']]
    ]
    return {
        rowDataExampleCondition: buildEmptyTestCondition(condition.columns || []),
        rowDataAssessment: [],
        table: {
            table1: terminalPairs.map(([left, right]) => {
                const row = JSON.parse(JSON.stringify(example))
                row.measurement.value = `${left} - (${right.join(' + ')})`
                return row
            })
        }
    }
}

export const validatePowerFrequencyTestRows = testList => {
    const terminals = buildCircuitBreakerTerminals()
    for (const test of testList || []) {
        if (test.testTypeCode !== 'PowerFrequencyVoltageWithstand') continue
        const rows = test.data?.table?.table1 || []
        if (!rows.length) return { valid: false, message: 'Power-frequency voltage withstand test needs at least one row.' }
        for (let i = 0; i < rows.length; i++) {
            const sides = readSides(rows[i], terminals)
            if (!sides.terminal1.length || !sides.terminal2.length ||
                [...sides.terminal1, ...sides.terminal2].some(value => !terminals.includes(value))) {
                return { valid: false, message: `Select both terminals in row ${i + 1} of the power-frequency voltage withstand test.` }
            }
            for (const [code, label] of [
                ['test_voltage', 'Test voltage'], ['frequency', 'Frequency'], ['duration', 'Test duration']
            ]) {
                const raw = rows[i][code]?.value
                const value = Number(raw)
                if (raw === '' || raw === null || raw === undefined || !Number.isFinite(value) || value <= 0) {
                    return { valid: false, message: `${label} in row ${i + 1} must be a positive number.` }
                }
            }
        }
    }
    return { valid: true, message: '' }
}
