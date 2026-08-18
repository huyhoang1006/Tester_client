import db from '../../datacontext/index'

const COMMISSIONING_DATE_TYPE = 'COMMISSIONING'

const run = (dbsql, sql, params = []) => new Promise((resolve, reject) => {
    dbsql.run(sql, params, function (err) {
        if (err) return reject(err)
        resolve(this)
    })
})

const all = (dbsql, sql, params = []) => new Promise((resolve, reject) => {
    dbsql.all(sql, params, (err, rows) => {
        if (err) return reject(err)
        resolve(rows || [])
    })
})

const ensureInUseDateColumns = async (dbsql) => {
    const rows = await all(dbsql, 'PRAGMA table_info(in_use_date)')
    const existing = new Set(rows.map(row => row.name))
    const columns = [
        ['asset_id', 'TEXT'],
        ['date_type', 'TEXT'],
        ['date_value', 'INTEGER'],
        ['note', 'TEXT'],
        ['created_at', 'TEXT'],
        ['updated_at', 'TEXT']
    ]
    for (const [name, type] of columns) {
        if (!existing.has(name)) {
            await run(dbsql, `ALTER TABLE in_use_date ADD COLUMN ${name} ${type}`)
        }
    }
}

export const getInUseDateById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM in_use_date WHERE mrid=?', [mrid], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get in-use date by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'In-use date not found' })
            return resolve({ success: true, data: row, message: 'Get in-use date by id completed' })
        })
    })
}

export const getInUseDateByAssetAndType = async (assetId, dateType = COMMISSIONING_DATE_TYPE) => {
    try {
        await ensureInUseDateColumns(db)
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM in_use_date
                 WHERE asset_id = ? AND date_type = ?
                 ORDER BY created_at ASC, mrid ASC
                 LIMIT 1`,
                [assetId, dateType],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get in-use date by asset and type failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'In-use date not found' })
                    return resolve({ success: true, data: row, message: 'Get in-use date by asset and type completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get in-use date by asset and type failed' }
    }
}

export const insertInUseDateTransaction = async (data, dbsql) => {
    await ensureInUseDateColumns(dbsql)
    return new Promise((resolve, reject) => {
        const dateValue = data.date_value != null ? data.date_value : data.in_use_date
        const now = new Date().toISOString()
        dbsql.run(
            `INSERT INTO in_use_date(
                mrid, asset_id, date_type, date_value, in_use_date,
                not_ready_for_use_date, ready_for_use_date, note, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                asset_id = excluded.asset_id,
                date_type = excluded.date_type,
                date_value = excluded.date_value,
                in_use_date = excluded.in_use_date,
                not_ready_for_use_date = excluded.not_ready_for_use_date,
                ready_for_use_date = excluded.ready_for_use_date,
                note = excluded.note,
                updated_at = excluded.updated_at
            `,
            [
                data.mrid,
                data.asset_id || null,
                data.date_type || COMMISSIONING_DATE_TYPE,
                dateValue || null,
                data.in_use_date || dateValue || null,
                data.not_ready_for_use_date,
                data.ready_for_use_date,
                data.note || null,
                data.created_at || now,
                data.updated_at || now
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert in-use date transaction failed' })
                return resolve({ success: true, data, message: 'Insert in-use date transaction completed' })
            }
        )
    })
}

export const deleteInUseDateByAssetIdTransaction = async (assetId, dbsql) => {
    await ensureInUseDateColumns(dbsql)
    return new Promise((resolve, reject) => {
        dbsql.run('DELETE FROM in_use_date WHERE asset_id = ?', [assetId], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete in-use date by asset failed' })
            return resolve({ success: true, data: null, message: 'Delete in-use date by asset completed' })
        })
    })
}

export const deleteInUseDateByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run('DELETE FROM in_use_date WHERE mrid = ?', [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete in-use date by id failed' })
            return resolve({ success: true, data: null, message: 'Delete in-use date by id completed' })
        })
    })
}

export { COMMISSIONING_DATE_TYPE }
