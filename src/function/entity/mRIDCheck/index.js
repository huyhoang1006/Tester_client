import db from '../../datacontext/index.js'
/**
 * mRIDCheck/index.js — TẦNG function (main process, truy SQLite qua sqlcipher)
 * ----------------------------------------------------------------------------
 * QUAN TRỌNG: db là @journeyapps/sqlcipher — API CALLBACK bất đồng bộ.
 * KHÔNG dùng db.prepare().get() (đồng bộ kiểu better-sqlite3) — nó KHÔNG hoạt động
 * và khiến MỌI mrid bị báo "tồn tại". Phải dùng db.get(sql, params, cb) bọc Promise.
 *
 * Schema thật: organisation_psr dùng cột `organisation_id`.
 * ----------------------------------------------------------------------------
 */

// Query 1 dòng an toàn — bọc db.get (callback) thành Promise. Lỗi/không có → null.
const safeGet = (sql, params = []) => new Promise((resolve) => {
    try {
        db.get(sql, params, (err, row) => {
            if (err) { resolve(null); return }
            resolve(row || null)
        })
    } catch (e) { resolve(null) }
})

const safeAll = (sql, params = []) => new Promise((resolve, reject) => {
    try {
        db.all(sql, params, (err, rows) => {
            if (err) { reject(err); return }
            resolve(rows || [])
        })
    } catch (e) { reject(e) }
})

const run = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) { reject(err); return }
        resolve(this)
    })
})

const quoteIdent = (name) => `"${String(name).replace(/"/g, '""')}"`

const isReplaceableColumn = (column) => {
    const type = String(column.type || '').toUpperCase()
    return !type.includes('BLOB')
}

// mode → { table, nameJoin/nameCol, parent: async (row)=>({mrid,mode})|null }
const MRID_TABLES = {
    organisation: {
        table: 'organisation', nameJoin: true,
        parent: async (row) => row.parent_organisation
            ? { mrid: row.parent_organisation, mode: 'organisation' } : null,
    },
    substation: {
        table: 'substation', nameJoin: true,
        parent: async (row) => {
            const link = await safeGet(
                `SELECT organisation_id FROM organisation_psr WHERE psr_id = ? LIMIT 1`, [row.mrid])
            return link && link.organisation_id
                ? { mrid: link.organisation_id, mode: 'organisation' } : null
        },
    },
    voltageLevel: {
        table: 'voltage_level', nameJoin: true,
        parent: async (row) => row.substation
            ? { mrid: row.substation, mode: 'substation' } : null,
    },
    bay: {
        table: 'bay', nameJoin: true,
        parent: async (row) => row.voltage_level
            ? { mrid: row.voltage_level, mode: 'voltageLevel' }
            : (row.substation ? { mrid: row.substation, mode: 'substation' } : null),
    },
    asset: {
        table: 'asset', nameCol: 'serial_number',
        parent: async (row) => {
            const link = await safeGet(
                `SELECT psr_id FROM asset_psr WHERE asset_id = ? LIMIT 1`, [row.mrid])
            if (!link || !link.psr_id) return null
            return { mrid: link.psr_id, mode: 'psr' }
        },
    },
    job: {
        table: 'work_task', nameJoin: true,
        parent: async (row) => {
            const link = await safeGet(
                `SELECT asset_id FROM asset_work_task WHERE work_task_id = ? LIMIT 1`, [row.mrid])
            return link && link.asset_id ? { mrid: link.asset_id, mode: 'asset' } : null
        },
    },
}

const PSR_LOOKUP = ['bay', 'voltageLevel', 'substation']

const getNodeName = async (def, row) => {
    if (def.nameJoin) {
        const io = await safeGet(
            `SELECT name FROM identified_object WHERE mrid = ? LIMIT 1`, [row.mrid])
        if (io && io.name) return io.name
    }
    if (def.nameCol && row[def.nameCol]) return row[def.nameCol]
    return row.serial_number || row.name || ''
}

const findMridInModes = async (mrid, modes) => {
    for (const mode of modes) {
        const def = MRID_TABLES[mode]
        if (!def) continue
        const row = await safeGet(`SELECT * FROM ${def.table} WHERE mrid = ? LIMIT 1`, [mrid])
        if (row) return { mode, row, def }
    }
    return null
}

const ASSET_TYPES = new Set(['transformer', 'voltageTransformer', 'currentTransformer', 'breaker',
    'disconnector', 'surgeArrester', 'powerCable', 'rotatingMachine', 'capacitor', 'reactor', 'bushing'])

const normalizeType = (type) => (ASSET_TYPES.has(type) ? 'asset' : type)

