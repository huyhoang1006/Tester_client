import { normalizeAssetKind } from '@/config/compare-keys'

const RESISTANCE_ABSOLUTE = 'resistanceAbsolute'
const RESISTANCE_SIGNED = 'resistanceSigned'
const EXCITING_CURRENT = 'excitingCurrent'
const DF_CAP = 'dfCap'
const CAP_ONLY = 'capOnly'
const SHORT_CIRCUIT = 'shortCircuit'

const REFERENCE_VALUE_MAPPINGS = {
    Transformer: {
        DCWindingPrim: {
            keys: ['name', 'tap'],
            fields: [{ target: 'r_ref', source: 'r_meas' }],
            calculation: RESISTANCE_ABSOLUTE
        },
        DCWindingSec: {
            keys: ['name', 'tap'],
            fields: [{ target: 'r_ref', source: 'r_meas' }],
            calculation: RESISTANCE_ABSOLUTE
        },
        DCWindingTert: {
            keys: ['name', 'tap'],
            fields: [{ target: 'r_ref', source: 'r_meas' }],
            calculation: RESISTANCE_ABSOLUTE
        },
        ExcitingCurrent: {
            keys: ['phase', 'tap'],
            fields: [{ target: 'i_ref', source: 'i_out' }],
            calculation: EXCITING_CURRENT
        },
        WindingDfCap: {
            keys: ['measurement', 'test_mode'],
            fields: [
                { target: 'df_ref', source: 'df_meas' },
                { target: 'c_ref', source: 'c_meas' }
            ],
            calculation: DF_CAP
        },
        BushingPrimC1: {
            keys: ['measurement', 'test_mode'],
            fields: [
                { target: 'df_ref', source: 'df_meas' },
                { target: 'c_ref', source: 'c_meas' }
            ],
            calculation: DF_CAP
        },
        BushingPrimC2: {
            keys: ['measurement', 'test_mode'],
            fields: [
                { target: 'df_ref', source: 'df_meas' },
                { target: 'c_ref', source: 'c_meas' }
            ],
            calculation: DF_CAP
        },
        BushingSecC1: {
            keys: ['measurement', 'test_mode'],
            fields: [
                { target: 'df_ref', source: 'df_meas' },
                { target: 'c_ref', source: 'c_meas' }
            ],
            calculation: DF_CAP
        },
        BushingSecC2: {
            keys: ['measurement', 'test_mode'],
            fields: [
                { target: 'df_ref', source: 'df_meas' },
                { target: 'c_ref', source: 'c_meas' }
            ],
            calculation: DF_CAP
        },
        BushingTertC1: {
            keys: ['measurement', 'test_mode'],
            fields: [
                { target: 'df_ref', source: 'df_meas' },
                { target: 'c_ref', source: 'c_meas' }
            ],
            calculation: DF_CAP
        },
        BushingTertC2: {
            keys: ['measurement', 'test_mode'],
            fields: [
                { target: 'df_ref', source: 'df_meas' },
                { target: 'c_ref', source: 'c_meas' }
            ],
            calculation: DF_CAP
        },
        ShortCircuitImpedancePrim: {
            keys: ['phase', 'tap'],
            fields: [{ target: 'uk_ref', source: 'uk_cal' }],
            calculation: SHORT_CIRCUIT
        },
        ShortCircuitImpedanceSec: {
            keys: ['phase', 'tap'],
            fields: [{ target: 'uk_ref', source: 'uk_cal' }],
            calculation: SHORT_CIRCUIT
        },
        ShortCircuitImpedanceTert: {
            keys: ['phase', 'tap'],
            fields: [{ target: 'uk_ref', source: 'uk_cal' }],
            calculation: SHORT_CIRCUIT
        }
    },
    CurrentTransformer: {
        CTWindingRes: {
            keys: ['name'],
            fields: [{ target: 'r_ref', source: 'r_meas' }],
            calculation: RESISTANCE_SIGNED
        },
        CTDfcap: {
            keys: ['measurement', 'test_mode'],
            fields: [{ target: 'c_ref', source: 'c_meas' }],
            calculation: CAP_ONLY
        }
    },
    VoltageTransformer: {
        DcWindingResistance: {
            keys: ['name'],
            fields: [{ target: 'r_ref', source: 'r_meas' }],
            calculation: RESISTANCE_SIGNED
        }
    }
}

const MAPPINGS_BY_KIND = Object.keys(REFERENCE_VALUE_MAPPINGS).reduce((result, kind) => {
    result[normalizeAssetKind(kind)] = REFERENCE_VALUE_MAPPINGS[kind]
    return result
}, {})

export const resolveReferenceValueMapping = (assetKind, testCode) => {
    const tests = MAPPINGS_BY_KIND[normalizeAssetKind(assetKind)]
    return tests && tests[testCode] ? tests[testCode] : null
}

export {
    RESISTANCE_ABSOLUTE,
    RESISTANCE_SIGNED,
    EXCITING_CURRENT,
    DF_CAP,
    CAP_ONLY,
    SHORT_CIRCUIT
}

export default REFERENCE_VALUE_MAPPINGS
