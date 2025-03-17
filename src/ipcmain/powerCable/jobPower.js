'use strict'
import {ipcMain} from 'electron'
import {powerCableJobFunc, conditionFunc, attachmentFunc} from "@/function"
const pathUpload = path.join(__dirname, `/../attachment`)
var fs = require('fs')
import path from 'path'

export const saveJobPower = () => {
    ipcMain.handle('saveJobPower', async function (event, job) {
        try {
            let check = await powerCableJobFunc.getJobById(job.id)
            if(check == undefined) {
                await powerCableJobFunc.insertJob(job.asset_id, job)
            }
            else {
                await powerCableJobFunc.updateJobPowerCable(job)
            }
            return {
                success: true,
                message: ""
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })
}

export const saveTestPower = () => {
    ipcMain.handle('saveTestPower', async function (event, testList, job_id) {
        try {
            let jobTest = await powerCableJobFunc.getTestByJobId(job_id)
            let listDelete = jobTest.filter(f => !testList.some(d => d.id == f.id))
            let listInsert = testList.filter(f => !jobTest.some(d=> d.id == f.id))
            let listUpdate = testList.filter(f => jobTest.some(d=> d.id == f.id))
            if(listDelete.length != 0) {
                for(let i in listDelete) {
                    powerCableJobFunc.deletePowerCableTest(listDelete[i].id)
                    conditionFunc.deleteTestingCondition(listDelete[i].id)
                    let fileData = await attachmentFunc.getAllAttachment(listDelete[i].id, 'test')
                    await attachmentFunc.deleteAttachment(listDelete[i].id)
                    for(let j in fileData) {
                        let name = JSON.parse(fileData[j].name)
                        for(let k in name) {
                            let pathFile = path.join(pathUpload, `/${name[k].path}`)
                            if(fs.existsSync(pathFile)) {
                                fs.unlinkSync(pathFile)
                            }
                        }
                    }
                }
            }
            for(let i in listInsert) {
                listInsert[i].type_id = listInsert[i].testTypeId
                listInsert[i].data = JSON.parse(listInsert[i].data)
                listInsert[i].data.condition.condition = JSON.parse(listInsert[i].data.condition.condition)
                listInsert[i].data.condition.equipment = JSON.parse(listInsert[i].data.condition.equipment)
                await conditionFunc.insertTestingCondition(listInsert[i].data.condition.id_foreign, listInsert[i].data.condition)
                await powerCableJobFunc.insertTest(listInsert[i].job_id, listInsert[i])
            }
            for(let i in listUpdate) {
                listUpdate[i].data = JSON.parse(listUpdate[i].data)
                listUpdate[i].data.condition.condition = JSON.parse(listUpdate[i].data.condition.condition)
                listUpdate[i].data.condition.equipment = JSON.parse(listUpdate[i].data.condition.equipment)
                await conditionFunc.updateTestingCondition(listUpdate[i].data.condition.id_foreign, listUpdate[i].data.condition)
                await powerCableJobFunc.updateTest(listUpdate[i])
            }
            return {
                success: true,
                message: "",
                insert : listInsert,
                update : listUpdate
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error
            }
        }
    })
}

export const getTestPowerByJobId = () => {
    ipcMain.handle('getTestPowerByJobId', async function (event, job_id) {
        try {
            let data = await powerCableJobFunc.getTestByJobId(job_id)
            return {
                success: true,
                data : data
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })
}