'use strict'
import {ipcMain} from 'electron'
import {jobFunc, conditionFunc, attachmentFunc} from "@/function"
const pathUpload = path.join(__dirname, `/../attachment`)
var fs = require('fs')
import path from 'path'

export const saveJobTransformer = () => {
    ipcMain.handle('saveJobTransformer', async function (event, job) {
        try {
            let check = await jobFunc.getJobById(job.id)
            if(check == undefined) {
                await jobFunc.insertJob(job.asset_id, job)
            }
            else {
                await jobFunc.updateJob(job)
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

export const saveTestTransformer = () => {
    ipcMain.handle('saveTestTransformer', async function (event, testList, job_id) {
        try {
            let jobTest = await jobFunc.getTestByJobId(job_id)
            let listDelete = jobTest.filter(f => !testList.some(d => d.id == f.id))
            let listInsert = testList.filter(f => !jobTest.some(d=> d.id == f.id))
            let listUpdate = testList.filter(f => jobTest.some(d=> d.id == f.id))
            if(listDelete.length != 0) {
                for(let i in listDelete) {
                    jobFunc.deleteTest(listDelete[i].id)
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
                listInsert[i].data.condition[0].condition = JSON.parse(listInsert[i].data.condition[0].condition)
                listInsert[i].data.condition[0].equipment = JSON.parse(listInsert[i].data.condition[0].equipment)
                await conditionFunc.insertTestingCondition(listInsert[i].data.condition[0].id_foreign, listInsert[i].data.condition[0])
                await jobFunc.insertTest(listInsert[i].job_id, listInsert[i])
            }
            for(let i in listUpdate) {
                listUpdate[i].data = JSON.parse(listUpdate[i].data)
                listUpdate[i].data.condition[0].condition = JSON.parse(listUpdate[i].data.condition[0].condition)
                listUpdate[i].data.condition[0].equipment = JSON.parse(listUpdate[i].data.condition[0].equipment)
                await conditionFunc.updateTestingCondition(listUpdate[i].data.condition.id_foreign, listUpdate[i].data.condition[0])
                await jobFunc.updateTestDownload(listUpdate[i])
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