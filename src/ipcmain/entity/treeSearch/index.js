'use strict'
import { ipcMain } from 'electron'
import { entityFunc } from '@/function'
import { describeFailure } from '@/ipcmain/failureMessage'

/**
 * IPC cho tìm kiếm trên cây.
 *
 * Chỉ một kênh, chỉ ĐỌC. `userId` do renderer gửi lên nhưng vẫn được dùng làm điều kiện
 * bắt buộc trong SQL — không có đường nào lấy được node của tài khoản khác.
 */
export const searchTree = () => {
    ipcMain.handle('searchTree', async function (event, userId, keyword, options) {
        try {
            const rs = await entityFunc.treeSearchFunc.searchTree(userId, keyword, options)
            if (rs.success === true) {
                return {
                    success: true,
                    message: rs.message || 'Success',
                    data: rs.data,
                    truncated: rs.truncated,
                    failures: rs.failures,
                }
            }
            return { success: false, message: describeFailure(rs) }
        } catch (error) {
            console.error('[treeSearch] search failed:', error)
            return {
                error,
                success: false,
                message: (error && error.message) ? error.message : 'Internal error',
            }
        }
    })
}

export const getNodePath = () => {
    ipcMain.handle('getNodePath', async function (event, mrid, mode) {
        try {
            const rs = await entityFunc.treeSearchFunc.getNodePath(mrid, mode)
            if (rs.success === true) {
                return { success: true, message: rs.message || 'Success', data: rs.data, truncatedPath: rs.truncatedPath }
            }
            return { success: false, message: describeFailure(rs) }
        } catch (error) {
            console.error('[treeSearch] path lookup failed:', error)
            return {
                error,
                success: false,
                message: (error && error.message) ? error.message : 'Internal error',
            }
        }
    })
}

export const active = () => {
    searchTree()
    getNodePath()
}
