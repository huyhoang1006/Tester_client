'use strict'
import { ipcMain } from 'electron'
import { cimFunc } from '@/function'
import { describeFailure } from '@/ipcmain/failureMessage'

const toResponse = (result) => {
    if (result && result.success === true) {
        return { success: true, message: result.message || 'Success', data: result.data }
    }
    return { success: false, message: describeFailure(result) }
}

export const getCbMotorCurrentPointsByDatasetId = () => {
    ipcMain.handle('getCbMotorCurrentPointsByDatasetId', async function (event, datasetId) {
        try {
            return toResponse(
                await cimFunc.cbMotorCurrentPointFunc.getCbMotorCurrentPointsByDatasetId(datasetId)
            )
        } catch (error) {
            console.error('[cbMotorCurrentPoint] get by dataset failed:', error)
            return {
                error,
                success: false,
                message: (error && error.message) ? error.message : 'Internal error',
            }
        }
    })
}

export const getCbMotorCurrentPointsByDatasetIds = () => {
    ipcMain.handle('getCbMotorCurrentPointsByDatasetIds', async function (event, datasetIds) {
        try {
            return toResponse(
                await cimFunc.cbMotorCurrentPointFunc.getCbMotorCurrentPointsByDatasetIds(datasetIds)
            )
        } catch (error) {
            console.error('[cbMotorCurrentPoint] get by datasets failed:', error)
            return {
                error,
                success: false,
                message: (error && error.message) ? error.message : 'Internal error',
            }
        }
    })
}

export const active = () => {
    getCbMotorCurrentPointsByDatasetId()
    getCbMotorCurrentPointsByDatasetIds()
}

