import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index.js'

const run = (dbsql, sql, params = []) => new Promise((resolve, reject) => {
    dbsql.run(sql, params, function (err) {
        if (err) return reject(err)
        return resolve(this)
    })
})

const get = (dbsql, sql, params = []) => new Promise((resolve, reject) => {
    dbsql.get(sql, params, (err, row) => {
        if (err) return reject(err)
        return resolve(row || null)
    })
})

const all = (dbsql, sql, params = []) => new Promise((resolve, reject) => {
    dbsql.all(sql, params, (err, rows) => {
        if (err) return reject(err)
        return resolve(rows || [])
    })
})

// Repair Ticket extends the CIM activity_record through a same-key child table.
// Existing databases are migrated lazily; legacy columns are left untouched so the
// upgrade is non-destructive, but all new reads and writes use the child tables.
export const ensureActivityRecordSchema = async (dbsql = db) => {
    const rows = await all(dbsql, 'PRAGMA table_info(activity_record)')
    const existing = new Set(rows.map(row => row.name))

    await run(dbsql, `
        CREATE TABLE IF NOT EXISTS activity_record_ticket (
            mrid TEXT NOT NULL PRIMARY KEY,
            ticket_id TEXT,
            ticket_status TEXT,
            ticket_severity TEXT,
            repair_location TEXT,
            action_note TEXT,
            created_by INTEGER,
            updated_at TEXT,
            FOREIGN KEY(mrid) REFERENCES activity_record(mrid) ON DELETE CASCADE
        )
    `)
    await run(dbsql, `
        CREATE TABLE IF NOT EXISTS activity_record_ticket_component (
            mrid TEXT NOT NULL PRIMARY KEY,
            activity_record_ticket_id TEXT NOT NULL,
            component_name TEXT NOT NULL,
            sequence_number INTEGER,
            created_at TEXT,
            FOREIGN KEY(activity_record_ticket_id) REFERENCES activity_record_ticket(mrid) ON DELETE CASCADE
        )
    `)
    await run(dbsql, `
        CREATE INDEX IF NOT EXISTS idx_activity_record_ticket_component_ticket
        ON activity_record_ticket_component(activity_record_ticket_id)
    `)

    const legacy = name => existing.has(name) ? `NULLIF(ar.${name}, '')` : 'NULL'
    const legacyTicketStatus = existing.has('ticket_status')
        ? `COALESCE(NULLIF(ar.ticket_status, ''), CASE ar.severity WHEN 'Completed' THEN 'Closed' WHEN 'InProgress' THEN 'In Progress' END)`
        : `CASE ar.severity WHEN 'Completed' THEN 'Closed' WHEN 'InProgress' THEN 'In Progress' END`
    const legacyTicketSeverity = `CASE WHEN ar.severity IN ('Completed', 'InProgress') THEN NULL ELSE ar.severity END`

    await run(dbsql, `
        INSERT OR IGNORE INTO activity_record_ticket(
            mrid, ticket_id, ticket_status, ticket_severity,
            repair_location, action_note, created_by, updated_at
        )
        SELECT ar.mrid, ${legacy('ticket_id')}, ${legacyTicketStatus}, ${legacyTicketSeverity},
               ${legacy('repair_location')}, ${legacy('action_note')},
               ${existing.has('created_by') ? 'ar.created_by' : 'NULL'},
               ${legacy('updated_at')}
        FROM activity_record ar
        WHERE ar.type = 'Repair'
    `)

    const legacyComponentColumns = await all(dbsql, 'PRAGMA table_info(activity_record_component)')
    if (legacyComponentColumns.length) {
        await run(dbsql, `
            INSERT OR IGNORE INTO activity_record_ticket_component(
                mrid, activity_record_ticket_id, component_name, sequence_number, created_at
            )
            SELECT c.mrid, c.activity_record_id, c.component_name, c.sequence_number, c.created_at
            FROM activity_record_component c
            JOIN activity_record_ticket t ON t.mrid = c.activity_record_id
        `)
    }
}

const normalizeComponents = (activity) => {
    if (Array.isArray(activity.components)) {
        return activity.components.map(component => {
            if (typeof component === 'string') return { mrid: '', name: component }
            return {
                mrid: component.mrid || component.id || '',
                name: component.name || component.component_name || ''
            }
        }).filter(component => String(component.name || '').trim())
    }

    return String(activity.component || '')
        .split(',')
        .map(name => ({ mrid: '', name: name.trim() }))
        .filter(component => component.name)
}

