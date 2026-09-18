/* eslint-disable */
import procedureDataMap from '@/config/procedures/index.js'
import testDataMap from '@/config/test-definitions/index.js'
import testConditionMap from '@/config/testing-condition/index.js'
import testAssessmentMap from '@/config/testing-assessment/index.js'
import Analog from '@/views/Cim/Analog'
import StringMeasurement from '@/views/Cim/StringMeasurement'
import Discrete from '@/views/Cim/Discrete'
import ValueToAlias from '@/views/Cim/ValueToAlias'
import ValueAliasSet from '@/views/Cim/ValueAliasSet'
import Procedure from '@/views/Cim/Procedure'
import MeasurementProcedure from '@/views/Cim/MeasurementProcedure'
import * as surgeArresterProcedureFunc from './surgeArrester/index'
import * as voltageTransformerProcedureFunc from './voltageTransformer/index'
import * as circuitBreakerProcedureFunc from './circuitBreaker/index'
import * as currentTransformerProcedureFunc from './currentTransformer/index'
import * as transformerProcedureFunc from './transformer/index'
import * as disconnectorProcedureFunc from './disconnector/index'
import * as powerCableProcedureFunc from './powerCable/index'
import * as rotatingMachineProcedureFunc from './rotatingMachine/index'

export const updateProcedure = async (dbsql) => {
    await createProcedure(dbsql)
}

const DYNAMIC_CONTACT_RESISTANCE_CODES = [
    'ODynamicContactResistance',
    'CDynamicContactResistance',
]

const TRANSFORMER_PTM_IMPORT_CODES = [
    'WindingDfCap',
    'BushingPrimC1',
    'BushingPrimC2',
    'BushingSecC1',
    'BushingSecC2',
    'BushingTertC1',
    'BushingTertC2',
    'RatioPrimSec',
    'ExcitingCurrent',
    'ShortCircuitImpedancePrim',
    'ShortCircuitImpedanceSec',
    'ShortCircuitImpedanceTert',
    'DCWindingPrim',
    'DCWindingSec',
]

const pickConfigEntries = (source, codes) => {
    return codes.reduce((result, code) => {
        if (source && source[code]) result[code] = source[code]
        return result
    }, {})
}

/**
 * Keep this small catalogue addition independent from the database version.
 * Existing installations may already carry a newer user_version while still
 * missing these config rows. Every insert in the procedure seeder is an upsert,
 * so this is safe to run at startup and does not touch job/result data.
 */
export const ensureDynamicContactResistanceProcedures = async (dbsql) => {
    const circuitBreakerProcedures = procedureDataMap.CircuitBreaker || { procedure: [] }
    const selectedProcedureMap = {
        CircuitBreaker: {
            ...circuitBreakerProcedures,
            procedure: (circuitBreakerProcedures.procedure || []).filter(item => {
                return DYNAMIC_CONTACT_RESISTANCE_CODES.includes(item.code)
            }),
        },
    }
    const selectedTestMap = {
        CircuitBreaker: pickConfigEntries(
            testDataMap.CircuitBreaker,
            DYNAMIC_CONTACT_RESISTANCE_CODES
        ),
    }
    const selectedConditionMap = {
        CircuitBreaker: pickConfigEntries(
            testConditionMap.CircuitBreaker,
            DYNAMIC_CONTACT_RESISTANCE_CODES
        ),
    }

    await circuitBreakerProcedureFunc.createProcedureCircuitBreaker(
        dbsql,
        selectedProcedureMap,
        selectedTestMap,
        selectedConditionMap,
        getProcedureInfo,
        getTestDefinitionInfo,
        getTestConditionInfo
    )
}

/**
 * PTM import can start writing a newly-added measurement before an older
 * database has advanced through a full procedure refresh. Keep the exact
 * Transformer catalogue slice used by the importer available on every start.
 */
export const ensureTransformerPtmImportProcedures = async (dbsql) => {
    const transformerProcedures = procedureDataMap.Transformer || { procedure: [] }
    const selectedProcedureMap = {
        Transformer: {
            ...transformerProcedures,
            procedure: (transformerProcedures.procedure || []).filter(item => {
                return TRANSFORMER_PTM_IMPORT_CODES.includes(item.code)
            }),
        },
    }
    const selectedTestMap = {
        Transformer: pickConfigEntries(
            testDataMap.Transformer,
            TRANSFORMER_PTM_IMPORT_CODES
        ),
    }
    const selectedConditionMap = {
        Transformer: pickConfigEntries(
            testConditionMap.Transformer,
            TRANSFORMER_PTM_IMPORT_CODES
        ),
    }

    await transformerProcedureFunc.createProcedureTransformer(
        dbsql,
        selectedProcedureMap,
        selectedTestMap,
        selectedConditionMap,
        getProcedureInfo,
        getTestDefinitionInfo,
        getTestConditionInfo
    )
}

