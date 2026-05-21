'use strict'
import {ipcMain, dialog, app} from 'electron'
import {entityFunc} from "@/function"
const path = require('path')
const fs = require('fs')


// ─── Template folder ────────────────────────────────────────────────────────
// Dev  : <project_root>/template/         (app.getAppPath())
// Prod : <AppData>/Roaming/<app>/template/ (app.getPath('userData')) ← writable
//
// process.resourcesPath  ← extraResources mount point, READ-ONLY in prod
// app.getAppPath()       ← .asar root in prod, READ-ONLY
// app.getPath('userData')← C:/Users/.../AppData/Roaming/<app>/, WRITABLE
// ─────────────────────────────────────────────────────────────────────────────
// Dev : project_root/template/          (dùng thẳng, không copy)
// Prod: process.resourcesPath/template/ → userData/template/ (copy 1 lần)
const isDev = process.env.NODE_ENV === 'development'

const TEMPLATE_DIR = isDev
    ? path.join(__dirname, '/../template')              // dev: __dirname=dist_electron/ → /../template = project root/template
    : path.join(app.getPath('userData'), 'template')   // prod: writable userData

if (!fs.existsSync(TEMPLATE_DIR)) {
    fs.mkdirSync(TEMPLATE_DIR, { recursive: true })
}