const syncActivityRecordComponents = async (activity, dbsql) => {
    await run(dbsql, 'DELETE FROM activity_record_ticket_component WHERE activity_record_ticket_id = ?', [activity.mrid])
    const components = normalizeComponents(activity)
    const now = new Date().toISOString()

    for (let index = 0; index < components.length; index += 1) {
        const component = components[index]
        const componentMrid = component.mrid || `${activity.mrid}@component-${index + 1}`
        await run(
            dbsql,
            `INSERT INTO activity_record_ticket_component(
                mrid, activity_record_ticket_id, component_name, sequence_number, created_at
            ) VALUES (?, ?, ?, ?, ?)`,
            [componentMrid, activity.mrid, component.name, index + 1, now]
        )
    }
}

const loadComponentsForRows = async (rows, dbsql) => {
    if (!rows.length) return rows
    const placeholders = rows.map(() => '?').join(',')
    const components = await all(
        dbsql,
        `SELECT * FROM activity_record_ticket_component
         WHERE activity_record_ticket_id IN (${placeholders})
         ORDER BY activity_record_ticket_id, sequence_number, mrid`,
        rows.map(row => row.mrid)
    )
    const grouped = components.reduce((map, component) => {
        if (!map[component.activity_record_ticket_id]) map[component.activity_record_ticket_id] = []
        map[component.activity_record_ticket_id].push({
            mrid: component.mrid,
            name: component.component_name,
            sequence_number: component.sequence_number
        })
        return map
    }, {})

    return rows.map(row => {
        const rowComponents = grouped[row.mrid] || []
        return Object.assign({}, row, {
            components: rowComponents,
            component: rowComponents.map(component => component.name).join(', ')
        })
    })
}

const insertActivityCore = async (activity, dbsql) => {
    await run(
        dbsql,
        `INSERT INTO activity_record(
            mrid, status, created_date_time, reason, severity, type, asset, provider, cost
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(mrid) DO UPDATE SET
            status = excluded.status,
            created_date_time = excluded.created_date_time,
            reason = excluded.reason,
            severity = excluded.severity,
            type = excluded.type,
            asset = excluded.asset,
            provider = excluded.provider,
            cost = excluded.cost`,
        [
            activity.mrid,
            activity.status || null,
            activity.created_date_time || null,
            activity.reason || null,
            activity.type === 'Repair' ? (activity.activity_severity || null) : (activity.severity || null),
            activity.type || null,
            activity.asset || null,
            activity.provider || null,
            activity.cost || null
        ]
    )
}

const upsertActivityTicket = async (activity, dbsql) => {
    const now = new Date().toISOString()
    const ticketSeverity = activity.ticket_severity != null
        ? activity.ticket_severity
        : activity.severity
    await run(
        dbsql,
        `INSERT INTO activity_record_ticket(
            mrid, ticket_id, ticket_status, ticket_severity,
            repair_location, action_note, created_by, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(mrid) DO UPDATE SET
            ticket_id = excluded.ticket_id,
            ticket_status = excluded.ticket_status,
            ticket_severity = excluded.ticket_severity,
            repair_location = excluded.repair_location,
            action_note = excluded.action_note,
            created_by = excluded.created_by,
            updated_at = excluded.updated_at`,
        [
            activity.mrid,
            activity.ticket_id || null,
            activity.ticket_status || null,
            ticketSeverity || null,
            activity.repair_location || null,
            activity.action_note || null,
            activity.created_by != null ? activity.created_by : null,
            activity.updated_at || now
        ]
    )
    await syncActivityRecordComponents(activity, dbsql)
}

const updateActivityCore = async (mrid, activity, dbsql) => {
    await run(
        dbsql,
        `UPDATE activity_record SET
            status = ?, created_date_time = ?, reason = ?, severity = ?, type = ?,
            asset = ?, provider = ?, cost = ?
         WHERE mrid = ?`,
        [
            activity.status || null,
            activity.created_date_time || null,
            activity.reason || null,
            activity.type === 'Repair' ? (activity.activity_severity || null) : (activity.severity || null),
            activity.type || null,
            activity.asset || null,
            activity.provider || null,
            activity.cost || null,
            mrid
        ]
    )
    activity.mrid = mrid
}

const ticketSelect = `
    SELECT ar.*,
           art.ticket_id,
           art.ticket_status,
           art.ticket_severity,
           art.repair_location,
           art.action_note,
           art.created_by,
           art.updated_at
    FROM activity_record ar
    LEFT JOIN activity_record_ticket art ON art.mrid = ar.mrid`

