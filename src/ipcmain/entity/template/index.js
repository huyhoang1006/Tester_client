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

const delimiterFromOption = (value) => {
    if (value === 'tab') return '\t'
    if (value === 'semicolon') return ';'
    if (value === 'pipe') return '|'
    if (value === 'comma') return ','
    return null
}

const parseCsvWithFormatOptions = (text, options = {}) => {
    const quote = options.textQualifier == null ? '"' : String(options.textQualifier)
    const candidates = [',', ';', '\t', '|']
    const parseWithDelimiter = (delimiter, sampleOnly = false) => {
        const rows = []
        let row = []
        let cur = ''
        let inQuote = false
        const pushCell = () => { row.push(cur); cur = '' }
        const pushRow = () => {
            if (row.length || cur !== '') pushCell()
            if (row.some(v => String(v || '').trim() !== '')) rows.push(row)
            row = []
            cur = ''
        }
        for (let i = 0; i < text.length; i++) {
            const ch = text[i]
            if (quote && ch === quote) {
                if (inQuote && text[i + 1] === quote) { cur += quote; i++ }
                else inQuote = !inQuote
            } else if (ch === delimiter && !inQuote) {
                pushCell()
            } else if ((ch === '\n' || ch === '\r') && !inQuote) {
                if (ch === '\r' && text[i + 1] === '\n') i++
                pushRow()
                if (sampleOnly && rows.length >= 20) return rows
            } else {
                cur += ch
            }
        }
        if (cur !== '' || row.length) pushRow()
        return rows
    }
    let delimiter = delimiterFromOption(options.delimiter)
    if (!delimiter) {
        delimiter = candidates
            .map(item => ({ item, score: parseWithDelimiter(item, true).reduce((sum, row) => sum + Math.max(0, row.length - 1), 0) }))
            .sort((a, b) => b.score - a.score)[0].item
    }
    return parseWithDelimiter(delimiter)
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
                const applyWrapIfNeeded = (value) => {
                    if (typeof value === 'string' && value.indexOf('\n') !== -1) {
                        try { cell.style('wrapText', true) } catch (e) { /* keep export best-effort */ }
                    }
                }
                
                let finalVal = val
                if (typeof val === 'string' && val.trim() !== '') {
                    const num = Number(val)
                    if (!isNaN(num) && !val.trim().match(/^0\d+/)) finalVal = num
                }

                if (currentValue === null || currentValue === undefined || currentValue === '') {
                    cell.value(finalVal)
                    applyWrapIfNeeded(finalVal)
                    return
                }

                const currentStr = String(currentValue).trim()
                const codeTrimmed = code.trim()

                if (currentStr === codeTrimmed || currentStr === `{${codeTrimmed}}`) {
                    cell.value(finalVal)
                    applyWrapIfNeeded(finalVal)
                    return
                }

                const codeRegex = new RegExp('(?<![A-Za-z0-9])\\{?' + codeTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\}?(?![A-Za-z0-9])', 'g')
                if (codeRegex.test(currentStr)) {
                    codeRegex.lastIndex = 0
                    const replaced = currentStr.replace(codeRegex, () => val)
                    cell.value(replaced)
                    applyWrapIfNeeded(replaced)
                } else {
                    cell.value(finalVal)
                    applyWrapIfNeeded(finalVal)
                }
            }

            // ── THUẬT TOÁN CHÍNH: QUẢN LÝ DỊCH CHUYỂN TỌA ĐỘ ───────────────
            function fillWorkbookSheet(wb, vars, codeMap) {
                const actionsBySheet = {}
                const parseExcelCellAddress = (addr) => {
                    const match = String(addr || '').match(/^([A-Z]+)(\d+)$/i)
                    if (!match) return null
                    return { colStr: match[1].toUpperCase(), rowNum: parseInt(match[2], 10) }
                }
                const parseExcelCoordinate = (coord) => {
                    const bangIdx = String(coord || '').indexOf('!')
                    if (bangIdx === -1) return null
                    const cell = parseExcelCellAddress(coord.substring(bangIdx + 1))
                    if (!cell) return null
                    return { sheetName: coord.substring(0, bangIdx), ...cell }
                }
                const isVerticalSeries = (coordinates) => {
                    if (!Array.isArray(coordinates) || coordinates.length < 2) return null
                    const parsed = coordinates.map(parseExcelCoordinate).filter(Boolean)
                    if (parsed.length < 2) return null
                    const first = parsed[0]
                    const sameSheetAndColumn = parsed.every(p => p.sheetName === first.sheetName && p.colStr === first.colStr)
                    if (!sameSheetAndColumn) return null
                    const rows = parsed.map(p => p.rowNum).sort((a, b) => a - b)
                    for (let i = 1; i < rows.length; i++) {
                        if (rows[i] - rows[i - 1] !== 1) return null
                    }
                    return { sheetName: first.sheetName, colStr: first.colStr, rowNum: rows[0] }
                }

                for (const variable of (vars || [])) {
                    const { code, coordinates } = variable
                    if (!code || !coordinates || !coordinates.length) continue

                    const rawVals = codeMap[code]
                    const values = Array.isArray(rawVals) ? rawVals : (rawVals !== undefined ? [String(rawVals)] : [])
                    if (!values.length) continue

                    const verticalSeries = isVerticalSeries(coordinates)
                    if (verticalSeries && values.length > 1) {
                        const { sheetName, colStr, rowNum } = verticalSeries
                        if (!actionsBySheet[sheetName]) actionsBySheet[sheetName] = {}
                        if (!actionsBySheet[sheetName][rowNum]) actionsBySheet[sheetName][rowNum] = []
                        actionsBySheet[sheetName][rowNum].push({
                            code, colStr, isAutoInsert: true, values, templateRowCount: coordinates.length
                        })
                        continue
                    }

                    const isAutoInsert = (coordinates.length === 1 && values.length > 1)

                    coordinates.forEach((coord, i) => {
                        const parsed = parseExcelCoordinate(coord)
                        if (!parsed) return
                        const { sheetName, colStr, rowNum } = parsed

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
                                maxShiftRequired = Math.max(maxShiftRequired, act.values.length - (act.templateRowCount || 1))
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

const readTestingEquipmentColumnImportPayload = async (filePath, options = {}) => {
    const ext = path.extname(filePath).toLowerCase().replace('.', '')
    const asText = (value) => {
        if (value == null) return ''
        if (value instanceof Date && !isNaN(value.getTime())) return value.toISOString().slice(0, 10)
        return String(value)
    }
    const normalizeRows = (rows) => {
        const normalized = (rows || []).map(row => (row || []).map(asText))
        let end = normalized.length
        while (end > 0 && normalized[end - 1].every(v => String(v || '').trim() === '')) end--
        const trimmed = normalized.slice(0, end)
        const maxCol = trimmed.reduce((max, row) => {
            let last = row.length
            while (last > 0 && String(row[last - 1] || '').trim() === '') last--
            return Math.max(max, last)
        }, 0)
        return trimmed.map(row => {
            const next = row.slice(0, maxCol)
            while (next.length < maxCol) next.push('')
            return next
        })
    }

    let sheets = []
    if (ext === 'csv') {
        const text = fs.readFileSync(filePath, 'utf-8')
        sheets = [{ name: path.basename(filePath, path.extname(filePath)), rows: normalizeRows(parseCsvWithFormatOptions(text, options)) }]
    } else {
        const XlsxPopulate = require('xlsx-populate')
        const workbook = await XlsxPopulate.fromFileAsync(filePath)
        sheets = workbook.sheets().map(sheet => {
            let used = null
            try { used = sheet.usedRange() } catch (e) { used = null }
            const endRow = used ? used.endCell().rowNumber() : 0
            const endCol = used ? used.endCell().columnNumber() : 0
            const rows = []
            for (let r = 1; r <= endRow; r++) {
                const row = []
                for (let c = 1; c <= endCol; c++) row.push(asText(sheet.cell(r, c).value()))
                rows.push(row)
            }
            return { name: sheet.name(), rows: normalizeRows(rows) }
        }).filter(sheet => sheet.rows.length)
    }

    return {
        success: true,
        filePath,
        fileName: path.basename(filePath),
        fileType: ext,
        sheets
    }
}

export const pickTestingEquipmentColumnImportFile = () => {
    ipcMain.handle('pickTestingEquipmentColumnImportFile', async function (event, options = {}) {
        void event
        try {
            const result = await dialog.showOpenDialog({
                title: 'Select testing equipment Excel/CSV file',
                filters: [
                    { name: 'Excel / CSV', extensions: ['xlsx', 'xls', 'csv'] },
                    { name: 'All Files', extensions: ['*'] }
                ],
                properties: ['openFile']
            })
            if (result.canceled || !result.filePaths.length) return { canceled: true }

            const filePath = result.filePaths[0]
            return readTestingEquipmentColumnImportPayload(filePath, options)
        } catch (e) {
            return { success: false, message: e.message }
        }
    })
}

export const readTestingEquipmentColumnImportFile = () => {
    ipcMain.handle('readTestingEquipmentColumnImportFile', async function (event, data = {}) {
        void event
        try {
            if (!data.filePath) return { success: false, message: 'No file selected' }
            return readTestingEquipmentColumnImportPayload(data.filePath, data.options || {})
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
            var codeSheetMap = {}
            var sheetNames = []
 
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
                    codeSheetMap[code] = []
 
                    for (var ci = 0; ci < coordinates.length; ci++) {
                        var coord    = coordinates[ci]
                        var bangIdx  = coord.indexOf('!')
                        // CSV chỉ có 1 sheet → bỏ "Sheet1!" lấy cell address
                        var cellAddr = bangIdx !== -1 ? coord.substring(bangIdx + 1) : coord
 
                        try {
                            var idx = cellAddressToIndex(cellAddr)
                            if (!idx) { codeValueMap[code].push(''); codeSheetMap[code].push('CSV'); continue }
 
                            var row    = filledRows[idx.row]
                            var rawVal = row ? row[idx.col] : undefined
 
                            if (rawVal === undefined || rawVal === null || rawVal === '') {
                                codeValueMap[code].push('')
                                codeSheetMap[code].push('CSV')
                                continue
                            }
 
                            // Số → trả thẳng
                            var numVal = Number(rawVal)
                            if (!isNaN(numVal) && rawVal.trim() !== '') {
                                codeValueMap[code].push(String(rawVal).trim())
                                codeSheetMap[code].push('CSV')
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
                            codeSheetMap[code].push('CSV')
                        } catch(e) {
                            codeValueMap[code].push('')
                            codeSheetMap[code].push('CSV')
                        }
                    }
                }
            } else {
                // ── Excel path (giữ nguyên) ───────────────────────────────────
                const XlsxPopulate = require('xlsx-populate')
                const filled = await XlsxPopulate.fromFileAsync(filePath)
                sheetNames = filled.sheets().map(sheet => sheet.name())
                const filledSheets = filled.sheets()
                const nonEmptySheets = filledSheets.filter(sheet => {
                    try { return !!sheet.usedRange() } catch (e) { return false }
                })
 
                var tmpl = null
                if (templatePath && fs.existsSync(templatePath)) {
                    try { tmpl = await XlsxPopulate.fromFileAsync(templatePath) }
                    catch(e) { console.warn('Cannot open template for prefix detection:', e.message) }
                }

                const pushExcelCellValue = (sheet, cellAddr, templateSheetName, code) => {
                    const actualSheetName = sheet.name()
                    var rawFilled = sheet.cell(cellAddr).value()

                    if (typeof rawFilled === 'number') {
                        codeValueMap[code].push(String(rawFilled))
                        codeSheetMap[code].push(actualSheetName)
                        return
                    }
                    if (rawFilled === null || rawFilled === undefined) {
                        codeValueMap[code].push('')
                        codeSheetMap[code].push(actualSheetName)
                        return
                    }

                    var filledStr = String(rawFilled)
                    var extracted = filledStr

                    if (tmpl) {
                        var tmplSheet = tmpl.sheet(templateSheetName)
                        if (tmplSheet) {
                            var rawTmpl = tmplSheet.cell(cellAddr).value()
                            if (rawTmpl !== null && rawTmpl !== undefined) {
                                extracted = extractValue(String(rawTmpl), filledStr, code)
                            }
                        }
                    }

                    codeValueMap[code].push(extracted.trim())
                    codeSheetMap[code].push(actualSheetName)
                }

                const parseExcelCellAddress = (addr) => {
                    const m = String(addr || '').match(/^([A-Z]+)(\d+)$/i)
                    if (!m) return null
                    const colText = m[1].toUpperCase()
                    let col = 0
                    for (let i = 0; i < colText.length; i++) col = col * 26 + (colText.charCodeAt(i) - 64)
                    return { colText, col, row: parseInt(m[2], 10) }
                }

                const excelColumnName = (index) => {
                    let n = index
                    let name = ''
                    while (n > 0) {
                        const rem = (n - 1) % 26
                        name = String.fromCharCode(65 + rem) + name
                        n = Math.floor((n - 1) / 26)
                    }
                    return name
                }

                const getExcelTargetSheet = (sheetName) => {
                    const explicit = filled.sheet(sheetName)
                    if (explicit) return explicit
                    const fallbackSheets = nonEmptySheets.length ? nonEmptySheets : filledSheets
                    return fallbackSheets[0] || null
                }

                const buildVerticalImportSpecs = () => {
                    const specs = []
                    for (const variable of variables) {
                        if (!variable || !variable.code || !Array.isArray(variable.coordinates) || variable.coordinates.length < 2) continue
                        const parsed = variable.coordinates
                            .map(coord => {
                                const bangIdx = String(coord || '').indexOf('!')
                                if (bangIdx === -1) return null
                                const sheetName = coord.substring(0, bangIdx)
                                const cell = parseExcelCellAddress(coord.substring(bangIdx + 1))
                                return cell ? { sheetName, ...cell } : null
                            })
                            .filter(Boolean)
                        if (parsed.length < 2) continue
                        const first = parsed[0]
                        const second = parsed[1]
                        const sameColumn = first.sheetName === second.sheetName && first.col === second.col
                        const adjacentRows = Math.abs(first.row - second.row) === 1
                        if (!sameColumn || !adjacentRows) continue
                        specs.push({
                            code: variable.code,
                            templateSheetName: first.sheetName,
                            col: first.col,
                            startRow: Math.min(first.row, second.row)
                        })
                    }
                    return specs
                }

                const isExcelBlank = (value) => value === null || value === undefined || String(value).trim() === ''
                const verticalSpecs = buildVerticalImportSpecs()
                const canUseVerticalScan = verticalSpecs.length >= 2
 
                if (canUseVerticalScan) {
                    for (const variable of variables) {
                        if (variable && variable.code) {
                            codeValueMap[variable.code] = []
                            codeSheetMap[variable.code] = []
                        }
                    }

                    const startRow = Math.min(...verticalSpecs.map(spec => spec.startRow))
                    const templateSheetName = verticalSpecs[0].templateSheetName
                    const targetSheet = getExcelTargetSheet(templateSheetName)

                    if (targetSheet) {
                        const maxRows = 5000
                        let readRows = 0
                        for (let row = startRow; row < startRow + maxRows; row++) {
                            const rowIsBlank = verticalSpecs.every(spec => {
                                const addr = `${excelColumnName(spec.col)}${row}`
                                return isExcelBlank(targetSheet.cell(addr).value())
                            })
                            if (rowIsBlank && readRows > 0) break
                            if (rowIsBlank) continue

                            for (const spec of verticalSpecs) {
                                const addr = `${excelColumnName(spec.col)}${row}`
                                pushExcelCellValue(targetSheet, addr, spec.templateSheetName, spec.code)
                            }
                            readRows++
                        }
                    }
                } else {
                for (let excelVi = 0; excelVi < variables.length; excelVi++) {
                    const excelVariable    = variables[excelVi]
                    const excelCode        = excelVariable.code
                    const excelCoordinates = excelVariable.coordinates
                    if (!excelCode || !excelCoordinates || !excelCoordinates.length) continue
 
                    codeValueMap[excelCode] = []
                    codeSheetMap[excelCode] = []
 
                    for (let excelCi = 0; excelCi < excelCoordinates.length; excelCi++) {
                        const excelCoord    = excelCoordinates[excelCi]
                        const excelBangIdx  = excelCoord.indexOf('!')
                        if (excelBangIdx === -1) { codeValueMap[excelCode].push(''); codeSheetMap[excelCode].push(''); continue }
 
                        var sheetName = excelCoord.substring(0, excelBangIdx)
                        const cellAddr  = excelCoord.substring(excelBangIdx + 1)
 
                        try {
                            var filledSheet = filled.sheet(sheetName)
                            if (!filledSheet) {
                                const fallbackSheets = nonEmptySheets.length ? nonEmptySheets : filledSheets
                                const fallbackSheet = fallbackSheets[0]
                                if (!fallbackSheet) {
                                    codeValueMap[excelCode].push('')
                                    codeSheetMap[excelCode].push(sheetName)
                                    continue
                                }
                                pushExcelCellValue(fallbackSheet, cellAddr, sheetName, excelCode)
                                continue
                            }
                            pushExcelCellValue(filledSheet, cellAddr, sheetName, excelCode)
                        } catch(cellErr) {
                            console.warn('readExcelForImport cell error:', excelCoord, cellErr.message)
                            codeValueMap[excelCode].push('')
                            codeSheetMap[excelCode].push(sheetName)
                        }
                    }
                }
                }
            }
 
            return { success: true, codeValueMap: codeValueMap, codeSheetMap: codeSheetMap, sheetNames: sheetNames }
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

// ══════════════════════════════════════════════════════════════════════════════
// TESTING EQUIPMENT — Word import RIÊNG (không đụng readWordForImport cũ)
// Khác biệt: hiểu placeholder dạng {code} — file điền thay NGUYÊN "{code}" bằng
// giá trị (không giữ ngoặc), nên prefix/suffix phải tính theo "{code}" chứ không
// phải "code" trần như extractValue cũ.
//   template: "Name: {B1}"  + filled: "Name: CPC 100"  → "CPC 100"
//   template: "{B1}"        + filled: "CPC 100"        → "CPC 100"
//   template: "Year: B1"    + filled: "Year: 2019"     → "2019" (fallback code trần)
// ══════════════════════════════════════════════════════════════════════════════
function extractValueWordTE(templateStr, filledStr, code) {
    var escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    var prefix = null
    var suffix = null

    // Ưu tiên placeholder {code}
    var placeholder = '{' + code + '}'
    var idx = templateStr.indexOf(placeholder)
    if (idx !== -1) {
        prefix = templateStr.substring(0, idx)
        suffix = templateStr.substring(idx + placeholder.length)
    } else {
        // Fallback: code trần với word boundary (như extractValue cũ)
        var tokenRegex = new RegExp('(?<![A-Za-z0-9])' + escapedCode + '(?![A-Za-z0-9])')
        var match = tokenRegex.exec(templateStr)
        if (!match) return filledStr
        prefix = templateStr.substring(0, match.index)
        suffix = templateStr.substring(match.index + code.length)
    }

    // Strip chặt bằng regex ^prefix(.*)suffix$
    var escPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    var escSuffix = suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    var extractMatch = new RegExp('^' + escPrefix + '([\\s\\S]*)' + escSuffix + '$').exec(filledStr)
    if (extractMatch) return extractMatch[1]

    // Strip mềm: bỏ prefix/suffix nếu khớp riêng lẻ (file điền lệch nhẹ)
    var value = filledStr
    if (prefix && value.startsWith(prefix)) value = value.substring(prefix.length)
    if (suffix && value.endsWith(suffix)) value = value.substring(0, value.length - suffix.length)
    return value
}

// Parse docx GIỮ XUỐNG DÒNG trong ô (đa đoạn văn / <w:br/> → '\n') — bản riêng cho TE.
// Excel giữ '\n' trong cell nên các cơ chế tách theo serial / license / sự kiện repair
// (split theo dòng) hoạt động; parser này cho Word hành xử giống hệt.
// Chỉ số table/row/cell/para giống parseDocxContent nên coordinate tương thích 100%.
function parseDocxContentTE(buffer) {
    const PizZip = require('pizzip')
    const zip = new PizZip(buffer)
    // <w:br/> trong run → newline
    const xml = zip.file('word/document.xml').asText()
        .replace(/<w:br\s*\/>/g, '<w:t>\n</w:t>')

    function getRunsText(fragment) {
        const matches = []
        const re = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g
        let m
        while ((m = re.exec(fragment)) !== null) matches.push(m[1])
        return matches.join('')
    }
    // Text của 1 fragment = các <w:p> join '\n' (đa đoạn văn trong ô)
    function getText(fragment) {
        const paraTexts = []
        const pRe = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g
        let pM
        while ((pM = pRe.exec(fragment)) !== null) paraTexts.push(getRunsText(pM[1]))
        if (!paraTexts.length) return getRunsText(fragment)
        return paraTexts.join('\n')
    }

    const cells = []
    const paras = []

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

    const xmlNoTbl = xml.replace(/<w:tbl\b[^>]*>[\s\S]*?<\/w:tbl>/g, '')
    const bodyM = xmlNoTbl.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/)
    if (bodyM) {
        let pIdx = 0
        const pRe = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g
        let pM
        while ((pM = pRe.exec(bodyM[1])) !== null) {
            paras.push({ para: pIdx, text: getRunsText(pM[1]) })
            pIdx++
        }
    }

    return { cells, paras }
}

export const readWordForImportTE = () => {
    ipcMain.handle('readWordForImportTE', async function (event, { filePath, templatePath, variables }) {
        try {
            if (!filePath || !fs.existsSync(filePath)) {
                return { success: false, message: 'File not found: ' + filePath }
            }
            if (!variables || !variables.length) {
                return { success: true, codeValueMap: {} }
            }

            const filledBuf = fs.readFileSync(filePath)
            const { cells: filledCells, paras: filledParas } = parseDocxContentTE(filledBuf)

            let tmplCells = [], tmplParas = []
            if (templatePath && fs.existsSync(templatePath)) {
                try {
                    const { cells, paras } = parseDocxContentTE(fs.readFileSync(templatePath))
                    tmplCells = cells; tmplParas = paras
                } catch(e) { console.warn('Cannot parse Word template:', e.message) }
            }

            function getCellText(cells, t, r, c) {
                const f = cells.find(x => x.table === t && x.row === r && x.cell === c)
                return f ? f.text : ''
            }
            function getParaText(paras, p) {
                const f = paras.find(x => x.para === p)
                return f ? f.text : ''
            }

            const codeValueMap = {}

            // ── VERTICAL SCAN (cơ chế như readExcelForImport) ─────────────────
            // Kích hoạt khi: code có ≥2 tọa độ CÙNG BẢNG, CÙNG CỘT (cell index),
            // hàng liền kề — và có ≥2 code như vậy. Khi đó quét bảng của file
            // ĐÃ ĐIỀN từ hàng đầu tiên xuống hết bảng (bỏ hàng trống đầu, dừng
            // ở hàng trống sau khi đã có dữ liệu) → số thiết bị không giới hạn
            // theo số hàng khai trong template.
            const isBlankText = (v) => v === null || v === undefined || String(v).trim() === ''
            const buildVerticalSpecs = () => {
                const specs = []
                for (const variable of variables) {
                    if (!variable || !variable.code || !Array.isArray(variable.coordinates) || variable.coordinates.length < 2) continue
                    const parsed = variable.coordinates
                        .map(coord => decodeWordCoord(coord || ''))
                        .filter(pos => pos && pos.table !== undefined)
                    if (parsed.length < 2) continue
                    const first = parsed[0]
                    const second = parsed[1]
                    const sameColumn = first.table === second.table && first.cell === second.cell
                    const adjacentRows = Math.abs(first.row - second.row) === 1
                    if (!sameColumn || !adjacentRows) continue
                    specs.push({
                        code: variable.code,
                        table: first.table,
                        cell: first.cell,
                        startRow: Math.min(first.row, second.row)
                    })
                }
                return specs
            }
            let verticalSpecs = buildVerticalSpecs()
            if (verticalSpecs.length) {
                // chỉ nhận các spec cùng 1 bảng (bảng của spec đầu tiên)
                const tableIdx = verticalSpecs[0].table
                verticalSpecs = verticalSpecs.filter(spec => spec.table === tableIdx)
            }
            const canUseVerticalScan = verticalSpecs.length >= 2

            if (canUseVerticalScan) {
                for (const variable of variables) {
                    if (variable && variable.code) codeValueMap[variable.code] = []
                }
                const tableIdx = verticalSpecs[0].table
                const startRow = Math.min(...verticalSpecs.map(spec => spec.startRow))
                const maxRow = filledCells.reduce((m, c) => c.table === tableIdx ? Math.max(m, c.row) : m, -1)
                let readRows = 0
                for (let row = startRow; row <= maxRow; row++) {
                    const rowIsBlank = verticalSpecs.every(spec =>
                        isBlankText(getCellText(filledCells, tableIdx, row, spec.cell))
                    )
                    if (rowIsBlank && readRows > 0) break
                    if (rowIsBlank) continue

                    for (const spec of verticalSpecs) {
                        const filledText = getCellText(filledCells, tableIdx, row, spec.cell)
                        const tmplText = tmplCells.length ? getCellText(tmplCells, tableIdx, row, spec.cell) : ''
                        let extracted = filledText
                        if (tmplText && tmplText !== filledText) {
                            try { extracted = extractValueWordTE(tmplText, filledText, spec.code) } catch(e) {}
                        }
                        codeValueMap[spec.code].push(String(extracted).trim())
                    }
                    readRows++
                }
                return { success: true, codeValueMap }
            }

            for (const variable of variables) {
                const { code, coordinates } = variable
                if (!code || !coordinates || !coordinates.length) continue
                codeValueMap[code] = []

                for (const coord of coordinates) {
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

                    let extracted = filledText
                    if (tmplText && tmplText !== filledText) {
                        try { extracted = extractValueWordTE(tmplText, filledText, code) } catch(e) {}
                    }
                    codeValueMap[code].push(extracted.trim())
                }
            }

            return { success: true, codeValueMap }
        } catch (error) {
            console.error('readWordForImportTE error:', error)
            return { success: false, message: error.message }
        }
    })
}

// ══════════════════════════════════════════════════════════════════════════════
// TESTING EQUIPMENT — Word export RIÊNG (không đụng exportWordWithData cũ)
// Bổ sung các cơ chế gộp nhiều bản ghi như export Excel (exportTemplateWithData):
//   1. Vertical group (code ở ≥2 hàng cùng cột)     → nhân hàng, mỗi thiết bị 1 hàng
//   2. Row-group auto-insert: các code SCALAR cùng 1 hàng bảng, có nhiều giá trị
//      → nhân hàng đó (tương đương auto-insert của Excel khi 1 tọa độ + nhiều value)
//   3. Giá trị nhiều dòng (bulletList repair/license) → <w:br/> để Word xuống dòng thật
//   4. Escape XML (&, <, >) khi ghi thẳng vào document.xml
//   5. Code tùy ý (không hardcode {A\d+})
// Giữ prefix/suffix quanh {code} trong ô như Excel setCellValueSafe.
// ══════════════════════════════════════════════════════════════════════════════
function escapeXmlTE(text) {
    return String(text == null ? '' : text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}
// Giá trị chèn vào trong <w:t>: escape + '\n' → ngắt run bằng <w:br/>
function wordValueTE(val) {
    return escapeXmlTE(val).replace(/\r?\n/g, '</w:t><w:br/><w:t xml:space="preserve">')
}
// Token regex như Excel setCellValueSafe: nhận cả "{A1}" LẪN "A1" trần
// (template Word có thể dùng code trần y như Excel), word-boundary chặn A1 ăn vào A10
function codeTokenRegexTE(code) {
    const esc = String(code).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp('\\{' + esc + '\\}|(?<![A-Za-z0-9])' + esc + '(?![A-Za-z0-9])', 'g')
}
// Chỉ thay trong TEXT của <w:t> (không đụng attribute/tag XML)
function replaceCodeInXmlTE(xmlFragment, code, val) {
    const tokenRe = codeTokenRegexTE(code)
    return xmlFragment.replace(/(<w:t(?:\s[^>]*)?>)([^<]*)(<\/w:t>)/g, (m, open, text, close) => {
        tokenRe.lastIndex = 0
        if (!tokenRe.test(text)) return m
        tokenRe.lastIndex = 0
        const replaced = text.replace(tokenRe, () => wordValueTE(val))
        return open + replaced + close
    })
}
// Fragment có chứa code (trong <w:t>) không — dùng để tìm hàng template
function xmlHasCodeTE(xmlFragment, code) {
    const tokenRe = codeTokenRegexTE(code)
    const wtRe = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g
    let m
    while ((m = wtRe.exec(xmlFragment)) !== null) {
        tokenRe.lastIndex = 0
        if (tokenRe.test(m[1])) return true
    }
    return false
}

export const exportWordWithDataTE = () => {
    ipcMain.handle('exportWordWithDataTE', async function (event, { templatePath, codeMap, variables }) {
        try {
            if (!templatePath || !fs.existsSync(templatePath)) {
                return { success: false, message: 'Template file not found' }
            }

            const PizZip = require('pizzip')

            const vars = Array.isArray(variables) ? variables : []
            const classified = classifyVariables(vars)
            const vertGroups = buildVerticalGroups(classified)
            const vertCodes = new Set(vertGroups.flatMap(g => g.codes))

            const valuesOf = (code) => {
                const v = codeMap ? codeMap[code] : undefined
                if (v === undefined || v === null) return []
                return Array.isArray(v) ? v.map(x => (x == null ? '' : String(x))) : [String(v)]
            }

            const content = fs.readFileSync(templatePath, 'binary')
            const zip = new PizZip(content)
            let xml = zip.files['word/document.xml'].asText()

            // ── Normalize split runs cho MỌI code (Word hay tách "{A1}" thành nhiều run) ──
            // Gộp text các <w:t> liên tiếp nếu ghép lại đúng bằng {code}
            const allCodes = vars.map(v => v.code).filter(Boolean)
            if (allCodes.length) {
                const phSet = new Set(allCodes.map(c => '{' + c + '}'))
                const wtPattern = /<w:t(?:[^>]*)>(.*?)<\/w:t>/gs
                const allWt = []
                let m
                while ((m = wtPattern.exec(xml)) !== null) {
                    allWt.push({ start: m.index, end: m.index + m[0].length, text: m[1] })
                }
                const replacements = []
                const processed = new Set()
                for (let i = 0; i < allWt.length; i++) {
                    if (processed.has(i)) continue
                    if (!allWt[i].text.includes('{')) continue
                    let combined = allWt[i].text
                    if (phSet.has(combined.trim())) continue // đã nguyên vẹn
                    for (let j = i + 1; j < Math.min(i + 10, allWt.length); j++) {
                        const between = xml.slice(allWt[j - 1].end, allWt[j].start)
                        if (/>[^<\s][^<]*</.test(between)) break
                        combined += allWt[j].text
                        const trimmed = combined.trim()
                        if (phSet.has(trimmed)) {
                            const tagOpen = xml.slice(allWt[i].start).match(/^<w:t[^>]*>/)
                            if (!tagOpen) break
                            replacements.push({ start: allWt[i].start, end: allWt[i].end, val: tagOpen[0] + combined + '</w:t>' })
                            for (let k = i + 1; k <= j; k++) {
                                const kTag = xml.slice(allWt[k].start).match(/^<w:t[^>]*>/)
                                if (kTag) replacements.push({ start: allWt[k].start, end: allWt[k].end, val: kTag[0] + '</w:t>' })
                                processed.add(k)
                            }
                            processed.add(i)
                            break
                        }
                        if (trimmed.includes('}')) break
                    }
                }
                for (const r of replacements.sort((a, b) => b.start - a.start)) {
                    xml = xml.slice(0, r.start) + r.val + xml.slice(r.end)
                }
            }

            // ── Thay MỘT LƯỢT nhiều code trong 1 fragment (regex gộp alternation):
            // giá trị vừa chèn không bị vòng thay thế của code sau quét lại.
            const escCode = (c) => String(c).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const replaceCodesOnePassTE = (fragment, codes, getVal) => {
                if (!codes.length) return fragment
                const alt = codes.map(escCode).join('|')
                const tokenRe = new RegExp('\\{(' + alt + ')\\}|(?<![A-Za-z0-9])(' + alt + ')(?![A-Za-z0-9])', 'g')
                return fragment.replace(/(<w:t(?:\s[^>]*)?>)([^<]*)(<\/w:t>)/g, (m, open, text, close) => {
                    tokenRe.lastIndex = 0
                    if (!tokenRe.test(text)) return m
                    tokenRe.lastIndex = 0
                    const replaced = text.replace(tokenRe, (mm, g1, g2) => wordValueTE(getVal(g1 || g2)))
                    return open + replaced + close
                })
            }

            // ── Step 1: Horizontal — replace tuần tự theo thứ tự xuất hiện ──────
            const horizontalCodes = Object.entries(classified)
                .filter(([, info]) => info.type === 'horizontal')
                .map(([code]) => code)
            if (horizontalCodes.length) {
                const idxByCode = {}
                xml = replaceCodesOnePassTE(xml, horizontalCodes, (code) => {
                    const valArr = valuesOf(code)
                    const idx = idxByCode[code] || 0
                    idxByCode[code] = idx + 1
                    return idx < valArr.length ? valArr[idx] : ''
                })
            }

            // ── Step 2: Vertical groups — nhân hàng, mỗi thiết bị 1 hàng ────────
            for (const group of vertGroups) {
                const maxLen = Math.max(...group.codes.map(c => valuesOf(c).length), 0)
                const trRegex = /<w:tr[ >][\s\S]*?<\/w:tr>/g
                const trMatches = []
                let m
                while ((m = trRegex.exec(xml)) !== null) {
                    trMatches.push({ start: m.index, end: m.index + m[0].length, content: m[0] })
                }
                const templateRows = trMatches.filter(tr =>
                    group.codes.some(code => xmlHasCodeTE(tr.content, code))
                )
                if (!templateRows.length) continue

                const templateTr = templateRows[0].content
                const expandedRows = []
                if (maxLen === 0) {
                    expandedRows.push(replaceCodesOnePassTE(templateTr, group.codes, () => ''))
                } else {
                    for (let i = 0; i < maxLen; i++) {
                        expandedRows.push(replaceCodesOnePassTE(templateTr, group.codes, (code) => {
                            const v = valuesOf(code)
                            return v[i] != null ? v[i] : ''
                        }))
                    }
                }
                const first = templateRows[0]
                const last = templateRows[templateRows.length - 1]
                xml = xml.slice(0, first.start) + expandedRows.join('') + xml.slice(last.end)
            }

            // ── Step 3: Row-group auto-insert (như Excel: 1 tọa độ + nhiều value) ──
            // Các code scalar nằm trong CÙNG 1 hàng bảng, có code nhiều giá trị
            // → nhân hàng đó maxLen lần, thiết bị thứ i nhận values[i].
            const scalarByRow = {}
            for (const [code, info] of Object.entries(classified)) {
                if (info.type !== 'scalar' || vertCodes.has(code)) continue
                const pos = info.coords[0]
                if (pos.tableIndex === undefined || pos.tableIndex === null) continue
                const key = pos.tableIndex + ':' + pos.rowIndex
                if (!scalarByRow[key]) scalarByRow[key] = []
                scalarByRow[key].push(code)
            }
            const handledScalar = new Set()
            for (const key of Object.keys(scalarByRow)) {
                const codesInRow = scalarByRow[key]
                const maxLen = Math.max(...codesInRow.map(c => valuesOf(c).length), 0)
                if (maxLen <= 1) continue // 1 giá trị → để Docxtemplater-less scalar fill ở Step 4

                const trRegex = /<w:tr[ >][\s\S]*?<\/w:tr>/g
                const trMatches = []
                let m
                while ((m = trRegex.exec(xml)) !== null) {
                    trMatches.push({ start: m.index, end: m.index + m[0].length, content: m[0] })
                }
                const rowMatch = trMatches.find(tr =>
                    codesInRow.every(code => xmlHasCodeTE(tr.content, code))
                )
                if (!rowMatch) continue

                const expandedRows = []
                for (let i = 0; i < maxLen; i++) {
                    expandedRows.push(replaceCodesOnePassTE(rowMatch.content, codesInRow, (code) => {
                        const v = valuesOf(code)
                        return v[i] != null ? v[i] : ''
                    }))
                }
                xml = xml.slice(0, rowMatch.start) + expandedRows.join('') + xml.slice(rowMatch.end)
                codesInRow.forEach(code => handledScalar.add(code))
            }

            // ── Step 4: Scalar / multi_cell còn lại — fill trực tiếp (giá trị đầu) ──
            const scalarCodes = Object.entries(classified)
                .filter(([code, info]) => !vertCodes.has(code) && !handledScalar.has(code)
                    && (info.type === 'scalar' || info.type === 'multi_cell'))
                .map(([code]) => code)
            if (scalarCodes.length) {
                xml = replaceCodesOnePassTE(xml, scalarCodes, (code) => {
                    const valArr = valuesOf(code)
                    return valArr.find(x => x != null && x !== '') || ''
                })
            }

            // ── Step 5: dọn placeholder sót — CHỈ xóa ô còn nguyên code/{code}
            // (không xóa token trần trong text đã fill, tránh nuốt dữ liệu trùng tên code)
            for (const v of vars) {
                if (!v || !v.code) continue
                const code = v.code
                xml = xml.replace(/(<w:t(?:\s[^>]*)?>)([^<]*)(<\/w:t>)/g, (m, open, text, close) => {
                    const t = text.trim()
                    if (t === code || t === '{' + code + '}') return open + close
                    if (text.indexOf('{' + code + '}') !== -1) return open + text.split('{' + code + '}').join('') + close
                    return m
                })
            }

            zip.file('word/document.xml', xml)
            const buf = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' })

            const { canceled, filePath } = await dialog.showSaveDialog({
                title: 'Save Word Export',
                defaultPath: 'TestingEquipment_Export.docx',
                filters: [{ name: 'Word Document', extensions: ['docx'] }]
            })
            if (canceled || !filePath) return { success: false, canceled: true }

            fs.writeFileSync(filePath, buf)
            return { success: true, filePath }
        } catch (error) {
            console.error('exportWordWithDataTE error:', error)
            return { success: false, message: error.message }
        }
    })
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
    pickTestingEquipmentColumnImportFile()
    readTestingEquipmentColumnImportFile()
    readExcelForImport()
    openFileTemplate()
    pickWordFileForImport()
    readWordForImport()
    readWordForImportTE()
    exportWordWithDataTE()
}
