/* eslint-disable */
/**
 * Kiểm tra DB sau khi xoá file và cho app tạo lại — CHỈ ĐỌC.
 *
 *   node check-db.js
 *
 * Kiểm 4 thứ:
 *   1. user_version = 2  (init đã chạy trọn vẹn)
 *   2. Bảng nối đã đổi sang work_task_id, FK trỏ work_task
 *   3. Số bản ghi seed khớp config
 *   4. Không còn id lạ / đơn vị sai
 */
const path = require('path')
const sqlite3 = require('@journeyapps/sqlcipher').verbose()

const DB_PATH = path.join(__dirname, 'database', 'database.db')
const DB_PASSWORD = 'attester'

// Kỳ vọng: chỉ 7 asset được createProcedure gọi
// (SurgeArrester, VoltageTransformer, CircuitBreaker, CurrentTransformer,
//  Transformer, Disconnector, PowerCable)
const EXPECTED = {
    procedure: 82,
    measurement: 137,
    analog: 111,
    string_measurement: 22,
    discrete: 4,
    value_alias_set: 2,
    value_to_alias: 6,
    measurement_procedure: 1098,
    standard: 113,
    assessment_rule: 233,
    assessment_group: 233,
    assessment: 231,
}

const LINK_TABLES = [
    'transformer', 'voltage_transformer', 'current_transformer', 'circuit_breaker',
    'power_cable', 'surge_arrester', 'reactor', 'capacitor', 'disconnector',
    'rotating_machine', 'bushing',
].map(a => `${a}_testing_equipment_test_type`)

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) { console.error('Không mở được DB:', err.message); process.exit(1) }
})
const get = (s, p = []) => new Promise((r, j) => db.get(s, p, (e, x) => e ? j(e) : r(x)))
const all = (s, p = []) => new Promise((r, j) => db.all(s, p, (e, x) => e ? j(e) : r(x)))

db.serialize(async () => {
    db.run(`PRAGMA key = '${DB_PASSWORD}'`)
    let fail = 0
    const bad = (m) => { console.log('   ✗ ' + m); fail++ }

    try {
        console.log('DB:', DB_PATH, '\n')

        // 1 ───────────────────────────────────────────────────────────
        const uv = (await get('PRAGMA user_version')).user_version
        console.log(`1. user_version = ${uv}` + (uv === 2 ? '  ✓' : ''))
        if (uv !== 2) bad(`mong đợi 2. 0 = init chưa chạy hoặc đã rollback vì lỗi`)

        // 2 ───────────────────────────────────────────────────────────
        console.log('\n2. Bảng nối equipment ↔ test')
        let okLink = 0
        for (const t of LINK_TABLES) {
            const cols = await all(`PRAGMA table_info(${t})`)
            if (cols.length === 0) { bad(`${t} KHÔNG tồn tại`); continue }
            const names = cols.map(c => c.name)
            if (!names.includes('work_task_id')) { bad(`${t} thiếu cột work_task_id — DB còn schema CŨ, phải XOÁ FILE chứ không DELETE FROM`); continue }
            if (names.includes('test_type_id')) { bad(`${t} vẫn còn cột test_type_id`); continue }
            const fks = await all(`PRAGMA foreign_key_list(${t})`)
            const fk = fks.find(f => f.from === 'work_task_id')
            if (!fk) bad(`${t}.work_task_id không có FK`)
            else if (fk.table !== 'work_task') bad(`${t}.work_task_id trỏ ${fk.table}, mong đợi work_task`)
            else okLink++
        }
        if (okLink === LINK_TABLES.length) console.log(`   ✓ ${okLink}/${LINK_TABLES.length} bảng đúng cột + FK → work_task`)

        // 3 ───────────────────────────────────────────────────────────
        console.log('\n3. Số bản ghi seed')
        for (const [t, want] of Object.entries(EXPECTED)) {
            let got
            try { got = (await get(`SELECT count(*) c FROM ${t}`)).c } catch (e) { bad(`bảng ${t}: ${e.message}`); continue }
            const mark = got === want ? '✓' : '✗'
            console.log(`   ${mark} ${t.padEnd(24)} ${String(got).padStart(5)} / ${want}`)
            if (got !== want) fail++
        }

        // 4 ───────────────────────────────────────────────────────────
        console.log('\n4. Chất lượng dữ liệu')
        const UUID = "mrid GLOB '[0-9a-f]*-[0-9a-f]*-[0-9a-f]*-[0-9a-f]*-[0-9a-f]*' AND length(mrid)=36"
        for (const t of ['procedure', 'measurement', 'standard', 'assessment_rule', 'assessment_group', 'assessment']) {
            try {
                const n = (await get(`SELECT count(*) c FROM ${t} WHERE NOT (${UUID})`)).c
                if (n > 0) bad(`${t}: ${n} mrid không phải UUID`)
            } catch (e) { /* bảng có thể chưa có, mục 3 đã báo */ }
        }
        const ohm = await all(`SELECT unit_multiplier, unit_symbol, count(*) c FROM measurement
                               WHERE unit_symbol LIKE '%Ω%' GROUP BY 1,2`)
        console.log('   Đơn vị ohm trong measurement:')
        for (const r of ohm) {
            const u = `${r.unit_multiplier || ''}${r.unit_symbol}`
            const wrong = r.unit_multiplier === 'm' && r.unit_symbol.includes('Ω')
            console.log(`     ${wrong ? '✗' : '·'} ${u.padEnd(6)} × ${r.c}`)
            if (wrong) bad(`còn ${r.c} cột dùng mΩ — đáng lẽ MΩ`)
        }

        console.log('\n' + '─'.repeat(64))
        console.log(fail === 0
            ? 'TẤT CẢ ĐỀU ĐÚNG ✓'
            : `CÓ ${fail} VẤN ĐỀ ✗ — xem các dòng ✗ ở trên`)
    } catch (e) {
        console.error('Lỗi:', e.message)
    } finally {
        db.close()
    }
})