const exposeTicketSeverity = row => {
    if (!row || row.type !== 'Repair') return row
    return Object.assign({}, row, {
        activity_severity: row.severity,
        severity: row.ticket_severity
    })
}

export const insertActivityRecordTransaction = async (activity, dbsql) => {
    await ensureActivityRecordSchema(dbsql)
    const identifiedResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction(activity, dbsql)
    if (!identifiedResult.success) {
        throw { success: false, message: 'Insert identified object failed', err: identifiedResult.err }
    }
    await insertActivityCore(activity, dbsql)
    if (activity.type === 'Repair') await upsertActivityTicket(activity, dbsql)
    return { success: true, data: activity, message: 'Insert activity record completed' }
}

export const insertActivityRecord = async (activity) => {
    await ensureActivityRecordSchema(db)
    await run(db, 'BEGIN TRANSACTION')
    try {
        const result = await insertActivityRecordTransaction(activity, db)
        await run(db, 'COMMIT')
        return result
    } catch (err) {
        try { await run(db, 'ROLLBACK') } catch (rollbackError) { /* transaction already closed */ }
        throw { success: false, err, message: 'Insert activity record transaction failed' }
    }
}

export const getActivityRecordById = async (mrid) => {
    try {
        await ensureActivityRecordSchema(db)
        const identifiedResult = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedResult.success) {
            return { success: false, data: null, message: 'Identified object not found' }
        }
        const row = await get(db, `${ticketSelect} WHERE ar.mrid = ?`, [mrid])
        if (!row) return { success: false, data: null, message: 'Activity record not found' }
        const enrichedRows = await loadComponentsForRows([exposeTicketSeverity(row)], db)
        return {
            success: true,
            data: Object.assign({}, identifiedResult.data, enrichedRows[0]),
            message: 'Get activity record completed'
        }
    } catch (err) {
        return { success: false, err, message: 'Get activity record failed' }
    }
}

export const getActivityRecordByAssetId = async (assetId, type = 'Repair') => {
    try {
        await ensureActivityRecordSchema(db)
        const rows = await all(
            db,
            `${ticketSelect}
             WHERE ar.asset = ? AND ar.type = ?
             ORDER BY ar.created_date_time DESC, ar.mrid`,
            [assetId, type]
        )
        if (!rows.length) {
            return { success: false, data: null, message: 'Activity record not found' }
        }
        const data = await loadComponentsForRows(rows.map(exposeTicketSeverity), db)
        return { success: true, data, message: 'Get activity record by asset completed' }
    } catch (err) {
        throw { success: false, err, message: 'Get activity record by asset failed' }
    }
}

export const updateActivityRecordByIdTransaction = async (mrid, activity, dbsql) => {
    await ensureActivityRecordSchema(dbsql)
    const identifiedResult = await identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, activity, dbsql)
    if (!identifiedResult.success) {
        throw { success: false, message: 'Update identified object failed', err: identifiedResult.err }
    }
    await updateActivityCore(mrid, activity, dbsql)
    if (activity.type === 'Repair') {
        await upsertActivityTicket(activity, dbsql)
    } else {
        await run(dbsql, 'DELETE FROM activity_record_ticket WHERE mrid = ?', [mrid])
    }
    return { success: true, data: activity, message: 'Update activity record completed' }
}

export const updateActivityRecordById = async (mrid, activity) => {
    await ensureActivityRecordSchema(db)
    await run(db, 'BEGIN TRANSACTION')
    try {
        const result = await updateActivityRecordByIdTransaction(mrid, activity, db)
        await run(db, 'COMMIT')
        return result
    } catch (err) {
        try { await run(db, 'ROLLBACK') } catch (rollbackError) { /* transaction already closed */ }
        throw { success: false, err, message: 'Update activity record transaction failed' }
    }
}

export const deleteActivityRecordById = async (mrid) => {
    return new Promise((resolve, reject) => {
        identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, db)
            .then(result => {
                if (!result.success) {
                    return reject({ success: false, message: 'Delete identified object failed', err: result.err })
                }
                return resolve({ success: true, message: 'Delete activity record (and components) completed' })
            })
            .catch(err => reject({ success: false, err, message: 'Delete activity record transaction failed' }))
    })
}

export const deleteActivityRecordByIdTransaction = async (mrid, dbsql) => {
    return identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
}