export const ensureRotatingMachineProcedures = async (dbsql) => {
    await rotatingMachineProcedureFunc.createProcedureRotatingMachine(
        dbsql,
        procedureDataMap,
        testDataMap,
        testConditionMap,
        getProcedureInfo,
        getTestDefinitionInfo,
        getTestConditionInfo
    )
}

export const createProcedure = async (dbsql) => {
    try {
        await surgeArresterProcedureFunc.createProcedureSurgeArrester(dbsql, procedureDataMap, testDataMap, testConditionMap,
            getProcedureInfo, getTestDefinitionInfo, getTestConditionInfo)
        await voltageTransformerProcedureFunc.createProcedureVoltageTransformer(dbsql, procedureDataMap, testDataMap, testConditionMap,
            getProcedureInfo, getTestDefinitionInfo, getTestConditionInfo)
        await circuitBreakerProcedureFunc.createProcedureCircuitBreaker(dbsql, procedureDataMap, testDataMap, testConditionMap,
            getProcedureInfo, getTestDefinitionInfo, getTestConditionInfo)
        await currentTransformerProcedureFunc.createProcedureCurrentTransformer(dbsql, procedureDataMap, testDataMap, testConditionMap,
            getProcedureInfo, getTestDefinitionInfo, getTestConditionInfo)
        await transformerProcedureFunc.createProcedureTransformer(dbsql, procedureDataMap, testDataMap, testConditionMap,
            getProcedureInfo, getTestDefinitionInfo, getTestConditionInfo)
        await disconnectorProcedureFunc.createProcedureDisconnector(dbsql, procedureDataMap, testDataMap, testConditionMap,
            getProcedureInfo, getTestDefinitionInfo, getTestConditionInfo)
        await powerCableProcedureFunc.createProcedurePowerCable(dbsql, procedureDataMap, testDataMap, testConditionMap,
            getProcedureInfo, getTestDefinitionInfo, getTestConditionInfo)
        await ensureRotatingMachineProcedures(dbsql)
    } catch (err) {
        throw new Error('Error creating procedure: ' + err.message)
    }
}

export const getProcedureInfo = async (assetProcedure) => {
    const procedures = []
    for (const procedureData of assetProcedure.procedure) {
        const procedure = new Procedure()
        procedure.name = procedureData.name
        procedure.generic_asset_model = assetProcedure.name
        procedure.alias_name = procedureData.code
        procedure.mrid = procedureData.mrid
        procedure.kind = procedureData.kind
        procedures.push(procedure)
    }
    return procedures
}

