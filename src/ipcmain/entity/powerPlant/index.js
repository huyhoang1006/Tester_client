'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from '@/function'
import { describeFailure } from '@/ipcmain/failureMessage'

export const active = () => {
    ipcMain.handle('insertPowerPlantEntity', async (event, data) => {
        try {
            const result = await entityFunc.powerPlantEntityFunc.insertPowerPlantEntity(data)
            return result.success
                ? { success: true, data: result.data, changed: result.changed, message: result.message }
                : { success: false, message: describeFailure(result) }
        } catch (error) {
            return { success: false, error, message: error.message || 'Internal error' }
        }
    })

    ipcMain.handle('getPowerPlantEntityByMrid', async (event, mrid, userId, organisationId) => {
        try {
            const result = await entityFunc.powerPlantEntityFunc.getPowerPlantEntityById(mrid, userId, organisationId)
            return result.success
                ? { success: true, data: result.data, message: result.message }
                : { success: false, message: describeFailure(result) }
        } catch (error) {
            return { success: false, error, message: error.message || 'Internal error' }
        }
    })

    ipcMain.handle('getPowerPlantsInOrganisationForUser', async (event, organisationId, userId) => {
        try {
            const result = await entityFunc.powerPlantEntityFunc.getPowerPlantsInOrganisationForUser(organisationId, userId)
            return { success: result.success, data: result.data || [], message: result.message }
        } catch (error) {
            return { success: false, data: [], error, message: error.message || 'Internal error' }
        }
    })
}
