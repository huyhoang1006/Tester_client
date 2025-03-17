'use strict'
import {ipcMain} from 'electron'
import {circuitFunc, jobAssetFunc, jobCircuitFunc} from "@/function" 

export const updateCircuitAssessmentLimits = () => {
    ipcMain.handle('updateCircuitAssessmentLimits', async function (event, asset) {
        const rs = await circuitFunc.updateCircuitAssessmentLimits(asset);
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

export const relocateCircuit = () => {
    ipcMain.handle('relocateCircuit', async function (event, asset) {
        try {
            await circuitFunc.relocateAsset(asset)
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