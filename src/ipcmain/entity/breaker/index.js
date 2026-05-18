'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from "@/function"

export const insertBreakerEntity = () => {
    ipcMain.handle('insertBreakerEntity', async function (event, old_data, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.insertBreakerEntity(old_data, data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateMotorCharacteristicsLimits = () => {
    ipcMain.handle('updateMotorCharacteristicsLimits', async function (event, assetId, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.updateMotorCharacteristicsLimits(assetId, data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateContactResistanceLimits = () => {
    ipcMain.handle('updateContactResistanceLimits', async function (event, assetId, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.updateContactResistanceLimits(assetId, data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateCoilCharacteristicsLimits = () => {
    ipcMain.handle('updateCoilCharacteristicsLimits', async function (event, assetId, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.updateCoilCharacteristicsLimits(assetId, data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updatePickupVoltageLimits = () => {
    ipcMain.handle('updatePickupVoltageLimits', async function (event, assetId, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.updatePickupVoltageLimits(assetId, data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateUnderVoltageReleaseLimits = () => {
    ipcMain.handle('updateUnderVoltageReleaseLimits', async function (event, assetId, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.updateUnderVoltageReleaseLimits(assetId, data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateOvercurrentReleaseLimits = () => {
    ipcMain.handle('updateOvercurrentReleaseLimits', async function (event, assetId, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.updateOvercurrentReleaseLimits(assetId, data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateOperatingTimeLimits = () => {
    ipcMain.handle('updateOperatingTimeLimits', async function (event, assetId, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.updateOperatingTimeLimits(assetId, data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateAuxContactsLimits = () => {
    ipcMain.handle('updateAuxContactsLimits', async function (event, assetId, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.updateAuxContactsLimits(assetId, data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateMiscellaneousLimits = () => {
    ipcMain.handle('updateMiscellaneousLimits', async function (event, assetId, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.updateMiscellaneousLimits(assetId, data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateTimingAssessmentLimits = () => {
    ipcMain.handle('updateTimingAssessmentLimits', async function (event, assetId, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.updateTimingAssessmentLimits(assetId, data)
            if (rs.success == true) {
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
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getBreakerEntityByMrid = () => {
    ipcMain.handle('getBreakerEntityByMrid', async function (event, mrid, psrId) {
        try {
            const rs = await entityFunc.breakerEntityFunc.getBreakerEntity(mrid, psrId)
            if (rs.success == true) {
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
        } catch (error) {
            console.error("Error retrieving circuit breaker entity by MRID:", error);
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}


export const deleteBreakerEntity = () => {
    ipcMain.handle('deleteBreakerEntity', async function (event, data) {
        try {
            const rs = await entityFunc.breakerEntityFunc.deleteBreakerEntity(data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data: data
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
    insertBreakerEntity()
    getBreakerEntityByMrid()
    deleteBreakerEntity()
    updateMotorCharacteristicsLimits()
    updateContactResistanceLimits()
    updateCoilCharacteristicsLimits()
    updatePickupVoltageLimits()
    updateUnderVoltageReleaseLimits()
    updateOvercurrentReleaseLimits()
    updateOperatingTimeLimits()
    updateAuxContactsLimits()
    updateMiscellaneousLimits()
    updateTimingAssessmentLimits()
}
