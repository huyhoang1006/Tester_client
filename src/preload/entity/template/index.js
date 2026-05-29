'use strict'
const { ipcRenderer } = require('electron')

export const templatePreload = () => {
    return {
        // ── CRUD ────────────────────────────────────────────────────────────
        getAllTemplates:     ()       => ipcRenderer.invoke('getAllTemplates'),
        getAllTemplatesByType:     (type, category)       => ipcRenderer.invoke('getAllTemplatesByType', type, category),
        getTemplateByName:  (name)   => ipcRenderer.invoke('getTemplateByName', name),
        insertTemplate:     (data)   => ipcRenderer.invoke('insertTemplate', data),
        updateTemplate:     (data)   => ipcRenderer.invoke('updateTemplate', data),
        deleteTemplate:     (name)   => ipcRenderer.invoke('deleteTemplate', name),
        checkNameTemplateExist: (name) => ipcRenderer.invoke('checkNameTemplateExist', name),

        // ── Upload Excel ─────────────────────────────────────────────────────
        // Mở dialog chọn file .xlsx → copy vào /template → trả { filePath, fileName }
        uploadExcelTemplate: (templateName) => ipcRenderer.invoke('uploadExcelTemplate', templateName),
        uploadWordTemplate: (templateName) => ipcRenderer.invoke('uploadWordTemplate', templateName),

        // ── Scan Coordinates ─────────────────────────────────────────────────
        // Đọc file Excel, tìm cell chứa code → trả coordinates map
        // { "A1": ["Sheet1!B3"], "B2": ["Sheet1!C5"] }
        scanTemplateCoordinates: (data) => ipcRenderer.invoke('scanTemplateCoordinates', data),
        // data = { filePath: string, codes: string[] }

        // ── Save with Scan ───────────────────────────────────────────────────
        // Scan Excel + merge coordinates vào variables + update DB
        // Gọi sau upload Excel hoặc khi Save
        saveTemplateWithScan: (data) => ipcRenderer.invoke('saveTemplateWithScan', data),
        // data = { name: string, filePath: string, variables: [] }

        // ── Export ───────────────────────────────────────────────────────────
        // Mở Excel template → fill data → ghi ra file mới (giữ nguyên style)
        exportTemplateWithData: (data) => ipcRenderer.invoke('exportTemplateWithData', data),
        // data = { templatePath: string, variables: [], dto: {} }

        exportWordWithData : (data) => ipcRenderer.invoke('exportWordWithData', data),

        pickExcelFileForImport: () => ipcRenderer.invoke('pickExcelFileForImport'),
    
        readExcelForImport: (data) => ipcRenderer.invoke('readExcelForImport', data),

        openFileTemplate: (filePath) => ipcRenderer.invoke('openFileTemplate', filePath),

        pickWordFileForImport: () => ipcRenderer.invoke('pickWordFileForImport'),
    
        readWordForImport: (data) => ipcRenderer.invoke('readWordForImport', data),
        
    }
}