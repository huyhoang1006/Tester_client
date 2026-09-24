'use strict'
import { ipcMain, dialog } from 'electron'
import path from 'path'
import { readPtmArchive } from '@/function/ptm/readPtmArchive'
import { readCpxpertArchive } from '@/function/cpxpert/readCpxpertArchive'
import { findDuplicateAsset } from '@/function/ptm/findDuplicateAsset'
import { readSfraArchive } from '@/function/sfra/readSfraArchive'

const readPtmOrSfraFile = filePath => path.extname(filePath).toLowerCase() === '.ptm'
    ? readPtmArchive(filePath)
    : readSfraArchive(filePath)

/**
 * IPC đọc file .ptm của OMICRON.
 *
 * Giải nén + phân tích XML chạy ở MAIN process: cần `fs`, và một file .ptm có thể tới vài
 * MB với hàng trăm file con — làm ở renderer sẽ đơ giao diện.
 *
 * Chỉ TRẢ VỀ dữ liệu đã chuẩn hoá, KHÔNG ghi gì vào CSDL. Quyết định nhập cái gì, đè hay
 * bỏ qua là việc của tầng trên sau khi người dùng xem trước và xác nhận.
 */

export const importPtm = () => {
    ipcMain.handle('importPtm', async () => {
        try {
            const result = await dialog.showOpenDialog({
                title: 'Select PTM or SFRA file to import',
                buttonLabel: 'Read file',
                filters: [{ name: 'OMICRON PTM / SFRA Files', extensions: ['ptm', 'zip', 'xml', 'xfra'] }],
                properties: ['openFile'],
            })

            if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
                return { success: false, message: 'Import cancelled' }
            }

            const filePath = result.filePaths[0]
            const data = readPtmOrSfraFile(filePath)

            return {
                success: true,
                message: 'PTM file read successfully',
                data: { ...data, filePath },
            }
        } catch (error) {
            console.error('[ptm] doc file that bai:', error)
            // Trả nguyên câu lỗi. File .ptm hỏng, sai định dạng, hay thiếu Relationship.xml
            // là ba chuyện khác nhau và người dùng cần biết là chuyện nào.
            return {
                success: false,
                message: (error && error.message) ? error.message : 'Could not read PTM file',
            }
        }
    })
}

/**
 * Đọc một file .ptm theo đường dẫn có sẵn, không mở hộp thoại.
 *
 * Dùng cho kịch bản kéo-thả và cho việc chạy lại đúng file đã chọn mà không bắt người
 * dùng chọn lần nữa.
 */
export const readPtmFile = () => {
    ipcMain.handle('readPtmFile', async (event, filePath) => {
        try {
            if (!filePath) return { success: false, message: 'No file path given' }
            const data = readPtmOrSfraFile(filePath)
            return { success: true, message: 'PTM file read successfully', data: { ...data, filePath } }
        } catch (error) {
            console.error('[ptm] doc file that bai:', error)
            return {
                success: false,
                message: (error && error.message) ? error.message : 'Could not read PTM file',
            }
        }
    })
}

export const importCpxpert = () => {
    ipcMain.handle('importCpxpert', async () => {
        try {
            const result = await dialog.showOpenDialog({
                title: 'Select CPXpert file to import',
                buttonLabel: 'Read file',
                filters: [{ name: 'OMICRON CPXpert Files', extensions: ['cpxpert'] }],
                properties: ['openFile'],
            })

            if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
                return { success: false, message: 'Import cancelled' }
            }

            const filePath = result.filePaths[0]
            const data = readCpxpertArchive(filePath)
            return {
                success: true,
                message: 'CPXpert file read successfully',
                data: { ...data, filePath },
            }
        } catch (error) {
            console.error('[cpxpert] read failed:', error)
            return {
                success: false,
                message: (error && error.message) ? error.message : 'Could not read CPXpert file',
            }
        }
    })
}

export const readCpxpertFile = () => {
    ipcMain.handle('readCpxpertFile', async (event, filePath) => {
        try {
            if (!filePath) return { success: false, message: 'No file path given' }
            const data = readCpxpertArchive(filePath)
            return { success: true, message: 'CPXpert file read successfully', data: { ...data, filePath } }
        } catch (error) {
            console.error('[cpxpert] read failed:', error)
            return {
                success: false,
                message: (error && error.message) ? error.message : 'Could not read CPXpert file',
            }
        }
    })
}

/**
 * Đối chiếu trùng thiết bị trước khi import.
 *
 * Tách thành lời gọi riêng, KHÔNG gộp vào `importPtm`: người dùng có thể đổi node đích
 * rồi kiểm lại mà không phải đọc lại cả file .ptm.
 */
export const findPtmDuplicateAsset = () => {
    ipcMain.handle('findPtmDuplicateAsset', async (event, criteria, userId, targetPsrId) => {
        try {
            return await findDuplicateAsset(criteria, userId, targetPsrId)
        } catch (error) {
            console.error('[ptm] doi chieu trung that bai:', error)
            return {
                success: false,
                message: (error && error.message) ? error.message : 'Duplicate check failed',
            }
        }
    })
}

export const active = () => {
    importPtm()
    readPtmFile()
    importCpxpert()
    readCpxpertFile()
    findPtmDuplicateAsset()
}
