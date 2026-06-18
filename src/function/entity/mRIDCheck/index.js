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