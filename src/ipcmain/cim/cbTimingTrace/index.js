'use strict'
import { ipcMain } from 'electron'
import { cimFunc } from '@/function'
import { describeFailure } from '@/ipcmain/failureMessage'

const response = result => result && result.success
    ? { success: true, data: result.data, message: result.message || 'Success' }
    : { success: false, message: describeFailure(result) }

export const active = () => {
    ipcMain.handle('getCbTimingTracesByWorkTaskId', async (event, workTaskId) => {
        try {
            return response(await cimFunc.cbTimingTraceFunc.getCbTimingTracesByWorkTaskId(workTaskId))
        } catch (error) {
            console.error('[cbTimingTrace] get by work task failed:', error)
            return { success: false, message: error && error.message ? error.message : 'Internal error' }
        }
    })
    ipcMain.handle('getCbTimingTracesByWorkTaskIds', async (event, workTaskIds) => {
        try {
            return response(await cimFunc.cbTimingTraceFunc.getCbTimingTracesByWorkTaskIds(workTaskIds))
        } catch (error) {
            console.error('[cbTimingTrace] get by work tasks failed:', error)
            return { success: false, message: error && error.message ? error.message : 'Internal error' }
        }
    })
}

