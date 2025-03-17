'use strict'
import Excel from 'exceljs'
import * as convert from "./toPDF"
const fs = require('fs')
import { v4 as newUuid } from 'uuid'
import path from 'path'
import db from '../datacontext/index'
const pathTemplate = path.join(__dirname,`/../template`)
import * as locationFunc from '../transformer/location'
import * as transformerFunc from '../transformer/asset'
import transformer from '@/views/ManageView/upload/constant/transformer'
import transformerValue from '@/views/ManageView/upload/constant/transformer/transformerValue'
import transformerTable from '@/views/ManageView/upload/constant/transformer/table'
import tapChangerTable from '@/views/ManageView/upload/constant/transformer/tapchangerTable'
import * as transformerJobFunc from '../transformer/job'
import * as dataTransformerTest from './templateData/transformerTest'
import * as conditionTest from './templateData/condition'
import * as dataCircuitTest from './templateData/circuitTest'
import transformerTableTest from '@/views/ManageView/upload/constant/transformer/tableTest'
import * as circuitFunc from '../circuitBreaker/asset'
import * as circuitJobFunc from '../circuitBreaker/job'
import * as currentTransFunc from '../currentTransformer/asset'
import * as currentTransJobFunc from '../currentTransformer/job'
import * as voltageTransFunc from '../voltageTransformer/asset'
import * as voltageTransJobFunc from '../voltageTransformer/job'
import * as disconnectorFunc from '../disconnector/asset'
import * as disconnectorJobFunc from '../disconnector/job'
import * as powerCableFunc from '../powerCable/asset'
import * as powerCableJobFunc from '../powerCable/job'
import * as surgeArresterFunc from '../surgeArrester/asset'
import * as surgeArresterJobFunc from '../surgeArrester/job'
import * as ownerFunc from '../organisation/index'

import assessmentLimitsTable from '@/views/ManageView/upload/constant/circuitBreaker/AssessmentTable'
import assessmentValue from '@/views/ManageView/upload/constant/circuitBreaker/AssessmentValue'
import operatingMechanismTable from '@/views/ManageView/upload/constant/circuitBreaker/operatingMechanismTable'
import circuitTableTest from '@/views/ManageView/upload/constant/circuitBreaker/circuitTableTest'
import * as templateData from './templateData/index'
import * as current from '@/views/ManageView/upload/constant/currentTrans/index'
import * as voltage from '@/views/ManageView/upload/constant/voltageTrans/index'
import * as disconnector from '@/views/ManageView/upload/constant/disconnector/index'
import * as powerCable from '@/views/ManageView/upload/constant/powerCable/index'
import * as surge from '@/views/ManageView/upload/constant/surgeArrester/index'
import { conditionFunc, jobAssetFunc } from '..'


export const uploadTemplate = async (file_Path, pathTemplate, name) => {
    let rsSplit = file_Path.split('.')
    if(rsSplit[rsSplit.length - 1] == 'xlsx') {
        const wb = new Excel.Workbook();
        let newName = name + ".xlsx"
        await wb.xlsx.readFile(file_Path)
        var path_name = await saveFile(wb, pathTemplate, newName)
        await updatePathByName(path_name, name)
        return path_name
    } else {
        let newName = name + '.docx'
        let rawdata = fs.readFileSync(file_Path)
        var path_name = path.join(pathTemplate, `/${newName}`)
        fs.writeFileSync(path_name, rawdata);
        await updatePathByName(path_name, name)
        return path_name
    }
}

export const readVarFromJson = async (file_Path) => {
    let rawdata = fs.readFileSync(file_Path);
    let jsonData = JSON.parse(rawdata);
    return jsonData
}

export const saveFile = async (data, pathTemplate, name) => {
    var path_name = path.join(pathTemplate, `/${name}`)
    await data.xlsx.writeFile(path_name)
    return path_name
}

export const uploadCustom = async (file_Path, name) => {
    var path_name = uploadTemplate(file_Path, pathTemplate, name)
    return path_name
}