// Production: copy bundled templates từ resourcesPath → userData (chỉ file chưa có)
if (!isDev) {
    const bundledDir = path.join(process.resourcesPath, 'template')
    if (fs.existsSync(bundledDir)) {
        fs.readdirSync(bundledDir).forEach(file => {
            const dest = path.join(TEMPLATE_DIR, file)
            if (!fs.existsSync(dest)) {
                try { fs.copyFileSync(path.join(bundledDir, file), dest) }
                catch(e) { console.warn('Cannot copy bundled template:', file, e.message) }
            }
        })
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// CRUD
// ═════════════════════════════════════════════════════════════════════════════

export const getAllTemplates = () => {
    ipcMain.handle('getAllTemplates', async function (event) {
        try {
            const rs = await entityFunc.templateFunc.getAllTemplates()
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data : rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getTemplateByName = () => {
    ipcMain.handle('getTemplateByName', async function (event, name) {
        try {
            const rs = await entityFunc.templateFunc.getTemplateByName(name)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data : rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            console.error("Error retrieving template by name:", error);
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const insertTemplate = () => {
    ipcMain.handle('insertTemplate', async function (event, data) {
        try {
            const rs = await entityFunc.templateFunc.insertTemplate(data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data : data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const updateTemplate = () => {
    ipcMain.handle('updateTemplate', async function (event, data) {
        try {
            const rs = await entityFunc.templateFunc.updateTemplate(data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data : rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            console.error("Error retrieving template by name:", error);
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteTemplate = () => {
    ipcMain.handle('deleteTemplate', async function (event, name) {
        try {
            // Xóa file Excel trước
            const tmplRs = await entityFunc.templateFunc.getTemplateByName(name)
            if (tmplRs.success && tmplRs.data && tmplRs.data.path) {
                try {
                    if (fs.existsSync(tmplRs.data.path)) fs.unlinkSync(tmplRs.data.path)
                } catch (e) { console.warn('Could not delete Excel file:', e.message) }
            }
            const rs = await entityFunc.templateFunc.deleteTemplate(name)
            if (rs.success) return { success: true }
            return { success: false, message: 'fail' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })
}

export const checkNameTemplateExist = () => {
    ipcMain.handle('checkNameTemplateExist', async function (event, name) {
        try {
            const rs = await entityFunc.templateFunc.getTemplateByName(name)
            return { success: true, data: !!(rs.success && rs.data) }
        } catch (error) {
            return { success: true, data: false }
        }
    })
}

// ═════════════════════════════════════════════════════════════════════════════
// UPLOAD EXCEL
// Mở dialog chọn file .xlsx → copy vào /template → trả về path
// ═════════════════════════════════════════════════════════════════════════════

export const uploadExcelTemplate = () => {
    ipcMain.handle('uploadExcelTemplate', async function (event, templateName) {
        try {
            const result = await dialog.showOpenDialog({
                title: 'Select Excel Template',
                filters: [{ name: 'Excel', extensions: ['xlsx'] }],
                properties: ['openFile']
            })
            if (result.canceled || !result.filePaths.length) {
                return { success: false, canceled: true }
            }

            const srcPath = result.filePaths[0]
            // Đặt tên file = templateName + extension gốc
            const ext = path.extname(srcPath)
            const safeName = templateName.replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]/g, '_')
            const fileName = `${safeName}${ext}`
            const destPath = path.join(TEMPLATE_DIR, fileName)

            fs.copyFileSync(srcPath, destPath)

            return { success: true, filePath: destPath, fileName }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })
}

// ═════════════════════════════════════════════════════════════════════════════
// SCAN COORDINATES
// Đọc file Excel → tìm cell nào chứa code → lưu tọa độ
//
// Flow:
//   - Duyệt tất cả sheets, tất cả rows, tất cả cells
//   - Nếu cell.value (string) CHỨA code → ghi lại "SheetName!CellAddr"
//   - Trả về: { "A1": ["Sheet1!B3"], "B2": ["Sheet1!C5", "Sheet2!A1"] }
// ═════════════════════════════════════════════════════════════════════════════

export const scanTemplateCoordinates = () => {
    ipcMain.handle('scanTemplateCoordinates', async function (event, { filePath, codes }) {
        try {
            if (!filePath || !fs.existsSync(filePath)) {
                return { success: false, message: 'File not found' }
            }
            if (!codes || !codes.length) {
                return { success: true, coordinates: {} }
            }

            const XlsxPopulate = require('xlsx-populate')
            const workbook = await XlsxPopulate.fromFileAsync(filePath)

            // Kết quả: { code → [coordinates] }
            const result = {}
            codes.forEach(c => { result[c] = [] })

            workbook.sheets().forEach(sheet => {
                const sheetName = sheet.name()
                const usedRange = sheet.usedRange()
                if (!usedRange) return

                usedRange.cells().forEach(rowCells => {
                    rowCells.forEach(cell => {
                        const val = cell.value()
                        if (val === null || val === undefined) return
                        const strVal = String(val)

                        codes.forEach(code => {
                            if (strVal.includes(code)) {
                                const coord = `${sheetName}!${cell.address()}`
                                if (!result[code].includes(coord)) {
                                    result[code].push(coord)
                                }
                            }
                        })
                    })
                })
            })

            return { success: true, coordinates: result }
        } catch (error) {
            console.error('scanTemplateCoordinates error:', error)
            return { success: false, message: error.message }
        }
    })
}

// ═════════════════════════════════════════════════════════════════════════════
// SAVE TEMPLATE WITH SCAN
// Scan coordinates → merge vào variables → update DB
// Gọi sau khi user upload Excel hoặc thay đổi rows
// ═════════════════════════════════════════════════════════════════════════════

export const saveTemplateWithScan = () => {
    ipcMain.handle('saveTemplateWithScan', async function (event, { name, filePath, variables }) {
        try {
            if (!filePath || !fs.existsSync(filePath)) {
                return { success: false, message: 'Excel file not found' }
            }

            // Lấy danh sách codes để scan
            const codes = (variables || []).map(v => v.code).filter(Boolean)

            // Scan coordinates
            let coordinatesMap = {}
            if (codes.length > 0) {
                const XlsxPopulate = require('xlsx-populate')
                const workbook = await XlsxPopulate.fromFileAsync(filePath)

                codes.forEach(c => { coordinatesMap[c] = [] })

                workbook.sheets().forEach(sheet => {
                    const sheetName = sheet.name()
                    const usedRange = sheet.usedRange()
                    if (!usedRange) return

                    usedRange.cells().forEach(rowCells => {
                        rowCells.forEach(cell => {
                            const val = cell.value()
                            if (val === null || val === undefined) return
                            const strVal = String(val)

                            codes.forEach(code => {
                                if (strVal.includes(code)) {
                                    const coord = `${sheetName}!${cell.address()}`
                                    if (!coordinatesMap[code].includes(coord)) {
                                        coordinatesMap[code].push(coord)
                                    }
                                }
                            })
                        })
                    })
                })
            }

            // Merge coordinates vào variables
            const updatedVariables = (variables || []).map(v => ({
                ...v,
                coordinates: v.code ? (coordinatesMap[v.code] || []) : []
            }))

            // Update DB
            const rs = await entityFunc.templateFunc.updateTemplate({
                name,
                path:     filePath,
                variable: JSON.stringify(updatedVariables)
            })

            if (rs.success) {
                return { success: true, variables: updatedVariables }
            }
            return { success: false, message: 'Update DB failed' }
        } catch (error) {
            console.error('saveTemplateWithScan error:', error)
            return { success: false, message: error.message }
        }
    })
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPORT TEMPLATE WITH DATA
// Mở Excel template → đến từng cell theo coordinate đã lưu
// → String replace: "Tên: A1" + code=A1, value="Công ty ABC"
//                 → "Tên: Công ty ABC"
// → Ghi ra file mới (template gốc không bị sửa)
// Style giữ nguyên 100% nhờ xlsx-populate
// ═════════════════════════════════════════════════════════════════════════════

export const exportTemplateWithData = () => {
    ipcMain.handle('exportTemplateWithData', async function (event, payload) {
        try {
            const { templatePath, variables, codeMap: rawCodeMap, dto } = payload || {}

            // Support both old format (dto: {code: value}) and new format (codeMap: {code: [v0,v1,...]})
            let codeMap = rawCodeMap
            if (!codeMap && dto) {
                // Backward compat: wrap dto single values into arrays
                codeMap = {}
                for (const [k, v] of Object.entries(dto)) {
                    codeMap[k] = [v !== null && v !== undefined ? String(v) : '']
                }
            }
            if (!codeMap) codeMap = {}

            if (!templatePath || !fs.existsSync(templatePath)) {
                return { success: false, message: 'Template file not found: ' + templatePath }
            }

            const XlsxPopulate = require('xlsx-populate')
            const workbook = await XlsxPopulate.fromFileAsync(templatePath)

            // codeMap[code] = [v0, v1, ...]
            // coordinates[i] → codeMap[code][i]  (occurrence-based)
            // values.length === 1 (scalar) → all coordinates get same value
            // values.length > 1  (array)  → each coordinate gets its indexed value, OOB → ''

            for (const variable of (variables || [])) {
                const { code, coordinates } = variable
                if (!code || !coordinates || !coordinates.length) continue

                const rawVals = codeMap[code]
                const values = Array.isArray(rawVals) ? rawVals
                             : rawVals !== undefined   ? [String(rawVals)]
                             : []

                coordinates.forEach((coord, coordIdx) => {
                    const fillValue = values.length <= 1
                        ? (values[0] !== undefined && values[0] !== null ? values[0] : '')                                   // scalar: same for all
                        : (coordIdx < values.length ? values[coordIdx] : '')  // array: indexed, OOB → ''

                    const bangIdx = coord.indexOf('!')
                    if (bangIdx === -1) return

                    const sheetName = coord.substring(0, bangIdx)
                    const cellAddr  = coord.substring(bangIdx + 1)

                    const sheet = workbook.sheet(sheetName)
                    if (!sheet) return

                    const cell = sheet.cell(cellAddr)
                    const currentValue = cell.value()
                    if (currentValue === null || currentValue === undefined) return

                    const currentStr = String(currentValue)
                    if (currentStr.includes(code)) {
                        // Replace code placeholder, keep surrounding text
                        // e.g. "Unit: A1" → "Unit: EVN"
                        cell.value(currentStr.replace(code, fillValue))
                    }
                })
            }

            // Hỏi user nơi lưu file output
            const saveResult = await dialog.showSaveDialog({
                title: 'Save exported file',
                defaultPath: path.join(require('os').homedir(), 'export.xlsx'),
                filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
            })
            if (saveResult.canceled) return { success: false, canceled: true }

            // Ghi ra file mới — template gốc không bị sửa
            await workbook.toFileAsync(saveResult.filePath)
            return { success: true, filePath: saveResult.filePath }

        } catch (error) {
            console.error('exportTemplateWithData error:', error)
            return { success: false, message: error.message }
        }
    })
}


export const active = () => {
    getAllTemplates()
    getTemplateByName()
    insertTemplate()
    updateTemplate()
    deleteTemplate()
    checkNameTemplateExist()
    uploadExcelTemplate()
    scanTemplateCoordinates()
    saveTemplateWithScan()
    exportTemplateWithData()
}