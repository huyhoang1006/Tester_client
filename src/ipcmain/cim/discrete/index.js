import {ipcMain} from 'electron'
import {cimFunc} from "@/function"

export const getDiscreteByMrid = () => {
    ipcMain.handle('getDiscreteByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.discreteFunc.getDiscreteById(mrid)
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getAllDiscreteByProcedure = () => {
    ipcMain.handle('getAllDiscreteByProcedure', async function (event, procedureId) {
        try {
            const rs = await cimFunc.discreteFunc.getAllDiscreteByProcedure(procedureId)
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    data: rs.data || [],
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const insertDiscrete = () => {
    ipcMain.handle('insertDiscrete', async function (event, data) {
        const rs = await cimFunc.discreteFunc.insertDiscrete(data)
        try {
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                    data: rs.data
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteDiscreteByMrid = () => {
    ipcMain.handle('deleteDiscreteByMrid', async function (event, mrid) {
        try {
            const rs = await cimFunc.discreteFunc.deleteDiscreteById(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: rs.message || "Success",
                }
            } else {
                return {
                    success: false,
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            console.log(error)
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const active = () => {
    getDiscreteByMrid()
    getAllDiscreteByProcedure()
    insertDiscrete()
    deleteDiscreteByMrid()
}