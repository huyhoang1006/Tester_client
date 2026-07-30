'use strict'
import { ipcMain } from 'electron'
import { tryWriteAuditLog } from '@/function/entity/auditLog/index'

// Ghi 1 dòng log tuỳ ý từ renderer (dùng cho log upload/download).
// tryWriteAuditLog tự nuốt lỗi nên ghi log hỏng không làm chết luồng gọi.
export const writeAuditLogEntry = () => {
    ipcMain.handle('writeAuditLogEntry', async function (event, options) {
        try {
            const rs = await tryWriteAuditLog(options)
            return { success: !!(rs && rs.success !== false), data: rs }
        } catch (error) {
            console.error('writeAuditLogEntry failed:', error)
            return { success: false, message: (error && error.message) || 'Write audit log failed' }
        }
    })
}

export const active = () => {
    writeAuditLogEntry()
}
