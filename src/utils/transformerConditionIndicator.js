const INDICATORS = ['Good', 'Fair', 'Poor', 'Bad']

const DGA_LIMITS = {
    h2: [100, 700, 1800],
    ch4: [120, 400, 1000],
    c2h2: [35, 50, 80],
    c2h4: [50, 100, 200],
    c2h6: [65, 100, 150],
    co: [350, 570, 1400],
    co2: [2500, 4000, 10000],
    tdcg: [720, 1920, 4630]
}

const DGA_COMBUSTIBLE_GASES = ['h2', 'ch4', 'c2h2', 'c2h4', 'c2h6', 'co']

const toNumber = field => {
    const raw = field && typeof field === 'object' && Object.prototype.hasOwnProperty.call(field, 'value')
        ? field.value
        : field
    if (raw === null || raw === undefined || String(raw).trim() === '') return null
    const value = Number(String(raw).trim().replace(',', '.'))
    return Number.isFinite(value) ? value : null
}

const lowerIsBetter = (value, limits) => {
    if (value === null) return null
    const absoluteValue = Math.abs(value)
    if (absoluteValue <= limits[0]) return 0
    if (absoluteValue <= limits[1]) return 1
    if (absoluteValue <= limits[2]) return 2
    return 3
}

const higherIsBetter = (value, limits) => {
    if (value === null) return null
    if (value >= limits[0]) return 0
    if (value >= limits[1]) return 1
    if (value >= limits[2]) return 2
    return 3
}

const worstSeverity = values => {
    const applicable = values.filter(value => value !== null && value !== undefined)
    return applicable.length ? Math.max.apply(null, applicable) : null
}

const setValue = (row, key, value) => {
    if (row && row[key] && typeof row[key] === 'object') row[key].value = value
}

const setIndicator = (row, key, severity) => {
    setValue(row, key, severity === null ? '' : INDICATORS[severity])
}

const allTableRows = testData => {
    const table = testData && testData.table
    if (!table) return []
    return Object.keys(table).reduce((rows, key) => {
        return Array.isArray(table[key]) ? rows.concat(table[key]) : rows
    }, [])
}

const calculateSimpleRows = (testData, evaluator, indicatorKey = 'condition_indicator') => {
    let calculated = 0
    allTableRows(testData).forEach(row => {
        const severity = evaluator(row)
        setIndicator(row, indicatorKey, severity)
        if (severity !== null) calculated += 1
    })
    return calculated
}

const calculateOil = testData => calculateSimpleRows(
    testData,
    row => higherIsBetter(toNumber(row.result), [60, 55, 40])
)

const calculateDga = testData => {
    let calculated = 0
    allTableRows(testData).forEach(row => {
        const combustibleValues = DGA_COMBUSTIBLE_GASES.map(code => toNumber(row[code]))
        if (combustibleValues.every(value => value !== null)) {
            const total = combustibleValues.reduce((sum, value) => sum + value, 0)
            setValue(row, 'tdcg', String(Math.round(total * 10000) / 10000))
        }

        const severities = Object.keys(DGA_LIMITS).map(code => {
            return lowerIsBetter(toNumber(row[code]), DGA_LIMITS[code])
        })
        const severity = worstSeverity(severities)
        setValue(row, 'status', severity === null ? '' : `Condition ${severity + 1}`)
        setIndicator(row, 'condition_indicator', severity)
        if (severity !== null) calculated += 1
    })
    return calculated
}

const calculateInsulationResistance = testData => calculateSimpleRows(testData, row => {
    const darSeverity = higherIsBetter(toNumber(row.dar), [1.4, 1.3, 1.2])
    const terminalText = `${row.measurement && row.measurement.value || ''} ${row.type && row.type.value || ''}`.toUpperCase()
    const isHighVoltage = terminalText.includes('PRIM') || terminalText.includes('PRIMARY') || terminalText.includes('HV')
    const isLowVoltage = terminalText.includes('SEC') || terminalText.includes('SECONDARY') ||
        terminalText.includes('TERT') || terminalText.includes('LV') || terminalText.includes('TV')
    const r60Limits = isHighVoltage ? [1000, 600, 400] : (isLowVoltage ? [500, 300, 200] : null)
    const r60Severity = r60Limits ? higherIsBetter(toNumber(row.r60s), r60Limits) : null
    return worstSeverity([darSeverity, r60Severity])
})

const calculateYokeCoreInsulation = testData => calculateSimpleRows(testData, row => {
    const r60 = toNumber(row.r60s)
    if (r60 === null) return null
    const reference = toNumber(row.r60s_ref)
    if (reference !== null && reference > 0 && r60 < reference * 0.5) return 3
    if (r60 >= 500) return 0
    if (r60 >= 100) return 1
    if (r60 >= 10) return 2
    return 3
})

