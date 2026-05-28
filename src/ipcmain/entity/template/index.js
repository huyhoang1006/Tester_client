'use strict'
import { ipcMain, dialog, app } from 'electron'
import { entityFunc } from "@/function"
const path = require('path')
const fs = require('fs')

// ─── Template folder ────────────────────────────────────────────────────────
// Dev  : <project_root>/template/         (app.getAppPath())
// Prod : <AppData>/Roaming/<app>/template/ (app.getPath('userData')) ← writable
//
// process.resourcesPath  = extraResources mount point, READ-ONLY in prod
// app.getAppPath()       = .asar root in prod, READ-ONLY
// app.getPath('userData')= C:/Users/.../AppData/Roaming/<app>/, WRITABLE
// ─────────────────────────────────────────────────────────────────────────────
// Dev : project_root/template/  (used directly, no copy)
// Prod: process.resourcesPath/template/ → userData/template/ (copied once)
const isDev = process.env.NODE_ENV === 'development'

const TEMPLATE_DIR = isDev
    ? path.join(__dirname, '/../template')              // dev: __dirname=dist_electron/ → /../template = project root/template
    : path.join(app.getPath('userData'), 'template')   // prod: writable userData

if (!fs.existsSync(TEMPLATE_DIR)) {
    fs.mkdirSync(TEMPLATE_DIR, { recursive: true })
}

// Production: copy bundled templates from resourcesPath → userData (only missing files)
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
            if (rs.success) return { success: true, data: rs.data }
            return { success: false, message: 'fail' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })
}