// 1) CHECK tồn tại: items [{mrid, type}] → { success, data:[{mrid, mode, name}] }
export const checkMridsExist = async (items) => {
    const existing = []
    for (const it of (items || [])) {
        const mrid = it.mrid
        if (!mrid) continue
        const wantMode = normalizeType(it.type)

        let hit = null
        if (wantMode && MRID_TABLES[wantMode]) {
            hit = await findMridInModes(mrid, [wantMode])
        }
        if (!hit) {
            hit = await findMridInModes(mrid,
                ['asset', 'job', 'bay', 'voltageLevel', 'substation', 'organisation'])
        }
        if (hit) {
            const name = await getNodeName(hit.def, hit.row)
            console.log(`[MRID-CHECK] mrid=${mrid} type=${it.type} -> CO o bang="${hit.def.table}"`)
            existing.push({ mrid, mode: hit.mode, name, _table: hit.def.table })
        } else {
            console.log(`[MRID-CHECK] mrid=${mrid} type=${it.type} -> KHONG co`)
        }
    }
    console.log(`[MRID-CHECK] Tong: ${existing.length}/${(items || []).length} mrid ton tai`)
    return { success: true, data: existing }
}

// 2) RESOLVE PATH: mrid + mode → { success, data:[{mode, mrid, name}] }
export const resolveMridPath = async (mrid, mode) => {
    const path = []
    let cur = { mrid, mode: normalizeType(mode) }
    let guard = 0

    while (cur && cur.mrid && guard++ < 50) {
        let hit
        if (cur.mode === 'psr') {
            hit = await findMridInModes(cur.mrid, PSR_LOOKUP)
        } else {
            hit = await findMridInModes(cur.mrid, [cur.mode])
        }
        if (!hit) break

        const name = await getNodeName(hit.def, hit.row)
        path.unshift({ mode: hit.mode, mrid: cur.mrid, name })

        const parent = hit.def.parent ? await hit.def.parent(hit.row) : null
        if (!parent || !parent.mrid) break
        cur = parent
    }

    return { success: true, data: path }
}

export const replaceLocalMrid = async (oldMrid, newMrid) => {
    if (!oldMrid || !newMrid) {
        return { success: false, message: 'Missing old or new mrid' }
    }
    if (String(oldMrid) === String(newMrid)) {
        return { success: true, data: { oldMrid, newMrid, updatedCells: 0 } }
    }

    const tables = await safeAll(
        `SELECT name FROM sqlite_master
         WHERE type = 'table'
           AND name NOT LIKE 'sqlite_%'
         ORDER BY name`
    )

    // Chặn trước: newMrid đã thuộc về một bản ghi KHÁC thì đổi tên chắc chắn vỡ
    // khoá chính. Báo rõ đang đụng cái gì thay vì để SQLITE_CONSTRAINT thô bắn lên.
    const conflicts = []
    for (const table of tables) {
        const cols = await safeAll(`PRAGMA table_info(${quoteIdent(table.name)})`)
        for (const col of cols.filter(c => c.pk > 0)) {
            const hit = await safeAll(
                `SELECT 1 FROM ${quoteIdent(table.name)} WHERE ${quoteIdent(col.name)} = ? LIMIT 1`,
                [String(newMrid)]
            )
            if (hit.length) conflicts.push(`${table.name}.${col.name}`)
        }
    }
    if (conflicts.length) {
        const owner = await safeGet(
            `SELECT name FROM identified_object WHERE mrid = ? LIMIT 1`, [String(newMrid)]
        )
        const ownerName = owner && owner.name ? `"${owner.name}"` : '(khong ro ten)'
        return {
            success: false,
            conflict: { newMrid: String(newMrid), tables: conflicts, ownerName },
            message: `Server returned id "${newMrid}" but it already belongs to another local node ${ownerName}. `
                + `Check for duplicate serial number.`
        }
    }

    let updatedCells = 0

    try {
        await run('PRAGMA foreign_keys = OFF')
        await run('BEGIN TRANSACTION')

        for (const table of tables) {
            const tableName = table.name
            const columns = await safeAll(`PRAGMA table_info(${quoteIdent(tableName)})`)

            for (const column of columns.filter(isReplaceableColumn)) {
                const columnName = column.name
                let result
                try {
                    result = await run(
                        `UPDATE ${quoteIdent(tableName)}
                         SET ${quoteIdent(columnName)} = ?
                         WHERE ${quoteIdent(columnName)} = ?`,
                        [String(newMrid), String(oldMrid)]
                    )
                } catch (updateError) {
                    // Chỉ rõ bảng.cột làm vỡ — trước đây lỗi bị nuốt ở catch ngoài cùng
                    console.error(`[REPLACE-MRID] FAILED tai ${tableName}.${columnName}:`, updateError && updateError.message)
                    throw updateError
                }
                updatedCells += result.changes || 0
            }
        }

        await run('COMMIT')
        await run('PRAGMA foreign_keys = ON')
        return {
            success: true,
            data: {
                oldMrid: String(oldMrid),
                newMrid: String(newMrid),
                updatedCells
            }
        }
    } catch (error) {
        try { await run('ROLLBACK') } catch (rollbackError) { void rollbackError }
        try { await run('PRAGMA foreign_keys = ON') } catch (pragmaError) { void pragmaError }
        return {
            success: false,
            error,
            message: error.message || 'Replace local mrid failed'
        }
    }
}
