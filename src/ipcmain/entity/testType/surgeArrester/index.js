 'use strict'
 import {ipcMain} from 'electron'
 import {entityFunc} from "@/function"
 
export const insertTestTypeSurgeArrester = () => {
    ipcMain.handle('insertTestTypeSurgeArrester', async function (event, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.surgeArresterTestTypeFunc.insertTestTypeSurgeArrester(data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}
 
export const getTestTypeSurgeArresterByMrid = () => {
    ipcMain.handle('getTestTypeSurgeArresterByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.surgeArresterTestTypeFunc.getTestTypeSurgeArresterByMrid(mrid)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getAllTestTypeSurgeArrester = () => {
    ipcMain.handle('getAllTestTypeSurgeArrester', async function (event) {
        try {
            const rs = await entityFunc.TestTypeFunc.surgeArresterTestTypeFunc.getAllTestTypeSurgeArrester()
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateTestTypeSurgeArresterByMrid = () => {
    ipcMain.handle('updateTestTypeSurgeArresterByMrid', async function (event, mrid, data) {
        try {
            const rs = await entityFunc.TestTypeFunc.surgeArresterTestTypeFunc.updateTestTypeSurgeArresterById(mrid, data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteTestTypeSurgeArresterByMrid = () => {
    ipcMain.handle('deleteTestTypeSurgeArresterByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.TestTypeFunc.surgeArresterTestTypeFunc.deleteTestTypeSurgeArresterById(mrid)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}


export const active = () => {
    insertTestTypeSurgeArrester()
    getTestTypeSurgeArresterByMrid()
    getAllTestTypeSurgeArrester()
    updateTestTypeSurgeArresterByMrid()
    deleteTestTypeSurgeArresterByMrid()
}