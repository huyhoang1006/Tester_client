'use strict'
import {ipcMain} from 'electron'
import { NIL as EMPTY } from 'uuid'
import {disconnectorFunc, locationFunc, disconnectorJobFunc, conditionFunc, attachmentFunc} from "@/function"
const pathUpload = path.join(__dirname, `/../attachment`)
var fs = require('fs')
import path from 'path'


export const insertDisconnector = () => {
    ipcMain.handle('insertDisconnector', async function (event, location_id, asset) {
        const rs = await disconnectorFunc.insertDisconnector(location_id, asset);
        if (rs.success === true) {
            return {
                success: true,
                message: "Success",
            }
        }
        else {
            return {
                success: false,
                message: "fail",
            }
        }
    })
}

export const getDisconnectorByLocationId = () => {
    ipcMain.handle('getDisconnectorByLocationId', async function (event, location_id) {
        const rs = await disconnectorFunc.getDisconnectorByLocationId(location_id);
        if (rs.success === true) {
            return {
                success: true,
                message: "Success",
                data : rs.data
            }
        }
        else {
            return {
                success: false,
                message: "fail",
            }
        }
    })
}

export const getDisconnectorById = () => {
    ipcMain.handle('getDisconnectorById', async function (event, id) {
        const rs = await disconnectorFunc.getDisconnectorById(id);
        if (rs.success === true) {
            return {
                success: true,
                message: "Success",
                data : rs.data
            }
        }
        else {
            return {
                success: false,
                message: "fail",
            }
        }
    })
}

