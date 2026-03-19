import * as procedureFunc from '@/function/cim/procedure/index'
import * as analogFunc from '@/function/cim/analog/index'
import * as stringMeasurementFunc from '@/function/cim/stringMeasurement/index'
import * as discreteFunc from '@/function/cim/discrete/index'
import * as valueAliasSet from '@/function/cim/valueAliasSet/index'
import * as valueToAliasFunc from '@/function/cim/valueToAlias/index'
import * as measurementProcedureFunc from '@/function/cim/measurementProcedure/index'

export const createProcedureDisconnector = async (dbsql, procedureDataMap, testDataMap, testConditionMap,
    getProcedureInfo, getTestDefinitionInfo, getTestConditionInfo
) => {
    const disconnectorProcedureInfo = procedureDataMap['Disconnector'];
    const disconnectorTestDefinitionInfo = testDataMap['Disconnector'];
    const disconnectorTestingConditionInfo = testConditionMap['Disconnector'];
    const disconnectorProcedure = await getProcedureInfo(disconnectorProcedureInfo)
    const disconnectorTestDefinitions = await getTestDefinitionInfo(disconnectorTestDefinitionInfo)
    const disconnectorTestingConditions = await getTestConditionInfo(disconnectorTestingConditionInfo)
    
    for (const procedure of disconnectorProcedure) {
        // Insert Procedure
        await procedureFunc.insertProcedureTransaction(procedure, dbsql)
    }
    
    // Insert Testing Definitions
    for(const analog of disconnectorTestDefinitions.analog){
        await analogFunc.insertAnalogTransaction(analog, dbsql)
    }
    for(const stringMeasurement of disconnectorTestDefinitions.stringMeasurement){
        await stringMeasurementFunc.insertStringMeasurementTransaction(stringMeasurement, dbsql)
    }
    for(const discrete of disconnectorTestDefinitions.valueAliasSet) {
        await valueAliasSet.insertValueAliasSetTransaction(discrete, dbsql)
    }
    for(const discrete of disconnectorTestDefinitions.discrete){
        await discreteFunc.insertDiscreteTransaction(discrete, dbsql)
    }
    for(const valueToAlias of disconnectorTestDefinitions.valueToAlias){
        await valueToAliasFunc.insertValueToAliasTransaction(valueToAlias, dbsql)
    }
    for(const measurementProcedure of disconnectorTestDefinitions.measurementProcedure){
        await measurementProcedureFunc.insertMeasurementProcedureTransaction(measurementProcedure, dbsql)
    }
    
    // Insert Testing Conditions
    for(const analog of disconnectorTestingConditions.analog){
        await analogFunc.insertAnalogTransaction(analog, dbsql)
    }
    for(const stringMeasurement of disconnectorTestingConditions.stringMeasurement){
        await stringMeasurementFunc.insertStringMeasurementTransaction(stringMeasurement, dbsql)
    }
    for(const discrete of disconnectorTestingConditions.valueAliasSet) {
        await valueAliasSet.insertValueAliasSetTransaction(discrete, dbsql)
    }
    for(const discrete of disconnectorTestingConditions.discrete){
        await discreteFunc.insertDiscreteTransaction(discrete, dbsql)
    }
    for(const valueToAlias of disconnectorTestingConditions.valueToAlias){
        await valueToAliasFunc.insertValueToAliasTransaction(valueToAlias, dbsql)
    }
    for(const measurementProcedure of disconnectorTestingConditions.measurementProcedure){
        await measurementProcedureFunc.insertMeasurementProcedureTransaction(measurementProcedure, dbsql)
    }
}