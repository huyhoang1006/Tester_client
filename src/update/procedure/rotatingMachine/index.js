/* eslint-disable */
import * as procedureFunc from '@/function/cim/procedure/index'
import * as analogFunc from '@/function/cim/analog/index'
import * as stringMeasurementFunc from '@/function/cim/stringMeasurement/index'
import * as discreteFunc from '@/function/cim/discrete/index'
import * as valueAliasSetFunc from '@/function/cim/valueAliasSet/index'
import * as valueToAliasFunc from '@/function/cim/valueToAlias/index'
import * as measurementProcedureFunc from '@/function/cim/measurementProcedure/index'
import * as common from '../common/index'
import testAssessmentMap from '@/config/testing-assessment/index.js'

const insertMeasurementCatalog = async (catalog, dbsql) => {
    for (const item of catalog.analog) await analogFunc.insertAnalogTransaction(item, dbsql)
    for (const item of catalog.stringMeasurement) await stringMeasurementFunc.insertStringMeasurementTransaction(item, dbsql)
    for (const item of catalog.valueAliasSet) await valueAliasSetFunc.insertValueAliasSetTransaction(item, dbsql)
    for (const item of catalog.discrete) await discreteFunc.insertDiscreteTransaction(item, dbsql)
    for (const item of catalog.valueToAlias) await valueToAliasFunc.insertValueToAliasTransaction(item, dbsql)
    for (const item of catalog.measurementProcedure) await measurementProcedureFunc.insertMeasurementProcedureTransaction(item, dbsql)
}

export const createProcedureRotatingMachine = async (
    dbsql,
    procedureDataMap,
    testDataMap,
    testConditionMap,
    getProcedureInfo,
    getTestDefinitionInfo,
    getTestConditionInfo
) => {
    const procedureInfo = procedureDataMap.RotatingMachine
    const definitionInfo = testDataMap.RotatingMachine || {}
    const conditionInfo = testConditionMap.RotatingMachine || {}
    const assessmentInfo = testAssessmentMap.RotatingMachine || {}

    const procedures = await getProcedureInfo(procedureInfo)
    const definitions = await getTestDefinitionInfo(definitionInfo)
    const conditions = await getTestConditionInfo(conditionInfo)

    for (const procedure of procedures) await procedureFunc.insertProcedureTransaction(procedure, dbsql)
    await insertMeasurementCatalog(definitions, dbsql)
    await insertMeasurementCatalog(conditions, dbsql)

    for (const testEntry of Object.values(assessmentInfo)) {
        for (const standard of (testEntry && testEntry.testStandard) || []) {
            await common.seedStandard(standard, dbsql)
        }
    }
}