export const getColumnByName = async (name) => {
    return new Promise((resolve, reject) => {
        db.all("PRAGMA table_info( " + name.toString() + ")", [], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const getAllInforAsset = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM assets", [], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const getNameTemplate = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM template", (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const getTemplateByName = (name) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM template where name = ?", [name], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const deleteTempByName = (name) => {
    return new Promise((resolve, reject) => {
        db.get("DELETE FROM template WHERE name = ?", [name], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const updateTempByName = (data) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE template' +
            ' SET variable = ?' +
            ' WHERE name = ?',
            [
              JSON.stringify(data.variable),   data.name.toString(),
            ], function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const updatePathByName = (path, name) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE template' +
            ' SET path = ?' +
            ' WHERE name = ?',
            [
              path, name
            ], function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const uploadReport = async (path, name, assetData, locationChosen, jobData, user_id) => {

    let conditionData = await conditionTest.initCondition()
    //location
    let locationData = JSON.parse(JSON.stringify(templateData.dataLoction.default))

    //transformer asset & job
    let transformerData = JSON.parse(JSON.stringify(templateData.dataTransformer.default))
    let bushingData = JSON.parse(JSON.stringify(templateData.databushingData.default))
    let tapChangerData = JSON.parse(JSON.stringify(templateData.dataTapChanger.default))
    let transformerJobData = JSON.parse(JSON.stringify(templateData.dataTransformerJob.default))

    // circuit breaker asset & job
    let circuitBreakerData = JSON.parse(JSON.stringify(templateData.dataCircuitBreaker.default))
    let circuitJobData = JSON.parse(JSON.stringify(templateData.dataCircuitJob.default))

    // current transformer asset & job
    let currentTransData = JSON.parse(JSON.stringify(templateData.dataCurrentTrans.default))
    let currentJobData = JSON.parse(JSON.stringify(templateData.dataCurrentJob.default))

    // // voltage transformer asset & job
    let voltageTransData = JSON.parse(JSON.stringify(templateData.dataVoltageTrans.default))
    let voltageJobData = JSON.parse(JSON.stringify(templateData.dataVoltageJob.default))

    // disconnector asset & job
    let disconnectorData = JSON.parse(JSON.stringify(templateData.dataDisconnector.default))
    let disconnectorJobData = JSON.parse(JSON.stringify(templateData.dataDisconnectorJob.default))

    // power cable asset & job
    let powerCableData = JSON.parse(JSON.stringify(templateData.dataPowerCable.default))
    let powerCableJobData = JSON.parse(JSON.stringify(templateData.dataPowerCableJob.default))

    // surge arrester asset & job
    let surgeData = JSON.parse(JSON.stringify(templateData.dataSurge.default))
    let surgeJobData = JSON.parse(JSON.stringify(templateData.dataSurgeJob.default))
    
    //testData
    let transformerTestTemplateData = JSON.parse(JSON.stringify(templateData.dataTransformerTestTemp.default))
    let circuitTestTemplateData = JSON.parse(JSON.stringify(templateData.dataCircuitBreakerTestTemp.default))
    let currentTestTemplateData = JSON.parse(JSON.stringify(templateData.dataCurrentTestTemp.default))
    let voltageTestTemplateData = JSON.parse(JSON.stringify(templateData.dataVoltageTestTemp.default))
    let disconnectorTestTemplateData = JSON.parse(JSON.stringify(templateData.dataDisconnectorTestTemp.default))
    let powerCableTestTemplateData = JSON.parse(JSON.stringify(templateData.dataPowerCableTestTemp.default))
    let surgeTestTemplateData = JSON.parse(JSON.stringify(templateData.dataSurgeTestTemp.default))

    //test list data
    let transformerTestData = []
    let circuitTestData = []
    let currentTestData = []
    let voltageTestData = []
    let disconnectorTestData = []
    let powerCableTestData = []
    let surgeTestData = []

    // all testList
    let listTestTransformer = Object.keys(transformerTableTest)
    let listTestCircuit = Object.keys(circuitTableTest)
    let listTestCurrent = Object.keys(current.currentTableTest.default)
    let listTestVoltage = Object.keys(voltage.voltageTableTest.default)
    let listTestDisconnector = Object.keys(disconnector.disconnectorTableTest.default)
    let listTestPowerCable = Object.keys(powerCable.powerCableTableTest.default)
    let listTestSurge = Object.keys(surge.surgeArresterTableTest.default)

    // 
    let listTestTransformerTemp = []
    let listTestCircuitTemp = []
    let listTestCurrentTemp = []
    let listTestVoltageTemp = []
    let listTestDisconnectorTemp = []
    let listTestPowerCableTemp = []
    let listTestSurgeTemp = []

    locationData.user_id = user_id
    if(locationChosen != undefined) {
        if(['owner1', 'owner2', 'owner3'].includes(locationChosen.mode)) {
            locationData.mode = 'location'
            locationData.owner_id = locationChosen.id
            locationData.refId = locationChosen.id
        } else if(locationChosen.mode == 'location') {
            locationData.mode = 'voltage'
            locationData.owner_id = locationChosen.owner_id
            locationData.refId = locationChosen.id
        } else if(locationChosen.mode == 'voltage') {
            locationData.mode = 'feeder'
            locationData.owner_id = locationChosen.owner_id
            locationData.refId = locationChosen.id
        } else if(locationChosen.mode == 'feeder') {
            locationData.mode = 'feeder'
            locationData.owner_id = locationChosen.owner_id
            locationData.refId = locationChosen.refId
        }
    } else {
        var dataRoot = await ownerFunc.getOwnerByName('root')
        locationData.mode = 'location'
        locationData.owner_id = dataRoot.data[0].id
        locationData.refId = dataRoot.data[0].id
    }
    var workbook = new Excel.Workbook()
    await workbook.xlsx.readFile(path)
    let data = await getTemplateByName(name)
    data.variable = JSON.parse(data.variable)

    for(let index in data.variable) {
        if(listTestTransformer.includes(data.variable[index].feature)) {
            listTestTransformerTemp.push(data.variable[index].feature)
        } else if(listTestCircuit.includes(data.variable[index].feature)) {
            listTestCircuitTemp.push(data.variable[index].feature)
        } else if(listTestCurrent.includes(data.variable[index].feature) && data.variable[index].categories.includes("Current")) {
            listTestCurrentTemp.push(data.variable[index].feature)
        } else if(listTestVoltage.includes(data.variable[index].feature) && data.variable[index].categories.includes("Voltage")) {
            listTestVoltageTemp.push(data.variable[index].feature)
        } else if(listTestDisconnector.includes(data.variable[index].feature) && data.variable[index].categories.includes("Disconnector")) {
            listTestDisconnectorTemp.push(data.variable[index].feature)
        } else if(listTestPowerCable.includes(data.variable[index].feature) && data.variable[index].categories.includes("Power cable")) {
            listTestPowerCableTemp.push(data.variable[index].feature)
        } else if(listTestSurge.includes(data.variable[index].feature) && data.variable[index].categories.includes("Surge")) {
            listTestSurgeTemp.push(data.variable[index].feature)
        }
    }

    listTestTransformerTemp = [...new Set(listTestTransformerTemp)]
    listTestCircuitTemp = [...new Set(listTestCircuitTemp)]
    listTestCurrentTemp = [...new Set(listTestCurrentTemp)]
    listTestVoltageTemp = [...new Set(listTestVoltageTemp)]
    listTestDisconnectorTemp = [...new Set(listTestDisconnectorTemp)]
    listTestPowerCableTemp = [...new Set(listTestPowerCableTemp)]
    listTestSurgeTemp = [...new Set(listTestSurgeTemp)]

    for(let index in listTestTransformerTemp) {
        transformerTestData.push({
            code : listTestTransformerTemp[index],
            data : await dataTransformerTest.initTest(listTestTransformerTemp[index]),
            condition : await conditionTest.initCondition()
        })
    }

    for(let index in listTestCircuitTemp) {
        circuitTestData.push({
            code : listTestCircuitTemp[index],
            data : await dataCircuitTest.initTest(listTestCircuitTemp[index]),
            condition : await conditionTest.initCondition()
        })
    }

    for(let index in listTestCurrentTemp) {
        currentTestData.push({
            code : listTestCurrentTemp[index],
            data : await templateData.dataCurrentTest.initTest(listTestCurrentTemp[index]),
            condition : await conditionTest.initCondition()
        })
    }

    for(let index in listTestVoltageTemp) {
        voltageTestData.push({
            code : listTestVoltageTemp[index],
            data : await templateData.dataVoltageTest.initTest(listTestVoltageTemp[index]),
            condition : await conditionTest.initCondition()
        })
    }

    for(let index in listTestDisconnectorTemp) {
        disconnectorTestData.push({
            code : listTestDisconnectorTemp[index],
            data : await templateData.dataDisconnectorTest.initTest(listTestDisconnectorTemp[index]),
            condition : await conditionTest.initCondition()
        })
    }

    for(let index in listTestSurgeTemp) {
        surgeTestData.push({
            code : listTestSurgeTemp[index],
            data : await templateData.dataSurgeTest.initTest(listTestSurgeTemp[index]),
            condition : await conditionTest.initCondition()
        })
    }

    for(let index in listTestPowerCableTemp) {
        powerCableTestData.push({
            code : listTestPowerCableTemp[index],
            data : await templateData.dataPowerCableTest.initTest(listTestPowerCableTemp[index]),
            condition : await conditionTest.initCondition()
        })
    }

    for(let indexData in workbook.worksheets) {
        var worksheet = workbook.getWorksheet(workbook.worksheets[indexData].name)
        for(let index in data.variable) {
            if(data.variable[index].categories == 'locations') {
                for(let j in data.variable[index].address[indexData][indexData]) {
                    if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                        locationData[data.variable[index].feature] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                }
            } 
            else if(data.variable[index].categories == 'Transformer') {
                if(transformer.map(x => x.value).includes(data.variable[index].feature) && !transformerValue.map(x => x.value).includes(data.variable[index].feature) && !Object.keys(transformerTable).includes(data.variable[index].feature) ) {
                    if(data.variable[index].feature != 'vector_group') {
                        for(let j in data.variable[index].address[indexData][indexData]) {
                            if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                                transformerData[data.variable[index].feature] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                        }
                    } else {
                        for(let j in data.variable[index].address[indexData][indexData]) {
                            if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null) {
                                let vectorgroup = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                transformerData[data.variable[index].feature].vector = transformerData[data.variable[index].feature].vector + vectorgroup
                            }
                        }
                    }
                } else if(transformerValue.map(x => x.value).includes(data.variable[index].feature)) {
                    for(let j in data.variable[index].address[indexData][indexData]) {
                        if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                            transformerData[data.variable[index].feature].value = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                    }
                } else if(Object.keys(transformerTable).includes(data.variable[index].feature)) {
                    if(data.variable[index].feature != 'winding') {
                        addDataTable(transformerTable, transformerData[data.variable[index].feature], data.variable[index], indexData, worksheet)
                    } else {
                        for(let j in data.variable[index].address[indexData][indexData]) {
                            if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null) {
                                transformerData[data.variable[index].feature][data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                            }
                        }
                    }
                }
            } else if(data.variable[index].categories == 'bushings') {
                for(let j in data.variable[index].address[indexData][indexData]) {
                    if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null) {
                        let jsonArrMap = Object.keys(bushingData[data.variable[index].feature][data.variable[index].columnAddr])
                        bushingData[data.variable[index].feature][data.variable[index].columnAddr][jsonArrMap[j]] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                    }
                }
            } else if(data.variable[index].categories == 'tap_changers') {
                if(Object.keys(tapChangerTable).includes(data.variable[index].feature)) {
                    addDataTable(tapChangerTable, tapChangerData[data.variable[index].feature], data.variable[index], indexData, worksheet)
                } else {
                    for(let j in data.variable[index].address[indexData][indexData]) {
                        if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                            tapChangerData[data.variable[index].feature] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                    }
                }
            } else if(data.variable[index].categories == 'Transformer job') {
                for(let j in data.variable[index].address[indexData][indexData]) {
                    if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                    transformerJobData[data.variable[index].feature] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                }
            } else if(data.variable[index].categories == 'Transformer test') {
                const arrJson = Object.assign({}, transformerTableTest[data.variable[index].feature].columnAddr.map(x => x.value))
                const swapped = Object.fromEntries(Object.entries(arrJson).map(([ , value]) => [value, '']))
                const dataTest = transformerTestData.filter(element => element.code == data.variable[index].feature).map(e => e.data)[0]
                for(let i in transformerTestData) {
                    if(transformerTestData[i].code == data.variable[index].feature && !['MeasurementOfOil','Dga'].includes(data.variable[index].feature)) {
                        if(Object.keys(conditionData).includes(data.variable[index].columnAddr)) {
                            if(data.variable[index].columnAddr != "comment") {
                                for(let j in data.variable[index].address[indexData][indexData]) {
                                    transformerTestData[i].condition[data.variable[index].columnAddr][data.variable[index].rowAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                }
                            }
                            else {
                                for(let j in data.variable[index].address[indexData][indexData]) {
                                    transformerTestData[i].condition[data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                }
                            }
                        } else {
                            if(transformerTestData[i].data.table.length == 0) {
                                for(let j in data.variable[index].address[indexData][indexData]) {
                                    let copySwaped = Object.assign({}, swapped);
                                    copySwaped[data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                    transformerTestData[i].data.table.push(copySwaped)
                                }
                            } else {
                                if(data.variable[index].address[indexData][indexData].length <=  transformerTestData[i].data.table.length) {
                                    for(let j in data.variable[index].address[indexData][indexData]) {
                                        transformerTestData[i].data.table[j][data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value      
                                    }
                                } else {
                                    for(let j in transformerTestData[i].data.table) {
                                        transformerTestData[i].data.table[j][data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                    }
                                    for(let i = transformerTestData[i].data.table.length; i < data.variable[index].address[indexData][indexData].length; i ++ ) {
                                        let copySwaped = Object.assign({}, swapped);
                                        copySwaped[data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][i]).value
                                        tapChangerData[data.variable[index].feature].push(copySwaped) 
                                    }
                                }
                            }
                        }
                    } else if(transformerTestData[i].code == data.variable[index].feature && ['MeasurementOfOil','Dga'].includes(data.variable[index].feature)) {
                        if(Object.keys(conditionData).includes(data.variable[index].columnAddr)) {
                            if(data.variable[index].columnAddr != "comment") {
                                for(let j in data.variable[index].address[indexData][indexData]) {
                                    transformerTestData[i].condition[data.variable[index].columnAddr][data.variable[index].rowAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                }
                            } else {
                                for(let j in data.variable[index].address[indexData][indexData]) {
                                    transformerTestData[i].condition[data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                }
                            }
                        } else {
                            for(let j in data.variable[index].address[indexData][indexData]) {
                                transformerTestData[i].data[data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                            }
                        }
                    }
                }   
            } else if(data.variable[index].categories == 'Circuit breaker') {
                for(let j in data.variable[index].address[indexData][indexData]) {
                    if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                        circuitBreakerData[data.variable[index].feature][data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                }
            } else if(data.variable[index].categories == 'Circuit breaker assessment limits') {
                if(Object.keys(assessmentLimitsTable).includes(data.variable[index].feature) && !Object.keys(assessmentValue).includes(data.variable[index].feature)) {
                    for(let j in data.variable[index].address[indexData][indexData]) {
                        circuitBreakerData['assessmentLimits'][data.variable[index].feature][data.variable[index].columnAddr][data.variable[index].rowAddr][data.variable[index].attribute]
                        = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                    }
                } else if(Object.keys(assessmentLimitsTable).includes(data.variable[index].feature) && Object.keys(assessmentValue).includes(data.variable[index].feature)) {
                    if(data.variable[index].feature != 'auxContact') {
                        for(let j in data.variable[index].address[indexData][indexData]) {
                            circuitBreakerData['assessmentLimits'][data.variable[index].feature][data.variable[index].columnAddr][data.variable[index].attribute]
                            = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                        }
                    } else {
                        for(let j in data.variable[index].address[indexData][indexData]) {
                            circuitBreakerData['assessmentLimits'][data.variable[index].feature][data.variable[index].columnAddr][data.variable[index].rowAddr][data.variable[index].attribute][data.variable[index].coverData]
                            = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                        }
                    }
                }              
            } else if(data.variable[index].categories == 'Circuit breaker operating mechanism') {
                if(!Object.keys(operatingMechanismTable).includes(data.variable[index].feature)) {
                    for(let j in data.variable[index].address[indexData][indexData]) {
                        circuitBreakerData['operating'][data.variable[index].feature]
                        = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                    }
                } else {
                    if(["operatingTableMotor", "operatingTableAuxiliary"].includes(data.variable[index].feature)) {
                        if(data.variable[index].feature == 'operatingTableMotor') {
                            for(let j in data.variable[index].address[indexData][indexData]) {
                                circuitBreakerData['operating']['table'][3][data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                            }
                        } else {
                            for(let j in data.variable[index].address[indexData][indexData]) {
                                circuitBreakerData['operating']['table'][2][data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                            }
                        }
                    } else {
                        let id = data.variable[index].feature == 'operatingTableTripCoil' ? 0 : 1
                        await addDataTable(operatingMechanismTable, circuitBreakerData['operating']['table'][id], data.variable[index], indexData, worksheet)
                    }
                }
            } else if(data.variable[index].categories == 'Circuit breaker job') {
                for(let j in data.variable[index].address[indexData][indexData]) {
                    if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                    circuitJobData[data.variable[index].feature] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                }
            } else if(data.variable[index].categories == 'Circuit breaker test') {
                let arrJson = ''
                let swapped = ''
                let dataTest = ''
                if(!["sf6MoiturePurity", 'sf6GasAnalysis'].includes(data.variable[index].feature)) {
                    arrJson = Object.assign({}, circuitTableTest[data.variable[index].feature].columnAddr.map(x => x.value))
                    swapped = Object.fromEntries(Object.entries(arrJson).map(([ , value]) => [value, '']))
                    dataTest = circuitTestData.filter(element => element.code == data.variable[index].feature).map(e => e.data)[0]
                } else {
                    arrJson = Object.assign({}, circuitTableTest[data.variable[index].feature][data.variable[index].columnAddr].columnAddr.map(x => x.value))
                    swapped = Object.fromEntries(Object.entries(arrJson).map(([ , value]) => [value, '']))
                    dataTest = circuitTestData.filter(element => element.code == data.variable[index].feature).map(e => e.data)[0]
                }
                
                for(let i in circuitTestData) {
                    if(circuitTestData[i].code == data.variable[index].feature) {
                        if(!["sf6MoiturePurity", 'sf6GasAnalysis'].includes(data.variable[index].feature)) {
                            if(Object.keys(conditionData).includes(data.variable[index].columnAddr)) {
                                if(data.variable[index].columnAddr != "comment") {
                                    for(let j in data.variable[index].address[indexData][indexData]) {
                                        circuitTestData[i].condition[data.variable[index].columnAddr][data.variable[index].rowAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                    }
                                } else {
                                    for(let j in data.variable[index].address[indexData][indexData]) {
                                        circuitTestData[i].condition[data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                    }
                                }
                            } else {
                                if(circuitTestData[i].data.table.length == 0) {
                                    for(let j in data.variable[index].address[indexData][indexData]) {
                                        let copySwaped = Object.assign({}, swapped);
                                        copySwaped[data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                        circuitTestData[i].data.table.push(copySwaped)
                                    }
                                } else {
                                    if(data.variable[index].address[indexData][indexData].length <=  circuitTestData[i].data.table.length) {
                                        for(let j in data.variable[index].address[indexData][indexData]) {
                                            circuitTestData[i].data.table[j][data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value      
                                        }
                                    } else {
                                        for(let j in circuitTestData[i].data.table) {
                                            circuitTestData[i].data.table[j][data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                        }
                                        for(let j = circuitTestData[i].data.table.length; j < data.variable[index].address[indexData][indexData].length; j ++ ) {
                                            let copySwaped = Object.assign({}, swapped);
                                            copySwaped[data.variable[index].columnAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                            circuitTestData[i].data.table.push(copySwaped) 
                                        }
                                    }
                                }
                            }
                        } else {
                            if(Object.keys(conditionData).includes(data.variable[index].rowAddr)) {
                                if(data.variable[index].rowAddr != "comment") {
                                    for(let j in data.variable[index].address[indexData][indexData]) {
                                        circuitTestData[i].condition[data.variable[index].rowAddr][data.variable[index].attribute] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                    }
                                } else {
                                    for(let j in data.variable[index].address[indexData][indexData]) {
                                        circuitTestData[i].condition[data.variable[index].rowAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                    }  
                                }
                            } else {
                                if(circuitTestData[i].data.table.length == 0) {
                                    for(let j in data.variable[index].address[indexData][indexData]) {
                                        let copySwaped = Object.assign({}, swapped);
                                        copySwaped[data.variable[index].rowAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                        circuitTestData[i].data.table.push(copySwaped)
                                    }
                                } else {
                                    if(data.variable[index].address[indexData][indexData].length <=  circuitTestData[i].data.table.length) {
                                        for(let j in data.variable[index].address[indexData][indexData]) {
                                            circuitTestData[i].data.table[j][data.variable[index].rowAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value      
                                        }
                                    } else {
                                        for(let j in circuitTestData[i].data.table) {
                                            circuitTestData[i].data.table[j][data.variable[index].rowAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                        }
                                        for(let j = circuitTestData[i].data.table.length; j < data.variable[index].address[indexData][indexData].length; j ++ ) {
                                            let copySwaped = Object.assign({}, swapped);
                                            copySwaped[data.variable[index].rowAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                            circuitTestData[i].data.table.push(copySwaped) 
                                        }
                                    }
                                }
                            }
                        }
                    }
                }                               
            } else if(data.variable[index].categories == 'Current') {
                if(data.variable[index].feature != 'config') {
                    for(let j in data.variable[index].address[indexData][indexData]) {
                        if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                            assignData(currentTransData, data.variable[index],worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value)
                    }
                }
                else {
                    if(data.variable[index].columnAddr == 'cores') {
                        for(let j in data.variable[index].address[indexData][indexData]) {
                            if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                                currentTransData[data.variable[index].feature][data.variable[index].columnAddr] =  worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                        }
                    } else {
                        if(["taps", "commonTap"].includes(data.variable[index].rowAddr)) {
                            addDataTableByColumnForCurrent(current.currentTransColumn.default[data.variable[index].columnAddr].columnAddr, currentTransData[data.variable[index].feature][data.variable[index].columnAddr], 
                                data.variable[index], data.variable[index].rowAddr, indexData, worksheet)
                        } else if(data.variable[index].rowAddr == "common") {
                            addDataTableByColumnCommon(currentTransData[data.variable[index].feature][data.variable[index].rowAddr], data.variable[index], data.variable[index].attribute, indexData, worksheet, data.variable[index].coverData)
                        } 
                        else {
                            addDataTableByColumnForCurrentForTable(current.currentTransColumn.default[data.variable[index].columnAddr].columnAddr, currentTransData[data.variable[index].feature][data.variable[index].columnAddr], 
                                data.variable[index], data.variable[index].rowAddr, indexData, worksheet, data.variable[index].attribute, data.variable[index].coverData)
                        }
                    }
                }
            } else if(data.variable[index].categories == 'Current job') {
                for(let j in data.variable[index].address[indexData][indexData]) {
                    if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                        assignData(currentJobData, data.variable[index],worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value)
                }
            } else if(data.variable[index].categories == 'Current test') {
                addDataTableByColumnTest(current.currentTableTest.default[data.variable[index].feature].columnAddr, currentTestData, data.variable[index].feature, data.variable[index], 
                    data.variable[index].columnAddr, indexData,  worksheet, conditionData)
            } else if(data.variable[index].categories == 'Voltage') {
                if(data.variable[index].columnAddr != 'dataVT') {
                    for(let j in data.variable[index].address[indexData][indexData]) {
                        if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                            assignData(voltageTransData, data.variable[index], worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value)
                    }
                } else {
                    addDataTableByColumn(voltage.voltageColumn.default[data.variable[index].columnAddr].columnAddr, voltageTransData[data.variable[index].feature][data.variable[index].columnAddr],
                        data.variable[index], data.variable[index].rowAddr, indexData, worksheet)
                }
            } else if(data.variable[index].categories == 'Voltage job') {
                for(let j in data.variable[index].address[indexData][indexData]) {
                    if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                        assignData(voltageJobData, data.variable[index],worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value)
                }
            } else if(data.variable[index].categories == 'Voltage test') {
                addDataTableByColumnTest(voltage.voltageTableTest.default[data.variable[index].feature].columnAddr, voltageTestData, data.variable[index].feature, data.variable[index], 
                    data.variable[index].columnAddr, indexData,  worksheet, conditionData)
            } else if(data.variable[index].categories == 'Disconnector') {
                for(let j in data.variable[index].address[indexData][indexData]) {
                    if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                        assignData(disconnectorData, data.variable[index], worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value)
                }
            } else if(data.variable[index].categories == 'Disconnector job') {
                for(let j in data.variable[index].address[indexData][indexData]) {
                    if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                        assignData(disconnectorJobData, data.variable[index],worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value)
                }
            } else if(data.variable[index].categories == 'Disconnector test') {
                addDataTableByColumnTest(disconnector.disconnectorTableTest.default[data.variable[index].feature].columnAddr, disconnectorTestData, data.variable[index].feature, data.variable[index], 
                    data.variable[index].columnAddr, indexData,  worksheet, conditionData)
            } else if(data.variable[index].categories == 'Power cable') {
                for(let j in data.variable[index].address[indexData][indexData]) {
                    if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                        assignData(powerCableData, data.variable[index], worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value)
                }
            } else if(data.variable[index].categories == 'Power cable job') {
                for(let j in data.variable[index].address[indexData][indexData]) {
                    if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                        assignData(powerCableJobData, data.variable[index],worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value)
                }
            } else if(data.variable[index].categories == 'Power cable test') {
                if(!['TandeltaVlfSource', 'VlfTest'].includes(data.variable[index].feature)) {
                    addDataTableByColumnTest(powerCable.powerCableTableTest.default[data.variable[index].feature].columnAddr, powerCableTestData, data.variable[index].feature, data.variable[index], 
                        data.variable[index].columnAddr, indexData,  worksheet, conditionData)
                } else {
                    if(data.variable[index].columnAddr == "vlfSetting") {
                        for(let i in powerCableTestData) {
                            if(powerCableTestData[i].code == data.variable[index].feature) {
                                for(let j in data.variable[index].address[indexData][indexData]) {
                                    powerCableTestData[i].data[data.variable[index].columnAddr][data.variable[index].rowAddr] = worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value
                                }
                            }
                        }
                    } else if(data.variable[index].columnAddr == "table") {
                        for(let i in powerCableTestData) {
                            if(powerCableTestData[i].code == data.variable[index].feature) {
                                for(let j in data.variable[index].address[indexData][indexData]) {
                                    addDataTableByColumnTestPower(powerCable.powerCableRowTest.default[data.variable[index].feature][data.variable[index].columnAddr].columnAddr, powerCableTestData, data.variable[index].feature, data.variable[index], 
                                        data.variable[index].rowAddr, indexData,  worksheet, conditionData)
                                }
                            }
                        }
                    } 
                }
            } else if(data.variable[index].categories == 'Surge') {
                if(data.variable[index].columnAddr != 'tableRating') {
                    for(let j in data.variable[index].address[indexData][indexData]) {
                        if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                            assignData(surgeData, data.variable[index], worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value)
                    }
                } else {
                    addDataTableByColumn(surge.surgeFeature.default[data.variable[index].columnAddr].columnAddr, surgeData[data.variable[index].feature][data.variable[index].columnAddr],
                        data.variable[index], data.variable[index].rowAddr, indexData, worksheet)
                }
            } else if(data.variable[index].categories == 'Surge job') {
                for(let j in data.variable[index].address[indexData][indexData]) {
                    if(worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value != null)
                        assignData(surgeJobData, data.variable[index],worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value)
                }
            } else if(data.variable[index].categories == 'Surge test') {
                addDataTableByColumnTest(surge.surgeArresterTableTest.default[data.variable[index].feature].columnAddr, surgeTestData, data.variable[index].feature, data.variable[index], 
                    data.variable[index].columnAddr, indexData,  worksheet, conditionData)
            }
        }
    }

    if(assetData == undefined) {
        await saveInforTransformer(locationData, transformerData, bushingData, tapChangerData, transformerJobData, transformerTestData, transformerTestTemplateData)
        await saveCircuitBreaker(locationData, circuitBreakerData, circuitJobData, circuitTestData, circuitTestTemplateData)
        await saveCurrentTrans(locationData, currentTransData, currentJobData, currentTestData, currentTestTemplateData)
        await saveVoltageTrans(locationData, voltageTransData, voltageJobData, voltageTestData, voltageTestTemplateData)
        await saveSurgeArrester(locationData, surgeData, surgeJobData, surgeTestData, surgeTestTemplateData)
        await saveDisconnector(locationData, disconnectorData, disconnectorJobData, disconnectorTestData, disconnectorTestTemplateData)
        await savePowerCable(locationData, powerCableData, powerCableJobData, powerCableTestData, powerCableTestTemplateData)

    }
    else {
        if(assetData.asset == "Transformer") {
            await saveInforTransformerTest(assetData, transformerJobData, transformerTestData, transformerTestTemplateData)
        } else if (assetData.asset == "Circuit breaker") {
            await saveInforCircuitTest(assetData, circuitJobData, circuitTestData, circuitTestTemplateData)
        } else if (assetData.asset == "Current transformer") {
            await saveInforCurrentTest(assetData, currentJobData, currentTestData, currentTestTemplateData)
        } else if (assetData.asset == "Voltage transformer") {
            await saveInforVoltageTest(assetData, voltageJobData, voltageTestData, voltageTestTemplateData)
        } else if (assetData.asset == "Disconnector") {
            await saveInforDisconnectorTest(assetData, disconnectorJobData, disconnectorTestData, disconnectorTestTemplateData)
        } else if (assetData.asset == "Power cable") {
            await saveInforPowerTest(assetData, powerCableJobData, powerCableTestData, powerCableTestTemplateData)
        } else if (assetData.asset == "Surge arrester") {
            await saveInforSurgeTest(assetData, surgeJobData, surgeTestData, surgeTestTemplateData)
        }
    }

}

export const saveTemplate = (data) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO template(name, path, variable)' +
            ' VALUES(?, ?, ? )',
            [
                data.name, data.path.toString(), JSON.stringify(data.var)
            ], function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const updateTemplateByName = (data) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE template' +
            ' SET variable = ?, path = ? ' +
            ' WHERE name = ?',
            [
              JSON.stringify(data.var), data.path.toString(), data.name.toString(),
            ], function (err) {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const saveInforTransformer = async (location, asset, bushing, tapChanger, job, testList, test) => {

    let tapNo = tapChanger['no_of_taps']
    if(tapNo > tapChanger['voltage_table'].length) {
        if (tapChanger["tap_scheme"] == '1...33' || tapChanger["tap_scheme"]== '1...N' || tapChanger["tap_scheme"] == 'Free') {
            for(let i= tapChanger['voltage_table'].length; i < tapNo; i ++) {
                tapChanger['voltage_table'].push({
                    id : newUuid(),
                    tap : i+1,
                    voltage : 0
                })
            }
        } else {
            for(let i= tapChanger['voltage_table'].length; i < tapNo; i ++) {
                tapChanger['voltage_table'].push({
                    id : newUuid(),
                    tap : tapNo - i,
                    voltage : 0
                })
            }
        }
    } else {
        for(let i= tapChanger['voltage_table'].length; i < tapNo; i ++) {
            tapChanger['voltage_table'].splice(tapNo, tapChanger['voltage_table'].length - tapNo)
        }
    }

    asset.vector_group = await vectorGroupParse(asset.vector_group.vector)

    let checkLocationExist = await locationFunc.checkLocationNameExist(location.name)
    let checktransformerExist = await transformerFunc.checkAssetNameExist(asset.serial_no)

    if(checkLocationExist.exist && location.name != '') {
        asset.location_id = checkLocationExist.id
        await locationFunc.updateLocationData(location)
        if(asset.serial_no != '') {
            if(checktransformerExist.exist) {
                asset.id = checktransformerExist.id
                await transformerFunc.updateTransformerData(asset)
                let checkBushingExist = await transformerFunc.checkBushingExist(asset.id)
                let checkTapChangerExist = await transformerFunc.checkTapChangerExist(asset.id)
                if(checkBushingExist.exist) {
                    bushing.asset_id = asset.id
                    bushing.id = checkBushingExist.id
                    await transformerFunc.updateBushings(bushing)
                } else {
                    await transformerFunc.insertBushings(bushing, asset.id)
                }
                if(checkTapChangerExist.exist) {
                    tapChanger.asset_id = asset.id
                    tapChanger.id = checkTapChangerExist.id
                    await transformerFunc.updateTapChanger(tapChanger)
                } else {
                    await transformerFunc.insertTapChanger(tapChanger, asset.id)
                }

                let checkTransfomerJobExist = await transformerJobFunc.checkJobExistByName(job.name, asset.id)
                
                if(checkTransfomerJobExist.exist && job.name != '') {
                    job.id = checkTransfomerJobExist.id
                    job.asset_id = asset.id
                    await transformerJobFunc.updateJobData(job)
                    for(let k in testList) {
                        let getTestType = await transformerJobFunc.getTestTypeByCode(testList[k].code)
                        test.id = newUuid()
                        test.job_id = checkTransfomerJobExist.id
                        test.data = testList[k].data
                        test.testTypeId = getTestType.id
                        test.name = getTestType.name
                        await transformerJobFunc.insertTest(test.job_id, test)
                    }
                } else {
                    job.asset_id = asset.id
                    let id = await transformerJobFunc.insertJobData(job)
                    for(let k in testList) {
                        let getTestType = await transformerJobFunc.getTestTypeByCode(testList[k].code)
                        test.id = newUuid()
                        test.job_id = id
                        test.data = testList[k].data
                        test.testTypeId = getTestType.id
                        test.name = getTestType.name
                        await transformerJobFunc.insertTest(test.job_id, test)
                    }
                }
            } else {
                job.asset_id = tapChanger.asset_id = bushing.asset_id = await transformerFunc.importTransformerData(asset)
                await transformerFunc.insertBushings(bushing, bushing.asset_id)
                await transformerFunc.insertTapChanger(tapChanger, tapChanger.asset_id)
                let id = await transformerJobFunc.insertJobData(job)
                for(let k in testList) {
                    let getTestType = await transformerJobFunc.getTestTypeByCode(testList[k].code)
                    test.id = newUuid()
                    test.job_id = id
                    test.data = testList[k].data
                    test.testTypeId = getTestType.id
                    test.name = getTestType.name
                    await transformerJobFunc.insertTest(test.job_id, test)
                }
            }
        }
    } else if(!checkLocationExist.exist && location.name != '') {
        asset.location_id = await locationFunc.importLocationData(location)
        if(asset.serial_no != '') {
            if(checktransformerExist.exist) {
                asset.id = checktransformerExist.id
                await transformerFunc.updateTransformerData(asset)
                let checkBushingExist = await transformerFunc.checkBushingExist(asset.id)
                let checkTapChangerExist = await transformerFunc.checkTapChangerExist(asset.id)
                if(checkBushingExist.exist) {
                    bushing.asset_id = asset.id
                    bushing.id = checkBushingExist.id
                    await transformerFunc.updateBushings(bushing)
                } else {
                    await transformerFunc.insertBushings(bushing, asset.id)
                }
                if(checkTapChangerExist.exist) {
                    tapChanger.asset_id = asset.id
                    tapChanger.id = checkTapChangerExist.id
                    await transformerFunc.updateTapChanger(tapChanger)
                } else {
                    await transformerFunc.insertTapChanger(tapChanger, asset.id)
                }

                let checkTransfomerJobExist = await transformerJobFunc.checkJobExistByName(job.name, asset.id)
                if(checkTransfomerJobExist.exist && job.name != '') {
                    job.id = checkTransfomerJobExist.id
                    job.asset_id = asset.id
                    transformerJobFunc.updateJobData(job)
                    for(let k in testList) {
                        let getTestType = await transformerJobFunc.getTestTypeByCode(testList[k].code)
                        test.id = newUuid()
                        test.job_id = checkTransfomerJobExist.id
                        test.data = testList[k].data
                        test.testTypeId = getTestType.id
                        test.name = getTestType.name
                        await transformerJobFunc.insertTest(test.job_id, test)
                        await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
                    }
                } else {
                    job.asset_id = asset.id
                    let id = await transformerJobFunc.insertJobData(job)
                    for(let k in testList) {
                        let getTestType = await transformerJobFunc.getTestTypeByCode(testList[k].code)
                        test.id = newUuid()
                        test.job_id = id
                        test.data = testList[k].data
                        test.testTypeId = getTestType.id
                        test.name = getTestType.name
                        await transformerJobFunc.insertTest(test.job_id, test)
                        await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
                    }
                }
            } else {
                job.asset_id = tapChanger.asset_id = bushing.asset_id = await transformerFunc.importTransformerData(asset)
                await transformerFunc.insertBushings(bushing, bushing.asset_id)
                await transformerFunc.insertTapChanger(tapChanger, tapChanger.asset_id)
                if(job.name == '') {
                    job.name = newUuid()
                }
                let id = await transformerJobFunc.insertJobData(job)
                for(let k in testList) {
                    let getTestType = await transformerJobFunc.getTestTypeByCode(testList[k].code)
                    test.id = newUuid()
                    test.job_id = id
                    test.data = testList[k].data
                    test.testTypeId = getTestType.id
                    test.name = getTestType.name
                    await transformerJobFunc.insertTest(test.job_id, test)
                    await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
                }
            }
        }
    }
}

export const saveInforTransformerTest = async (asset, job, testList, test) => {
    let checkTransfomerJobExist = await transformerJobFunc.checkJobExistByName(job.name, asset.id)
    if(checkTransfomerJobExist.exist && job.name != '') {
        job.id = checkTransfomerJobExist.id
        job.asset_id = asset.id
        await transformerJobFunc.updateJobData(job)
        for(let k in testList) {
            let getTestType = await transformerJobFunc.getTestTypeByCode(testList[k].code)
            test.id = newUuid()
            test.job_id = checkTransfomerJobExist.id
            test.data = testList[k].data
            test.testTypeId = getTestType.id
            test.name = getTestType.name
            await transformerJobFunc.insertTest(test.job_id, test)
            await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
        }
    }  else if(!checkTransfomerJobExist.exist & job.name == '' ) {
        job.asset_id = asset.id
        job.name = newUuid()
        let jobId = await transformerJobFunc.insertJobData(job)
        for(let k in testList) {
            let getTestType = await transformerJobFunc.getTestTypeByCode(testList[k].code)
            test.id = newUuid()
            test.job_id = jobId
            test.data = testList[k].data
            test.testTypeId = getTestType.id
            test.name = getTestType.name
            await transformerJobFunc.insertTest(test.job_id, test)
            await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
        }
    } else if(!checkTransfomerJobExist.exist && job.name != '') {
        job.asset_id = asset.id
        let jobId = await transformerJobFunc.insertJobData(job)
        for(let k in testList) {
            let getTestType = await transformerJobFunc.getTestTypeByCode(testList[k].code)
            test.id = newUuid()
            test.job_id = jobId
            test.data = testList[k].data
            test.testTypeId = getTestType.id
            test.name = getTestType.name
            await transformerJobFunc.insertTest(test.job_id, test)
            await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
        }
    }
}

export const saveInforCircuitTest = async (asset, job, testList, test) => {   

    for(let i in testList) {
        if(["cTiming", 'coTiming'].includes(testList[i].code)) {
            let table = JSON.parse(JSON.stringify(testList[i].data.table))
            let operating = JSON.parse(asset.operating)
            let circuitBreaker = JSON.parse(asset.circuitBreaker)
            testList[i].data.table = []
            if(operating.numberCloseCoil != undefined && operating.numberCloseCoil != 0) {
                for(let j =0; j <operating.numberCloseCoil; j ++) {
                    testList[i].data.table.push([])
                }

                if(circuitBreaker.numberOfPhase != "" && circuitBreaker.numberOfInterruptPhase != "") {
                    let lengthData = circuitBreaker.numberOfPhase * circuitBreaker.numberOfInterruptPhase
                    for(let j in testList[i].data.table) {
                        for(let n=0; n < lengthData; n++) {
                            if(n + j*lengthData >= table.length) {
                                break
                            } else {
                                testList[i].data.table[j].push(table[n + j*lengthData])
                            }  
                        }
                    }
                }
            }
        } 
        else if(["oTiming", "ocTiming", "ocoTiming"].includes(testList[i].code)) {
            let table = JSON.parse(JSON.stringify(testList[i].data.table))
            let operating = JSON.parse(asset.operating)
            let circuitBreaker = JSON.parse(asset.circuitBreaker)
            testList[i].data.table = []
            if(operating.numberTripCoil != undefined && operating.numberTripCoil != 0) {
                for(let j =0; j <operating.numberTripCoil; j ++) {
                    testList[i].data.table.push([])
                }

                if(circuitBreaker.numberOfPhase != "" && circuitBreaker.numberOfInterruptPhase != "") {
                    let lengthData = circuitBreaker.numberOfPhase * circuitBreaker.numberOfInterruptPhase
                    for(let j in testList[i].data.table) {
                        for(let n=0; n < lengthData; n++) {
                            if(n + j*lengthData >= table.length) {
                                break
                            } else {
                                testList[i].data.table[j].push(table[n + j*lengthData])
                            }  
                        }
                    }
                }
            }
        } else if(["sf6MoiturePurity", "sf6GasAnalysis"].includes(testList[i].code)) {
            let table = JSON.parse(JSON.stringify(testList[i].data.table))
            testList[i].data.table = {}
            let value = ["moiture", 'purity', 'decomSf6', 'so2Sof2', 'hf']
            let label = ["moitureTable", "purityTable", "decomSf6Table", "so2Sof2Table", "hfTable"]
            for(let index in label) {
                testList[i].data.table[label[index]] = table.filter(x => x[value[index]] != undefined)
            }
        }
    }

    let jobId = ''
    let checkJobExist = await circuitJobFunc.checkJobExistByName(job.name, asset.id)
    if(checkJobExist.exist) {
        if(job.name != '') {
            job.id = checkJobExist.id
            job.asset_id = asset.id
        } else {
            job.asset_id = asset.id
            job.name = newUuid()
        }
    } else {
        if(job.name != '') {
            job.asset_id = asset.id
        } else {
            job.asset_id = asset.id
            job.name = newUuid()
        }
        job.id = jobId = newUuid()
    }

    if(!checkJobExist.exist) {
        await jobAssetFunc.insertJobasset(asset.id, jobId)
        await circuitJobFunc.insertJobData(job)
    } else {
        jobId = checkJobExist.id
        await circuitJobFunc.updateJob(job)
    }

    for(let k in testList) {
        let getTestType = await circuitJobFunc.getTestTypeByCode(testList[k].code)
        test.id = newUuid()
        test.job_id = jobId
        test.data = testList[k].data
        test.testTypeId = getTestType.id
        test.name = getTestType.name
        await circuitJobFunc.insertTest(test.job_id, test)
        await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
    }
}

export const saveInforCurrentTest = async (asset, job, testList, test) => {
    let jobId = ''
    let checkJobExist = await currentTransJobFunc.checkJobExistByName(job.name, asset.id)
    if(checkJobExist.exist) {
        if(job.name != '') {
            job.id = checkJobExist.id
            job.asset_id = asset.id
        } else {
            job.asset_id = asset.id
            job.name = newUuid()
        }
    } else {
        if(job.name != '') {
            job.asset_id = asset.id
        } else {
            job.asset_id = asset.id
            job.name = newUuid()
        }
        job.id = jobId = newUuid()
    }

    if(!checkJobExist.exist) {
        jobId = await currentTransJobFunc.insertJob(asset.id ,job)
    } else {
        jobId = checkJobExist.id
        await currentTransJobFunc.updateJobCurrentVoltage(job)
    }

    for(let k in testList) {
        let getTestType = await currentTransJobFunc.getTestTypeByCode(testList[k].code)
        test.id = newUuid()
        test.job_id = jobId
        test.data = testList[k].data
        test.testTypeId = getTestType.id
        test.name = getTestType.name
        await currentTransJobFunc.insertTest(test.job_id, test)
        await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
    }
}

export const saveInforVoltageTest = async (asset, job, testList, test) => {
    let jobId = ''
    let checkJobExist = await voltageTransJobFunc.checkJobExistByName(job.name, asset.id)
    if(checkJobExist.exist) {
        if(job.name != '') {
            job.id = checkJobExist.id
            job.asset_id = asset.id
        } else {
            job.asset_id = asset.id
            job.name = newUuid()
        }
    } else {
        if(job.name != '') {
            job.asset_id = asset.id
        } else {
            job.asset_id = asset.id
            job.name = newUuid()
        }
        job.id = jobId = newUuid()
    }

    if(!checkJobExist.exist) {
        jobId = await voltageTransJobFunc.insertJob(asset.id ,job)
    } else {
        jobId = checkJobExist.id
        await voltageTransJobFunc.updateJobVoltageTrans(job)
    }

    for(let k in testList) {
        let getTestType = await voltageTransJobFunc.getTestTypeByCode(testList[k].code)
        test.id = newUuid()
        test.job_id = jobId
        test.data = testList[k].data
        test.testTypeId = getTestType.id
        test.name = getTestType.name
        await voltageTransJobFunc.insertTest(test.job_id, test)
        await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
    }
}

export const saveInforDisconnectorTest = async (asset, job, testList, test) => {
    let jobId = ''
    let checkJobExist = await disconnectorJobFunc.checkJobExistByName(job.name, asset.id)
    if(checkJobExist.exist) {
        if(job.name != '') {
            job.id = checkJobExist.id
            job.asset_id = asset.id
        } else {
            job.asset_id = asset.id
            job.name = newUuid()
        }
    } else {
        if(job.name != '') {
            job.asset_id = asset.id
        } else {
            job.asset_id = asset.id
            job.name = newUuid()
        }
        job.id = jobId = newUuid()
    }

    if(!checkJobExist.exist) {
        jobId = await disconnectorJobFunc.insertJob(asset.id ,job)
    } else {
        jobId = checkJobExist.id
        await disconnectorJobFunc.updateJobDisconnector(job)
    }

    for(let k in testList) {
        let getTestType = await disconnectorJobFunc.getTestTypeByCode(testList[k].code)
        test.id = newUuid()
        test.job_id = jobId
        test.data = testList[k].data
        test.testTypeId = getTestType.id
        test.name = getTestType.name
        await disconnectorJobFunc.insertTest(test.job_id, test)
        await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
    }
}

export const saveInforPowerTest = async (asset, job, testList, test) => {
    let jobId = ''
    let checkJobExist = await powerCableJobFunc.checkJobExistByName(job.name, asset.id)
    if(checkJobExist.exist) {
        if(job.name != '') {
            job.id = checkJobExist.id
            job.asset_id = asset.id
        } else {
            job.asset_id = asset.id
            job.name = newUuid()
        }
    } else {
        if(job.name != '') {
            job.asset_id = asset.id
        } else {
            job.asset_id = asset.id
            job.name = newUuid()
        }
        job.id = jobId = newUuid()
    }

    if(!checkJobExist.exist) {
        jobId = await powerCableJobFunc.insertJob(asset.id ,job)
    } else {
        jobId = checkJobExist.id
        await powerCableJobFunc.updateJobPowerCable(job)
    }

    for(let k in testList) {
        let getTestType = await powerCableJobFunc.getTestTypeByCode(testList[k].code)
        test.id = newUuid()
        test.job_id = jobId
        test.data = testList[k].data
        test.testTypeId = getTestType.id
        test.name = getTestType.name
        await powerCableJobFunc.insertTest(test.job_id, test)
        await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
    }
}

export const saveInforSurgeTest = async (asset, job, testList, test) => {
    let jobId = ''
    let checkJobExist = await surgeArresterJobFunc.checkJobExistByName(job.name, asset.id)
    if(checkJobExist.exist) {
        if(job.name != '') {
            job.id = checkJobExist.id
            job.asset_id = asset.id
        } else {
            job.asset_id = asset.id
            job.name = newUuid()
        }
    } else {
        if(job.name != '') {
            job.asset_id = asset.id
        } else {
            job.asset_id = asset.id
            job.name = newUuid()
        }
        job.id = jobId = newUuid()
    }

    if(!checkJobExist.exist) {
        jobId = await surgeArresterJobFunc.insertJob(asset.id ,job)
    } else {
        jobId = checkJobExist.id
        await surgeArresterJobFunc.updateJobSurgeArrester(job)
    }

    for(let k in testList) {
        let getTestType = await surgeArresterJobFunc.getTestTypeByCode(testList[k].code)
        test.id = newUuid()
        test.job_id = jobId
        test.data = testList[k].data
        test.testTypeId = getTestType.id
        test.name = getTestType.name
        await surgeArresterJobFunc.insertTest(test.job_id, test)
        await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
    }
}

export const vectorGroupParse = async(vector) => {
    let vectorData = vector.toUpperCase()
    let data = {
        prim :"",
        sec :{
            I:"",
            Value:""
        },
        tert :{
            I:"",
            Value:"",
            accessibility:""
        }
    }

    function parseDataVector(dataset) {
        let i = ""
        let valueData = ""
        if(dataset.length >= 1) {
            if(dataset[0] == "I") {
                i = dataset[0]
                if(dataset.length >= 2) {
                    if(!isNaN(dataset[1])) {
                        if(dataset.length >= 3) {
                            if(!isNaN(dataset[2])) {
                                valueData = dataset.substring(1, 3)
                            } else {
                                valueData = dataset[1]
                            }
                        } else {
                            valueData = dataset[1]
                        }
                    } else {
                        valueData = ""
                    }
                }
            } else if(dataset[0] == "D" || dataset[0] == "Y" || dataset[0] == "Z" ) {
                if(dataset.length >= 2) {
                    if(dataset[1] == "N") {
                        i = dataset.substring(0, 2)
                        if(dataset.length >=3) {
                            if(!isNaN(dataset[2])) {
                                if(dataset.length >= 4) {
                                    if(!isNaN(dataset[3])) {
                                        valueData = dataset.substring(2, 4)
                                    } else {
                                        valueData = dataset[2]
                                    }
                                } else {
                                    valueData = dataset[2]
                                }
                            } else {
                                valueData = ""
                            }
                        } 
                    } else {
                        i = dataset[0]
                       if(!isNaN(dataset[1])) {
                            if(dataset.length >= 3) {
                                if(!isNaN(dataset[2])) {
                                    valueData = dataset.substring(1,3)
                                } else {
                                    valueData = dataset[1]
                                }
                            } else {
                                valueData = dataset[1]
                            }
                       }
                    }
                } else {
                    i = dataset[0]
                }
            }
        }
        return [i, valueData]
    }

    if(vectorData.length >= 1) {
        if(vectorData[0] == 'I') {
            data.prim = vectorData[0] + 'a'
            if(vectorData.length >= 2) {
                const secDataArr = parseDataVector(vectorData.substring(1))
                data.sec.I = secDataArr[0]
                data.sec.Value = secDataArr[1]
                let getLength = secDataArr[0].length + secDataArr[1].length + 1
                if(vectorData.length >= getLength) {
                    const tertDataArr = parseDataVector(vectorData.substring(getLength))
                    data.tert.I = tertDataArr[0]
                    data.tert.Value = tertDataArr[1]
                }
            }
        } else if(vectorData[0] == 'D') {
            data.prim = vectorData[0]
            if(vectorData.length >= 2) {
                const secDataArr = parseDataVector(vectorData.substring(1))
                data.sec.I = secDataArr[0]
                data.sec.Value = secDataArr[1]
                let getLength = secDataArr[0].length + secDataArr[1].length + 1
                if(vectorData.length >= getLength) {
                    const tertDataArr = parseDataVector(vectorData.substring(getLength))
                    data.tert.I = tertDataArr[0]
                    data.tert.Value = tertDataArr[1]
                }
            }
        } else if(vectorData[0] == 'Y') {
            if(vectorData.length >= 2) {
                if(vectorData[1] == 'N') {
                    data.prim = vectorData.substring(0,2)
                    if(vectorData.length >= 3) {
                        const secDataArr = parseDataVector(vectorData.substring(2))
                        data.sec.I = secDataArr[0]
                        data.sec.Value = secDataArr[1]
                        let getLength = secDataArr[0].length + secDataArr[1].length + 2
                        if(vectorData.length >= getLength) {
                            const tertDataArr = parseDataVector(vectorData.substring(getLength))
                            data.tert.I = tertDataArr[0]
                            data.tert.Value = tertDataArr[1]
                        }
                    }
                } else {
                    data.prim = vectorData[0]
                    if(vectorData.length >= 2) {
                        const secDataArr = parseDataVector(vectorData.substring(1))
                        data.sec.I = secDataArr[0]
                        data.sec.Value = secDataArr[1]
                        let getLength = secDataArr[0].length + secDataArr[1].length + 1
                        if(vectorData.length >= getLength) {
                            const tertDataArr = parseDataVector(vectorData.substring(getLength))
                            data.tert.I = tertDataArr[0]
                            data.tert.Value = tertDataArr[1]
                        }
                    }
                }
            } else {
                data.prim = vectorData[0]
            }
        }
    }
    return data
}

export const saveCircuitBreaker = async(location, asset, job, testList, test) => {

    if(asset.operating.table[0].length != 0) {
        asset.operating.numberTripCoil = asset.operating.table[0].length
        for(let i in asset.operating.table[0]) {
            if(asset.operating.table[0][i].tripCoil == "") {
                asset.operating.table[0][i].tripCoil = "Trip coil " + `${parseInt(i) + 1}` 
            }
        }
    }

    if(asset.operating.table[1].length != 0) {
        asset.operating.numberCloseCoil = asset.operating.table[1].length
        for(let i in asset.operating.table[1]) {
            if(asset.operating.table[1][i].closeCoil == "") {
                asset.operating.table[1][i].closeCoil = "Close coil " + `${parseInt(i) + 1}` 
            }
        }
    }

    for(let i in testList) {
        if(["cTiming", 'coTiming'].includes(testList[i].code)) {
            let table = JSON.parse(JSON.stringify(testList[i].data.table))
            let operating = asset.operating
            let circuitBreaker = asset.circuitBreaker
            testList[i].data.table = []
            if(operating.numberCloseCoil != undefined && operating.numberCloseCoil != 0) {
                for(let j =0; j <operating.numberCloseCoil; j ++) {
                    testList[i].data.table.push([])
                }

                if(circuitBreaker.numberOfPhase != "" && circuitBreaker.numberOfInterruptPhase != "") {
                    let lengthData = circuitBreaker.numberOfPhase * circuitBreaker.numberOfInterruptPhase
                    for(let j in testList[i].data.table) {
                        for(let n=0; n < lengthData; n++) {
                            if(n + j*lengthData >= table.length) {
                                break
                            } else {
                                testList[i].data.table[j].push(table[n + j*lengthData])
                            }  
                        }
                    }
                }
            }
        } 
        else if(["oTiming", "ocTiming", "ocoTiming"].includes(testList[i].code)) {
            let table = JSON.parse(JSON.stringify(testList[i].data.table))
            let operating = asset.operating
            let circuitBreaker = asset.circuitBreaker
            testList[i].data.table = []
            if(operating.numberTripCoil != undefined && operating.numberTripCoil != 0) {
                for(let j =0; j <operating.numberTripCoil; j ++) {
                    testList[i].data.table.push([])
                }

                if(circuitBreaker.numberOfPhase != "" && circuitBreaker.numberOfInterruptPhase != "") {
                    let lengthData = circuitBreaker.numberOfPhase * circuitBreaker.numberOfInterruptPhase
                    for(let j in testList[i].data.table) {
                        for(let n=0; n < lengthData; n++) {
                            if(n + j*lengthData >= table.length) {
                                break
                            } else {
                                testList[i].data.table[j].push(table[n + j*lengthData])
                            }  
                        }
                    }
                }
            }
        } else if(["sf6MoiturePurity", "sf6GasAnalysis"].includes(testList[i].code)) {
            let table = JSON.parse(JSON.stringify(testList[i].data.table))
            testList[i].data.table = {}
            let value = ["moiture", 'purity', 'decomSf6', 'so2Sof2', 'hf']
            let label = ["moitureTable", "purityTable", "decomSf6Table", "so2Sof2Table", "hfTable"]
            for(let index in label) {
                testList[i].data.table[label[index]] = table.filter(x => x[value[index]] != undefined)
            }
        }
    }

    if(location.name != '') {
        let checkLocationExist = await locationFunc.checkLocationNameExist(location.name)
        let locationId = ''
        if(checkLocationExist.exist) {
            location.id = checkLocationExist.id
            locationId = await locationFunc.updateLocationData(location)
        } else {
            locationId = await locationFunc.importLocationData(location)
        }

        if(asset.properties.serial_no != '') {
            let checkCircuitExist = await circuitFunc.checkAssetNameExist(checkLocationExist.id, asset.properties.serial_no)
            let assetId = ''
            let jobId = ''
            if(checkCircuitExist.exist) {
                asset.id = checkCircuitExist.id
                assetId = asset.id
                await circuitFunc.updateCircuitImport(asset)
            } else {
                asset.location_id = locationId
                assetId  = (await circuitFunc.insertCircuitImport(asset)).id
            }

            let checkCircuitJobExits = circuitJobFunc.checkJobExistByName(job.name, assetId)
            if(job.name == '') {
                job.name = newUuid()
                job.asset_id = assetId
            } else {
                job.asset_id = assetId
            }

            if(checkCircuitJobExits.exist) {
                job.id = checkCircuitJobExits.id
                jobId = job.id
                await circuitJobFunc.updateJob(job)
            } else {
                jobId = newUuid()
                job.id = jobId
                await jobAssetFunc.insertJobasset(assetId, jobId)
                await circuitJobFunc.insertJobData(job)
            }

            if(jobId != '') {
                for(let k in testList) {
                    let getTestType = await circuitJobFunc.getTestTypeByCode(testList[k].code)
                    test.id = newUuid()
                    test.job_id = jobId
                    test.data = testList[k].data
                    test.testTypeId = getTestType.id
                    test.name = getTestType.name
                    await circuitJobFunc.insertTest(test.job_id, test)
                    await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
                }
            }
        }
    }
}

export const saveCurrentTrans = async(location, asset, job, testList, test) => {

    let data = {
        taps : 2,
        commonTap : 1,
        fullTap : {
            table : {
                isShow : true
            },
            classRating : {
            }
        },
        mainTap : {
            data : []
        },
        interTap : {
            data : []
        }
    }

    function groupIt(arr) {
        let groups = {}
        
        // let firstChar = arr.map(el=>el.table.name[0])
        let firstChar = arr.map(function (el) {
            if(el.table.name != undefined && el.table.name != "" && el.table.name != "undefined") {
                return (el.table.name.toString())[0]
            } else {
                return ""
            }
        })
        let firstCharFilter = firstChar.filter((el,id)=>{
          return firstChar.indexOf(el)===id
        })
       
        firstCharFilter.forEach(el=>{
          groups[el]=[]
        })
        
        firstCharFilter.forEach(char=>{
          for(let word of arr) {
            if((word.table.name.toString())[0]==char) {
              groups[char].push(word)
            }
          }
        })
        return groups
    }

    let group = groupIt(asset.config.common)
    let ordered = Object.keys(group).sort().reduce(
        (obj, key) => { 
          obj[key] = group[key]; 
          return obj;
        }, 
        {}
    )

    if(asset.config.dataCT.length == 0) {
        if(ordered != {}) {
            for(let i in Object.keys(ordered)) {
                let dataJson = JSON.parse(JSON.stringify(data))
                let desc = ordered[Object.keys(ordered)[i]].sort(function (a, b) {
                    return a.table.name.localeCompare(b.table.name);
                });
                let fulMain = desc.filter(element => element.table.name.includes(`${parseInt(i) + 1}S1`))
                let tapsData = fulMain[fulMain.length - 1].table.name.split("-")
                let tapsLast = tapsData[tapsData.length - 1]
                let taps = tapsLast[tapsLast.length - 1]
                dataJson.taps = taps
                dataJson.fullTap = fulMain[fulMain.length - 1]
                for(let j=0; j < fulMain.length - 1; j ++) {
                    dataJson.mainTap.data.push(fulMain[j])
                }
                asset.config.dataCT.push(dataJson)
            }
        }
    } else {
        if(ordered != {}) {
            if(Object.keys(ordered).length <= asset.config.dataCT.length) {
                for(let i in Object.keys(ordered)) {
                    let desc = ordered[Object.keys(ordered)[i]].sort(function (a, b) {
                        return a.table.name.localeCompare(b.table.name);
                    });
                    let fulMain = desc.filter(element => element.table.name.includes(`${parseInt(i) + 1}S1`))
                    let tapsData = fulMain[fulMain.length - 1].table.name.split("-")
                    let tapsLast = tapsData[tapsData.length - 1]
                    let taps = tapsLast[tapsLast.length - 1]
                    asset.config.dataCT[i].taps = taps
                    asset.config.dataCT[i].commonTap = 1
                    asset.config.dataCT[i].fullTap = fulMain[fulMain.length - 1]
                    fulMain.pop()
                    asset.config.dataCT[i].mainTap.data = fulMain
                }
            }
            else {
                for(let i=0; i< asset.config.dataCT.length; i++) {
                    let desc = ordered[Object.keys(ordered)[i]].sort(function (a, b) {
                        return a.table.name.localeCompare(b.table.name);
                    });
                    let fulMain = desc.filter(element => element.table.name.includes(`${parseInt(i) + 1}S1`))
                    let tapsData = fulMain[fulMain.length - 1].table.name.split("-")
                    let tapsLast = tapsData[tapsData.length - 1]
                    let taps = tapsLast[tapsLast.length - 1]
                    asset.config.dataCT[i].taps = taps
                    asset.config.dataCT[i].commonTap = 1
                    asset.config.dataCT[i].fullTap = fulMain[fulMain.length - 1]
                    fulMain.pop()
                    asset.config.dataCT[i].mainTap.data = fulMain
                }
                for(let i=asset.config.dataCT.length; i < Object.keys(ordered).length; i ++) {
                    let dataJson = JSON.parse(JSON.stringify(data))
                    let desc = ordered[Object.keys(ordered)[i]].sort(function (a, b) {
                        return a.table.name.localeCompare(b.table.name);
                    });
                    let fulMain = desc.filter(element => element.table.name.includes(`${parseInt(i) + 1}S1`))
                    let tapsData = fulMain[fulMain.length - 1].table.name.split("-")
                    let tapsLast = tapsData[tapsData.length - 1]
                    let taps = tapsLast[tapsLast.length - 1]
                    dataJson.taps = taps
                    dataJson.fullTap = fulMain[fulMain.length - 1]
                    for(let j=0; j < fulMain.length - 1; j ++) {
                        dataJson.mainTap.data.push(fulMain[j])
                    }
                    asset.config.dataCT.push(dataJson)
                } 
            }
        }
    }

    asset.config.cores = asset.config.dataCT.length
    
    if(location.name != '') {
        let checkLocationExist = await locationFunc.checkLocationNameExist(location.name)
        let locationId = ''
        if(checkLocationExist.exist) {
            location.id = checkLocationExist.id
            locationId = await locationFunc.updateLocationData(location)
        } else {
            locationId = await locationFunc.importLocationData(location)
        }

        if(asset.properties.serial_no != '') {
            let checkCurrentTransExist = await currentTransFunc.checkAssetNameExist(checkLocationExist.id, asset.properties.serial_no)
            let assetId = ''
            let jobId = ''
            if(checkCurrentTransExist.exist) {
                asset.id = checkCurrentTransExist.id
                assetId = asset.id
                await currentTransFunc.updateCurrentTransImport(asset)
            } else {
                asset.location_id = locationId
                assetId  = (await currentTransFunc.insertCurrentTransImport(asset)).id
            }

            let checkCurrentTransJobExits = currentTransJobFunc.checkJobExistByName(job.name, assetId)
            if(job.name == '') {
                job.name = newUuid()
                job.asset_id = assetId
            } else {
                job.asset_id = assetId
            }

            if(checkCurrentTransJobExits.exist) {
                job.id = checkCurrentTransJobExits.id
                jobId = job.id
                await currentTransJobFunc.updateJobCurrentVoltage(job)
            } else {
                jobId = await currentTransJobFunc.insertJob(job.asset_id, job)
            }

            if(jobId != '') {
                for(let k in testList) {
                    let getTestType = await currentTransJobFunc.getTestTypeByCode(testList[k].code)
                    test.id = newUuid()
                    test.job_id = jobId
                    test.data = testList[k].data
                    test.testTypeId = getTestType.id
                    test.name = getTestType.name
                    await currentTransJobFunc.insertTest(test.job_id, test)
                    await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
                }
            }
        }
    }
}

export const saveVoltageTrans = async(location, asset, job, testList, test) => {
    if(asset.ratings.rated_frequency_custom != '') {
        asset.ratings.rated_frequency = 'Custom'
    }
    asset.config.windings = asset.config.dataVT.length
    for(let i in asset.config.dataVT) {
        if(asset.config.dataVT[i].usrRatio != '') {
            asset.config.dataVT[i].usrRatio = asset.config.dataVT[i].usrRatio.toString()
            asset.config.dataVT[i].usrRatio = asset.config.dataVT[i].usrRatio.replace(/ /g, '')
            if(asset.config.dataVT[i].usrRatio == '1' || asset.config.dataVT[i].usrRatio == '1/1') {
                asset.config.dataVT[i].usrRatio = '1'
            } else if (asset.config.dataVT[i].usrRatio == '1/3') {
                asset.config.dataVT[i].usrRatio = '3'
            } else {
                if(!isNaN(parseFloat(asset.config.dataVT[i].usrRatio))) {
                    if((Math.round(parseFloat(asset.config.dataVT[i].usrRatio) * 10000) / 10000) == '0.3333') {
                        asset.config.dataVT[i].usrRatio = '3'
                    } else {
                        asset.config.dataVT[i].usrRatio = '3sqrt' 
                    }
                } else {
                    asset.config.dataVT[i].usrRatio = '3sqrt'
                } 
            }
        }

        asset.config.dataVT[i] = {
            table : asset.config.dataVT[i]
        }
    }

    if(asset.ratings.uprRatio != '') {
        asset.ratings.uprRatio = asset.ratings.uprRatio.toString()
        asset.ratings.uprRatio = asset.ratings.uprRatio.replace(/ /g, '')
        if(asset.ratings.uprRatio == '1' || asset.ratings.uprRatio == '1/1') {
            asset.ratings.uprRatio = '1'
        } else if (asset.ratings.uprRatio == '1/3') {
            asset.ratings.uprRatio = '3'
        } else {
            if(!isNaN(parseFloat(asset.ratings.uprRatio))) {
                if((Math.round(parseFloat(asset.ratings.uprRatio) * 10000) / 10000) == '0.3333') {
                    asset.ratings.uprRatio = '3'
                } else {
                    asset.ratings.uprRatio = '3sqrt' 
                }
            } else {
                asset.ratings.uprRatio = '3sqrt'
            } 
        }
    }

    if(location.name != '') {
        let checkLocationExist = await locationFunc.checkLocationNameExist(location.name)
        let locationId = ''
        if(checkLocationExist.exist) {
            location.id = checkLocationExist.id
            locationId = await locationFunc.updateLocationData(location)
        } else {
            locationId = await locationFunc.importLocationData(location)
        }

        if(asset.properties.serial_no != '') {
            let checkVoltageTransExist = await voltageTransFunc.checkAssetNameExist(checkLocationExist.id, asset.properties.serial_no)
            let assetId = ''
            let jobId = ''
            if(checkVoltageTransExist.exist) {
                asset.id = checkVoltageTransExist.id
                assetId = asset.id
                await voltageTransFunc.updateVoltageTransImport(asset)
            } else {
                asset.location_id = locationId
                assetId  = (await voltageTransFunc.insertVoltageTransImport(asset)).id
            }

            let checkVoltageTransJobExits = await voltageTransJobFunc.checkJobExistByName(assetId, job.name)
            if(job.name == '') {
                job.name = newUuid()
                job.asset_id = assetId
            } else {
                job.asset_id = assetId
            }

            if(checkVoltageTransJobExits.exist) {
                job.id = checkVoltageTransJobExits.id
                jobId = job.id
                await voltageTransJobFunc.updateJobVoltageTrans(job)
            } else {
                jobId = await voltageTransJobFunc.insertJob(job.asset_id, job)
            }

            if(jobId != '') {
                for(let k in testList) {
                    let getTestType = await voltageTransJobFunc.getTestTypeByCode(testList[k].code)
                    test.id = newUuid()
                    test.job_id = jobId
                    test.data = testList[k].data
                    test.testTypeId = getTestType.id
                    test.name = getTestType.name
                    await voltageTransJobFunc.insertTest(test.job_id, test)
                    await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
                }
            }
        }
    }
}

export const saveSurgeArrester = async(location, asset, job, testList, test) => {

    if(asset.ratings.tableRating.length != 0) {
        asset.ratings.unitStack = asset.ratings.tableRating.length
    }

    if(location.name != '') {
        let checkLocationExist = await locationFunc.checkLocationNameExist(location.name)
        let locationId = ''
        if(checkLocationExist.exist) {
            location.id = checkLocationExist.id
            locationId = await locationFunc.updateLocationData(location)
        } else {
            locationId = await locationFunc.importLocationData(location)
        }

        if(asset.properties.serial_no != '') {
            let checkSurgeArresterExist = await surgeArresterFunc.checkAssetNameExist(checkLocationExist.id, asset.properties.serial_no)
            let assetId = ''
            let jobId = ''
            if(checkSurgeArresterExist.exist) {
                asset.id = checkSurgeArresterExist.id
                assetId = asset.id
                await surgeArresterFunc.updateSurgeImport(asset)
            } else {
                asset.location_id = locationId
                assetId  = (await surgeArresterFunc.insertSurgeImport(asset)).id
            }

            let checkSurgeArresterJobExits = surgeArresterJobFunc.checkJobExistByName(job.name, assetId)
            if(job.name == '') {
                job.name = newUuid()
                job.asset_id = assetId
            } else {
                job.asset_id = assetId
            }

            if(checkSurgeArresterJobExits.exist) {
                job.id = checkSurgeArresterJobExits.id
                jobId = job.id
                await surgeArresterJobFunc.updateJobSurgeArrester(job)
            } else {
                jobId = await surgeArresterJobFunc.insertJob(job.asset_id, job)
            }

            if(jobId != '') {
                for(let k in testList) {
                    let getTestType = await surgeArresterJobFunc.getTestTypeByCode(testList[k].code)
                    test.id = newUuid()
                    test.job_id = jobId
                    test.data = testList[k].data
                    test.testTypeId = getTestType.id
                    test.name = getTestType.name
                    await surgeArresterJobFunc.insertTest(test.job_id, test)
                    await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
                }
            }
        }
    }
}

export const saveDisconnector = async(location, asset, job, testList, test) => {
    if(location.name != '') {
        let checkLocationExist = await locationFunc.checkLocationNameExist(location.name)
        let locationId = ''
        if(checkLocationExist.exist) {
            location.id = checkLocationExist.id
            locationId = await locationFunc.updateLocationData(location)
        } else {
            locationId = await locationFunc.importLocationData(location)
        }

        if(asset.properties.serial_no != '') {
            let checkDisconnectorExist = await disconnectorFunc.checkAssetNameExist(checkLocationExist.id, asset.properties.serial_no)
            let assetId = ''
            let jobId = ''
            if(checkDisconnectorExist.exist) {
                asset.id = checkDisconnectorExist.id
                assetId = asset.id
                await disconnectorFunc.updateDisconnectorImport(asset)
            } else {
                asset.location_id = locationId
                assetId  = (await disconnectorFunc.insertDisconnectorImport(asset)).id
            }

            let checkDisconnectorJobExits = disconnectorJobFunc.checkJobExistByName(assetId , job.name)
            if(job.name == '') {
                job.name = newUuid()
                job.asset_id = assetId
            } else {
                job.asset_id = assetId
            }

            if(checkDisconnectorJobExits.exist) {
                job.id = checkDisconnectorJobExits.id
                jobId = job.id
                await disconnectorJobFunc.updateJob(job)
            } else {
                jobId = await disconnectorJobFunc.insertJob(job.asset_id, job)
            }

            if(jobId != '') {
                for(let k in testList) {
                    let getTestType = await disconnectorJobFunc.getTestTypeByCode(testList[k].code)
                    test.id = newUuid()
                    test.job_id = jobId
                    test.data = testList[k].data
                    test.testTypeId = getTestType.id
                    test.name = getTestType.name
                    await disconnectorJobFunc.insertTest(test.job_id, test)
                    await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
                }
            }
        }
    }
}

export const savePowerCable = async(location, asset, job, testList, test) => {
    let listTanDeltaVlf = testList.filter(x => x.code == 'TandeltaVlfSource')
    if(listTanDeltaVlf.length != 0) {
        for(let i=0; i<listTanDeltaVlf.length; i++) {
            for(let j=0; j<listTanDeltaVlf[i].data.table.length; j++) {
                if(j%3==0) {
                    listTanDeltaVlf[i].data.table[j].test_voltage_label = '0.5'
                } else if(j%3==1) {
                    listTanDeltaVlf[i].data.table[j].test_voltage_label = '1.0'
                } else {
                    listTanDeltaVlf[i].data.table[j].test_voltage_label = '1.5'
                }
                if(j/3==1) {
                    listTanDeltaVlf[i].data.table[j].measurement = "Phase B-(A+C+GND)"
                }
                else if(j/3 == 2) {
                    listTanDeltaVlf[i].data.table[j].measurement = "Phase C-(A+B+GND)"
                } else {
                    listTanDeltaVlf[i].data.table[j].measurement = "Phase A-(B+C+GND)"
                }
            }
        }
    }
    if(location.name != '') {
        let checkLocationExist = await locationFunc.checkLocationNameExist(location.name)
        let locationId = ''
        if(checkLocationExist.exist) {
            location.id = checkLocationExist.id
            locationId = await locationFunc.updateLocationData(location)
        } else {
            locationId = await locationFunc.importLocationData(location)
        }

        if(asset.powerCable.properties.serial_no != '') {
            let checkPowerCableExist = await powerCableFunc.checkAssetNameExist(checkLocationExist.id, asset.powerCable.properties.serial_no)
            let assetId = ''
            let jobId = ''
            if(checkPowerCableExist.exist) {
                asset.id = checkPowerCableExist.id
                assetId = asset.id
                await powerCableFunc.updatePowerCableImport(asset)
            } else {
                asset.location_id = locationId
                assetId  = (await powerCableFunc.insertPowerCableImport(asset)).id
            }

            let checkPowerCableJobExits = powerCableJobFunc.checkJobExistByName(assetId, job.name)
            if(job.name == '') {
                job.name = newUuid()
                job.asset_id = assetId
            } else {
                job.asset_id = assetId
            }

            if(checkPowerCableJobExits.exist) {
                job.id = checkPowerCableJobExits.id
                jobId = job.id
                await powerCableJobFunc.updateJobPowerCable(job)
            } else {
                jobId = await powerCableJobFunc.insertJob(job.asset_id, job)
            }

            if(jobId != '') {
                for(let k in testList) {
                    let getTestType = await powerCableJobFunc.getTestTypeByCode(testList[k].code)
                    test.id = newUuid()
                    test.job_id = jobId
                    test.data = testList[k].data
                    test.testTypeId = getTestType.id
                    test.name = getTestType.name
                    await powerCableJobFunc.insertTest(test.job_id, test)
                    await conditionFunc.insertTestingCondition(test.id, testList[k].condition)
                }
            }
        }
    }
}

export const addDataTable = async(dataTable, dataForm, dataVar, indexData, worksheet) => {
    const arrJson = Object.assign({}, dataTable[dataVar.feature].columnAddr.map(x => x.value))
    const swapped = Object.fromEntries(Object.entries(arrJson).map(([ , value]) => [value, '']))
    let dataValue = dataTable[dataVar.feature].columnAddr.filter(element => element.extends != undefined).map(x => x.value)

    if(dataForm.length == 0) {
        for(let j in dataVar['address'][indexData][indexData]) {
            let copySwaped = JSON.parse(JSON.stringify(swapped))
            if(dataValue.includes(dataVar.columnAddr)) {
                copySwaped[dataVar.columnAddr] = Object.assign({},dataTable[dataVar.feature].columnAddr.filter(element => element.value == dataVar.columnAddr)[0].extends)
                copySwaped[dataVar.columnAddr].value = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                dataForm.push(copySwaped)
            } else {
                copySwaped[dataVar.columnAddr] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                dataForm.push(copySwaped)
            }
        }
    } else {
        if(dataVar.address[indexData][indexData].length <=  dataForm.length) {
            for(let j in dataVar.address[indexData][indexData]) {
                if(dataValue.includes(dataVar.columnAddr)) {
                    dataForm[j][dataVar.columnAddr] = Object.assign({},dataTable[dataVar.feature].columnAddr.filter(element => element.value == dataVar.columnAddr)[0].extends)
                    dataForm[j][dataVar.columnAddr].value = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                } else {
                    dataForm[j][dataVar.columnAddr] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                }
            }
        } else {
            for(let j in dataForm) {
                if(dataValue.includes(dataVar.columnAddr)) {
                    dataForm[j][dataVar.columnAddr].value = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                } else {
                    dataForm[j][dataVar.columnAddr] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                }
            }
            for(let i = dataForm.length; i < dataVar.address[indexData][indexData].length; i ++ ) {
                let copySwaped = Object.assign({}, swapped);
                if(dataValue.includes(dataVar.columnAddr)) {
                    copySwaped[dataVar.columnAddr] = Object.assign({}, dataTable[dataVar.feature].columnAddr.filter(element => element.value == dataVar.columnAddr)[0].extends)
                    copySwaped[dataVar.columnAddr].value = worksheet.getCell(dataVar.address[indexData][indexData][i]).value
                    dataForm.push(copySwaped)
                } else {
                    copySwaped[dataVar.columnAddr] = worksheet.getCell(dataVar.address[indexData][indexData][i]).value
                    dataForm.push(copySwaped)
                }  
            }
        }
    }
    return dataForm
}

export const assignData = async(template, data, value) => {
    if(data.coverData == '') {
        if(data.attribute == '') {
            if(data.rowAddr == '') {
                if(data.columnAddr == '') {
                    if(data.feature == '') {
                    } else {
                        template[data.feature] = value
                    }
                } else {
                    template[data.feature][data.columnAddr] = value
                }
            } else {
                template[data.feature][data.columnAddr][data.rowAddr] = value
            }
        } else {
            template[data.feature][data.columnAddr][data.rowAddr][data.attribute] = value
        }
    } else {
        template[data.feature][data.columnAddr][data.rowAddr][data.attribute][data.coverData] = value
    }
}

export const addDataTableByColumnTest = async(column, dataForm, code, dataVar, columnName, indexData, worksheet, conditionData) => {
    const arrJson = column.map(x => x.value)
    const swapped = Object.fromEntries(Object.entries(arrJson).map(([ , value]) => [value, '']))
    const dataTest = dataForm.filter(element => element.code == code).map(e => e.data)[0]
    for(let i in dataForm) {
        if(dataForm[i].code == code) {
            if(Object.keys(conditionData).includes(dataVar.columnAddr)) {
                if(dataVar.columnAddr != "comment") {
                    for(let j in dataVar.address[indexData][indexData]) {
                        dataForm[i].condition[dataVar.columnAddr][dataVar.rowAddr] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                    }
                }
                else {
                    for(let j in dataVar.address[indexData][indexData]) {
                        dataForm[i].condition[dataVar.columnAddr] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                    }
                }
            } else {
                if(dataForm[i].data.table.length == 0) {
                    for(let j in dataVar.address[indexData][indexData]) {
                        let copySwaped = Object.assign({}, swapped);
                        copySwaped[columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                        dataForm[i].data.table.push(copySwaped)
                    }
                } else {
                    if(dataVar.address[indexData][indexData].length <=  dataForm[i].data.table.length) {
                        for(let j in dataVar.address[indexData][indexData]) {
                            dataForm[i].data.table[j][columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value      
                        }
                    } else {
                        for(let j in dataForm[i].data.table) {
                            dataForm[i].data.table[j][columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                        }
                        for(let j = dataForm[i].data.table.length; j < dataVar.address[indexData][indexData].length; j ++ ) {
                            let copySwaped = Object.assign({}, swapped);
                            copySwaped[columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                            dataForm[i].data.table.push(copySwaped) 
                        }
                    }
                }
            }
        }
    }
}

export const addDataTableByColumnTestPower = async(column, dataForm, code, dataVar, columnName, indexData, worksheet, conditionData) => {
    const arrJson = column.map(x => x.value)
    const swapped = Object.fromEntries(Object.entries(arrJson).map(([ , value]) => [value, '']))
    const dataTest = dataForm.filter(element => element.code == code).map(e => e.data)[0]
    for(let i in dataForm) {
        if(dataForm[i].code == code) {
            if(Object.keys(conditionData).includes(dataVar.rowAddr)) {
                if(dataVar.rowAddr != "comment") {
                    for(let j in dataVar.address[indexData][indexData]) {
                        dataForm[i].condition[dataVar.rowAddr][dataVar.attribute] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                    }
                }
                else {
                    for(let j in dataVar.address[indexData][indexData]) {
                        dataForm[i].condition[dataVar.rowAddr] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                    }
                }
            } else {
                if(dataForm[i].data.table.length == 0) {
                    for(let j in dataVar.address[indexData][indexData]) {
                        let copySwaped = Object.assign({}, swapped);
                        copySwaped[columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                        dataForm[i].data.table.push(copySwaped)
                    }
                } else {
                    if(dataVar.address[indexData][indexData].length <=  dataForm[i].data.table.length) {
                        for(let j in dataVar.address[indexData][indexData]) {
                            dataForm[i].data.table[j][columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value      
                        }
                    } else {
                        for(let j in dataForm[i].data.table) {
                            dataForm[i].data.table[j][columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                        }
                        for(let j = dataForm[i].data.table.length; j < dataVar.address[indexData][indexData].length; j ++ ) {
                            let copySwaped = Object.assign({}, swapped);
                            copySwaped[columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                            dataForm[i].data.table.push(copySwaped) 
                        }
                    }
                }
            }
        }
    }
}

export const addDataTableByColumn = async(column, table, dataVar, columnName, indexData, worksheet) => {
    const arrJson = column.map(x => x.value)
    const swapped = Object.fromEntries(Object.entries(arrJson).map(([ , value]) => [value, '']))
    if(table.length == 0) {
        for(let j in dataVar.address[indexData][indexData]) {
            let copySwaped = Object.assign({}, swapped);
            copySwaped[columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
            table.push(copySwaped)
        }
    } else {
        if(dataVar.address[indexData][indexData].length <=  table.length) {
            for(let j in dataVar.address[indexData][indexData]) {
                table[j][columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value      
            }
        } else {
            for(let j in table) {
                table[j][columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
            }
            for(let j = table.length; j < dataVar.address[indexData][indexData].length; j ++ ) {
                let copySwaped = Object.assign({}, swapped);
                copySwaped[columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                table.push(copySwaped) 
            }
        }
    }
}

export const addDataTableByColumnCommon = async( table, dataVar, columnName, indexData, worksheet, rowName) => {
    let templateData = {
        table : {
            isShow : true
        },
        classRating : {}
    }

    if(table.length == 0) {
        for(let j in dataVar.address[indexData][indexData]) {
            let copySwaped = JSON.parse(JSON.stringify(templateData))
            copySwaped[columnName][rowName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
            table.push(copySwaped)
        }
    } 
    else {
        if(dataVar.address[indexData][indexData].length <=  table.length) {
            for(let j in dataVar.address[indexData][indexData]) {
                table[j][columnName][rowName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value      
            }
        } else {
            for(let j in table) {
                table[j][columnName][rowName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
            }
            for(let j = table.length; j < dataVar.address[indexData][indexData].length; j ++ ) {
                let copySwaped = JSON.parse(JSON.stringify(templateData))
                copySwaped[columnName][rowName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                table.push(copySwaped) 
            }
        }
    }
}

export const addDataTableByColumnForCurrent = async(column, table, dataVar, columnName, indexData, worksheet) => {
    const arrJson = column.map(x => x.value)
    let templateArr = Object.entries(arrJson).map(function ([ , value]) {
        if(["mainTap", "interTap"].includes(value)) {
            return [value, {data : []}]
        } else if(value == 'fullTap') {
            return [value, {}]
        } else {
            return [value, ""] 
        }
    })
    let swapped = Object.fromEntries(templateArr)

    if(table.length == 0) {
        for(let j in dataVar.address[indexData][indexData]) {
            let copySwaped = Object.assign({}, swapped);
            copySwaped[columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
            table.push(copySwaped)
        }
    } else {
        if(dataVar.address[indexData][indexData].length <=  table.length) {
            for(let j in dataVar.address[indexData][indexData]) {
                table[j][columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value      
            }
        } else {
            for(let j in table) {
                table[j][columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
            }
            for(let j = table.length; j < dataVar.address[indexData][indexData].length; j ++ ) {
                let copySwaped = Object.assign({}, swapped);
                copySwaped[columnName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                table.push(copySwaped) 
            }
        }
    }
}

export const addDataTableByColumnForCurrentForTable = async(column, table, dataVar, rowName, indexData, worksheet, attributeName, coverDataName  ) => {
    const arrJson = column.map(x => x.value)
    let templateArr = Object.entries(arrJson).map(function ([ , value]) {
        if(["mainTap", "interTap"].includes(value)) {
            return [value, {data : []}]
        } else if(value == 'fullTap') {
            return [value, {}]
        } else {
            return [value, ""] 
        }
    })
    let swapped = Object.fromEntries(templateArr)

    let templateData = {
        table : {
            isShow : true
        },
        classRating : {}
    }

    if(table.length == 0) {
        for(let j in dataVar.address[indexData][indexData]) {
            let copySwaped = Object.assign({}, swapped);
            if(rowName == "fullTap") {
                copySwaped[rowName] = JSON.parse(JSON.stringify(templateData))
                copySwaped[rowName][attributeName][coverDataName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                table.push(copySwaped)
            } else {
                table.push(copySwaped)
                let temp = JSON.parse(JSON.stringify(templateData))
                temp[attributeName][coverDataName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                table[0][rowName]['data'].push(temp)
            }
        }
    } 
    else {
        if(rowName == "fullTap") {
            if(dataVar.address[indexData][indexData].length <=  table.length) {
                for(let j in dataVar.address[indexData][indexData]) {
                    table[j][rowName][attributeName][coverDataName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value      
                }
            } else {
                for(let j in table) {
                    table[j][rowName][attributeName][coverDataName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                }
                for(let j = table.length; j < dataVar.address[indexData][indexData].length; j ++ ) {
                    let copySwaped = Object.assign({}, swapped);
                    copySwaped[rowName] = JSON.parse(JSON.stringify(templateData))
                    copySwaped[rowName][attributeName][coverDataName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                    table.push(copySwaped)
                }
            }
        } else {
            if(dataVar.address[indexData][indexData].length <=  table.length) {
                for(let j in dataVar.address[indexData][indexData]) {
                    table[0][rowName]['data'][j][attributeName][coverDataName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value      
                }
            } else {
                for(let j in table) {
                    table[0][rowName]['data'][j][attributeName][coverDataName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                }
                for(let j = table.length; j < dataVar.address[indexData][indexData].length; j ++ ) {
                    let copySwaped = Object.assign({}, swapped);
                    table.push(copySwaped)
                    let temp = JSON.parse(JSON.stringify(templateData))
                    temp[attributeName][coverDataName] = worksheet.getCell(dataVar.address[indexData][indexData][j]).value
                    table[0][rowName]['data'].push(temp)
                }
            }
        }
    }
}

export const exportReport = async(file, filePath, location, assetType, asset, job, test, user_id, bushing, tap_changer) => {
    let fullTap = []
    let mainTap = []
    let interTap = []
    if(assetType == 'current') {
        for(let i in JSON.parse(asset.config).dataCT) {
            fullTap.push(JSON.parse(asset.config).dataCT[i].fullTap)
            for(let j in JSON.parse(asset.config).dataCT[i].mainTap.data) {
                mainTap.push(JSON.parse(asset.config).dataCT[i].mainTap.data[j])
            }
            for(let j in JSON.parse(asset.config).dataCT[i].interTap.data) {
                interTap.push(JSON.parse(asset.config).dataCT[i].interTap.data[j])
            }
        }
    }
    var allTap = fullTap.concat(mainTap, interTap)
    allTap = allTap.sort((a,b) => {
        if(a.table.name < b.table.name) {
            return -1
        }
    })

    var regexPattern = /^#/;
    let conditionData = await conditionTest.initCondition()
    let listCondition = []
    for(let i in test) {
        let conditon = await conditionFunc.getTestingCondition(test[i].id)
        listCondition.push(conditon)
    }
    var workbookTemp = new Excel.Workbook()
    await workbookTemp.xlsx.readFile(file.path)

    for(let i in workbookTemp.worksheets) {
        var worksheet = workbookTemp.getWorksheet(workbookTemp.worksheets[i].name)
        worksheet.eachRow({ includeEmpty: false }, async function(row) {
            row.eachCell({ includeEmpty: false }, (cell) => {
                if(regexPattern.test(cell.value)) {
                   cell.value = '' 
                }
            })
        })
    }

    for(let indexData in workbookTemp.worksheets) {
        var worksheet = workbookTemp.getWorksheet(workbookTemp.worksheets[indexData].name)
        for(let index in file.var) {
            if(file.var[index].categories == 'locations') {
                for(let j in file.var[index].address[indexData][indexData]) {
                    worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = location[file.var[index].feature]
                }
            } else if(file.var[index].categories == 'Transformer') {
                if(transformer.map(x => x.value).includes(file.var[index].feature) && !transformerValue.map(x => x.value).includes(file.var[index].feature) && !Object.keys(transformerTable).includes(file.var[index].feature) ) {
                    if(file.var[index].feature != 'vector_group') {
                        for(let j in file.var[index].address[indexData][indexData]) {
                            worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = asset[file.var[index].feature]
                        }
                    } else {
                        for(let j in file.var[index].address[indexData][indexData]) {
                            let vector_group = JSON.parse(asset[file.var[index].feature])
                            worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = vector_group.prim + vector_group.sec.I + vector_group.sec.Value
                            + vector_group.tert.I + vector_group.tert.Value
                        }
                    }
                } else if(transformerValue.map(x => x.value).includes(file.var[index].feature)) {
                    for(let j in file.var[index].address[indexData][indexData]) {
                        worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset[file.var[index].feature]).value
                    }
                } else if(Object.keys(transformerTable).includes(file.var[index].feature)) {
                    if(file.var[index].feature != 'winding') {
                        let column = transformerTable[file.var[index].feature].columnAddr.filter(x => x.value == file.var[index].columnAddr)[0]
                        if(column.extends == undefined) {
                            for(let j in file.var[index].address[indexData][indexData]) {
                                if(JSON.parse(asset[file.var[index].feature])[j] != undefined) {
                                    if(JSON.parse(asset[file.var[index].feature])[j][file.var[index].columnAddr] != undefined) {
                                        worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset[file.var[index].feature])[j][file.var[index].columnAddr]
                                    }
                                }
                            }
                        } else {
                            for(let j in file.var[index].address[indexData][indexData]) {
                                if(JSON.parse(asset[file.var[index].feature])[j] != undefined) {
                                    if(JSON.parse(asset[file.var[index].feature])[j][file.var[index].columnAddr] != undefined) {
                                        worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset[file.var[index].feature])[j][file.var[index].columnAddr].value
                                    }
                                }
                            }
                        }
                    } else {
                        for(let j in file.var[index].address[indexData][indexData]) {
                            if(worksheet.getCell(file.var[index].address[indexData][indexData][j]).value != null) {
                                worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset[file.var[index].feature])[file.var[index].columnAddr]
                            }
                        }
                    }
                }
            } else if(file.var[index].categories == 'bushings') {
                let jsonArrMap = ['fi', 'se', 'th', 'fo']
                for(let j in file.var[index].address[indexData][indexData]) {
                    if(j < jsonArrMap.length) {
                        worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(bushing[file.var[index].feature])[file.var[index].columnAddr][jsonArrMap[j]]
                    }
                }
            } else if(file.var[index].categories == 'tap_changers') {
                if(Object.keys(tapChangerTable).includes(file.var[index].feature)) {
                    for(let j in file.var[index].address[indexData][indexData]) {
                        if(j < JSON.parse(tap_changer[file.var[index].feature]).length) {
                            worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(tap_changer[file.var[index].feature])[j][file.var[index].columnAddr]
                        }
                    }
                } else {
                    for(let j in file.var[index].address[indexData][indexData]) {
                        worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = tap_changer[file.var[index].feature]
                    }
                }
            } else if(file.var[index].categories == 'Transformer job') {
                for(let j in file.var[index].address[indexData][indexData]) {
                    worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = job[file.var[index].feature]
                }
            } else if(file.var[index].categories == 'Transformer test') {
                let copyData = JSON.parse(JSON.stringify(file.var[index].address[indexData][indexData]))
                var indexChart = []
                if(copyData.length > 0) {
                    for(let i=0; i<copyData.length -1; i++) {
                        var isNextTo = nextTo(copyData[i], copyData[i+1])
                        if(isNextTo == false) {
                            indexChart.push(i)
                        }
                    }
                }
                
                var copyDataArr = []
                for(let i in indexChart) {
                    if(i==0) {
                        var sub = copyData.splice(0, indexChart[i]+1)
                        copyDataArr.push(sub)
                    } else{
                        var sub = copyData.splice(0, indexChart[i]-indexChart[i-1])
                        copyDataArr.push(sub)
                    }
                }

                if(copyData.length != 0) {
                    copyDataArr.push(copyData)
                }
                

                if(Object.keys(conditionData).includes(file.var[index].columnAddr)) {
                    var th = 0
                    for(let i=0; i<test.length; i++) {
                        if(JSON.parse(test[i].data).code == file.var[index].feature) {
                            var t = i
                            if(th < copyDataArr.length) {
                                if(file.var[index].columnAddr != 'comment') {
                                    for(let j=0; j<copyDataArr[th].length; j++) {
                                        worksheet.getCell(copyDataArr[th][j]).value = JSON.parse(listCondition[t][0][file.var[index].columnAddr])[file.var[index].rowAddr]
                                    }
                                } else {
                                    for(let j=0; j<copyDataArr[th].length; j++) {
                                        worksheet.getCell(copyDataArr[th][j]).value = listCondition[t][0][file.var[index].columnAddr]
                                    }
                                }
                            }
                            th = th + 1
                        }
                    }
                } else {     
                    var th = 0
                    for(let i=0; i<test.length; i++) {
                        if(JSON.parse(test[i].data).code == file.var[index].feature) {
                            var t = i
                            if(th < copyDataArr.length) {
                                for(let j=0; j<copyDataArr[th].length; j++) {
                                    if(j < JSON.parse(test[t].data).table.length) {
                                        worksheet.getCell(copyDataArr[th][j]).value = JSON.parse(test[t].data).table[j][file.var[index].columnAddr]
                                    }
                                }
                            }
                            th = th + 1             
                        }
                    }
                }
            } else if(file.var[index].categories == 'Circuit breaker') {
                for(let j in file.var[index].address[indexData][indexData]) {
                    worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset[file.var[index].feature])[file.var[index].columnAddr]
                }
            } else if(file.var[index].categories == 'Circuit breaker assessment limits') {
                if(Object.keys(assessmentLimitsTable).includes(file.var[index].feature) && !Object.keys(assessmentValue).includes(file.var[index].feature)) {
                    for(let j in file.var[index].address[indexData][indexData]) {
                        worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset['assessmentLimits'])[file.var[index].feature][file.var[index].columnAddr][file.var[index].rowAddr][file.var[index].attribute]
                    }
                } else if(Object.keys(assessmentLimitsTable).includes(file.var[index].feature) && Object.keys(assessmentValue).includes(file.var[index].feature)) {
                    if(file.var[index].feature != 'auxContact') {
                        for(let j in file.var[index].address[indexData][indexData]) {
                            worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset['assessmentLimits'])[file.var[index].feature][file.var[index].columnAddr][file.var[index].attribute]
                        }
                    } else {
                        for(let j in file.var[index].address[indexData][indexData]) {
                            worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset['assessmentLimits'])[file.var[index].feature][file.var[index].columnAddr][file.var[index].rowAddr][file.var[index].attribute][file.var[index].coverData]
                        }
                    }
                }    
            } else if(file.var[index].categories == 'Circuit breaker operating mechanism') {
                if(!Object.keys(operatingMechanismTable).includes(file.var[index].feature)) {
                    for(let j in file.var[index].address[indexData][indexData]) {
                        worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON(asset['operating'])[file.var[index].feature]
                    }
                } else {
                    if(["operatingTableMotor", "operatingTableAuxiliary"].includes(file.var[index].feature)) {
                        if(file.var[index].feature == 'operatingTableMotor') {
                            for(let j in file.var[index].address[indexData][indexData]) {
                                worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset['operating'])['table'][3][file.var[index].columnAddr]
                            }
                        } else {
                            for(let j in file.var[index].address[indexData][indexData]) {
                                worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset['operating'])['table'][2][file.var[index].columnAddr]
                            }
                        }
                    } else {
                        let id = file.var[index].feature == 'operatingTableTripCoil' ? 0 : 1
                        for(let j in file.var[index].address[indexData][indexData]) {
                            if(j < JSON.parse(asset['operating'])['table'][id]) {
                                worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset['operating'])['table'][id][j][file.var[index].columnAddr]
                            }
                        }
                    }
                }
            } else if(file.var[index].categories == 'Circuit breaker job') {
                for(let j in file.var[index].address[indexData][indexData]) {
                    worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value = job[data.variable[index].feature]
                }
            } else if(file.var[index].categories == 'Circuit breaker test') {
                let copyData = JSON.parse(JSON.stringify(file.var[index].address[indexData][indexData]))
                var indexChart = []
                if(copyData.length > 0) {
                    for(let i=0; i<copyData.length -1; i++) {
                        var isNextTo = nextTo(copyData[i], copyData[i+1])
                        if(isNextTo == false) {
                            indexChart.push(i)
                        }
                    }
                }

                var copyDataArr = []
                for(let i in indexChart) {
                    if(i==0) {
                        var sub = copyData.splice(0, indexChart[i]+1)
                        copyDataArr.push(sub)
                    } else{
                        var sub = copyData.splice(0, indexChart[i]-indexChart[i-1])
                        copyDataArr.push(sub)
                    }
                }
                if(copyData.length != 0) {
                    copyDataArr.push(copyData)
                }


                if(Object.keys(conditionData).includes(file.var[index].columnAddr)) {
                    var th = 0
                    for(let i=0; i<test.length; i++) {
                        if(test[i].testTypeCode == file.var[index].feature) {
                            var t = i
                            if(th < copyDataArr.length) {
                                if(file.var[index].columnAddr != 'comment') {
                                    for(let j=0; j<copyDataArr[th].length; j++) {
                                        worksheet.getCell(copyDataArr[th][j]).value = JSON.parse(listCondition[t][0][file.var[index].columnAddr])[file.var[index].rowAddr]
                                    }
                                } else {
                                    for(let j=0; j<copyDataArr[th].length; j++) {
                                        worksheet.getCell(copyDataArr[th][j]).value = listCondition[t][0][file.var[index].columnAddr]
                                    }
                                }
                            }
                            th = th + 1
                        }
                    }
                } else {
                    var th = 0
                    for(let i=0; i<test.length; i++) {
                        if(test[i].testTypeCode == file.var[index].feature) {
                            if(["sf6MoiturePurity", 'sf6GasAnalysis'].includes(file.var[index].feature)) {
                                if(Object.keys(conditionData).includes(file.var[index].rowAddr)) {
                                    var t = i
                                    if(th < copyDataArr.length) {
                                        if(file.var[index].rowAddr != 'comment') {
                                            for(let j=0; j<copyDataArr[th].length; j++) {
                                                worksheet.getCell(copyDataArr[th][j]).value = JSON.parse(listCondition[t][0][file.var[index].rowAddr])[file.var[index].attribute]
                                            }
                                        } else {
                                            for(let j=0; j<copyDataArr[th].length; j++) {
                                                worksheet.getCell(copyDataArr[th][j]).value = listCondition[t][0][file.var[index].rowAddr]
                                            }
                                        }
                                    }
                                    th = th + 1
                                   
                                } else {
                                    if(test[i].testTypeCode == file.var[index].feature) {
                                        var t = i
                                        if(th < copyDataArr.length) {
                                            for(let j=0; j<copyDataArr[th].length; j++) {
                                                if(j < JSON.parse(test[t].data).table[file.var[index].columnAddr].length) {
                                                    worksheet.getCell(copyDataArr[th][j]).value = JSON.parse(test[t].data).table[file.var[index].columnAddr][j][file.var[index].rowAddr]
                                                }
                                            }
                                        }
                                        th = th + 1             
                                    }
                                    
                                }
                            } else if(["cTiming", 'coTiming', "oTiming", "ocTiming", "ocoTiming"].includes(file.var[index].feature)) {
                                if(test[i].testTypeCode == file.var[index].feature) {
                                    var t = i
                                    for(let k=0; k<JSON.parse(test[i].data).table.length; k++) {
                                        if(th < copyDataArr.length) {
                                            for(let j=0; j<copyDataArr[th].length; j++) {
                                                if(j<JSON.parse(test[t].data).table[k].length) {
                                                    if(JSON.parse(test[t].data).table[k][j][file.var[index].columnAddr] != undefined && JSON.parse(test[t].data).table[k][j][file.var[index].columnAddr] != 'undefined') {
                                                        worksheet.getCell(copyDataArr[th][j]).value = JSON.parse(test[t].data).table[k][j][file.var[index].columnAddr]
                                                    }
                                                }
                                            }
                                            th = th+1
                                        }
                                    }
                                               
                                }
                            } else {
                                if(test[i].testTypeCode == file.var[index].feature) {
                                    var t = i
                                    if(th < copyDataArr.length) {
                                        for(let j=0; j<copyDataArr[th].length; j++) {
                                            if(j < JSON.parse(test[t].data).table.length) {
                                                if(JSON.parse(test[t].data).table[j][file.var[index].columnAddr] != undefined && JSON.parse(test[t].data).table[j][file.var[index].columnAddr] != '') {
                                                    worksheet.getCell(copyDataArr[th][j]).value = JSON.parse(test[t].data).table[j][file.var[index].columnAddr]
                                                }
                                            }
                                        }
                                    }
                                    th = th + 1             
                                }
                            }
                        }
                    }
                }
            } else if(file.var[index].categories == 'Current') {
                let copyData = JSON.parse(JSON.stringify(file.var[index].address[indexData][indexData]))
                var indexChart = []
                if(copyData.length > 0) {
                    for(let i=0; i<copyData.length -1; i++) {
                        var isNextTo = nextTo(copyData[i], copyData[i+1])
                        if(isNextTo == false) {
                            indexChart.push(i)
                        }
                    }
                }

                var copyDataArr = []
                for(let i in indexChart) {
                    if(i==0) {
                        var sub = copyData.splice(0, indexChart[i]+1)
                        copyDataArr.push(sub)
                    } else{
                        var sub = copyData.splice(0, indexChart[i]-indexChart[i-1])
                        copyDataArr.push(sub)
                    }
                }
                if(copyData.length != 0) {
                    copyDataArr.push(copyData)
                }

                if(file.var[index].feature != 'config') {
                    for(let j in file.var[index].address[indexData][indexData]) {
                        if(file.var[index].rowAddr != undefined && file.var[index].rowAddr != '') {
                            worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset[file.var[index].feature])[file.var[index].columnAddr][file.var[index].rowAddr]
                        } else {
                            worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset[file.var[index].feature])[file.var[index].columnAddr]
                        }
                    }  
                } else {
                    if(file.var[index].columnAddr == 'cores') {
                        for(let j in file.var[index].address[indexData][indexData]) {
                            worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset[file.var[index].feature])[file.var[index].columnAddr]
                        }
                    } else {
                        if(["taps", "commonTap"].includes(file.var[index].rowAddr)) {
                            for(let j in file.var[index].address[indexData][indexData]) {
                                worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = JSON.parse(asset[file.var[index].feature])[file.var[index].columnAddr][file.var[index].rowAddr]
                            }
                        } else if(file.var[index].rowAddr == "common") {
                            for(let j in file.var[index].address[indexData][indexData]) {
                                if(j < allTap.length) {
                                    if(allTap[j][file.var[index].attribute][file.var[index].coverData] != undefined) {
                                        worksheet.getCell(file.var[index].address[indexData][indexData][j]).value = allTap[j][file.var[index].attribute][file.var[index].coverData]
                                    }
                                }
                            }
                        } else {
                            var th = 0
                            if(file.var[index].rowAddr == 'fullTap') {
                                for(let j=0; j<JSON.parse(asset.config).dataCT.length; j++) {
                                    if(th < JSON.parse(asset.config).dataCT.length) {
                                        for(let k in copyDataArr[th]) {
                                            worksheet.getCell(copyDataArr[th][k]).value =  JSON.parse(asset.config).dataCT[j].fullTap[file.var[index].attribute][file.var[index].coverData]
                                        }
                                    }
                                    th = th + 1
                                }
                            } else if(file.var[index].rowAddr == 'mainTap') {
                                for(let j=0; j<JSON.parse(asset.config).dataCT.length; j++) {
                                    if(th < JSON.parse(asset.config).dataCT.length) {
                                        for(let k in copyDataArr[th]) {
                                            if(k < JSON.parse(asset.config).dataCT[j].mainTap.data.length) {
                                                worksheet.getCell(copyDataArr[th][k]).value =  JSON.parse(asset.config).dataCT[j].mainTap.data[k][file.var[index].attribute][file.var[index].coverData]
                                            }
                                        }
                                    }
                                    th = th + 1
                                }
                            } else if(file.var[index].rowAddr == 'interTap') {
                                for(let j=0; j<JSON.parse(asset.config).dataCT.length; i++) {
                                    if(th < JSON.parse(asset.config).dataCT.length) {
                                        for(let k in copyDataArr[th]) {
                                            if(k < JSON.parse(asset.config).dataCT[j].interTap.data.length) {
                                                worksheet.getCell(copyDataArr[th][k]).value =  JSON.parse(asset.config).dataCT[j].interTap.data[k][file.var[index].attribute][file.var[index].coverData]
                                            }
                                        }
                                    }
                                    th = th + 1
                                }
                            }
                        }
                    }
                }
            } else if(file.var[index].categories == 'Current job') {
                for(let j in file.var[index].address[indexData][indexData]) {
                    worksheet.getCell(data.variable[index].address[indexData][indexData][j]).value = job[data.variable[index].feature]
                }
            } else if(file.var[index].categories == 'Current test') {
                let copyData = JSON.parse(JSON.stringify(file.var[index].address[indexData][indexData]))
                var indexChart = []
                if(copyData.length > 0) {
                    for(let i=0; i<copyData.length -1; i++) {
                        var isNextTo = nextTo(copyData[i], copyData[i+1])
                        if(isNextTo == false) {
                            indexChart.push(i)
                        }
                    }
                }
                
                var copyDataArr = []
                for(let i in indexChart) {
                    if(i==0) {
                        var sub = copyData.splice(0, indexChart[i]+1)
                        copyDataArr.push(sub)
                    } else{
                        var sub = copyData.splice(0, indexChart[i]-indexChart[i-1])
                        copyDataArr.push(sub)
                    }
                }

                if(copyData.length != 0) {
                    copyDataArr.push(copyData)
                }

                if(Object.keys(conditionData).includes(file.var[index].columnAddr)) {
                    var th = 0
                    for(let i=0; i<test.length; i++) {
                        if(JSON.parse(test[i].data).code == file.var[index].feature) {
                            var t = i
                            if(th < copyDataArr.length) {
                                if(file.var[index].columnAddr != 'comment') {
                                    for(let j=0; j<copyDataArr[th].length; j++) {
                                        worksheet.getCell(copyDataArr[th][j]).value = JSON.parse(listCondition[t][0][file.var[index].columnAddr])[file.var[index].rowAddr]
                                    }
                                } else {
                                    for(let j=0; j<copyDataArr[th].length; j++) {
                                        worksheet.getCell(copyDataArr[th][j]).value = listCondition[t][0][file.var[index].columnAddr]
                                    }
                                }
                            }
                            th = th + 1
                        }
                    }
                } else {
                    
                }


            }
        }
    }
    
    if(file.typeExport == 'EXCEL') {
        workbookTemp.xlsx.writeFile(filePath)
    } else if(file.typeExport == 'PDF') {
        convert.toPDF(workbookTemp, filePath)
    }
}

function nextTo(a, b) {
    var aCharacter = a.split('').filter(x => isNaN(x) == true)
    var bCharacter = b.split('').filter(x => isNaN(x) == true)
    var aNumber = a.replace(aCharacter.join(""), '')
    var bNumber = b.replace(bCharacter.join(""), '')
    var sumA = 0
    var sumB = 0
    for(let i in aCharacter) {
        let temp = chartToData(aCharacter[i]) * Math.pow(26, (aCharacter.length - 1) - i)
        sumA = sumA + temp
    }

    for(let i in bCharacter) {
        let temp = chartToData(bCharacter[i]) * Math.pow(26, (bCharacter.length - 1) - i)
        sumB = sumB + temp
    }

    var check = Math.abs(parseInt(aNumber) - parseInt(bNumber)) + Math.abs(sumA - sumB)

    if(check == 1) {
        return true
    } else {
        return false
    }
}

function chartToData(a) {
    const alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
    return alphabet.indexOf(a) + 1
}