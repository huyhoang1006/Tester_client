'use strict'
const { ipcRenderer } = require('electron')

/**
 * Đọc file .ptm của OMICRON.
 *
 * Chỉ ĐỌC — hai hàm này không ghi gì vào CSDL. Việc ghi đi qua đúng những đường lưu job
 * sẵn có, để dữ liệu nhập từ PTM và dữ liệu nhập tay không có hai đường ghi khác nhau.
 */
export const ptmPreload = () => {
    return {
        /** Mở hộp thoại chọn file rồi đọc. */
        importPtm: () => ipcRenderer.invoke('importPtm'),
        /** Đọc theo đường dẫn có sẵn (kéo-thả, hoặc đọc lại file đã chọn). */
        readPtmFile: (filePath) => ipcRenderer.invoke('readPtmFile', filePath),
        /** Mở hộp thoại chọn project CPXpert rồi chuẩn hoá về cùng mô hình import. */
        importCpxpert: () => ipcRenderer.invoke('importCpxpert'),
        /** Đọc project CPXpert theo đường dẫn có sẵn. */
        readCpxpertFile: (filePath) => ipcRenderer.invoke('readCpxpertFile', filePath),
        /** Đối chiếu trùng thiết bị theo (serial, manufacturer, manufacturer type). */
        findPtmDuplicateAsset: (criteria, userId, targetPsrId) =>
            ipcRenderer.invoke('findPtmDuplicateAsset', criteria, userId, targetPsrId),
    }
}
