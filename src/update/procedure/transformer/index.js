import * as procedureFunc from '@/function/cim/procedure/index'
import * as analogFunc from '@/function/cim/analog/index'
import * as stringMeasurementFunc from '@/function/cim/stringMeasurement/index'
import * as discreteFunc from '@/function/cim/discrete/index'
import * as valueAliasSet from '@/function/cim/valueAliasSet/index'
import * as valueToAliasFunc from '@/function/cim/valueToAlias/index'
import * as measurementProcedureFunc from '@/function/cim/measurementProcedure/index'
export const createProcedureTransformer = async (dbsql, procedureDataMap, testDataMap, testConditionMap,
    getProcedureInfo, getTestDefinitionInfo, getTestConditionInfo
) => {
    const transformerProcedureInfo = procedureDataMap['Transformer'];
    const transformerTestDefinitionInfo = testDataMap['Transformer'];
    const transformerTestingConditionInfo = testConditionMap['Transformer'];
    const transformerProcedure = await getProcedureInfo(transformerProcedureInfo)
    const transformerTestDefinitions = await getTestDefinitionInfo(transformerTestDefinitionInfo)
    const transformerTestingConditions = await getTestConditionInfo(transformerTestingConditionInfo)
    for (const procedure of transformerProcedure) {
        // Insert Procedure
        await procedureFunc.insertProcedureTransaction(procedure, dbsql)
    }
    // Insert Testing Definitions
    for(const analog of transformerTestDefinitions.analog){
        await analogFunc.insertAnalogTransaction(analog, dbsql)
    }
    for(const stringMeasurement of transformerTestDefinitions.stringMeasurement){
        await stringMeasurementFunc.insertStringMeasurementTransaction(stringMeasurement, dbsql)
    }
    for(const discrete of transformerTestDefinitions.valueAliasSet) {
        await valueAliasSet.insertValueAliasSetTransaction(discrete, dbsql)
    }
    for(const discrete of transformerTestDefinitions.discrete){
        await discreteFunc.insertDiscreteTransaction(discrete, dbsql)
    }
    for(const valueToAlias of transformerTestDefinitions.valueToAlias){
        await valueToAliasFunc.insertValueToAliasTransaction(valueToAlias, dbsql)
    }
    for(const measurementProcedure of transformerTestDefinitions.measurementProcedure){
        await measurementProcedureFunc.insertMeasurementProcedureTransaction(measurementProcedure, dbsql)
    }
    // Insert Testing Conditions
    for(const analog of transformerTestingConditions.analog){
        await analogFunc.insertAnalogTransaction(analog, dbsql)
    }
    for(const stringMeasurement of transformerTestingConditions.stringMeasurement){
        await stringMeasurementFunc.insertStringMeasurementTransaction(stringMeasurement, dbsql)
    }
    for(const discrete of transformerTestingConditions.valueAliasSet) {
        await valueAliasSet.insertValueAliasSetTransaction(discrete, dbsql)
    }
    for(const discrete of transformerTestingConditions.discrete){
        await discreteFunc.insertDiscreteTransaction(discrete, dbsql)
    }
    for(const valueToAlias of transformerTestingConditions.valueToAlias){
        await valueToAliasFunc.insertValueToAliasTransaction(valueToAlias, dbsql)
    }
    for(const measurementProcedure of transformerTestingConditions.measurementProcedure){
        await measurementProcedureFunc.insertMeasurementProcedureTransaction(measurementProcedure, dbsql)
    }
}