const calculateDcWinding = testData => {
    let calculated = 0
    const table = testData && testData.table
    if (!table) return calculated
    Object.keys(table).forEach(key => {
        const rows = Array.isArray(table[key]) ? table[key] : []
        rows.forEach((row, index) => {
            const groupFirstRow = rows[Math.floor(index / 3) * 3]
            const severity = worstSeverity([
                lowerIsBetter(toNumber(row.dev_r_ref), [1, 2, 3]),
                lowerIsBetter(toNumber(groupFirstRow && groupFirstRow.dev_phase), [1, 2, 3])
            ])
            setIndicator(row, 'condition_indicator', severity)
            if (severity !== null) calculated += 1
        })
    })
    return calculated
}

const calculateRatio = testData => calculateSimpleRows(
    testData,
    row => lowerIsBetter(toNumber(row.ratio_dev), [0.3, 0.5, 0.7])
)

const calculateWindingDfCap = testData => {
    let calculated = 0
    allTableRows(testData).forEach(row => {
        const dfSeverity = lowerIsBetter(toNumber(row.df_meas), [0.5, 1, 1.5])
        const capacitanceSeverity = lowerIsBetter(toNumber(row.delta_c_percent), [5, 7, 10])
        setIndicator(row, 'condition_indicator_df', dfSeverity)
        setIndicator(row, 'condition_indicator_c', capacitanceSeverity)
        if (dfSeverity !== null || capacitanceSeverity !== null) calculated += 1
    })
    return calculated
}

const calculateBushingDfCap = testData => {
    let calculated = 0
    allTableRows(testData).forEach(row => {
        const dfMeasured = toNumber(row.df_meas)
        const dfReference = toNumber(row.df_ref)
        const dfRatio = dfMeasured !== null && dfReference !== null && dfReference !== 0
            ? Math.abs(dfMeasured / dfReference)
            : null
        const dfSeverity = worstSeverity([
            lowerIsBetter(dfMeasured, [0.4, 0.7, 1]),
            lowerIsBetter(dfRatio, [1.3, 2, 3])
        ])
        const capacitanceSeverity = lowerIsBetter(toNumber(row.delta_c_percent), [5, 7, 10])
        setIndicator(row, 'condition_indicator_df', dfSeverity)
        setIndicator(row, 'condition_indicator_c', capacitanceSeverity)
        if (dfSeverity !== null || capacitanceSeverity !== null) calculated += 1
    })
    return calculated
}

const calculateExcitingCurrent = testData => calculateSimpleRows(
    testData,
    row => lowerIsBetter(toNumber(row.i_dev), [10, 15, 20])
)

const calculateShortCircuitImpedance = testData => calculateSimpleRows(
    testData,
    row => lowerIsBetter(toNumber(row.uk_dev), [1, 2, 3])
)

const BUSHING_TESTS = [
    'BushingPrimC1',
    'BushingPrimC2',
    'BushingSecC1',
    'BushingSecC2',
    'BushingTertC1',
    'BushingTertC2'
]

const CALCULATORS = {
    MeasurementOfOil: calculateOil,
    Dga: calculateDga,
    InsulationResistance: calculateInsulationResistance,
    InsulationResistanceYokeCore: calculateYokeCoreInsulation,
    DCWindingPrim: calculateDcWinding,
    DCWindingSec: calculateDcWinding,
    DCWindingTert: calculateDcWinding,
    RatioPrimSec: calculateRatio,
    WindingDfCap: calculateWindingDfCap,
    ExcitingCurrent: calculateExcitingCurrent,
    ShortCircuitImpedancePrim: calculateShortCircuitImpedance,
    ShortCircuitImpedanceSec: calculateShortCircuitImpedance,
    ShortCircuitImpedanceTert: calculateShortCircuitImpedance
}

BUSHING_TESTS.forEach(code => { CALCULATORS[code] = calculateBushingDfCap })

const lowerRangeLabels = (limits, unit = '') => {
    const suffix = unit ? `\u00a0${unit}` : ''
    return [
        `<= ${limits[0]}${suffix}`,
        `> ${limits[0]} to <= ${limits[1]}${suffix}`,
        `> ${limits[1]} to <= ${limits[2]}${suffix}`,
        `> ${limits[2]}${suffix}`
    ]
}

const higherRangeLabels = (limits, unit = '') => {
    const suffix = unit ? `\u00a0${unit}` : ''
    return [
        `>= ${limits[0]}${suffix}`,
        `>= ${limits[1]} to < ${limits[0]}${suffix}`,
        `>= ${limits[2]} to < ${limits[1]}${suffix}`,
        `< ${limits[2]}${suffix}`
    ]
}

const settingRow = (criterion, ranges) => ({ criterion, ranges })

