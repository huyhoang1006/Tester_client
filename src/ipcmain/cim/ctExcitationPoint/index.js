'use strict'
import { ipcMain } from 'electron'
import { cimFunc } from '@/function'
import { describeFailure } from '@/ipcmain/failureMessage'

/**
 * IPC cho đường cong từ hoá CT.
 *
 * Chỉ mở hai đường ĐỌC. Đường GHI cố tình không mở: điểm đo được ghi trong cùng
 * transaction với bài test (xem luồng lưu job CT), nên nếu cho renderer ghi riêng thì
 * đường cong và bảng có thể lệch nhau — bảng lưu thành công, đường cong hỏng, mà không
 * có gì buộc chúng đi cùng nhau.
 */

export const getCtExcitationPointsByDatasetId = () => {
    ipcMain.handle('getCtExcitationPointsByDatasetId', async function (event, datasetId) {
        try {
            const rs = await cimFunc.ctExcitationPointFunc.getCtExcitationPointsByDatasetId(datasetId)
            if (rs.success === true) {
                return { success: true, message: rs.message || 'Success', data: rs.data }
            }
            return { success: false, message: describeFailure(rs) }
        } catch (error) {
            console.error('[ctExcitationPoint] get by dataset failed:', error)
            return {
                error,
                success: false,
                message: (error && error.message) ? error.message : 'Internal error',
            }
        }
    })
}

export const getCtExcitationPointsByDatasetIds = () => {
    ipcMain.handle('getCtExcitationPointsByDatasetIds', async function (event, datasetIds) {
        try {
            const rs = await cimFunc.ctExcitationPointFunc.getCtExcitationPointsByDatasetIds(datasetIds)
            if (rs.success === true) {
                return { success: true, message: rs.message || 'Success', data: rs.data }
            }
            return { success: false, message: describeFailure(rs) }
        } catch (error) {
            console.error('[ctExcitationPoint] get by datasets failed:', error)
            return {
                error,
                success: false,
                message: (error && error.message) ? error.message : 'Internal error',
            }
        }
    })
}

export const getCtExcitationKneePointsByDatasetIds = () => {
    ipcMain.handle('getCtExcitationKneePointsByDatasetIds', async function (event, datasetIds) {
        try {
            const rs = await cimFunc.ctExcitationPointFunc.getCtExcitationKneePointsByDatasetIds(datasetIds)
            if (rs.success === true) {
                return { success: true, message: rs.message || 'Success', data: rs.data }
            }
            return { success: false, message: describeFailure(rs) }
        } catch (error) {
            console.error('[ctExcitationPoint] get knee points failed:', error)
            return {
                error,
                success: false,
                message: (error && error.message) ? error.message : 'Internal error',
            }
        }
    })
}

export const active = () => {
    getCtExcitationPointsByDatasetId()
    getCtExcitationPointsByDatasetIds()
    getCtExcitationKneePointsByDatasetIds()
}
