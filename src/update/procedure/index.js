import * as procedureFunc from '@/function/cim/procedure/index'
import procedureDataMap from '@/config/procedures/index.js'
import testDataMap from '@/config/test-definitions/index.js'
import * as analogFunc from '@/function/cim/analog/index'
import * as stringMeasurementFunc from '@/function/cim/stringMeasurement/index'
import * as discreteFunc from '@/function/cim/discrete/index'
import * as valueAliasSet from '@/function/cim/valueAliasSet/index'
import * as valueToAliasFunc from '@/function/cim/valueToAlias/index'
import * as measurementProcedureFunc from '@/function/cim/measurementProcedure/index'
import Analog from '@/views/Cim/Analog'
import StringMeasurement from '@/views/Cim/StringMeasurement'
import Discrete from '@/views/Cim/Discrete'
import ValueToAlias from '@/views/Cim/ValueToAlias'
import ValueAliasSet from '@/views/Cim/ValueAliasSet'
import Procedure from '@/views/Cim/Procedure'
import MeasurementProcedure from '@/views/Cim/MeasurementProcedure'


export const updateProcedure = async (dbsql) => {
    console.log(procedureDataMap['Capacitor'])
}

export const createProcedure = async (dbsql) => {
    try {
        await runAsync('BEGIN TRANSACTION', dbsql);
        const surgeArresterProcedureInfo = procedureDataMap['SurgeArrester'];
        const surgeArresterTestDefinitionInfo = testDataMap['SurgeArrester'];
        const surgerArresterProcedure = await getProcedureInfo(surgeArresterProcedureInfo)
        const surgeArresterTestDefinitions = await getTestDefinitionInfo(surgeArresterTestDefinitionInfo)
        for (const procedure of surgerArresterProcedure) {
            await procedureFunc.insertProcedureTransaction(procedure, dbsql)
            for(const analog of surgeArresterTestDefinitions.analog){
                await analogFunc.insertAnalogTransaction(analog, dbsql)
            }
            for(const stringMeasurement of surgeArresterTestDefinitions.stringMeasurement){
                await stringMeasurementFunc.insertStringMeasurementTransaction(stringMeasurement, dbsql)
            }
            for(const discrete of surgeArresterTestDefinitions.valueAliasSet) {
                await valueAliasSet.insertValueAliasSetTransaction(discrete, dbsql)
            }
            for(const discrete of surgeArresterTestDefinitions.discrete){
                await discreteFunc.insertDiscreteTransaction(discrete, dbsql)
            }
            for(const valueToAlias of surgeArresterTestDefinitions.valueToAlias){
                await valueToAliasFunc.insertValueToAliasTransaction(valueToAlias, dbsql)
            }
            for(const measurementProcedure of surgeArresterTestDefinitions.measurementProcedure){
                await measurementProcedureFunc.insertMeasurementProcedureTransaction(measurementProcedure, dbsql)
            }
        }
        await runAsync('COMMIT', dbsql);
    } catch (err) {
        console.error('Error creating procedure:', err)
        await runAsync('ROLLBACK', dbsql);
    }
}

export const getProcedureInfo = async (assetProcedure) => {
    const procedures = []
    for(const surgeProcedure of assetProcedure.procedure){
        const procedure = new Procedure()
        procedure.name = surgeProcedure.name
        procedure.generic_asset_model = assetProcedure.name
        procedure.alias_name = surgeProcedure.code
        procedure.mrid = surgeProcedure.mrid
        procedure.kind = surgeProcedure.kind
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
        for (const column of test.columns) {
            if(column.type === 'analog'){
                const analogTest = new Analog()
                analogTest.mrid = column.mrid
                analogTest.name = column.name
                analogTest.alias_name = column.code
                const { unit_symbol, unit_multiplier } = parseUnit(column.unit)
                analogTest.unit_symbol = unit_symbol
                analogTest.unit_multiplier = unit_multiplier
                analogTests.push(analogTest)
            } else if(column.type === 'string'){
                const stringMeasurementTest = new StringMeasurement()
                stringMeasurementTest.mrid = column.mrid
                stringMeasurementTest.name = column.name
                stringMeasurementTest.alias_name = column.code
                const { unit_symbol, unit_multiplier } = parseUnit(column.unit)
                stringMeasurementTest.unit_symbol = unit_symbol
                stringMeasurementTest.unit_multiplier = unit_multiplier
                stringMeasurementTests.push(stringMeasurementTest)
            } else if(column.type === 'discrete'){
                const discreteTest = new Discrete()
                discreteTest.mrid = column.mrid
                discreteTest.name = column.name
                discreteTest.alias_name = column.code
                discreteTest.value_alias_set = column.valueAliasSetId
                discreteTests.push(discreteTest)
                const valueAliasSetTest = new ValueAliasSet()
                valueAliasSetTest.mrid = column.valueAliasSetId
                valueAliasSetTests.push(valueAliasSetTest)
                for(const valueAlias of column.options){
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

const runAsync = (sql, dbsql, params = []) => {
    return new Promise((resolve, reject) => {
        dbsql.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};

function uniqueBy(arr, keyFn) {
  const map = new Map()
  for (const item of arr) {
    const key = keyFn(item)
    if (!map.has(key)) {
      map.set(key, item)
    }
  }
  return Array.from(map.values())
}

function uniqueMeasurementProcedure(arr) {
  const map = new Map()

  for (const item of arr) {
    const key = `${item.measurement_id}__${item.procedure_id}`
    if (!map.has(key)) {
      map.set(key, item)
    }
  }

  return Array.from(map.values())
}

function parseUnit(unitStr = "") {
  if (!unitStr) {
    return { unit_symbol: "", unit_multiplier: "" }
  }

  // Ví dụ: "M|Ω" → ["M", "Ω"]
  const parts = unitStr.split("|")

  if (parts.length === 2) {
    return {
      unit_multiplier: parts[0],
      unit_symbol: parts[1]
    }
  }

  // Nếu không có |, coi như chỉ là symbol
  return {
    unit_multiplier: "",
    unit_symbol: unitStr
  }
}