const STANDARD_SETTINGS = {
    MeasurementOfOil: {
        rows: [settingRow('Breakdown voltage', higherRangeLabels([60, 55, 40], 'kV'))]
    },
    InsulationResistance: {
        rows: [
            settingRow('DAR / Kht', higherRangeLabels([1.4, 1.3, 1.2])),
            settingRow('R60 HV to earth', higherRangeLabels([1000, 600, 400], 'MOhm')),
            settingRow('R60 LV/Tert to earth', higherRangeLabels([500, 300, 200], 'MOhm'))
        ],
        note: 'The worst applicable criterion determines the row condition indicator.'
    },
    InsulationResistanceYokeCore: {
        rows: [settingRow('R60 yoke/core to earth', higherRangeLabels([500, 100, 10], 'MOhm'))],
        note: 'Bad also applies when R60 is less than 50% of the reference value.'
    },
    RatioPrimSec: {
        rows: [settingRow('Ratio deviation', lowerRangeLabels([0.3, 0.5, 0.7], '%'))]
    },
    WindingDfCap: {
        rows: [
            settingRow('Dissipation factor', lowerRangeLabels([0.5, 1, 1.5], '%')),
            settingRow('Capacitance deviation', lowerRangeLabels([5, 7, 10], '%'))
        ]
    },
    ExcitingCurrent: {
        rows: [settingRow('Current deviation', lowerRangeLabels([10, 15, 20], '%'))]
    },
    ShortCircuitImpedancePrim: {
        rows: [settingRow('Short-circuit impedance deviation (uk dev)', lowerRangeLabels([1, 2, 3], '%'))],
        note: 'The source document labels this row as breakdown voltage. uk deviation is used for this test.'
    }
}

STANDARD_SETTINGS.DCWindingPrim = {
    rows: [
        settingRow('Resistance deviation from reference', lowerRangeLabels([1, 2, 3], '%')),
        settingRow('Resistance deviation between phases', lowerRangeLabels([1, 2, 3], '%'))
    ],
    note: 'The worst applicable criterion determines the row condition indicator.'
}
STANDARD_SETTINGS.DCWindingSec = STANDARD_SETTINGS.DCWindingPrim
STANDARD_SETTINGS.DCWindingTert = STANDARD_SETTINGS.DCWindingPrim
STANDARD_SETTINGS.ShortCircuitImpedanceSec = STANDARD_SETTINGS.ShortCircuitImpedancePrim
STANDARD_SETTINGS.ShortCircuitImpedanceTert = STANDARD_SETTINGS.ShortCircuitImpedancePrim

const BUSHING_SETTINGS = {
    rows: [
        settingRow('Dissipation factor', lowerRangeLabels([0.4, 0.7, 1], '%')),
        settingRow('Measured/reference DF ratio', lowerRangeLabels([1.3, 2, 3])),
        settingRow('Capacitance deviation', lowerRangeLabels([5, 7, 10], '%'))
    ],
    note: 'The worse DF criterion is used. Capacitance has its own condition indicator.'
}

BUSHING_TESTS.forEach(code => { STANDARD_SETTINGS[code] = BUSHING_SETTINGS })

const DGA_COLUMNS = [
    { key: 'h2', label: 'H2' },
    { key: 'ch4', label: 'CH4' },
    { key: 'c2h2', label: 'C2H2' },
    { key: 'c2h4', label: 'C2H4' },
    { key: 'c2h6', label: 'C2H6' },
    { key: 'co', label: 'CO' },
    { key: 'co2', label: 'CO2' },
    { key: 'tdcg', label: 'TDCG' }
]

const DGA_SETTINGS = {
    columns: DGA_COLUMNS,
    rows: INDICATORS.map((indicator, severity) => {
        const values = {}
        DGA_COLUMNS.forEach(column => {
            values[column.key] = lowerRangeLabels(DGA_LIMITS[column.key], 'ppm')[severity]
        })
        return {
            status: `Condition ${severity + 1}`,
            indicator,
            values
        }
    }),
    note: 'TDCG is H2 + CH4 + C2H2 + C2H4 + C2H6 + CO. The worst gas or TDCG condition determines the result.'
}

export const calculateTransformerConditionIndicators = (testCode, testData) => {
    const calculator = CALCULATORS[testCode]
    if (!calculator) return { supported: false, calculated: 0 }
    return { supported: true, calculated: calculator(testData) }
}

export const getTransformerConditionIndicatorSettings = testCode => {
    if (testCode === 'Dga') return { type: 'dga', ...DGA_SETTINGS }
    const setting = STANDARD_SETTINGS[testCode]
    return setting ? { type: 'standard', ...setting } : null
}

export const transformerConditionIndicatorThresholds = {
    dga: DGA_LIMITS,
    shortCircuitImpedanceUkDeviation: [1, 2, 3]
}
