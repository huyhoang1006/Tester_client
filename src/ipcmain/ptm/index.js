'use strict'
import { ipcMain, dialog } from 'electron'
import { readPtmArchive } from '@/function/ptm/readPtmArchive'
import { findDuplicateAsset } from '@/function/ptm/findDuplicateAsset'

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
                title: 'Select PTM file to import',
                buttonLabel: 'Read file',
                filters: [{ name: 'OMICRON PTM Files', extensions: ['ptm'] }],
                properties: ['openFile'],
            })

            if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
                return { success: false, message: 'Import cancelled' }
            }

            const filePath = result.filePaths[0]
            const data = readPtmArchive(filePath)

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
            const data = readPtmArchive(filePath)
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
    findPtmDuplicateAsset()
}
