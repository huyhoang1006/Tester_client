#!/usr/bin/env node
/**
 * SỬA FILE JSON EXPORT CŨ cho khớp config hiện tại.
 *
 *   node tools/fix-export-json.js "duong-dan.json"            # chi kiem tra, khong ghi
 *   node tools/fix-export-json.js "duong-dan.json" --write     # sua that
 *
 * ─── VẤN ĐỀ ──────────────────────────────────────────────────────────────────
 *
 * File export mang theo `measurement_id` và `testTypeId` — hai thứ trỏ vào DANH MỤC
 * CẤU HÌNH, không phải dữ liệu người dùng. Config đổi thì file cũ trỏ vào id không còn
 * tồn tại, và import đổ.
 *
 * Trường hợp thật đã gặp: cột `open_close_time` của `OCTiming`/`OCOTiming` từng mang id
 * `c92fh65g-a311-4827-f012-5357a7b8c92e`. Để ý `h` và `g` — KHÔNG phải chữ số hex, tức
 * đó chưa bao giờ là UUID hợp lệ. Một id gõ tay bị lỗi trong config cũ, đã sửa từ lâu,
 * nhưng vẫn còn nằm trong mọi file đã export trước đó.
 *
 * ─── CÁCH REMAP ──────────────────────────────────────────────────────────────
 *
 * KHÔNG dùng bảng tra id-cũ-sang-id-mới viết tay, vì bảng đó sẽ lạc hậu ngay lần config
 * đổi tiếp theo. Thay vào đó tra theo thứ KHÔNG đổi: **mã bài test + tên cột**.
 *
 *     (testTypeCode = 'OCTiming', cot = 'open_close_time')  ->  id trong config hien tai
 *
 * Nhờ vậy công cụ này còn dùng được cho những lần lệch sau, không chỉ lần này.
 *
 * ─── CHỈ SỬA ID CẤU HÌNH ─────────────────────────────────────────────────────
 *
 * Tuyệt đối không đụng vào `mrid` của bài test, dòng bảng hay ô đo — đó là dữ liệu
 * người dùng. Cũng không đụng tới quyền sở hữu: import gán quyền theo người đang đăng
 * nhập, file JSON không được quyết định chuyện đó.
 */

const fs = require('fs')
const path = require('path')

const CONFIG_DIR = path.join(__dirname, '..', 'src', 'config')

/** Đọc mọi file JSON trong một thư mục config, trả về [{ testType, data }]. */
function readConfigGroup(group) {
    const root = path.join(CONFIG_DIR, group)
    if (!fs.existsSync(root)) return []
    const out = []
    for (const dir of fs.readdirSync(root)) {
        const full = path.join(root, dir)
        if (fs.statSync(full).isDirectory()) {
            for (const file of fs.readdirSync(full)) {
                if (!file.endsWith('.json')) continue
                out.push({
                    testType: path.basename(file, '.json'),
                    data: JSON.parse(fs.readFileSync(path.join(full, file), 'utf8'))
                })
            }
        } else if (dir.endsWith('.json')) {
            out.push({ testType: path.basename(dir, '.json'), data: JSON.parse(fs.readFileSync(full, 'utf8')) })
        }
    }
    return out
}

/** Duyệt sâu, gọi fn cho mọi object. */
function deepVisit(node, fn) {
    if (Array.isArray(node)) { node.forEach(item => deepVisit(item, fn)); return }
    if (!node || typeof node !== 'object') return
    fn(node)
    Object.values(node).forEach(value => deepVisit(value, fn))
}

/** Bảng tra: cột đo hiện tại, theo (mã bài test, tên cột) và theo tên cột dùng chung. */
function buildColumnIndex() {
    const byTestAndAlias = new Map()
    const byAliasOnly = new Map()
    const knownIds = new Set()
    // mrid -> kieu do ('analog' | 'string' | 'discrete') theo config HIEN TAI
    const typeById = new Map()

    // testing-condition chua 7 cot dieu kien dung chung; test-definitions chua cot rieng
    for (const group of ['test-definitions', 'testing-condition']) {
        for (const { testType, data } of readConfigGroup(group)) {
            deepVisit(data, (obj) => {
                const alias = obj.alias_name || obj.aliasName || obj.code
                if (!obj.mrid || !alias) return
                knownIds.add(obj.mrid)
                const key = `${testType}|${alias}`
                if (!byTestAndAlias.has(key)) byTestAndAlias.set(key, obj.mrid)
                if (!byAliasOnly.has(alias)) byAliasOnly.set(alias, obj.mrid)
                if (obj.type) {
                    const type = String(obj.type).toLowerCase()
                    const seen = typeById.get(obj.mrid)
                    if (seen && seen !== type) {
                        // Một mrid chỉ được thuộc MỘT bảng đo. Nếu config khai hai kiểu
                        // cho cùng mrid thì chính config sai, không phải file export.
                        console.warn(`  CANH BAO config: mrid ${obj.mrid} khai ca "${seen}" va "${type}"`)
                    }
                    if (!seen) typeById.set(obj.mrid, type)
                }
            })
        }
    }
    return { byTestAndAlias, byAliasOnly, knownIds, typeById }
}