export const deleteDisconnector = () => {
    ipcMain.handle('deleteDisconnector', async function (event, ids) {
        try {
            for(let k in ids) {
                let element = ids[k]
                let jobs = await disconnectorJobFunc.getJobByAssetId(element)
                for(let i in jobs) {
                    let jobId = jobs[i].id
                    let testList = await disconnectorJobFunc.getTestByJobId(jobId)
                    for(let j in testList) {
                        await conditionFunc.deleteTestingCondition(testList[j].id)
                        const rs = await attachmentFunc.getAllAttachment(testList[j].id, "test")
                        if(rs.length != 0) {
                            for(let n in rs) {
                                JSON.parse(rs[n].name).forEach(e => {
                                    let pathFile = path.join(pathUpload, `/${e.path}`)
                                    fs.unlinkSync(pathFile)
                                })
                            }
                            await attachmentFunc.deleteAttachment(testList[j].id)
                        }
                    }
                }
                await disconnectorFunc.deleteDisconnector(element)
            }
            return {
                success: true,
                message: "",
                data: null
            }
        } catch(error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })
}

export const updateDisconnector = () => {
    ipcMain.handle('updateDisconnector', async function (event, asset) {
        const rs = await disconnectorFunc.updateDisconnector(asset);
        if (rs.success === true) {
            return {
                success: true,
                message: "Success",
            }
        }
        else {
            return {
                success: false,
                message: "fail",
            }
        }
    })
}

export const getLocationAssetByIdDisconnector = () => {
    ipcMain.handle('getLocationAssetByIdDisconnector', async function (event, assetId) {
        try {
            const asset = await disconnectorFunc.getAssetDisconnectById(assetId)

            const locationId = asset.location_id
            const location = await locationFunc.getLocationById(locationId)
            return {
                success: true,
                message: "",
                data: {
                    asset,
                    location,
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })
}

export const getTestDisconnectorTypes = () => {
    ipcMain.handle('getTestDisconnectorTypes', async function (event) {
        try {
            const rows = await disconnectorFunc.getTestDisconnectTypes()
            return {
                success: true,
                message: "",
                data: rows
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })
}

export const insertJobDisconnector = () => {
    ipcMain.handle('insertJobDisconnector', async function (event, assetId, properties, testList, testConditionArr, attachmentArr) {
        properties.asset_id = assetId
        try {
            const check = await disconnectorJobFunc.checkJobExist(properties)
            if (check) {
                return {
                    success: false,
                    message: "Name already exists"
                }
            }
            else {
                let i = 0;
                //insert job
                const jobId = await disconnectorJobFunc.insertJob(assetId, properties)

                //insert test
                if(!(testConditionArr == undefined) && !(attachmentArr == undefined)) {
                    for(const item of testList) {
                        const testId = await disconnectorJobFunc.insertTest(jobId, item)
                        await conditionFunc.insertTestingCondition(testId, testConditionArr[i])
                        await attachmentFunc.uploadAttachment(testId, "test", attachmentArr[i])
                        i = i + 1
                    }
                }
                else {
                    for(const item of testList) {
                        await disconnectorJobFunc.insertTest(jobId, item)
                    }
                }

                return {
                    success: true,
                    message: 'Success',
                    data: jobId
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })
}

export const getJobDisconnector = () => {
    ipcMain.handle('getJobDisconnector', async function (event, assetId) {
        try {
            const rows = await disconnectorJobFunc.getJobDisconnector(assetId)
            return {
                success: true,
                message: "",
                data: rows
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })
}

export const updateJobDisconnector = () => {
    ipcMain.handle('updateJobDisconnector', async function (event, properties, testList, testConditionArr, attachmentArr) {
        try {
            const check = await disconnectorJobFunc.checkJobExist(properties)
            if (check) {
                return {
                    success: false,
                    message: "Name already exists"
                }
            }
            else {
                // update job
                const jobId = properties.id
                await disconnectorJobFunc.updateJobDisconnector(properties)

                // update test
                testList.forEach(async (item, index) => {
                    let testId = item.id

                    // testId khác 0 là test cũ nên cập nhật vào db, ngược lại thêm vào db
                    if (testId != EMPTY ) {
                        await disconnectorJobFunc.updateTest(item)
                        const rs = await conditionFunc.getTestingCondition(testId)
                        if(rs.length !== 0) {
                            await conditionFunc.updateTestingCondition(testId, testConditionArr[index])
                        } else {
                            await conditionFunc.insertTestingCondition(testId, testConditionArr[index])
                        }
                        const rt = await attachmentFunc.getAllAttachment(testId, "test")
                        if(rt.length !== 0) {
                            await attachmentFunc.updateAttachment(testId, attachmentArr[index])
                        }
                        else {
                            await attachmentFunc.uploadAttachment(testId,"test",attachmentArr[index])
                        }
                    }
                    else {
                        let id = await disconnectorJobFunc.insertTest(jobId, item)
                        await conditionFunc.insertTestingCondition(id, testConditionArr[index])
                        await attachmentFunc.uploadAttachment(id,"test",attachmentArr[index])
                        
                    }

                })

                return {
                    success: true,
                    message: "Success"
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })
}

export const getJobDisconnectorById = () => {
    ipcMain.handle('getJobDisconnectorById', async function (event, id) {
        try {
            const job = await disconnectorJobFunc.getJobById(id)
            const job_id = job.id
            let testList = await disconnectorJobFunc.getTestByJobId(id)
            testList = testList.map((test) => ({...test, job_id}))
            return {
                success: true,
                message: "",
                data: {
                    job,
                    testList
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error,
                data: null
            }
        }
    })
}

export const deleteJobDisconnector = () => {
    ipcMain.handle('deleteJobDisconnector', function (event, ids) {
        try {
            ids.forEach(async (jobId) => {
                const testIds = await disconnectorJobFunc.getTestIdByJobId(jobId)
                testIds.forEach(async (element) => {
                    const testId = element.id
                    const rs = await attachmentFunc.getAllAttachment(testId, "test")
                        if(rs.length !== 0) {
                            rs.forEach(element => {
                                JSON.parse(element.name).forEach(e => {
                                    let pathFile = path.join(pathUpload, `/${e.path}`)
                                    fs.unlinkSync(pathFile)
                                })
                            })
                            await attachmentFunc.deleteAttachment(testId)
                        }
                    await conditionFunc.deleteTestingCondition(testId)
                })
                await disconnectorJobFunc.deleteJob(jobId)
            })
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

export const deleteDisconnectorTest = () => {
    ipcMain.handle('deleteDisconnectorTest', async function (event, id) {
        try {
            await disconnectorJobFunc.deleteDisconnectorTest(id)
            await conditionFunc.deleteTestingCondition(id)
            let fileData = await attachmentFunc.getAllAttachment(id, 'test')
            await attachmentFunc.deleteAttachment(id)
            for(let i in fileData) {
                let name = JSON.parse(fileData[i].name)
                for(let j in name) {
                    let pathFile = path.join(pathUpload, `/${name[j].path}`)
                    if(fs.existsSync(pathFile)) {
                        fs.unlinkSync(pathFile)
                    }
                }
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

export const relocateDisconnector = () => {
    ipcMain.handle('relocateDisconnector', async function (event, asset) {
        try {
            await disconnectorFunc.relocateAsset(asset)
            return {
                success: true,
                message: "Success"
            }
        } catch (error) {
            return {
                success: false,
                message: error
            }
        }
    })
}