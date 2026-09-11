export const TRANSFORMER_TERMINALS = ['Prim', 'Sec', 'Tert', 'GND']

export const terminalsForTransformerType = transformerType => {
    const hasTertiaryWinding = transformerType === 'Three-winding' || transformerType === 'Auto w/ tert'
    return TRANSFORMER_TERMINALS.filter(terminal => hasTertiaryWinding || terminal !== 'Tert')
}

const TERMINAL_ALIASES = {
    HV: 'Prim',
    PRIM: 'Prim',
    PRIMARY: 'Prim',
    LV: 'Sec',
    SEC: 'Sec',
    SECONDARY: 'Sec',
    TV: 'Tert',
    TERT: 'Tert',
    TERTIARY: 'Tert',
    GND: 'GND',
    E: 'GND',
    EARTH: 'GND',
}

const uniqueTerminals = values => TRANSFORMER_TERMINALS.filter(terminal => values.includes(terminal))

export const parseTerminalList = value => {
    const rawValues = Array.isArray(value)
        ? value
        : String(value === null || value === undefined ? '' : value)
            .replace(/[()]/g, '')
            .split(/\s*\+\s*|\s*,\s*/)

    const parsed = rawValues
        .map(item => TERMINAL_ALIASES[String(item).trim().toUpperCase()])
        .filter(Boolean)
    return uniqueTerminals(parsed)
}

export const readTerminalSides = row => {
    const measurement = row && row.measurement ? row.measurement.value : ''
    const type = row && row.type ? row.type.value : ''
    const measurementText = String(measurement === null || measurement === undefined ? '' : measurement)
    const separatorIndex = measurementText.indexOf(' - ')

    if (separatorIndex >= 0) {
        const terminal1 = parseTerminalList(measurementText.slice(0, separatorIndex))
        const terminal2 = parseTerminalList(measurementText.slice(separatorIndex + 3))
            .filter(terminal => !terminal1.includes(terminal))
        return { terminal1, terminal2 }
    }

    const terminal1 = parseTerminalList(measurement)
    const terminal2 = parseTerminalList(type).filter(terminal => !terminal1.includes(terminal))
    return { terminal1, terminal2 }
}

export const writeTerminalSides = (row, terminal1, terminal2) => {
    if (!row || !row.measurement || !row.type) return row
    const left = uniqueTerminals(Array.isArray(terminal1) ? terminal1 : [])
    const right = uniqueTerminals(Array.isArray(terminal2) ? terminal2 : [])
        .filter(terminal => !left.includes(terminal))
    row.measurement.value = left.join(' + ')
    row.type.value = right.join(' + ')
    return row
}

export const normalizeTerminalRow = row => {
    const sides = readTerminalSides(row)
    return writeTerminalSides(row, sides.terminal1, sides.terminal2)
}

export const validateInsulationResistanceTerminals = (testList, transformerType) => {
    const availableTerminals = terminalsForTransformerType(transformerType)
    const tests = (Array.isArray(testList) ? testList : [])
        .filter(test => test && test.testTypeCode === 'InsulationResistance')

    for (const test of tests) {
        const rows = test.data && test.data.table && Array.isArray(test.data.table.table1)
            ? test.data.table.table1
            : []
        for (let index = 0; index < rows.length; index++) {
            const sides = readTerminalSides(rows[index])
            const terminal1 = sides.terminal1.filter(terminal => availableTerminals.includes(terminal))
            const terminal2 = sides.terminal2.filter(terminal => availableTerminals.includes(terminal))
            if (terminal1.length === 0 || terminal2.length === 0) {
                return {
                    valid: false,
                    message: `Please select at least one option for both Terminal 1 and Terminal 2 in row ${index + 1}.`,
                }
            }
            writeTerminalSides(rows[index], terminal1, terminal2)
        }
    }
    return { valid: true, message: '' }
}
