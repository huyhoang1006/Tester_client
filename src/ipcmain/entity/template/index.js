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

// ═══════════════════════════════════════════════════════════════════════════════
// CSV SUPPORT — thêm vào 3 chỗ
// ═══════════════════════════════════════════════════════════════════════════════
 
// ── HELPER: parse CSV thành 2D array ─────────────────────────────────────────

// ── HELPER: parse CSV thành 2D array (RFC 4180) ──────────────────────────────
function parseCsv(text) {
    const rows = []
    const lines = text.split(/\r?\n/)
    for (const line of lines) {
        if (line.trim() === '') continue
        const cols = []
        let cur = '', inQuote = false
        for (let i = 0; i < line.length; i++) {
            const ch = line[i]
            if (ch === '"') {
                if (inQuote && line[i + 1] === '"') { cur += '"'; i++ }
                else inQuote = !inQuote
            } else if (ch === ',' && !inQuote) {
                cols.push(cur); cur = ''
            } else {
                cur += ch
            }
        }
        cols.push(cur)
        rows.push(cols)
    }
    return rows
}
 
// ── HELPER: "A1" → { row: 0, col: 0 } ────────────────────────────────────────
function cellAddressToIndex(addr) {
    const m = addr.match(/^([A-Z]+)(\d+)$/i)
    if (!m) return null
    const colStr = m[1].toUpperCase()
    let col = 0
    for (let i = 0; i < colStr.length; i++) col = col * 26 + (colStr.charCodeAt(i) - 64)
    return { row: parseInt(m[2]) - 1, col: col - 1 }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
 
// Parse "Word!tXrYcZ" → { tableIndex, rowIndex, colIndex }
function parseCoord(coord) {
    const m = coord.match(/Word!t(\d+)r(\d+)c(\d+)/)
    if (!m) return null
    return { tableIndex: +m[1], rowIndex: +m[2], colIndex: +m[3] }
}

// Phân loại từng code:
// VERTICAL:   nhiều coords, cùng col, khác row → duplicate rows
// HORIZONTAL: nhiều coords, cùng row, khác col → fill sequential theo colIndex
// SCALAR:     1 coord → Docxtemplater fill bình thường
// MULTI_CELL: nhiều coords, khác row khác col → fill cùng 1 value vào tất cả cells
function classifyVariables(variables) {
    const classified = {}
    for (const v of variables) {
        if (!v.code || !Array.isArray(v.coordinates)) continue
        const coords = v.coordinates.map(parseCoord).filter(Boolean)
        if (!coords.length) continue
        const rows = [...new Set(coords.map(c => c.rowIndex))]
        const cols = [...new Set(coords.map(c => c.colIndex))]
        let type
        if (coords.length === 1)   type = 'scalar'
        else if (rows.length === 1) type = 'horizontal'
        else if (cols.length === 1) type = 'vertical'
        else                        type = 'multi_cell'
        classified[v.code] = { type, coords }
    }
    return classified
}

// Group vertical codes cùng table cùng rows thành 1 group để duplicate cùng lúc
function buildVerticalGroups(classified) {
    const vertCodes = Object.entries(classified).filter(([, v]) => v.type === 'vertical')
    const groups = []
    const processed = new Set()
 
    for (const [code, item] of vertCodes) {
        if (processed.has(code)) continue
        const ti = item.coords[0].tableIndex
        const rows = item.coords.map(c => c.rowIndex).sort((a, b) => a - b)
 
        const groupCodes = [code]
        for (const [other, otherItem] of vertCodes) {
            if (other === code || processed.has(other)) continue
            const otherRows = otherItem.coords.map(c => c.rowIndex)
            if (otherItem.coords[0].tableIndex === ti && otherRows.some(r => rows.includes(r))) {
                groupCodes.push(other)
                processed.add(other)
            }
        }
        processed.add(code)
        groups.push({ tableIndex: ti, rows, codes: groupCodes })
    }
    return groups
}

// Normalize split runs: merge các <w:r> liên tiếp tạo thành {AXX} thành 1 run
function normalizeSplitRuns(xml) {
    // Tìm và merge split placeholders {AXX} bằng cách xử lý trực tiếp trên XML string
    // Không parse paragraph để tránh match nhầm nested <w:r> bên trong <w:rPr>
    const wtPattern = /<w:t(?:[^>]*)>(.*?)<\/w:t>/gs
    const allWt = []
    let m
    while ((m = wtPattern.exec(xml)) !== null) {
        allWt.push({ start: m.index, end: m.index + m[0].length, text: m[1], fullMatch: m[0] })
    }
 
    const replacements = []
    const processed = new Set()
 
    for (let i = 0; i < allWt.length; i++) {
        if (processed.has(i)) continue
        const text = allWt[i].text
        if (!text.includes('{') && !(text.length > 0 && '0123456789}'.includes(text[0]))) continue
 
        let combined = text
        for (let j = i + 1; j < Math.min(i + 8, allWt.length); j++) {
            // Check không có text content giữa 2 w:t (chỉ XML tags)
            const between = xml.slice(allWt[j-1].end, allWt[j].start)
            if (/>[^<\s][^<]*</.test(between)) break
 
            combined += allWt[j].text
            const trimmed = combined.trim()
 
            if (/^\{A\d+\}$/.test(trimmed)) {
                // Merge: set wt[i] = placeholder, empty wt[i+1..j]
                const tagOpenMatch = xml.slice(allWt[i].start).match(/^<w:t[^>]*>/)
                if (!tagOpenMatch) break
                replacements.push({ start: allWt[i].start, end: allWt[i].end,
                                     val: tagOpenMatch[0] + trimmed + '</w:t>' })
                for (let k = i + 1; k <= j; k++) {
                    const kTagMatch = xml.slice(allWt[k].start).match(/^<w:t[^>]*>/)
                    if (kTagMatch) {
                        replacements.push({ start: allWt[k].start, end: allWt[k].end,
                                             val: kTagMatch[0] + '</w:t>' })
                    }
                    processed.add(k)
                }
                processed.add(i)
                break
            }
            if (!/^\{A?\d*$/.test(trimmed.trim()) && !trimmed.trim().startsWith('{')) break
        }
    }
 
    // Apply replacements từ cuối về đầu
    for (const r of replacements.sort((a, b) => b.start - a.start)) {
        xml = xml.slice(0, r.start) + r.val + xml.slice(r.end)
    }
    return xml
}

// Detect vertical groups: 1 code nhiều coords cùng col khác row
// Detect horizontal groups: nhiều codes cùng row khá

// ══════════════════════════════════════════════════════════════════════════════
// THÊM: Helpers — đặt sau hàm extractValue (cuối file, trước active())
// ══════════════════════════════════════════════════════════════════════════════
 
// ── Parse docx XML → danh sách cells và paragraphs có vị trí ─────────────────
// Dùng PizZip (đã có) + regex đơn giản, không cần xmldom
// getText(): nối tất cả <w:t> trong fragment → handle split-run (A + 1 → A1)
function parseDocxContent(buffer) {
    const PizZip = require('pizzip')
    const zip = new PizZip(buffer)
    const xml = zip.file('word/document.xml').asText()
 
    // Nối tất cả <w:t> text trong fragment (kể cả text bị split nhiều run)
    function getText(fragment) {
        const matches = []
        const re = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g
        let m
        while ((m = re.exec(fragment)) !== null) matches.push(m[1])
        return matches.join('')
    }
 
    const cells = []  // [{ table, row, cell, text }]
    const paras = []  // [{ para, text }]
 
    // ── Table cells ──────────────────────────────────────────────────────────
    let tblIdx = 0
    const tblRe = /<w:tbl\b[^>]*>([\s\S]*?)<\/w:tbl>/g
    let tblM
    while ((tblM = tblRe.exec(xml)) !== null) {
        let trIdx = 0
        const trRe = /<w:tr\b[^>]*>([\s\S]*?)<\/w:tr>/g
        let trM
        while ((trM = trRe.exec(tblM[1])) !== null) {
            let tcIdx = 0
            const tcRe = /<w:tc\b[^>]*>([\s\S]*?)<\/w:tc>/g
            let tcM
            while ((tcM = tcRe.exec(trM[1])) !== null) {
                cells.push({ table: tblIdx, row: trIdx, cell: tcIdx, text: getText(tcM[1]) })
                tcIdx++
            }
            trIdx++
        }
        tblIdx++
    }
 
    // ── Paragraphs ngoài table ────────────────────────────────────────────────
    const xmlNoTbl = xml.replace(/<w:tbl\b[^>]*>[\s\S]*?<\/w:tbl>/g, '')
    const bodyM = xmlNoTbl.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/)
    if (bodyM) {
        let pIdx = 0
        const pRe = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g
        let pM
        while ((pM = pRe.exec(bodyM[1])) !== null) {
            paras.push({ para: pIdx, text: getText(pM[1]) })
            pIdx++
        }
    }
 
    return { cells, paras }
}

// Encode/decode coordinate
// Table cell : "Word!t0r1c2"  (table 0, row 1, cell 2)
// Paragraph  : "Word!p5"
function encodeWordCoord(pos) {
    if (pos.table !== undefined) return `Word!t${pos.table}r${pos.row}c${pos.cell}`
    return `Word!p${pos.para}`
}
function decodeWordCoord(coord) {
    const cm = coord.match(/^Word!t(\d+)r(\d+)c(\d+)$/)
    if (cm) return { table: +cm[1], row: +cm[2], cell: +cm[3] }
    const pm = coord.match(/^Word!p(\d+)$/)
    if (pm) return { para: +pm[1] }
    return null
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
                    // Parse docx XML → tìm {Code} trong từng cell/paragraph
                    // Ghi coordinate dạng Word!t{t}r{r}c{c} hoặc Word!p{p}
                    const buffer = fs.readFileSync(filePath)
                    const { cells, paras } = parseDocxContent(buffer)
 
                    function matchCode(text, code) {
                        // Tìm {code} hoặc code standalone (không có { } trong trường hợp user dùng plain text)
                        return text.includes('{' + code + '}') || text === code
                    }
 
                    codes.forEach(code => {
                        cells.forEach(pos => {
                            if (matchCode(pos.text, code)) {
                                const coord = encodeWordCoord(pos)
                                if (!coordinatesMap[code].includes(coord)) coordinatesMap[code].push(coord)
                            }
                        })
                        paras.forEach(pos => {
                            if (matchCode(pos.text, code)) {
                                const coord = encodeWordCoord(pos)
                                if (!coordinatesMap[code].includes(coord)) coordinatesMap[code].push(coord)
                            }
                        })
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
            const fs = require('fs')

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

            if (!selections.length) return { success: false, message: 'No selections provided' }
            if (!templatePath || !fs.existsSync(templatePath)) return { success: false, message: 'Template not found' }

            const XlsxPopulate = require('xlsx-populate')
            const JSZip = require('jszip')

            // ── CÁC STYLE KEY CẦN COPY (FIX LỖI Xlsx-Populate) ────────────
            const STYLE_KEYS = [
                'bold', 'italic', 'underline', 'strikethrough', 'fontSize', 'fontFamily', 
                'fontColor', 'horizontalAlignment', 'verticalAlignment', 'wrapText', 
                'border', 'fill', 'numberFormat'
            ];

            // ── HÀM DỊCH CHUYỂN & CHÈN DÒNG (AUTO INSERT) ─────────────────
            function insertAndShiftRows(sheet, insertAfterRow, shiftCount) {
                const usedRange = sheet.usedRange()
                if (!usedRange) return
                
                const maxRow = usedRange.endCell().rowNumber()
                const maxCol = usedRange.endCell().columnNumber()

                // Bước 1: Dịch chuyển các dòng bên dưới xuống
                for (let r = maxRow; r > insertAfterRow; r--) {
                    for (let c = 1; c <= maxCol; c++) {
                        const srcCell = sheet.cell(r, c)
                        const destCell = sheet.cell(r + shiftCount, c)

                        destCell.value(srcCell.value())
                        destCell.formula(srcCell.formula())

                        // Copy Style an toàn
                        const styles = srcCell.style(STYLE_KEYS)
                        const validStyles = {}
                        for (const k in styles) {
                            if (styles[k] !== undefined) validStyles[k] = styles[k]
                        }
                        if (Object.keys(validStyles).length > 0) destCell.style(validStyles)
                    }
                }

                // Bước 2: Tạo dòng trống ở giữa và clone Style từ dòng gốc (Anchor Row)
                for (let r = insertAfterRow + 1; r <= insertAfterRow + shiftCount; r++) {
                    const anchorRowObj = sheet.row(insertAfterRow)
                    if (anchorRowObj.height()) sheet.row(r).height(anchorRowObj.height())

                    for (let c = 1; c <= maxCol; c++) {
                        const anchorCell = sheet.cell(insertAfterRow, c)
                        const newCell = sheet.cell(r, c)

                        newCell.value(undefined)
                        newCell.formula(undefined)

                        // Clone Style an toàn
                        const styles = anchorCell.style(STYLE_KEYS)
                        const validStyles = {}
                        for (const k in styles) {
                            if (styles[k] !== undefined) validStyles[k] = styles[k]
                        }
                        if (Object.keys(validStyles).length > 0) newCell.style(validStyles)
                    }
                }
            }

            // ── HÀM GHI DỮ LIỆU AN TOÀN (BẢO TOÀN KIỂU NUMBER) ────────────
            function setCellValueSafe(cell, val, code) {
                const currentValue = cell.value()
                
                let finalVal = val
                if (typeof val === 'string' && val.trim() !== '') {
                    const num = Number(val)
                    if (!isNaN(num) && !val.trim().match(/^0\d+/)) finalVal = num
                }

                if (currentValue === null || currentValue === undefined || currentValue === '') {
                    cell.value(finalVal)
                    return
                }

                const currentStr = String(currentValue).trim()
                const codeTrimmed = code.trim()

                if (currentStr === codeTrimmed || currentStr === `{${codeTrimmed}}`) {
                    cell.value(finalVal)
                    return
                }

                const codeRegex = new RegExp('(?<![A-Za-z0-9])\\{?' + codeTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\}?(?![A-Za-z0-9])', 'g')
                if (codeRegex.test(currentStr)) {
                    codeRegex.lastIndex = 0
                    cell.value(currentStr.replace(codeRegex, () => val))
                } else {
                    cell.value(finalVal)
                }
            }

            // ── THUẬT TOÁN CHÍNH: QUẢN LÝ DỊCH CHUYỂN TỌA ĐỘ ───────────────
            function fillWorkbookSheet(wb, vars, codeMap) {
                const actionsBySheet = {}

                for (const variable of (vars || [])) {
                    const { code, coordinates } = variable
                    if (!code || !coordinates || !coordinates.length) continue

                    const rawVals = codeMap[code]
                    const values = Array.isArray(rawVals) ? rawVals : (rawVals !== undefined ? [String(rawVals)] : [])
                    if (!values.length) continue

                    const isAutoInsert = (coordinates.length === 1 && values.length > 1)

                    coordinates.forEach((coord, i) => {
                        const bangIdx = coord.indexOf('!')
                        if (bangIdx === -1) return

                        const sheetName = coord.substring(0, bangIdx)
                        const cellAddr = coord.substring(bangIdx + 1)
                        
                        const match = cellAddr.match(/^([A-Z]+)(\d+)$/i)
                        if (!match) return

                        const colStr = match[1].toUpperCase()
                        const rowNum = parseInt(match[2], 10)

                        if (!actionsBySheet[sheetName]) actionsBySheet[sheetName] = {}
                        if (!actionsBySheet[sheetName][rowNum]) actionsBySheet[sheetName][rowNum] = []

                        actionsBySheet[sheetName][rowNum].push({
                            code, colStr, isAutoInsert,
                            values: isAutoInsert ? values : [values[i] || '']
                        })
                    })
                }

                for (const sheetName in actionsBySheet) {
                    const sheet = wb.sheet(sheetName)
                    if (!sheet) continue

                    let currentOffset = 0 
                    const originalRows = Object.keys(actionsBySheet[sheetName]).map(Number).sort((a, b) => a - b)

                    for (const origRow of originalRows) {
                        const rowActions = actionsBySheet[sheetName][origRow]
                        const actualRow = origRow + currentOffset 

                        let maxShiftRequired = 0
                        rowActions.forEach(act => {
                            if (act.isAutoInsert) {
                                maxShiftRequired = Math.max(maxShiftRequired, act.values.length - 1)
                            }
                        })

                        if (maxShiftRequired > 0) {
                            insertAndShiftRows(sheet, actualRow, maxShiftRequired)
                            currentOffset += maxShiftRequired 
                        }

                        rowActions.forEach(act => {
                            if (act.isAutoInsert) {
                                act.values.forEach((val, idx) => {
                                    const cell = sheet.cell(`${act.colStr}${actualRow + idx}`)
                                    setCellValueSafe(cell, val, act.code)
                                })
                            } else {
                                const cell = sheet.cell(`${act.colStr}${actualRow}`)
                                setCellValueSafe(cell, act.values[0], act.code)
                            }
                        })
                    }
                }
            }

            // ── Sanitize sheet name ───────────────────────────────────────
            function sanitizeSheetName(name, index) {
                return (name || ('Sheet' + (index + 1))).replace(/[[\]*?:/\\]/g, '_').trim().substring(0, 31) || ('Sheet' + (index + 1))
            }

            // ── EXPORT CHÍNH ─────────────────────────────────────────────
            if (selections.length === 1) {
                const { codeMap, sheetName } = selections[0]
                const wb = await XlsxPopulate.fromFileAsync(templatePath)
                const s = wb.sheet(0)
                if (s && sheetName && sheetName !== s.name()) {
                    try { s.name(sanitizeSheetName(sheetName, 0)) } catch(e) {}
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

            const templateBuffer = fs.readFileSync(templatePath)
            const filledBuffers = []

            for (let i = 0; i < selections.length; i++) {
                const { codeMap, sheetName } = selections[i]
                const wb = await XlsxPopulate.fromDataAsync(templateBuffer)
                fillWorkbookSheet(wb, variables, codeMap)
                const buf = await wb.outputAsync()
                filledBuffers.push({ buf, sheetName: sanitizeSheetName(sheetName, i) })
            }

            const baseZip = await JSZip.loadAsync(filledBuffers[0].buf)
            let wbXml   = await baseZip.file('xl/workbook.xml').async('string')
            let relsXml = await baseZip.file('xl/_rels/workbook.xml.rels').async('string')
            let ctXml   = await baseZip.file('[Content_Types].xml').async('string')

            const firstSheetSafeName = filledBuffers[0].sheetName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            wbXml = wbXml.replace(/(<sheet[^>]*name=")[^"]*(")/, function(match, p1, p2) { return p1 + firstSheetSafeName + p2 })

            for (let i = 1; i < filledBuffers.length; i++) {
                const { buf, sheetName } = filledBuffers[i]
                const srcZip = await JSZip.loadAsync(buf)

                const sheetXml = await srcZip.file('xl/worksheets/sheet1.xml').async('string')
                const destSheetFile = `xl/worksheets/sheet${i + 1}.xml`
                baseZip.file(destSheetFile, sheetXml)

                try {
                    const drawingRelsFile = srcZip.file('xl/worksheets/_rels/sheet1.xml.rels')
                    if (drawingRelsFile) {
                        const drawingRels = await drawingRelsFile.async('string')
                        baseZip.file('xl/worksheets/_rels/sheet' + (i + 1) + '.xml.rels', drawingRels.replace(/sheet1\./g, 'sheet' + (i + 1) + '.'))
                    }
                } catch(e) {}

                const rId = `rIdX${i}`
                const sheetId = i + 1
                const safeSheetName = sheetName.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

                wbXml = wbXml.replace('</sheets>', `<sheet name="${safeSheetName}" sheetId="${sheetId}" r:id="${rId}"/></sheets>`)
                relsXml = relsXml.replace('</Relationships>', `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${sheetId}.xml"/></Relationships>`)
                ctXml = ctXml.replace('</Types>', `<Override PartName="/xl/worksheets/sheet${sheetId}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`)
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
    ipcMain.handle('exportWordWithData', async function (event, { templatePath, codeMap, variables }) {
        try {
            if (!templatePath || !fs.existsSync(templatePath)) {
                return { success: false, message: 'Template file not found' }
            }
 
            const PizZip        = require('pizzip')
            const Docxtemplater = require('docxtemplater')
 
            console.log('[exportWord] codeMap received:', JSON.stringify(codeMap))
            console.log('[exportWord] variables count:', Array.isArray(variables) ? variables.length : 0)
            const classified = Array.isArray(variables) ? classifyVariables(variables) : {}
            console.log('[exportWord] classified:', JSON.stringify(Object.fromEntries(Object.entries(classified).map(([k,v]) => [k, v.type]))))
            const vertGroups = buildVerticalGroups(classified)
            const vertCodes  = new Set(vertGroups.flatMap(g => g.codes))
 
            // ── Build dataForWord (scalar + multi_cell) ───────────────────────
            const dataForWord = {}
            for (const key in codeMap) {
                const info = classified[key]
                if (!info || info.type === 'scalar' || info.type === 'multi_cell') {
                    const v = codeMap[key]
                    dataForWord[key] = Array.isArray(v)
                        ? (v.find(x => x != null && x !== '') || '')
                        : (v || '')
                }
            }
 
            // ── Read & normalize XML ──────────────────────────────────────────
            const content = fs.readFileSync(templatePath, 'binary')
            const zip2    = new PizZip(content)
            let xml = zip2.files['word/document.xml'].asText()
 
            // FIX: normalize split runs TRƯỚC MỌI thao tác replace
            xml = normalizeSplitRuns(xml)
 
            // ── VERIFY 1: Check placeholders after normalize ──────────────────
            const allPH = xml.match(/\{A\d+\}/g) || []
            const phCounts = {}
            allPH.forEach(p => { phCounts[p] = (phCounts[p] || 0) + 1 })
            console.log('[exportWord] After normalize, placeholder counts:', JSON.stringify(phCounts))
 
            // ── Step 1: Horizontal — sequential replace ───────────────────────
            for (const [code, info] of Object.entries(classified)) {
                if (info.type !== 'horizontal') continue
                const values = codeMap[code]
                if (!values) continue
                const valArr = Array.isArray(values) ? values : [values]
                // Sort coords by colIndex
                const sortedCoords = [...info.coords].sort((a, b) => a.colIndex - b.colIndex)
                let idx = 0
                const ph = `{${code}}`
                xml = xml.replace(new RegExp(ph.replace(/[{}]/g, '\\$&'), 'g'), () => {
                    const val = idx < valArr.length && valArr[idx] != null ? String(valArr[idx]) : ''
                    idx++
                    return val
                })
            }
 
            // ── VERIFY 2: After horizontal replace ───────────────────────────
            for (const [code, info] of Object.entries(classified)) {
                if (info.type !== 'horizontal') continue
                const remaining = (xml.match(new RegExp('\\{' + code + '\\}', 'g')) || []).length
                console.log('[exportWord] After horiz replace', code, '- remaining occurrences:', remaining)
            }
 
            // ── Step 2: Vertical — duplicate rows ─────────────────────────────
            for (const group of vertGroups) {
                const maxLen = Math.max(...group.codes.map(c => {
                    const v = codeMap[c]
                    return Array.isArray(v) ? v.length : (v ? 1 : 0)
                }), 0)
 
                // Tìm tất cả <w:tr>
                const trRegex  = /<w:tr[ >][\s\S]*?<\/w:tr>/g
                const trMatches = []
                let m
                while ((m = trRegex.exec(xml)) !== null) {
                    trMatches.push({ start: m.index, end: m.index + m[0].length, content: m[0] })
                }
 
                const templateRows = trMatches.filter(tr =>
                    group.codes.some(code => tr.content.includes(`{${code}}`))
                )
                console.log('[exportWord] Vertical group', group.codes, '- template rows found:', templateRows.length, '- maxLen:', maxLen)
                if (!templateRows.length) continue
 
                const templateTr = templateRows[0].content
                const expandedRows = []
 
                if (maxLen === 0) {
                    // Không có data → giữ 1 row rỗng
                    let emptyRow = templateTr
                    group.codes.forEach(code => { emptyRow = emptyRow.split(`{${code}}`).join('') })
                    expandedRows.push(emptyRow)
                } else {
                    for (let i = 0; i < maxLen; i++) {
                        let rowXml = templateTr
                        for (const code of group.codes) {
                            const v = codeMap[code]
                            const val = Array.isArray(v)
                                ? (v[i] != null ? String(v[i]) : '')
                                : (i === 0 ? String(v || '') : '')
                            rowXml = rowXml.split(`{${code}}`).join(val)
                        }
                        expandedRows.push(rowXml)
                    }
                }
 
                const first = templateRows[0]
                const last  = templateRows[templateRows.length - 1]
                xml = xml.slice(0, first.start) + expandedRows.join('') + xml.slice(last.end)
            }
 
            zip2.file('word/document.xml', xml)
            const transformed = zip2.generate({ type: 'nodebuffer' })
 
            // ── VERIFY 3: Log dataForWord ─────────────────────────────────────
            console.log('[exportWord] dataForWord keys:', Object.keys(dataForWord))
            console.log('[exportWord] dataForWord values:', JSON.stringify(dataForWord))
 
            // ── Step 3: Strip unknown placeholders trước khi render ────────────
            // Tránh Docxtemplater crash vì placeholder không có trong config (vd {A14})
            const zip3_raw = new PizZip(transformed)
            let xml3 = zip3_raw.files['word/document.xml'].asText()
            xml3 = xml3.replace(/\{A\d+\}/g, (match) => {
                const code = match.slice(1, -1)
                return (code in dataForWord) ? match : ''
            })
            zip3_raw.file('word/document.xml', xml3)
            const transformed3 = zip3_raw.generate({ type: 'nodebuffer' })
 
            // ── Step 4: Render scalar + multi_cell ───────────────────────────────
            const zip3 = new PizZip(transformed3)
            const doc  = new Docxtemplater(zip3, {
                paragraphLoop: true,
                linebreaks:    true,
                nullGetter()   { return '' }
            })
            doc.render(dataForWord)
            const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' })
 
            // ── Save ──────────────────────────────────────────────────────────
            const { canceled, filePath } = await dialog.showSaveDialog({
                title: 'Save Word Export',
                defaultPath: 'Export_Report.docx',
                filters: [{ name: 'Word Document', extensions: ['docx'] }]
            })
            if (canceled || !filePath) return { success: false, canceled: true }
 
            fs.writeFileSync(filePath, buf)
            return { success: true, filePath }
 
        } catch (error) {
            console.error('exportWordWithData error:', error)
            if (error.properties && error.properties.errors instanceof Array) {
                const msgs = error.properties.errors.map(e => e.properties.explanation).join('\n')
                return { success: false, message: msgs }
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
                title: 'Select filled Excel/CSV file to import',
                filters: [
                    { name: 'Excel / CSV', extensions: ['xlsx', 'xls', 'csv'] },  // ← thêm csv
                    { name: 'All Files',   extensions: ['*'] }
                ],
                properties: ['openFile']
            })
            if (result.canceled || !result.filePaths.length) return { canceled: true }
            return { success: true, filePath: result.filePaths[0] }
        } catch (e) {
            return { success: false, message: e.message }
        }
    })
}

// ══════════════════════════════════════════════════════════════════════════════
// THÊM: pickWordFileForImport — đặt sau pickExcelFileForImport
// ══════════════════════════════════════════════════════════════════════════════
export const pickWordFileForImport = () => {
    ipcMain.handle('pickWordFileForImport', async function (event) {
        try {
            const result = await dialog.showOpenDialog({
                title: 'Select filled Word file to import',
                filters: [
                    { name: 'Word Documents', extensions: ['docx'] },
                    { name: 'All Files',       extensions: ['*'] }
                ],
                properties: ['openFile']
            })
            if (result.canceled || !result.filePaths.length) return { canceled: true }
            return { success: true, filePath: result.filePaths[0] }
        } catch(e) {
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
 
            const ext = filePath.split('.').pop().toLowerCase()
            const isCsv = ext === 'csv'
 
            var codeValueMap = {}
 
            if (isCsv) {
                // ── CSV path ──────────────────────────────────────────────────
                const filledText = fs.readFileSync(filePath, 'utf-8')
                const filledRows = parseCsv(filledText)
 
                // Template CSV nếu có (để tách prefix y hệt Excel)
                var tmplRows = null
                if (templatePath && fs.existsSync(templatePath)) {
                    try {
                        const tmplExt = templatePath.split('.').pop().toLowerCase()
                        if (tmplExt === 'csv') {
                            tmplRows = parseCsv(fs.readFileSync(templatePath, 'utf-8'))
                        }
                    } catch(e) { console.warn('Cannot open CSV template:', e.message) }
                }
 
                for (var vi = 0; vi < variables.length; vi++) {
                    var variable    = variables[vi]
                    var code        = variable.code
                    var coordinates = variable.coordinates
                    if (!code || !coordinates || !coordinates.length) continue
 
                    codeValueMap[code] = []
 
                    for (var ci = 0; ci < coordinates.length; ci++) {
                        var coord    = coordinates[ci]
                        var bangIdx  = coord.indexOf('!')
                        // CSV chỉ có 1 sheet → bỏ "Sheet1!" lấy cell address
                        var cellAddr = bangIdx !== -1 ? coord.substring(bangIdx + 1) : coord
 
                        try {
                            var idx = cellAddressToIndex(cellAddr)
                            if (!idx) { codeValueMap[code].push(''); continue }
 
                            var row    = filledRows[idx.row]
                            var rawVal = row ? row[idx.col] : undefined
 
                            if (rawVal === undefined || rawVal === null || rawVal === '') {
                                codeValueMap[code].push('')
                                continue
                            }
 
                            // Số → trả thẳng
                            var numVal = Number(rawVal)
                            if (!isNaN(numVal) && rawVal.trim() !== '') {
                                codeValueMap[code].push(String(rawVal).trim())
                                continue
                            }
 
                            var filledStr = String(rawVal)
                            var extracted = filledStr
 
                            // Tách prefix/suffix từ template CSV nếu có
                            if (tmplRows) {
                                var tmplRow = tmplRows[idx.row]
                                var rawTmpl = tmplRow ? tmplRow[idx.col] : undefined
                                if (rawTmpl !== undefined && rawTmpl !== null && rawTmpl !== '') {
                                    extracted = extractValue(String(rawTmpl), filledStr, code)
                                }
                            }
 
                            codeValueMap[code].push(extracted.trim())
                        } catch(e) {
                            codeValueMap[code].push('')
                        }
                    }
                }
            } else {
                // ── Excel path (giữ nguyên) ───────────────────────────────────
                const XlsxPopulate = require('xlsx-populate')
                const filled = await XlsxPopulate.fromFileAsync(filePath)
 
                var tmpl = null
                if (templatePath && fs.existsSync(templatePath)) {
                    try { tmpl = await XlsxPopulate.fromFileAsync(templatePath) }
                    catch(e) { console.warn('Cannot open template for prefix detection:', e.message) }
                }
 
                for (var vi = 0; vi < variables.length; vi++) {
                    var variable    = variables[vi]
                    var code        = variable.code
                    var coordinates = variable.coordinates
                    if (!code || !coordinates || !coordinates.length) continue
 
                    codeValueMap[code] = []
 
                    for (var ci = 0; ci < coordinates.length; ci++) {
                        var coord    = coordinates[ci]
                        var bangIdx  = coord.indexOf('!')
                        if (bangIdx === -1) { codeValueMap[code].push(''); continue }
 
                        var sheetName = coord.substring(0, bangIdx)
                        var cellAddr  = coord.substring(bangIdx + 1)
 
                        try {
                            var filledSheet = filled.sheet(sheetName)
                            if (!filledSheet) { codeValueMap[code].push(''); continue }
 
                            var rawFilled = filledSheet.cell(cellAddr).value()
 
                            if (typeof rawFilled === 'number') {
                                codeValueMap[code].push(String(rawFilled))
                                continue
                            }
                            if (rawFilled === null || rawFilled === undefined) {
                                codeValueMap[code].push('')
                                continue
                            }
 
                            var filledStr = String(rawFilled)
                            var extracted = filledStr
 
                            if (tmpl) {
                                var tmplSheet = tmpl.sheet(sheetName)
                                if (tmplSheet) {
                                    var rawTmpl = tmplSheet.cell(cellAddr).value()
                                    if (rawTmpl !== null && rawTmpl !== undefined) {
                                        extracted = extractValue(String(rawTmpl), filledStr, code)
                                    }
                                }
                            }
 
                            codeValueMap[code].push(extracted.trim())
                        } catch(cellErr) {
                            console.warn('readExcelForImport cell error:', coord, cellErr.message)
                            codeValueMap[code].push('')
                        }
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

// ══════════════════════════════════════════════════════════════════════════════
// THÊM: readWordForImport — đặt sau readExcelForImport
// Giống readExcelForImport nhưng đọc docx XML theo Word!t{t}r{r}c{c} coordinate
// ══════════════════════════════════════════════════════════════════════════════
export const readWordForImport = () => {
    ipcMain.handle('readWordForImport', async function (event, { filePath, templatePath, variables }) {
        try {
            if (!filePath || !fs.existsSync(filePath)) {
                return { success: false, message: 'File not found: ' + filePath }
            }
            if (!variables || !variables.length) {
                return { success: true, codeValueMap: {} }
            }
 
            // Parse filled docx
            const filledBuf = fs.readFileSync(filePath)
            const { cells: filledCells, paras: filledParas } = parseDocxContent(filledBuf)
 
            // Parse template docx (để tách prefix/suffix giống Excel)
            let tmplCells = [], tmplParas = []
            if (templatePath && fs.existsSync(templatePath)) {
                try {
                    const { cells, paras } = parseDocxContent(fs.readFileSync(templatePath))
                    tmplCells = cells; tmplParas = paras
                } catch(e) { console.warn('Cannot parse Word template:', e.message) }
            }
 
            // Lookup helpers
            function getCellText(cells, t, r, c) {
                const f = cells.find(x => x.table === t && x.row === r && x.cell === c)
                return f ? f.text : ''
            }
            function getParaText(paras, p) {
                const f = paras.find(x => x.para === p)
                return f ? f.text : ''
            }
 
            const codeValueMap = {}
 
            for (const variable of variables) {
                const { code, coordinates } = variable
                if (!code || !coordinates || !coordinates.length) continue
                codeValueMap[code] = []
 
                for (const coord of coordinates) {
                    // Legacy: 'Found in Document' (scan cũ) → bỏ qua
                    if (!coord || coord === 'Found in Document') {
                        codeValueMap[code].push('')
                        continue
                    }
 
                    const pos = decodeWordCoord(coord)
                    if (!pos) { codeValueMap[code].push(''); continue }
 
                    let filledText = '', tmplText = ''
                    if (pos.table !== undefined) {
                        filledText = getCellText(filledCells, pos.table, pos.row, pos.cell)
                        tmplText   = tmplCells.length ? getCellText(tmplCells, pos.table, pos.row, pos.cell) : ''
                    } else {
                        filledText = getParaText(filledParas, pos.para)
                        tmplText   = tmplParas.length ? getParaText(tmplParas, pos.para) : ''
                    }
 
                    // Tách prefix/suffix y hệt Excel (reuse extractValue đã có)
                    let extracted = filledText
                    if (tmplText && tmplText !== filledText) {
                        try { extracted = extractValue(tmplText, filledText, code) } catch(e) {}
                    }
                    codeValueMap[code].push(extracted.trim())
                }
            }
 
            return { success: true, codeValueMap }
        } catch (error) {
            console.error('readWordForImport error:', error)
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
    pickWordFileForImport()
    readWordForImport()
}