export const getTestDefinitionInfo = async (testDefinitions) => {
    const analogTests = []
    const stringMeasurementTests = []
    const discreteTests = []
    const valueToAliasTests = []
    const valueAliasSetTests = []
    const measurementProcedureTests = []
    for (const test of Object.values(testDefinitions)) {
        if (!test || !test.columns) continue
        for (const column of test.columns) {
            if (column.type === 'analog') {
                const analogTest = new Analog()
                analogTest.mrid = column.mrid
                analogTest.name = column.name
                analogTest.alias_name = column.code
                const { unit_symbol, unit_multiplier } = parseUnit(column.unit)
                analogTest.unit_symbol = unit_symbol
                analogTest.unit_multiplier = unit_multiplier
                analogTest.measurement_type = column.measurement_type || "test"
                analogTests.push(analogTest)
            } else if (column.type === 'string') {
                const stringMeasurementTest = new StringMeasurement()
                stringMeasurementTest.mrid = column.mrid
                stringMeasurementTest.name = column.name
                stringMeasurementTest.alias_name = column.code
                const { unit_symbol, unit_multiplier } = parseUnit(column.unit)
                stringMeasurementTest.unit_symbol = unit_symbol
                stringMeasurementTest.unit_multiplier = unit_multiplier
                stringMeasurementTest.measurement_type = column.measurement_type || "test"
                stringMeasurementTests.push(stringMeasurementTest)
            } else if (column.type === 'discrete') {
                const discreteTest = new Discrete()
                discreteTest.mrid = column.mrid
                discreteTest.name = column.name
                discreteTest.alias_name = column.code
                discreteTest.value_alias_set = column.valueAliasSetId
                discreteTest.measurement_type = column.measurement_type || "test"
                discreteTests.push(discreteTest)
                const valueAliasSetTest = new ValueAliasSet()
                valueAliasSetTest.mrid = column.valueAliasSetId
                valueAliasSetTests.push(valueAliasSetTest)
                for (const valueAlias of column.options) {
                    const valueToAliasTest = new ValueToAlias()
                    valueToAliasTest.mrid = valueAlias.mrid
                    valueToAliasTest.value_alias_set = column.valueAliasSetId
                    valueToAliasTest.alias_name = valueAlias.alias
                    valueToAliasTest.value = valueAlias.value
                    valueToAliasTests.push(valueToAliasTest)
                }
            }
            const measurementProcedure = new MeasurementProcedure()
            measurementProcedure.measurement_id = column.mrid
            measurementProcedure.procedure_id = test.testId
            measurementProcedureTests.push(measurementProcedure)
        }
    }
    return {
        analog: uniqueBy(analogTests, x => x.mrid),
        stringMeasurement: uniqueBy(stringMeasurementTests, x => x.mrid),
        discrete: uniqueBy(discreteTests, x => x.mrid),
        valueToAlias: uniqueBy(valueToAliasTests, x => x.mrid),
        valueAliasSet: uniqueBy(valueAliasSetTests, x => x.mrid),
        measurementProcedure: uniqueMeasurementProcedure(measurementProcedureTests)
    }
}

export const getTestConditionInfo = async (testConditions) => {
    const analogTests = []
    const stringMeasurementTests = []
    const discreteTests = []
    const valueToAliasTests = []
    const valueAliasSetTests = []
    const measurementProcedureTests = []
    for (const test of Object.values(testConditions)) {
        if (!test || !test.columns) continue
        for (const column of test.columns) {
            if (column.type === 'analog') {
                const analogTest = new Analog()
                analogTest.mrid = column.mrid
                analogTest.name = column.name
                analogTest.alias_name = column.code
                const { unit_symbol, unit_multiplier } = parseUnit(column.unit)
                analogTest.unit_symbol = unit_symbol
                analogTest.unit_multiplier = unit_multiplier
                analogTest.measurement_type = "condition"
                analogTests.push(analogTest)
            } else if (column.type === 'string') {
                const stringMeasurementTest = new StringMeasurement()
                stringMeasurementTest.mrid = column.mrid
                stringMeasurementTest.name = column.name
                stringMeasurementTest.alias_name = column.code
                const { unit_symbol, unit_multiplier } = parseUnit(column.unit)
                stringMeasurementTest.unit_symbol = unit_symbol
                stringMeasurementTest.unit_multiplier = unit_multiplier
                stringMeasurementTest.measurement_type = "condition"
                stringMeasurementTests.push(stringMeasurementTest)
            } else if (column.type === 'discrete') {
                const discreteTest = new Discrete()
                discreteTest.mrid = column.mrid
                discreteTest.name = column.name
                discreteTest.alias_name = column.code
                discreteTest.value_alias_set = column.valueAliasSetId
                discreteTest.measurement_type = "condition"
                discreteTests.push(discreteTest)
                const valueAliasSetTest = new ValueAliasSet()
                valueAliasSetTest.mrid = column.valueAliasSetId
                valueAliasSetTests.push(valueAliasSetTest)
                for (const valueAlias of column.options) {
                    const valueToAliasTest = new ValueToAlias()
                    valueToAliasTest.mrid = valueAlias.mrid
                    valueToAliasTest.value_alias_set = column.valueAliasSetId
                    valueToAliasTest.alias_name = valueAlias.alias
                    valueToAliasTest.value = valueAlias.value
                    valueToAliasTests.push(valueToAliasTest)
                }
            }
            const measurementProcedure = new MeasurementProcedure()
            measurementProcedure.measurement_id = column.mrid
            measurementProcedure.procedure_id = test.testId
            measurementProcedureTests.push(measurementProcedure)
        }
    }
    return {
        analog: uniqueBy(analogTests, x => x.mrid),
        stringMeasurement: uniqueBy(stringMeasurementTests, x => x.mrid),
        discrete: uniqueBy(discreteTests, x => x.mrid),
        valueToAlias: uniqueBy(valueToAliasTests, x => x.mrid),
        valueAliasSet: uniqueBy(valueAliasSetTests, x => x.mrid),
        measurementProcedure: uniqueMeasurementProcedure(measurementProcedureTests)
    }
}

