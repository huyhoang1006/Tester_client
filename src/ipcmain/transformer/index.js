'use strict'
import {dialog, ipcMain} from 'electron'
import {export3P1W} from '../../function/exportETRC/Tranformer/Job/export3P1W';
import { jobFunc, attachmentFunc, conditionFunc, assetFunc } from '@/function';
import fs from 'fs'
const pathUpload = path.join(__dirname, `/../attachment`)
import path from 'path'

export const exportEtrc = () => {
    ipcMain.handle('exportEtrc', async function (event, asset, testList) {
        try {
            const rs = await dialog.showSaveDialog({
                title: 'Select the file path to save',
                buttonLabel: 'Save',
                filters: [
                    { name: 'docx', extensions: ['docx'] },
                ],
                properties: ['openDirectory ']  
            })
            if(!rs.canceled) {
                export3P1W(rs.filePath)
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

export const deleteAsset = () => {
    ipcMain.handle('deleteAsset', async function (event, ids) {
        try {
            for(let i in ids) {
                let jobs = await jobFunc.getJobByAssetId(ids[i])
                if(jobs.length != 0) {
                    for(let j in jobs) {
                        let jobId = jobs[j].id
                        let testIds = await jobFunc.getTestIdByJobId(jobId)
                        for(let k in testIds) {
                            let testId = testIds[k].id
                            await jobFunc.deleteTest(testId)
                            const rs = await attachmentFunc.getAllAttachment(testId, "test")
                            if(rs.length != 0 && rs.toString != "undefined") {
                                for(let n in rs) {
                                    JSON.parse(rs[n].name).forEach(e => {
                                        let pathFile = path.join(pathUpload, `/${e.path}`)
                                        fs.unlinkSync(pathFile)
                                    })
                                }
                                await attachmentFunc.deleteAttachment(testId)
                            }
                            await conditionFunc.deleteTestingCondition(testId)
                        }
                        await jobFunc.deleteJob(jobId)
                    }
                }
                await assetFunc.deleteAsset(ids[i])
            }
            return {
                success: true,
                message: "",
                data: null
            }
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })
}