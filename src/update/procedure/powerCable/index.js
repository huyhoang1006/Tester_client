/* eslint-disable */
import * as procedureFunc from '@/function/cim/procedure/index'
import * as analogFunc from '@/function/cim/analog/index'
import * as stringMeasurementFunc from '@/function/cim/stringMeasurement/index'
import * as discreteFunc from '@/function/cim/discrete/index'
import * as valueAliasSet from '@/function/cim/valueAliasSet/index'
import * as valueToAliasFunc from '@/function/cim/valueToAlias/index'
import * as measurementProcedureFunc from '@/function/cim/measurementProcedure/index'
import * as common from '../common/index'
import testAssessmentMap from '@/config/testing-assessment/index.js'

export const createProcedurePowerCable = async (
    dbsql,
    procedureDataMap,
    testDataMap,
    testConditionMap,
    getProcedureInfo,
    getTestDefinitionInfo,
    getTestConditionInfo
) => {
    const powerCableProcedureInfo        = procedureDataMap['PowerCable']
    const powerCableTestDefinitionInfo   = testDataMap['PowerCable']
    const powerCableTestingConditionInfo = testConditionMap['PowerCable']
    const powerCableAssessmentInfo       = testAssessmentMap ? testAssessmentMap['PowerCable'] : null

    const powerCableProcedure         = await getProcedureInfo(powerCableProcedureInfo)
    const powerCableTestDefinitions   = await getTestDefinitionInfo(powerCableTestDefinitionInfo)
    const powerCableTestingConditions = await getTestConditionInfo(powerCableTestingConditionInfo)

    // ─── Procedures ───────────────────────────────────────────────────────────
    for (var i = 0; i < powerCableProcedure.length; i++) {
        await procedureFunc.insertProcedureTransaction(powerCableProcedure[i], dbsql)
    }

    // ─── Test Definitions ─────────────────────────────────────────────────────
    for (var i = 0; i < powerCableTestDefinitions.analog.length; i++) {
        await analogFunc.insertAnalogTransaction(powerCableTestDefinitions.analog[i], dbsql)
    }
    for (var i = 0; i < powerCableTestDefinitions.stringMeasurement.length; i++) {
        await stringMeasurementFunc.insertStringMeasurementTransaction(powerCableTestDefinitions.stringMeasurement[i], dbsql)
    }
    for (var i = 0; i < powerCableTestDefinitions.valueAliasSet.length; i++) {
        await valueAliasSet.insertValueAliasSetTransaction(powerCableTestDefinitions.valueAliasSet[i], dbsql)
    }
    for (var i = 0; i < powerCableTestDefinitions.discrete.length; i++) {
        await discreteFunc.insertDiscreteTransaction(powerCableTestDefinitions.discrete[i], dbsql)
    }
    for (var i = 0; i < powerCableTestDefinitions.valueToAlias.length; i++) {
        await valueToAliasFunc.insertValueToAliasTransaction(powerCableTestDefinitions.valueToAlias[i], dbsql)
    }
    for (var i = 0; i < powerCableTestDefinitions.measurementProcedure.length; i++) {
        await measurementProcedureFunc.insertMeasurementProcedureTransaction(powerCableTestDefinitions.measurementProcedure[i], dbsql)
    }

    // ─── Testing Conditions ───────────────────────────────────────────────────
    for (var i = 0; i < powerCableTestingConditions.analog.length; i++) {
        await analogFunc.insertAnalogTransaction(powerCableTestingConditions.analog[i], dbsql)
    }
    for (var i = 0; i < powerCableTestingConditions.stringMeasurement.length; i++) {
        await stringMeasurementFunc.insertStringMeasurementTransaction(powerCableTestingConditions.stringMeasurement[i], dbsql)
    }
    for (var i = 0; i < powerCableTestingConditions.valueAliasSet.length; i++) {
        await valueAliasSet.insertValueAliasSetTransaction(powerCableTestingConditions.valueAliasSet[i], dbsql)
    }
    for (var i = 0; i < powerCableTestingConditions.discrete.length; i++) {
        await discreteFunc.insertDiscreteTransaction(powerCableTestingConditions.discrete[i], dbsql)
    }
    for (var i = 0; i < powerCableTestingConditions.valueToAlias.length; i++) {
        await valueToAliasFunc.insertValueToAliasTransaction(powerCableTestingConditions.valueToAlias[i], dbsql)
    }
    for (var i = 0; i < powerCableTestingConditions.measurementProcedure.length; i++) {
        await measurementProcedureFunc.insertMeasurementProcedureTransaction(powerCableTestingConditions.measurementProcedure[i], dbsql)
    }

    // ─── Seed pre-defined assessment standards (IEEE, IEC, ASTM, ...) ─────────
    if (powerCableAssessmentInfo) {
        var testKeys = Object.keys(powerCableAssessmentInfo)
        for (var ti = 0; ti < testKeys.length; ti++) {
            var testEntry     = powerCableAssessmentInfo[testKeys[ti]]
            var testStandards = testEntry && testEntry.testStandard ? testEntry.testStandard : []
            for (var si = 0; si < testStandards.length; si++) {
                await common.seedStandard(testStandards[si], dbsql)
            }
        }
    }
}