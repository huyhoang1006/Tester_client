'use strict'
import { ipcMain } from 'electron'
import { NIL as EMPTY } from 'uuid'
import { powerCableFunc, locationFunc, powerCableJobFunc, conditionFunc, attachmentFunc } from "@/function"
const pathUpload = path.join(__dirname, `/../attachment`)
var fs = require('fs')
import path from 'path'


export const insertPowerCable = () => {
    ipcMain.handle('insertPowerCable', async function (event, location_id, asset) {
        const rs = await powerCableFunc.insertPowerCable(location_id, asset);
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

export const getPowerCableByLocationId = () => {
    ipcMain.handle('getPowerCableByLocationId', async function (event, location_id) {
        const rs = await powerCableFunc.getPowerCableByLocationId(location_id);
        if (rs.success === true) {
            return {
                success: true,
                message: "Success",
                data: rs.data
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

export const getPowerCableById = () => {
    ipcMain.handle('getPowerCableById', async function (event, id) {
        const rs = await powerCableFunc.getPowerCableById(id);
        if (rs.success === true) {
            return {
                success: true,
                message: "Success",
                data: rs.data
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

export const deletePowerCable = () => {
    ipcMain.handle('deletePowerCable', async function (event, ids) {
        try {
            for (let k in ids) {
                let element = ids[k]
                let jobs = await powerCableJobFunc.getJobByAssetId(element)
                for (let i in jobs) {
                    let jobId = jobs[i].id
                    let testList = await powerCableJobFunc.getTestByJobId(jobId)
                    for (let j in testList) {
                        await conditionFunc.deleteTestingCondition(testList[j].id)
                        const rs = await attachmentFunc.getAllAttachment(testList[j].id, "test")
                        if (rs.length != 0) {
                            for (let n in rs) {
                                JSON.parse(rs[n].name).forEach(e => {
                                    let pathFile = path.join(pathUpload, `/${e.path}`)
                                    fs.unlinkSync(pathFile)
                                })
                            }
                            await attachmentFunc.deleteAttachment(testList[j].id)
                        }
                    }
                }
                await powerCableFunc.deletePowerCable(element)
            }
            return {
                success: true,
                message: "",
                data: null
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

export const updatePowerCable = () => {
    ipcMain.handle('updatePowerCable', async function (event, asset) {
        const rs = await powerCableFunc.updatePowerCable(asset);
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

export const getLocationAssetByIdPowerCable = () => {
    ipcMain.handle('getLocationAssetByIdPowerCable', async function (event, assetId) {
        try {
            const asset = await powerCableFunc.getAssetPowerById(assetId)

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

export const getTestPowerCableTypes = () => {
    ipcMain.handle('getTestPowerCableTypes', async function (event) {
        try {
            const rows = await powerCableFunc.getTestPowerTypes()
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

export const insertJobPowerCable = () => {
    ipcMain.handle('insertJobPowerCable', async function (event, assetId, properties, testList, testConditionArr, attachmentArr) {
        properties.asset_id = assetId
        try {
            const check = await powerCableJobFunc.checkJobExist(properties)
            if (check) {
                return {
                    success: false,
                    message: "Name already exists"
                }
            }
            else {
                let i = 0;
                //insert job
                const jobId = await powerCableJobFunc.insertJob(assetId, properties)

                //insert test
                if (!(testConditionArr == undefined) && !(attachmentArr == undefined)) {
                    for (const item of testList) {
                        const testId = await powerCableJobFunc.insertTest(jobId, item)
                        await conditionFunc.insertTestingCondition(testId, testConditionArr[i])
                        await attachmentFunc.uploadAttachment(testId, "test", attachmentArr[i])
                        i = i + 1
                    }
                }
                else {
                    for (const item of testList) {
                        await powerCableJobFunc.insertTest(jobId, item)
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

export const getJobPowerCable = () => {
    ipcMain.handle('getJobPowerCable', async function (event, assetId) {
        try {
            const rows = await powerCableJobFunc.getJobPowerCable(assetId)
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

export const updateJobPowerCable = () => {
    ipcMain.handle('updateJobPowerCable', async function (event, properties, testList, testConditionArr, attachmentArr) {
        try {
            const check = await powerCableJobFunc.checkJobExist(properties)
            if (check) {
                return {
                    success: false,
                    message: "Name already exists"
                }
            }
            else {
                // update job
                const jobId = properties.id
                await powerCableJobFunc.updateJobPowerCable(properties)

                // update test
                testList.forEach(async (item, index) => {
                    let testId = item.id

                    // testId khác 0 là test cũ nên cập nhật vào db, ngược lại thêm vào db
                    if (testId != EMPTY) {
                        await powerCableJobFunc.updateTest(item)
                        const rs = await conditionFunc.getTestingCondition(testId)
                        if (rs.length !== 0) {
                            await conditionFunc.updateTestingCondition(testId, testConditionArr[index])
                        } else {
                            await conditionFunc.insertTestingCondition(testId, testConditionArr[index])
                        }
                        const rt = await attachmentFunc.getAllAttachment(testId, "test")
                        if (rt.length !== 0) {
                            await attachmentFunc.updateAttachment(testId, attachmentArr[index])
                        }
                        else {
                            await attachmentFunc.uploadAttachment(testId, "test", attachmentArr[index])
                        }
                    }
                    else {
                        let id = await powerCableJobFunc.insertTest(jobId, item)
                        await conditionFunc.insertTestingCondition(id, testConditionArr[index])
                        await attachmentFunc.uploadAttachment(id, "test", attachmentArr[index])

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

export const getJobPowerCableById = () => {
    ipcMain.handle('getJobPowerCableById', async function (event, id) {
        try {
            const job = await powerCableJobFunc.getJobById(id)
            const job_id = job.id
            let testList = await powerCableJobFunc.getTestByJobId(id)
            testList = testList.map((test) => ({ ...test, job_id }))
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

export const deleteJobPowerCable = () => {
    ipcMain.handle('deleteJobPowerCable', function (event, ids) {
        try {
            ids.forEach(async (jobId) => {
                const testIds = await powerCableJobFunc.getTestIdByJobId(jobId)
                testIds.forEach(async (element) => {
                    const testId = element.id
                    const rs = await attachmentFunc.getAllAttachment(testId, "test")
                    if (rs.length !== 0) {
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
                await powerCableJobFunc.deleteJob(jobId)
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

export const deletePowerCableTest = () => {
    ipcMain.handle('deletePowerCableTest', async function (event, id) {
        try {
            await powerCableJobFunc.deletePowerCableTest(id)
            await conditionFunc.deleteTestingCondition(id)
            let fileData = await attachmentFunc.getAllAttachment(id, 'test')
            await attachmentFunc.deleteAttachment(id)
            for (let i in fileData) {
                let name = JSON.parse(fileData[i].name)
                for (let j in name) {
                    let pathFile = path.join(pathUpload, `/${name[j].path}`)
                    if (fs.existsSync(pathFile)) {
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

export const relocatePowerCable = () => {
    ipcMain.handle('relocatePowerCable', async function (event, asset) {
        try {
            await powerCableFunc.relocateAsset(asset)
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