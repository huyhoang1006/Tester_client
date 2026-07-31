'use strict'
import { ipcMain } from 'electron'
import { getComparableTests, getTestSnapshot } from '@/function/entity/compareTest/index'

export const getComparableTestsHandler = () => {
    ipcMain.handle('getComparableTests', async function (event, { assetMrid, testCode, excludeWorkMrid }) {
        try {
            return await getComparableTests(assetMrid, testCode, excludeWorkMrid)
        } catch (error) {
            return { success: false, data: [], message: (error && error.message) || 'Get comparable tests failed' }
        }
    })
}

export const getTestSnapshotHandler = () => {
    ipcMain.handle('getTestSnapshot', async function (event, workTaskMrid) {
        try {
            return await getTestSnapshot(workTaskMrid)
        } catch (error) {
            return { success: false, data: null, message: (error && error.message) || 'Get test snapshot failed' }
        }
    })
}

export const active = () => {
    getComparableTestsHandler()
    getTestSnapshotHandler()
}
