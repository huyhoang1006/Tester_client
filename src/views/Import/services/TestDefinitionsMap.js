/**
 * testDefinitionsMap.js
 * 
 * Build TEST_DEFINITIONS từ các config file hiện có.
 * Khi config thay đổi → file này tự cập nhật theo.
 * deepImportService chỉ cần import TEST_DEFINITIONS từ đây.
 *
 * Cấu trúc output:
 * {
 *   'Job_TransformerJobDto': {
 *     'WindingDfCap': {
 *       testId:           string,
 *       testName:         string,
 *       columns:          [{ code, mrid, type, unit }],
 *       conditionColumns: [{ code, mrid, type, unit }]
 *     },
 *     ...
 *   },
 *   ...
 * }
 */

// ── Test definitions (columns + testId) ──────────────────────────────────────
import transformerTestMap        from '@/config/test-definitions/Transformer'
import voltageTransformerTestMap from '@/config/test-definitions/VoltageTransformer'
import currentTransformerTestMap from '@/config/test-definitions/CurrentTransformer'
import circuitBreakerTestMap     from '@/config/test-definitions/CircuitBreaker'
import powerCableTestMap         from '@/config/test-definitions/PowerCable'
import surgeArresterTestMap      from '@/config/test-definitions/SurgeArrester'
import reactorTestMap            from '@/config/test-definitions/Reactor'
import capacitorTestMap          from '@/config/test-definitions/Capacitor'
import disconnectorTestMap       from '@/config/test-definitions/Disconnector'
import rotatingMachineTestMap    from '@/config/test-definitions/RotatingMachine'
import bushingTestMap            from '@/config/test-definitions/Bushing'

// ── Condition definitions (condition columns per test type) ───────────────────
import transformerConditionMap        from '@/config/testing-condition/Transformer'
import voltageTransformerConditionMap from '@/config/testing-condition/VoltageTransformer'
import currentTransformerConditionMap from '@/config/testing-condition/CurrentTransformer'
import circuitBreakerConditionMap     from '@/config/testing-condition/CircuitBreaker'
import powerCableConditionMap         from '@/config/testing-condition/PowerCable'
import surgeArresterConditionMap      from '@/config/testing-condition/SurgeArrester'
import reactorConditionMap            from '@/config/testing-condition/Reactor'
import capacitorConditionMap          from '@/config/testing-condition/Capacitor'
import disconnectorConditionMap       from '@/config/testing-condition/Disconnector'
import rotatingMachineConditionMap    from '@/config/testing-condition/RotatingMachine'
import bushingConditionMap            from '@/config/testing-condition/Bushing'

// ── Helper: merge testMap + conditionMap → định dạng chuẩn ───────────────────
function buildDefs(testMap, conditionMap) {
    const result = {}
    Object.keys(testMap).forEach(testCode => {
        const def = testMap[testCode]
        const cond = conditionMap[testCode] || {}
        result[testCode] = {
            testId:   def.testId   || '',
            testName: def.testName || testCode,
            columns: (def.columns || []).map(col => ({
                code: col.code,
                mrid: col.mrid,
                type: col.type,
                unit: col.unit || ''
            })),
            conditionColumns: (cond.columns || []).map(col => ({
                code: col.code,
                mrid: col.mrid,
                type: col.type,
                unit: col.unit || ''
            }))
        }
    })
    return result
}


// ── Multi-table config: chỉ khai báo các test có table2/table3 ───────────────
// Mỗi entry: { tables: ['table1', 'table2', ...], primaryField: { table1: 'field', table2: 'field', ... } }
// primaryField: field chính phân biệt row thuộc table nào khi import
// Nếu 1 test không có trong đây → mặc định chỉ có table1
export const MULTI_TABLE_CONFIG = {
    'Job_CircuitBreakerJobDto': {
        'SF6MoiturePurity': {
            tables: ['table1', 'table2'],
            primaryField: {
                table1: 'moiture',
                table2: 'purity'
            }
        },
        'SF6GasAnalysis': {
            tables: ['table1', 'table2', 'table3'],
            primaryField: {
                table1: 'decom_sf6',
                table2: 'so2_sof2',
                table3: 'hf'
            }
        }
    }
}

// ── Export TEST_DEFINITIONS ───────────────────────────────────────────────────
export const TEST_DEFINITIONS = {
    'Job_TransformerJobDto':        buildDefs(transformerTestMap,        transformerConditionMap),
    'Job_VoltageTransformerJobDto': buildDefs(voltageTransformerTestMap, voltageTransformerConditionMap),
    'Job_CurrentTransformerJobDto': buildDefs(currentTransformerTestMap, currentTransformerConditionMap),
    'Job_CircuitBreakerJobDto':     buildDefs(circuitBreakerTestMap,     circuitBreakerConditionMap),
    'Job_PowerCableJobDto':         buildDefs(powerCableTestMap,         powerCableConditionMap),
    'Job_SurgeArresterJobDto':      buildDefs(surgeArresterTestMap,      surgeArresterConditionMap),
    'Job_ReactorJobDto':            buildDefs(reactorTestMap,            reactorConditionMap),
    'Job_CapacitorJobDto':          buildDefs(capacitorTestMap,          capacitorConditionMap),
    'Job_DisconnectorJobDto':       buildDefs(disconnectorTestMap,       disconnectorConditionMap),
    'Job_RotatingMachineJobDto':    buildDefs(rotatingMachineTestMap,    rotatingMachineConditionMap),
    'Job_BushingJobDto':            buildDefs(bushingTestMap,            bushingConditionMap),
}