export const getAllTemplatesByType = () => {
    ipcMain.handle('getAllTemplatesByType', async function (event, type, category) {
        try {
            const rs = await entityFunc.templateFunc.getAllTemplatesByType(type, category)
            if (rs.success) return { success: true, data: rs.data }
            return { success: false, message: 'fail' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })
}

export const getTemplateByName = () => {
    ipcMain.handle('getTemplateByName', async function (event, name) {
        try {
            const rs = await entityFunc.templateFunc.getTemplateByName(name)
            if (rs.success) return { success: true, data: rs.data }
            return { success: false, message: 'fail' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })
}

export const insertTemplate = () => {
    ipcMain.handle('insertTemplate', async function (event, data) {
        try {
            const rs = await entityFunc.templateFunc.insertTemplate(data)
            if (rs.success) return { success: true, data }
            return { success: false, message: 'fail' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    })
}

export const updateTemplate = () => {
    ipcMain.handle('updateTemplate', async function (event, data) {
        try {
            const rs = await entityFunc.templateFunc.updateTemplate(data)
            if (rs.success) return { success: true }
            return { success: false, message: 'fail' }
        } catch (error) {
            return { success: false, message: error.message }
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

export const uploadWordTemplate = () => {
    ipcMain.handle('uploadWordTemplate', async function (event, templateName) {
        try {
            const result = await dialog.showOpenDialog({
                title: 'Select Excel Template',
                filters: [{ name: 'Word', extensions: ['doc', 'docx'] }],
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
    ipcMain.handle('saveTemplateWithScan', async function (event, { name, filePath, variables, type, category }) {
        try {
            if (!filePath || !fs.existsSync(filePath)) {
                return { success: false, message: 'Template file not found' }
            }

            const codes = (variables || []).map(v => v.code).filter(Boolean)
            let coordinatesMap = {}
            codes.forEach(c => { coordinatesMap[c] = [] })

            // ── Helper: match code với word boundary ──────────────────────────────
            // Fix: "A10".includes("A1") → true (sai)
            // tokenRegex đảm bảo A1 chỉ match khi không có ký tự chữ/số liền kề
            // → "Name : A1" ✓, "A10" ✗, "A11" ✗, "BA1" ✗
            function codeMatchesCell(strVal, code) {
                var escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                var tokenRegex = new RegExp('(?<![A-Za-z0-9])' + escapedCode + '(?![A-Za-z0-9])')
                return tokenRegex.test(strVal)
            }

            if (codes.length > 0) {
                if (type === 'excel') {
                    // === SCAN EXCEL ===
                    const XlsxPopulate = require('xlsx-populate')
                    const workbook = await XlsxPopulate.fromFileAsync(filePath)
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
                                    if (codeMatchesCell(strVal, code)) {  // ← FIX
                                        const coord = `${sheetName}!${cell.address()}`
                                        if (!coordinatesMap[code].includes(coord)) coordinatesMap[code].push(coord)
                                    }
                                })
                            })
                        })
                    })
                } else if (type === 'word') {
                    // === SCAN WORD ===
                    const PizZip = require('pizzip')
                    const Docxtemplater = require('docxtemplater')
                    const content = fs.readFileSync(filePath, 'binary')
                    const zip = new PizZip(content)
                    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
                    const text = doc.getFullText()
                    codes.forEach(code => {
                        if (text.includes(`{${code}}`)) {
                            coordinatesMap[code].push('Found in Document')
                        }
                    })
                }
            }

            // Merge tọa độ vào variables
            const updatedVariables = (variables || []).map(v => ({
                ...v,
                coordinates: v.code ? (coordinatesMap[v.code] || []) : []
            }))

            // Cập nhật Database
            const rs = await entityFunc.templateFunc.updateTemplate({
                name,
                path: filePath,
                variable: JSON.stringify(updatedVariables),
                type : type,
                category : category
            })

            if (rs.success) return { success: true, variables: updatedVariables }
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
            const { templatePath, variables, selections: rawSelections, codeMap: rawCodeMap, dto } = payload || {}

            // ── Normalize to selections array ─────────────────────────────
            // Support: new multi-sheet (selections=[]), old single (codeMap/dto)
            let selections = rawSelections
            if (!selections) {
                let codeMap = rawCodeMap
                if (!codeMap && dto) {
                    codeMap = {}
                    for (const [k, v] of Object.entries(dto)) {
                        codeMap[k] = [v !== null && v !== undefined ? String(v) : '']
                    }
                }
                selections = [{ codeMap: codeMap || {}, sheetName: 'Sheet1' }]
            }

            if (!selections.length) {
                return { success: false, message: 'No selections provided' }
            }

            if (!templatePath || !fs.existsSync(templatePath)) {
                return { success: false, message: 'Template file not found: ' + templatePath }
            }

            const XlsxPopulate = require('xlsx-populate')
            const JSZip = require('jszip')

            // ── Helper: fill one workbook's first sheet ───────────────────
            function fillWorkbookSheet(wb, vars, codeMap) {
                const sheet = wb.sheet(0)
                if (!sheet) return

                for (const variable of (vars || [])) {
                    const { code, coordinates } = variable
                    if (!code || !coordinates || !coordinates.length) continue

                    const rawVals = codeMap[code]
                    const values = Array.isArray(rawVals) ? rawVals
                                 : rawVals !== undefined   ? [String(rawVals)]
                                 : []

                    coordinates.forEach((coord, coordIdx) => {
                        const fillValue = values.length <= 1
                            ? (values[0] !== undefined && values[0] !== null ? values[0] : '')
                            : (coordIdx < values.length ? values[coordIdx] : '')

                        const bangIdx = coord.indexOf('!')
                        if (bangIdx === -1) return

                        const sheetName = coord.substring(0, bangIdx)
                        const cellAddr  = coord.substring(bangIdx + 1)

                        try {
                            const s = wb.sheet(sheetName)
                            if (!s) { console.warn('Sheet not found:', sheetName); return }

                            const cell = s.cell(cellAddr)
                            const currentValue = cell.value()
                            if (currentValue === null || currentValue === undefined) return

                            const currentStr = String(currentValue)
                            // Exact token match: code must not be preceded/followed by alphanumeric
                            const codeRegex = new RegExp(
                                '(?<![A-Za-z0-9])' +
                                code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
                                '(?![A-Za-z0-9])',
                                'g'
                            )
                            if (codeRegex.test(currentStr)) {
                                codeRegex.lastIndex = 0
                                cell.value(currentStr.replace(codeRegex, () => fillValue))
                            }
                        } catch (cellErr) {
                            console.error('Fill error at coord:', coord, '| code:', code, '|', cellErr.message)
                        }
                    })
                }
            }

            // ── Sanitize sheet name (Excel constraint: ≤31 chars, no []:\/?*) ──
            function sanitizeSheetName(name, index) {
                const clean = (name || ('Sheet' + (index + 1)))
                    .replace(/[[\]*?:/\\]/g, '_')
                    .trim()
                    .substring(0, 31)
                return clean || ('Sheet' + (index + 1))
            }

            // ── Single selection: simple path, no JSZip manipulation ──────
            if (selections.length === 1) {
                const { codeMap, sheetName } = selections[0]
                const wb = await XlsxPopulate.fromFileAsync(templatePath)
                // Rename first sheet if needed
                const s = wb.sheet(0)
                if (s && sheetName && sheetName !== s.name()) {
                    try { s.name(sanitizeSheetName(sheetName, 0)) } catch(e) { /* skip */ }
                }
                fillWorkbookSheet(wb, variables, codeMap)

                const { canceled, filePath } = await new Promise(resolve =>
                    require('electron').dialog.showSaveDialog({
                        title: 'Save export file',
                        defaultPath: sanitizeSheetName(sheetName, 0) + '.xlsx',
                        filters: [{ name: 'Excel', extensions: ['xlsx'] }]
                    }).then(resolve)
                )
                if (canceled || !filePath) return { success: false, canceled: true }

                await wb.toFileAsync(filePath)
                return { success: true, filePath }
            }

            // ── Multi-selection: build one filled buffer per selection ─────
            // Then clone sheets into a single output workbook via JSZip
            const templateBuffer = fs.readFileSync(templatePath)
            const filledBuffers = []

            for (let i = 0; i < selections.length; i++) {
                const { codeMap, sheetName } = selections[i]
                const wb = await XlsxPopulate.fromDataAsync(templateBuffer)
                fillWorkbookSheet(wb, variables, codeMap)
                const buf = await wb.outputAsync()
                filledBuffers.push({ buf, sheetName: sanitizeSheetName(sheetName, i) })
            }

            // ── Combine into single XLSX using JSZip ──────────────────────
            // Load first buffer as base workbook
            const baseZip = await JSZip.loadAsync(filledBuffers[0].buf)

            // Read & update workbook.xml and relationships to add sheets 2..N
            let wbXml   = await baseZip.file('xl/workbook.xml').async('string')
            let relsXml = await baseZip.file('xl/_rels/workbook.xml.rels').async('string')
            let ctXml   = await baseZip.file('[Content_Types].xml').async('string')

            // Rename first sheet — use function callback to avoid $1/$2 pattern issues
            const firstSheetSafeName = filledBuffers[0].sheetName
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            wbXml = wbXml.replace(
                /(<sheet[^>]*name=")[^"]*(")/,
                function(match, p1, p2) { return p1 + firstSheetSafeName + p2 }
            )

            for (let i = 1; i < filledBuffers.length; i++) {
                const { buf, sheetName } = filledBuffers[i]
                const srcZip = await JSZip.loadAsync(buf)

                // Copy sheet XML
                const sheetXml = await srcZip.file('xl/worksheets/sheet1.xml').async('string')
                const destSheetFile = `xl/worksheets/sheet${i + 1}.xml`
                baseZip.file(destSheetFile, sheetXml)

                // Copy any drawing/chart files referenced by this sheet (optional, skip errors)
                try {
                    const drawingRelsFile = srcZip.file('xl/worksheets/_rels/sheet1.xml.rels')
                    if (drawingRelsFile) {
                        const drawingRels = await drawingRelsFile.async('string')
                        baseZip.file('xl/worksheets/_rels/sheet' + (i + 1) + '.xml.rels',
                            drawingRels.replace(/sheet1\./g, 'sheet' + (i + 1) + '.'))
                    }
                } catch(e) { /* no drawing rels, skip */ }

                // Unique rId for this sheet
                const rId = `rIdX${i}`
                const sheetId = i + 1
                const safeSheetName = sheetName.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

                // Append <sheet> entry to workbook.xml
                wbXml = wbXml.replace(
                    '</sheets>',
                    `<sheet name="${safeSheetName}" sheetId="${sheetId}" r:id="${rId}"/></sheets>`
                )
                // Append relationship
                relsXml = relsXml.replace(
                    '</Relationships>',
                    `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${sheetId}.xml"/></Relationships>`
                )
                // Append content type
                ctXml = ctXml.replace(
                    '</Types>',
                    `<Override PartName="/xl/worksheets/sheet${sheetId}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`
                )
            }

            baseZip.file('xl/workbook.xml', wbXml)
            baseZip.file('xl/_rels/workbook.xml.rels', relsXml)
            baseZip.file('[Content_Types].xml', ctXml)

            const combinedBuffer = await baseZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } })

            const { canceled, filePath } = await new Promise(resolve =>
                require('electron').dialog.showSaveDialog({
                    title: 'Save export file (' + selections.length + ' sheets)',
                    defaultPath: 'export_report.xlsx',
                    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
                }).then(resolve)
            )
            if (canceled || !filePath) return { success: false, canceled: true }

            fs.writeFileSync(filePath, combinedBuffer)
            return { success: true, filePath }

        } catch (error) {
            console.error('exportTemplateWithData error:', error)
            return { success: false, message: error.message }
        }
    })
}

export const exportWordWithData = () => {
    ipcMain.handle('exportWordWithData', async function (event, { templatePath, codeMap }) {
        try {
            if (!templatePath || !fs.existsSync(templatePath)) {
                return { success: false, message: 'Template file not found' }
            }

            const PizZip = require('pizzip')
            const Docxtemplater = require('docxtemplater')

            // Chuẩn bị dữ liệu cho docxtemplater
            // Frontend truyền lên array: { "A1": ["Value 1", "Value 2"] }
            // Word cần Object phẳng: { "A1": "Value 1\nValue 2" }
            const dataForWord = {}
            for (const key in codeMap) {
                const values = codeMap[key]
                if (Array.isArray(values)) {
                    // Lọc bỏ giá trị rỗng và nối bằng dấu xuống dòng (Enter)
                    dataForWord[key] = values.filter(v => v !== '').join('\n')
                } else {
                    dataForWord[key] = values || ''
                }
            }

            // Đọc và Render Word
            const content = fs.readFileSync(templatePath, 'binary')
            const zip = new PizZip(content)
            
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                nullGetter() { return ""; } // Tránh in ra chữ "undefined" nếu code trống
            })

            // Thay thế {Code} bằng data
            doc.render(dataForWord)

            // Xuất ra buffer
            const buf = doc.getZip().generate({ type: 'nodebuffer', compression: "DEFLATE" })

            // Mở Dialog cho user lưu file
            const { canceled, filePath } = await dialog.showSaveDialog({
                title: 'Save Word Export',
                defaultPath: 'Export_Report.docx',
                filters: [{ name: 'Word Document', extensions: ['docx'] }]
            })

            if (canceled || !filePath) return { success: false, canceled: true }

            // Ghi file
            fs.writeFileSync(filePath, buf)

            return { success: true, filePath }

        } catch (error) {
            console.error('exportWordWithData error:', error)
            // Lấy chi tiết lỗi của docxtemplater nếu có (ví dụ quên đóng ngoặc {})
            if (error.properties && error.properties.errors instanceof Array) {
                const errorMessages = error.properties.errors.map(function (e) {
                    return e.properties.explanation;
                }).join("\n");
                return { success: false, message: errorMessages }
            }
            return { success: false, message: error.message }
        }
    })
}

// ═════════════════════════════════════════════════════════════════════════════
// ACTIVE
// ═════════════════════════════════════════════════════════════════════════════

// ── Thêm vào ipcmain_entity_template_index.js ───────────────────────────────

// 1. pickExcelFileForImport — chọn file Excel bất kỳ (không cần trong template dir)
export const pickExcelFileForImport = () => {
    ipcMain.handle('pickExcelFileForImport', async function (event) {
        try {
            const result = await dialog.showOpenDialog({
                title: 'Select filled Excel file to import',
                filters: [{ name: 'Excel', extensions: ['xlsx'] }],
                properties: ['openFile']
            })
            if (result.canceled || !result.filePaths.length) return { canceled: true }
            return { success: true, filePath: result.filePaths[0] }
        } catch (e) {
            return { success: false, message: e.message }
        }
    })
}

// 2. readExcelForImport — đọc values tại coordinates đã lưu trong template
//    Ngược của fillWorkbookSheet trong exportTemplateWithData:
//      Export: codeMap → coordinates → write cell
//      Import: coordinates → read cell  → codeValueMap
//
//    Trả về: { code: [value0, value1, ...] }
//    value0 = cell tại coordinates[0], value1 = cell tại coordinates[1], ...
// ── readExcelForImport v2 ─────────────────────────────────────────────────
// Đọc SONG SONG 2 file:
//   1. templatePath  : file template gốc (chứa code placeholder: "Tên: A1")
//   2. filePath      : file Excel đã fill (chứa giá trị: "Tên: EVN HCM")
//
// Với mỗi coordinate, tách giá trị thực bằng cách xác định
// prefix/suffix xung quanh code trong template cell, rồi loại bỏ khỏi filled cell.
//
// Ví dụ:
//   template cell = "Tên: A1"   code = "A1"
//   filled   cell = "Tên: EVN HCM"
//   → prefix = "Tên: "  suffix = ""
//   → extracted = "EVN HCM"
//
//   template cell = "[A2] Ngày:"  code = "A2"  (code nằm giữa)
//   filled   cell = "[2024-01-15] Ngày:"
//   → prefix = "["  suffix = "] Ngày:"
//   → extracted = "2024-01-15"
//
// Edge cases:
//   - Cell chứa NHIỀU code (A1, A2 trong 1 cell) → trả chuỗi nguyên, split sau
//   - Cell chỉ có code đơn thuần → prefix = "" suffix = "" → trả nguyên giá trị
//   - Cell là số (numeric) → trả String trực tiếp (không qua prefix/suffix)

export const readExcelForImport = () => {
    ipcMain.handle('readExcelForImport', async function (event, { filePath, templatePath, variables }) {
        try {
            if (!filePath || !fs.existsSync(filePath)) {
                return { success: false, message: 'Filled file not found: ' + filePath }
            }
            if (!variables || !variables.length) {
                return { success: true, codeValueMap: {} }
            }

            const XlsxPopulate = require('xlsx-populate')

            // Mở file đã fill
            const filled = await XlsxPopulate.fromFileAsync(filePath)

            // Mở template gốc nếu có (để biết prefix/suffix)
            var tmpl = null
            if (templatePath && fs.existsSync(templatePath)) {
                try { tmpl = await XlsxPopulate.fromFileAsync(templatePath) }
                catch(e) { console.warn('Cannot open template for prefix detection:', e.message) }
            }

            var codeValueMap = {}

            for (var vi = 0; vi < variables.length; vi++) {
                var variable = variables[vi]
                var code = variable.code
                var coordinates = variable.coordinates
                if (!code || !coordinates || !coordinates.length) continue

                codeValueMap[code] = []

                for (var ci = 0; ci < coordinates.length; ci++) {
                    var coord = coordinates[ci]
                    var bangIdx = coord.indexOf('!')
                    if (bangIdx === -1) { codeValueMap[code].push(''); continue }

                    var sheetName = coord.substring(0, bangIdx)
                    var cellAddr  = coord.substring(bangIdx + 1)

                    try {
                        var filledSheet = filled.sheet(sheetName)
                        if (!filledSheet) { codeValueMap[code].push(''); continue }

                        var rawFilled = filledSheet.cell(cellAddr).value()

                        // Số → trả String trực tiếp, không cần tách prefix
                        if (typeof rawFilled === 'number') {
                            codeValueMap[code].push(String(rawFilled))
                            continue
                        }

                        if (rawFilled === null || rawFilled === undefined) {
                            codeValueMap[code].push('')
                            continue
                        }

                        var filledStr = String(rawFilled)

                        // ── Tách prefix/suffix từ template gốc ──────────────────
                        var extracted = filledStr  // default: không tách được

                        if (tmpl) {
                            var tmplSheet = tmpl.sheet(sheetName)
                            if (tmplSheet) {
                                var rawTmpl = tmplSheet.cell(cellAddr).value()
                                if (rawTmpl !== null && rawTmpl !== undefined) {
                                    var tmplStr = String(rawTmpl)
                                    extracted = extractValue(tmplStr, filledStr, code)
                                }
                            }
                        }

                        codeValueMap[code].push(extracted.trim())

                    } catch (cellErr) {
                        console.warn('readExcelForImport cell error:', coord, cellErr.message)
                        codeValueMap[code].push('')
                    }
                }
            }

            return { success: true, codeValueMap: codeValueMap }
        } catch (error) {
            console.error('readExcelForImport error:', error)
            return { success: false, message: error.message }
        }
    })
}

// ── Helper: tách giá trị từ filled cell dựa vào vị trí code trong template cell ──
// templateStr: "Tên đơn vị: A1"
// filledStr:   "Tên đơn vị: EVN HCM"
// code:        "A1"
// → "EVN HCM"
function extractValue(templateStr, filledStr, code) {
    // Tìm vị trí code trong template (exact token match)
    var escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    var tokenRegex  = new RegExp('(?<![A-Za-z0-9])' + escapedCode + '(?![A-Za-z0-9])')
    var match = tokenRegex.exec(templateStr)

    if (!match) {
        // Code không tìm thấy trong template cell → trả nguyên filledStr
        return filledStr
    }

    var codeStart = match.index
    var codeEnd   = codeStart + code.length

    var prefix = templateStr.substring(0, codeStart)   // "Tên đơn vị: "
    var suffix = templateStr.substring(codeEnd)         // "" hoặc " (kV)" v.v.

    // Xây regex để strip prefix và suffix ra khỏi filledStr
    var escPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    var escSuffix = suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    var extractRegex = new RegExp('^' + escPrefix + '(.*)' + escSuffix + '$')
    var extractMatch = extractRegex.exec(filledStr)

    if (extractMatch) {
        return extractMatch[1]  // chỉ lấy phần giữa prefix và suffix
    }

    // Fallback: nếu regex không match (filledStr đã bị sửa khác) → trả nguyên
    return filledStr
}

// ── Thêm vào preload ─────────────────────────────────────────────────────
// pickExcelFileForImport: () => ipcRenderer.invoke('pickExcelFileForImport'),
// readExcelForImport: (data) => ipcRenderer.invoke('readExcelForImport', data),

// ipcmain — 1 handler, đăng ký trong active()
export const openFileTemplate = () => {
    ipcMain.handle('openFileTemplate', async (event, filePath) => {
        const { shell } = require('electron')
        return await shell.openPath(filePath)  // '' = OK, string = lỗi
    })
}

export const active = () => {
    getAllTemplates()
    getAllTemplatesByType()
    getTemplateByName()
    insertTemplate()
    updateTemplate()
    deleteTemplate()
    checkNameTemplateExist()
    uploadExcelTemplate()
    uploadWordTemplate()
    scanTemplateCoordinates()
    saveTemplateWithScan()
    exportWordWithData()
    exportTemplateWithData()
    pickExcelFileForImport()
    readExcelForImport()
    openFileTemplate()
}