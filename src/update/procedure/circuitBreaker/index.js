import * as procedureFunc from '@/function/cim/procedure/index'
import * as analogFunc from '@/function/cim/analog/index'
import * as stringMeasurementFunc from '@/function/cim/stringMeasurement/index'
import * as discreteFunc from '@/function/cim/discrete/index'
import * as valueAliasSet from '@/function/cim/valueAliasSet/index'
import * as valueToAliasFunc from '@/function/cim/valueToAlias/index'
import * as measurementProcedureFunc from '@/function/cim/measurementProcedure/index'
export const createProcedureCircuitBreaker = async (dbsql, procedureDataMap, testDataMap, testConditionMap,
    getProcedureInfo, getTestDefinitionInfo, getTestConditionInfo
) => {
    const circuitBreakerProcedureInfo = procedureDataMap['CircuitBreaker'];
    const circuitBreakerTestDefinitionInfo = testDataMap['CircuitBreaker'];
    const circuitBreakerTestingConditionInfo = testConditionMap['CircuitBreaker'];
    const circuitBreakerProcedure = await getProcedureInfo(circuitBreakerProcedureInfo)
    const circuitBreakerTestDefinitions = await getTestDefinitionInfo(circuitBreakerTestDefinitionInfo)
    const circuitBreakerTestingConditions = await getTestConditionInfo(circuitBreakerTestingConditionInfo)
    for (const procedure of circuitBreakerProcedure) {
        // Insert Procedure
        await procedureFunc.insertProcedureTransaction(procedure, dbsql)
    }
    // Insert Testing Definitions
    for(const analog of circuitBreakerTestDefinitions.analog){
        await analogFunc.insertAnalogTransaction(analog, dbsql)
    }
    for(const stringMeasurement of circuitBreakerTestDefinitions.stringMeasurement){
        await stringMeasurementFunc.insertStringMeasurementTransaction(stringMeasurement, dbsql)
    }
    for(const discrete of circuitBreakerTestDefinitions.valueAliasSet) {
        await valueAliasSet.insertValueAliasSetTransaction(discrete, dbsql)
    }
    for(const discrete of circuitBreakerTestDefinitions.discrete){
        await discreteFunc.insertDiscreteTransaction(discrete, dbsql)
    }
    for(const valueToAlias of circuitBreakerTestDefinitions.valueToAlias){
        await valueToAliasFunc.insertValueToAliasTransaction(valueToAlias, dbsql)
    }
    for(const measurementProcedure of circuitBreakerTestDefinitions.measurementProcedure){
        await measurementProcedureFunc.insertMeasurementProcedureTransaction(measurementProcedure, dbsql)
    }
    // Insert Testing Conditions
    for(const analog of circuitBreakerTestingConditions.analog){
        await analogFunc.insertAnalogTransaction(analog, dbsql)
    }
    for(const stringMeasurement of circuitBreakerTestingConditions.stringMeasurement){
        await stringMeasurementFunc.insertStringMeasurementTransaction(stringMeasurement, dbsql)
    }
    for(const discrete of circuitBreakerTestingConditions.valueAliasSet) {
        await valueAliasSet.insertValueAliasSetTransaction(discrete, dbsql)
    }
    for(const discrete of circuitBreakerTestingConditions.discrete){
        await discreteFunc.insertDiscreteTransaction(discrete, dbsql)
    }
    for(const valueToAlias of circuitBreakerTestingConditions.valueToAlias){
        await valueToAliasFunc.insertValueToAliasTransaction(valueToAlias, dbsql)
    }
    for(const measurementProcedure of circuitBreakerTestingConditions.measurementProcedure){
        await measurementProcedureFunc.insertMeasurementProcedureTransaction(measurementProcedure, dbsql)
    }
}