/**
 * getTestAssessmentInfo — fixed: iterate qua testStandard[].columns
 * (version gốc bị lỗi vì gọi test.columns trực tiếp)
 */
export const getTestAssessmentInfo = async (testAssessments) => {
    const analogTests = []
    const stringMeasurementTests = []
    const discreteTests = []
    const valueToAliasTests = []
    const valueAliasSetTests = []
    const measurementProcedureTests = []

    for (const test of Object.values(testAssessments)) {
        const testStandards = test.testStandard || []
        for (const standard of testStandards) {
            const columns = standard.columns || []
            for (const column of columns) {
                if (column.type === 'analog') {
                    const analogTest = new Analog()
                    analogTest.mrid = column.mrid
                    analogTest.name = column.name
                    analogTest.alias_name = column.code
                    const { unit_symbol, unit_multiplier } = parseUnit(column.unit)
                    analogTest.unit_symbol = unit_symbol
                    analogTest.unit_multiplier = unit_multiplier
                    analogTest.measurement_type = column.measurement_type || "test, assessment"
                    analogTests.push(analogTest)
                } else if (column.type === 'string') {
                    const sm = new StringMeasurement()
                    sm.mrid = column.mrid
                    sm.name = column.name
                    sm.alias_name = column.code
                    const { unit_symbol, unit_multiplier } = parseUnit(column.unit)
                    sm.unit_symbol = unit_symbol
                    sm.unit_multiplier = unit_multiplier
                    sm.measurement_type = column.measurement_type || "test, assessment"
                    stringMeasurementTests.push(sm)
                } else if (column.type === 'discrete') {
                    const d = new Discrete()
                    d.mrid = column.mrid
                    d.name = column.name
                    d.alias_name = column.code
                    d.value_alias_set = column.valueAliasSetId
                    d.measurement_type = column.measurement_type || "test, assessment"
                    discreteTests.push(d)
                    const vas = new ValueAliasSet()
                    vas.mrid = column.valueAliasSetId
                    valueAliasSetTests.push(vas)
                    for (const valueAlias of (column.options || [])) {
                        const vta = new ValueToAlias()
                        vta.mrid = valueAlias.mrid
                        vta.value_alias_set = column.valueAliasSetId
                        vta.alias_name = valueAlias.alias
                        vta.value = valueAlias.value
                        valueToAliasTests.push(vta)
                    }
                }
                const mp = new MeasurementProcedure()
                mp.measurement_id = column.mrid
                mp.procedure_id = test.testId
                measurementProcedureTests.push(mp)
            }
        }
    }

    return {
        analog: uniqueBy(analogTests, x => x.mrid),
        stringMeasurement: uniqueBy(stringMeasurementTests, x => x.mrid),
        discrete: uniqueBy(discreteTests, x => x.mrid),
        valueToAlias: uniqueBy(valueToAliasTests, x => x.mrid),
        valueAliasSet: uniqueBy(valueAliasSetTests, x => x.mrid),
        measurementProcedure: uniqueMeasurementProcedure(measurementProcedureTests)
    }
}

const runAsync = (sql, dbsql, params = []) => {
    return new Promise((resolve, reject) => {
        dbsql.run(sql, params, function (err) {
            if (err) reject(err)
            else resolve()
        })
    })
}

function uniqueBy(arr, keyFn) {
    const map = new Map()
    for (const item of arr) {
        const key = keyFn(item)
        if (!map.has(key)) map.set(key, item)
    }
    return Array.from(map.values())
}

function uniqueMeasurementProcedure(arr) {
    const map = new Map()
    for (const item of arr) {
        const key = item.measurement_id + '__' + item.procedure_id
        if (!map.has(key)) map.set(key, item)
    }
    return Array.from(map.values())
}

function parseUnit(unitStr) {
    if (!unitStr) return { unit_symbol: "", unit_multiplier: "" }
    const parts = unitStr.split("|")
    if (parts.length === 2) return { unit_multiplier: parts[0], unit_symbol: parts[1] }
    return { unit_multiplier: "", unit_symbol: unitStr }
}
