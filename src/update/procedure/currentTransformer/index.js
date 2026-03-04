import * as procedureFunc from '@/function/cim/procedure/index'
import * as analogFunc from '@/function/cim/analog/index'
import * as stringMeasurementFunc from '@/function/cim/stringMeasurement/index'
import * as discreteFunc from '@/function/cim/discrete/index'
import * as valueAliasSet from '@/function/cim/valueAliasSet/index'
import * as valueToAliasFunc from '@/function/cim/valueToAlias/index'
import * as measurementProcedureFunc from '@/function/cim/measurementProcedure/index'
export const createProcedureCurrentTransformer = async (dbsql, procedureDataMap, testDataMap, testConditionMap,
    getProcedureInfo, getTestDefinitionInfo, getTestConditionInfo
) => {
    const currentTransformerProcedureInfo = procedureDataMap['CurrentTransformer'];
    const currentTransformerTestDefinitionInfo = testDataMap['CurrentTransformer'];
    const currentTransformerTestingConditionInfo = testConditionMap['CurrentTransformer'];
    const currentTransformerProcedure = await getProcedureInfo(currentTransformerProcedureInfo)
    const currentTransformerTestDefinitions = await getTestDefinitionInfo(currentTransformerTestDefinitionInfo)
    const currentTransformerTestingConditions = await getTestConditionInfo(currentTransformerTestingConditionInfo)
    for (const procedure of currentTransformerProcedure) {
        // Insert Procedure
        await procedureFunc.insertProcedureTransaction(procedure, dbsql)
    }
    // Insert Testing Definitions
    for(const analog of currentTransformerTestDefinitions.analog){
        await analogFunc.insertAnalogTransaction(analog, dbsql)
    }
    for(const stringMeasurement of currentTransformerTestDefinitions.stringMeasurement){
        await stringMeasurementFunc.insertStringMeasurementTransaction(stringMeasurement, dbsql)
    }
    for(const discrete of currentTransformerTestDefinitions.valueAliasSet) {
        await valueAliasSet.insertValueAliasSetTransaction(discrete, dbsql)
    }
    for(const discrete of currentTransformerTestDefinitions.discrete){
        await discreteFunc.insertDiscreteTransaction(discrete, dbsql)
    }
    for(const valueToAlias of currentTransformerTestDefinitions.valueToAlias){
        await valueToAliasFunc.insertValueToAliasTransaction(valueToAlias, dbsql)
    }
    for(const measurementProcedure of currentTransformerTestDefinitions.measurementProcedure){
        await measurementProcedureFunc.insertMeasurementProcedureTransaction(measurementProcedure, dbsql)
    }
    // Insert Testing Conditions
    for(const analog of currentTransformerTestingConditions.analog){
        await analogFunc.insertAnalogTransaction(analog, dbsql)
    }
    for(const stringMeasurement of currentTransformerTestingConditions.stringMeasurement){
        await stringMeasurementFunc.insertStringMeasurementTransaction(stringMeasurement, dbsql)
    }
    for(const discrete of currentTransformerTestingConditions.valueAliasSet) {
        await valueAliasSet.insertValueAliasSetTransaction(discrete, dbsql)
    }
    for(const discrete of currentTransformerTestingConditions.discrete){
        await discreteFunc.insertDiscreteTransaction(discrete, dbsql)
    }
    for(const valueToAlias of currentTransformerTestingConditions.valueToAlias){
        await valueToAliasFunc.insertValueToAliasTransaction(valueToAlias, dbsql)
    }
    for(const measurementProcedure of currentTransformerTestingConditions.measurementProcedure){
        await measurementProcedureFunc.insertMeasurementProcedureTransaction(measurementProcedure, dbsql)
    }
}