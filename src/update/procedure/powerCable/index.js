import * as procedureFunc from '@/function/cim/procedure/index'
import * as analogFunc from '@/function/cim/analog/index'
import * as stringMeasurementFunc from '@/function/cim/stringMeasurement/index'
import * as discreteFunc from '@/function/cim/discrete/index'
import * as valueAliasSet from '@/function/cim/valueAliasSet/index'
import * as valueToAliasFunc from '@/function/cim/valueToAlias/index'
import * as measurementProcedureFunc from '@/function/cim/measurementProcedure/index'
export const createProcedurePowerCable = async (dbsql, procedureDataMap, testDataMap, testConditionMap,
    getProcedureInfo, getTestDefinitionInfo, getTestConditionInfo
) => {
    const powerCableProcedureInfo = procedureDataMap['PowerCable'];
    const powerCableTestDefinitionInfo = testDataMap['PowerCable'];
    const powerCableTestingConditionInfo = testConditionMap['PowerCable'];
    const powerCableProcedure = await getProcedureInfo(powerCableProcedureInfo)
    const powerCableTestDefinitions = await getTestDefinitionInfo(powerCableTestDefinitionInfo)
    const powerCableTestingConditions = await getTestConditionInfo(powerCableTestingConditionInfo)
    for (const procedure of powerCableProcedure) {
        // Insert Procedure
        await procedureFunc.insertProcedureTransaction(procedure, dbsql)
    }
    // Insert Testing Definitions
    for(const analog of powerCableTestDefinitions.analog){
        await analogFunc.insertAnalogTransaction(analog, dbsql)
    }
    for(const stringMeasurement of powerCableTestDefinitions.stringMeasurement){
        await stringMeasurementFunc.insertStringMeasurementTransaction(stringMeasurement, dbsql)
    }
    for(const discrete of powerCableTestDefinitions.valueAliasSet) {
        await valueAliasSet.insertValueAliasSetTransaction(discrete, dbsql)
    }
    for(const discrete of powerCableTestDefinitions.discrete){
        await discreteFunc.insertDiscreteTransaction(discrete, dbsql)
    }
    for(const valueToAlias of powerCableTestDefinitions.valueToAlias){
        await valueToAliasFunc.insertValueToAliasTransaction(valueToAlias, dbsql)
    }
    for(const measurementProcedure of powerCableTestDefinitions.measurementProcedure){
        await measurementProcedureFunc.insertMeasurementProcedureTransaction(measurementProcedure, dbsql)
    }
    // Insert Testing Conditions
    for(const analog of powerCableTestingConditions.analog){
        await analogFunc.insertAnalogTransaction(analog, dbsql)
    }
    for(const stringMeasurement of powerCableTestingConditions.stringMeasurement){
        await stringMeasurementFunc.insertStringMeasurementTransaction(stringMeasurement, dbsql)
    }
    for(const discrete of powerCableTestingConditions.valueAliasSet) {
        await valueAliasSet.insertValueAliasSetTransaction(discrete, dbsql)
    }
    for(const discrete of powerCableTestingConditions.discrete){
        await discreteFunc.insertDiscreteTransaction(discrete, dbsql)
    }
    for(const valueToAlias of powerCableTestingConditions.valueToAlias){
        await valueToAliasFunc.insertValueToAliasTransaction(valueToAlias, dbsql)
    }
    for(const measurementProcedure of powerCableTestingConditions.measurementProcedure){
        await measurementProcedureFunc.insertMeasurementProcedureTransaction(measurementProcedure, dbsql)
    }
}