/**
 * Đổi kiểu ô có làm mất dữ liệu không?
 *
 * Ô rỗng thì đổi kiểu là vô hại. Ô có giá trị mà chuyển sang analog thì chỉ an toàn khi
 * giá trị đọc được thành số — ngược lại phải báo để người dùng tự quyết, không tự ý bỏ.
 */
function conversionIsLossless(value, toType) {
    if (value === null || value === undefined || value === '') return true
    if (toType === 'string') return true
    return String(value).trim() !== '' && Number.isFinite(Number(value))
}

/** Bảng tra: mrid của 82 bài test hiện tại. */
function buildProcedureIndex() {
    const ids = new Set()
    for (const { data } of readConfigGroup('procedures')) {
        deepVisit(data, (obj) => { if (obj.mrid) ids.add(obj.mrid) })
    }
    return ids
}

/** Gom mọi node trong cây export. */
function collectNodes(exported) {
    const nodes = []
    const walk = (node) => {
        if (!node || typeof node !== 'object') return
        nodes.push(node)
        for (const child of (node.children || [])) walk(child)
    }
    for (const root of (exported.roots || [])) walk(root)
    return nodes
}

function main() {
    const file = process.argv[2]
    const write = process.argv.includes('--write')
    if (!file) {
        console.error('Thieu duong dan file JSON.')
        console.error('  node tools/fix-export-json.js "file.json" [--write]')
        process.exit(1)
    }

    const columns = buildColumnIndex()
    const procedures = buildProcedureIndex()
    console.log(`Config hien tai: ${columns.knownIds.size} cot do, ${procedures.size} bai test\n`)

    const exported = JSON.parse(fs.readFileSync(file, 'utf8'))
    const jobs = collectNodes(exported).filter(node => node.type === 'job')

    let cellsChecked = 0
    let fixed = 0
    let typeFixed = 0
    const unresolved = new Map()
    const changes = new Map()
    const typeChanges = new Map()
    const typeRisky = new Map()
    const badProcedures = new Map()

    for (const job of jobs) {
        for (const test of ((job.data && job.data.testList) || [])) {
            const code = test.testTypeCode

            if (test.testTypeId && !procedures.has(test.testTypeId)) {
                badProcedures.set(`${code}|${test.testTypeId}`, (badProcedures.get(`${code}|${test.testTypeId}`) || 0) + 1)
            }

            // Khoi dieu kien va moi dong cua moi bang deu chua o do
            const holders = []
            const cond = test.testCondition && test.testCondition.condition
            if (cond && typeof cond === 'object') holders.push(cond)
            const tables = (test.data && test.data.table) || {}
            for (const rows of Object.values(tables)) {
                for (const row of (rows || [])) if (row && typeof row === 'object') holders.push(row)
            }

            for (const holder of holders) {
                for (const [alias, cell] of Object.entries(holder)) {
                    if (!cell || typeof cell !== 'object' || !cell.measurement_id) continue
                    cellsChecked++
                    if (columns.knownIds.has(cell.measurement_id)) {
                        // ─── KIEU DO LECH CONFIG ─────────────────────────────
                        //
                        // Ô ghi `type` của riêng nó, và tầng ghi chọn BẢNG theo đó:
                        // string -> string_measurement_value, analog -> analog_...
                        // Mỗi bảng lại có khoá ngoại về string_measurement / analog_
                        // measurement, và một mrid chỉ nằm ở MỘT trong hai.
                        //
                        // Nên `type` lệch config không phải sai sót thẩm mỹ: nó khiến
                        // insert trỏ vào bảng không có mrid đó và đổ "FOREIGN KEY
                        // constraint failed", báo lên thành "Insert stringMeasurement
                        // Values failed".
                        //
                        // Config là bản gốc của kiểu đo (người dùng không đổi được),
                        // nên khi lệch thì file sai, sửa file.
                        const wantType = columns.typeById.get(cell.measurement_id)
                        const haveType = cell.type ? String(cell.type).toLowerCase() : null
                        if (wantType && haveType && wantType !== haveType) {
                            const key = `${code}|${alias}|${haveType}|${wantType}`
                            if (conversionIsLossless(cell.value, wantType)) {
                                typeChanges.set(key, (typeChanges.get(key) || 0) + 1)
                                if (write) cell.type = wantType
                                typeFixed++
                            } else {
                                const rk = `${key}|${JSON.stringify(cell.value)}`
                                typeRisky.set(rk, (typeRisky.get(rk) || 0) + 1)
                            }
                        }
                        continue
                    }

                    const replacement = columns.byTestAndAlias.get(`${code}|${alias}`)
                        || columns.byAliasOnly.get(alias)

                    if (!replacement) {
                        const key = `${code}|${alias}|${cell.measurement_id}`
                        unresolved.set(key, (unresolved.get(key) || 0) + 1)
                        continue
                    }
                    const key = `${code}|${alias}|${cell.measurement_id}|${replacement}`
                    changes.set(key, (changes.get(key) || 0) + 1)
                    if (write) cell.measurement_id = replacement
                    fixed++
                }
            }
        }
    }

    console.log(`Da kiem ${cellsChecked} o do trong ${jobs.length} job`)
    console.log(`  khop config       : ${cellsChecked - fixed - [...unresolved.values()].reduce((a, b) => a + b, 0)}`)
    console.log(`  remap duoc        : ${fixed}`)
    console.log(`  KHONG remap duoc  : ${[...unresolved.values()].reduce((a, b) => a + b, 0)}`)
    console.log(`  sai kieu do       : ${typeFixed} sua duoc, ${[...typeRisky.values()].reduce((a, b) => a + b, 0)} phai xem tay`)

    if (typeChanges.size) {
        console.log('\n=== Kieu do se doi (config la ban goc) ===')
        for (const [key, count] of typeChanges) {
            const [code, alias, from, to] = key.split('|')
            console.log(`  ${code} > ${alias}  ${from} -> ${to}   (${count} o, o rong nen doi la vo hai)`)
        }
    }

    if (typeRisky.size) {
        console.log('\n=== Kieu do lech NHUNG o CO du lieu — phai xem tay ===')
        for (const [key, count] of typeRisky) {
            const [code, alias, from, to, value] = key.split('|')
            console.log(`  ${code} > ${alias}  ${from} -> ${to}  value=${value}  (${count} o)`)
        }
        console.log('  Doi kieu se lam mat gia tri nay. Tu quyet dinh giu hay bo.')
    }

    if (changes.size) {
        console.log('\n=== Cac id se doi ===')
        for (const [key, count] of changes) {
            const [code, alias, oldId, newId] = key.split('|')
            console.log(`  ${code} > ${alias}  (${count} o)`)
            console.log(`    ${oldId}`)
            console.log(` -> ${newId}`)
        }
    }

    if (unresolved.size) {
        console.log('\n=== KHONG remap duoc — phai xu ly tay ===')
        for (const [key, count] of unresolved) {
            const [code, alias, oldId] = key.split('|')
            console.log(`  ${code} > ${alias}  ${oldId}  (${count} o)`)
        }
        console.log('  Cot nay khong con trong config. Hoac cot da bi bo, hoac doi ten.')
    }

    if (badProcedures.size) {
        console.log('\n=== testTypeId khong co trong 82 bai test ===')
        for (const [key, count] of badProcedures) {
            const [code, id] = key.split('|')
            console.log(`  ${code}  ${id}  (${count} bai)`)
        }
        console.log('  Cong cu nay KHONG tu sua testTypeId — sai o day nghia la ca bai test')
        console.log('  khong con trong danh muc, phai quyet dinh bo hay anh xa sang bai nao.')
    }

    if (!write) {
        console.log('\nCHUA GHI GI. Them --write de sua that.')
        return
    }
    // Phải đếm CẢ HAI loại sửa. Bản trước chỉ kiểm `fixed` (remap measurement_id), nên
    // file chỉ lệch KIỂU ĐO thì công cụ tìm ra đủ 6 ô, in ra đủ, rồi thoát ở đây với
    // "Khong co gi phai sua" và không ghi gì — báo cáo nói có việc, hành động nói không.
    if (!fixed && !typeFixed) {
        console.log('\nKhong co gi phai sua.')
        return
    }

    // Sao lưu trước khi ghi. File export là dữ liệu thật của người dùng, và công cụ
    // này chạy tay nên không có đường hoàn tác nào khác.
    const backup = `${file}.bak`
    if (!fs.existsSync(backup)) {
        fs.copyFileSync(file, backup)
        console.log(`\nDa sao luu: ${backup}`)
    }
    fs.writeFileSync(file, JSON.stringify(exported, null, 2), 'utf8')
    console.log(`Da ghi vao ${file}: ${fixed} o doi measurement_id, ${typeFixed} o doi kieu do`)
}

main()
