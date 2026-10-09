import db from '../../datacontext/index'
import {v4 as uuidv4} from 'uuid'
import demoFmeca from '../../../config/fmeca/transformer-condition-assessment-rev1.json'

export const DEMO_FMECA_ID = '11111111-1111-4111-8111-111111111111'
export const DEFAULT_FMECA_NAME = 'ATDigital FMECA'

const run = (connection, sql, params = []) => new Promise((resolve, reject) => {
    connection.run(sql, params, error => error ? reject(error) : resolve())
})

const get = (connection, sql, params = []) => new Promise((resolve, reject) => {
    connection.get(sql, params, (error, row) => error ? reject(error) : resolve(row || null))
})

const all = (connection, sql, params = []) => new Promise((resolve, reject) => {
    connection.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows || []))
})

const tableDefinition = `(
        id TEXT NOT NULL PRIMARY KEY,
        table_fmeca TEXT,
        table_calculate TEXT,
        total TEXT,
        name TEXT,
        updated_at TEXT,
        server_id TEXT,
        user_id TEXT REFERENCES "user"(user_id),
        version TEXT,
        scope TEXT NOT NULL DEFAULT 'user' CHECK(scope IN ('user', 'demo'))
    )`

const requiredId = (value, label) => {
    const id = String(value || '').trim()
    if (!id) throw new TypeError(`${label} is required`)
    return id
}

const requiredName = value => {
    const name = String(value || '').trim()
    if (!name) throw new TypeError('FMECA name is required')
    return name
}

const parseJson = value => {
    if (value === null || value === undefined) return null
    try {
        return JSON.parse(value)
    } catch (error) {
        return value
    }
}

const serializeJson = value => {
    if (value === undefined || value === null) return null
    const json = JSON.stringify(value)
    if (json === undefined) throw new TypeError('FMECA data must be JSON-serializable')
    return json
}

const mapRow = (row, hiSourceId = null) => row && ({
    id: row.server_id || row.id,
    localId: row.id,
    serverId: row.server_id,
    userId: row.user_id,
    scope: row.scope,
    protected: row.id === DEMO_FMECA_ID,
    isHiSource: row.id === hiSourceId,
    name: row.id === DEMO_FMECA_ID ? DEFAULT_FMECA_NAME : row.name,
    version: row.version,
    updatedAt: row.updated_at,
    tableFmeca: parseJson(row.table_fmeca),
    tableCalculate: parseJson(row.table_calculate),
    total: parseJson(row.total)
})

const accessibleRow = async (connection, id, userId) => get(connection,
    `SELECT * FROM fmeca
     WHERE id = ? AND (scope = 'demo' OR (scope = 'user' AND user_id = ?))`, [id, userId])

const ensureHiSource = async (connection, userId) => {
    const current = await get(connection, 'SELECT hi_fmeca_id FROM fmeca_settings WHERE user_id = ?', [userId])
    if (current) {
        const source = await accessibleRow(connection, current.hi_fmeca_id, userId)
        if (source) return current.hi_fmeca_id
    }
    await run(connection, `INSERT INTO fmeca_settings (user_id, hi_fmeca_id)
        VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET hi_fmeca_id = excluded.hi_fmeca_id`,
    [userId, DEMO_FMECA_ID])
    return DEMO_FMECA_ID
}

export const ensureFmecaSchema = async (connection = db) => {
    await run(connection, `CREATE TABLE IF NOT EXISTS fmeca ${tableDefinition}`)

    const columns = new Set((await all(connection, 'PRAGMA table_info(fmeca)')).map(row => row.name))
    if (columns.has('schema_version')) {
        const oldValue = name => columns.has(name) ? name : 'NULL'
        await run(connection, 'BEGIN IMMEDIATE')
        try {
            await run(connection, `CREATE TABLE fmeca_migration ${tableDefinition}`)
            await run(connection, `INSERT INTO fmeca_migration (
                id, table_fmeca, table_calculate, total, name, updated_at, server_id, user_id, version, scope
            ) SELECT id, table_fmeca, table_calculate, total, name,
                ${oldValue('updated_at')}, ${oldValue('server_id')},
                ${oldValue('user_id')}, ${oldValue('version')},
                ${columns.has('scope') ? 'scope' : "'user'"}
            FROM fmeca`)
            await run(connection, 'DROP TABLE fmeca')
            await run(connection, 'ALTER TABLE fmeca_migration RENAME TO fmeca')
            await run(connection, 'COMMIT')
        } catch (error) {
            await run(connection, 'ROLLBACK')
            throw error
        }
        columns.delete('schema_version')
        for (const name of ['updated_at', 'server_id', 'user_id', 'version', 'scope']) columns.add(name)
    }
    if (!columns.has('updated_at')) await run(connection, 'ALTER TABLE fmeca ADD COLUMN updated_at TEXT')
    if (!columns.has('server_id')) await run(connection, 'ALTER TABLE fmeca ADD COLUMN server_id TEXT')
    if (!columns.has('user_id')) {
        await run(connection, 'ALTER TABLE fmeca ADD COLUMN user_id TEXT REFERENCES "user"(user_id)')
    }
    if (!columns.has('version')) await run(connection, 'ALTER TABLE fmeca ADD COLUMN version TEXT')
    if (!columns.has('scope')) {
        await run(connection, "ALTER TABLE fmeca ADD COLUMN scope TEXT NOT NULL DEFAULT 'user' CHECK(scope IN ('user', 'demo'))")
    }
    await run(connection, `CREATE UNIQUE INDEX IF NOT EXISTS idx_fmeca_user_server
        ON fmeca(user_id, server_id)`)
    await run(connection, `CREATE TABLE IF NOT EXISTS fmeca_settings (
        user_id TEXT NOT NULL PRIMARY KEY,
        hi_fmeca_id TEXT NOT NULL
    )`)

    const existingDemo = await get(connection, 'SELECT id FROM fmeca WHERE id = ?', [DEMO_FMECA_ID])
    if (!existingDemo) {
        await run(connection, `INSERT INTO fmeca (
            id, name, version, scope, table_fmeca, table_calculate, total, updated_at
        ) VALUES (?, ?, ?, 'demo', ?, ?, NULL, ?)`, [
            DEMO_FMECA_ID,
            DEFAULT_FMECA_NAME,
            demoFmeca.version,
            JSON.stringify({...demoFmeca.tableFmeca, sourceFile: demoFmeca.sourceFile, sourceSha256: demoFmeca.sourceSha256}),
            JSON.stringify(demoFmeca.tableCalculate),
            new Date().toISOString()
        ])
    }
    await run(connection, `UPDATE fmeca SET name = ?, scope = 'demo', user_id = NULL, server_id = NULL
        WHERE id = ?`, [DEFAULT_FMECA_NAME, DEMO_FMECA_ID])
}

export const getFmecaByServerId = async (serverId, userId, connection = db) => {
    const sourceId = requiredId(serverId, 'FMECA server id')
    const ownerId = requiredId(userId, 'User id')
    await ensureFmecaSchema(connection)
    const hiSourceId = await ensureHiSource(connection, ownerId)
    return mapRow(await get(connection,
        "SELECT * FROM fmeca WHERE server_id = ? AND user_id = ? AND scope = 'user'", [sourceId, ownerId]), hiSourceId)
}

export const getFmecaById = async (id, userId, connection = db) => {
    const localId = requiredId(id, 'FMECA id')
    const ownerId = requiredId(userId, 'User id')
    await ensureFmecaSchema(connection)
    const hiSourceId = await ensureHiSource(connection, ownerId)
    return mapRow(await accessibleRow(connection, localId, ownerId), hiSourceId)
}

export const listFmeca = async (userId, connection = db) => {
    const ownerId = requiredId(userId, 'User id')
    await ensureFmecaSchema(connection)
    const hiSourceId = await ensureHiSource(connection, ownerId)
    return (await all(connection,
        `SELECT * FROM fmeca WHERE scope = 'demo' OR (scope = 'user' AND user_id = ?)
         ORDER BY CASE WHEN scope = 'demo' THEN 0 ELSE 1 END, name, version, server_id`, [ownerId]))
        .map(row => mapRow(row, hiSourceId))
}

export const createFmeca = async (input, userId, connection = db) => {
    const ownerId = requiredId(userId, 'User id')
    const name = requiredName(input && input.name)
    const templateId = requiredId(input && input.templateId, 'Template FMECA id')
    await ensureFmecaSchema(connection)
    const template = await accessibleRow(connection, templateId, ownerId)
    if (!template) throw new TypeError('FMECA template was not found')
    const id = uuidv4()
    await run(connection, 'INSERT OR IGNORE INTO "user"(user_id) VALUES (?)', [ownerId])
    await run(connection, `INSERT INTO fmeca (
        id, server_id, user_id, scope, name, table_fmeca, table_calculate, total, version, updated_at
    ) VALUES (?, NULL, ?, 'user', ?, ?, ?, ?, ?, ?)`, [
        id,
        ownerId,
        name,
        template.table_fmeca,
        template.table_calculate,
        template.total,
        template.version || 'local',
        new Date().toISOString()
    ])
    return getFmecaById(id, ownerId, connection)
}

export const updateFmeca = async (record, userId, connection = db) => {
    const ownerId = requiredId(userId, 'User id')
    const localId = requiredId(record && (record.localId || record.id), 'FMECA id')
    await ensureFmecaSchema(connection)
    const existing = await accessibleRow(connection, localId, ownerId)
    if (!existing) throw new TypeError('FMECA was not found')
    if (existing.scope !== 'demo' && existing.user_id !== ownerId) throw new TypeError('FMECA is not editable')

    await run(connection, `UPDATE fmeca SET
        table_fmeca = ?, table_calculate = ?, total = ?, updated_at = ?
        WHERE id = ?`, [
        serializeJson(record.tableFmeca),
        serializeJson(record.tableCalculate),
        serializeJson(record.total),
        new Date().toISOString(),
        localId
    ])
    return getFmecaById(localId, ownerId, connection)
}

export const renameFmeca = async (id, name, userId, connection = db) => {
    const ownerId = requiredId(userId, 'User id')
    const localId = requiredId(id, 'FMECA id')
    const nextName = requiredName(name)
    if (localId === DEMO_FMECA_ID) throw new TypeError('ATDigital FMECA cannot be renamed')
    await ensureFmecaSchema(connection)
    const existing = await accessibleRow(connection, localId, ownerId)
    if (!existing || existing.scope !== 'user') throw new TypeError('FMECA was not found')
    await run(connection, 'UPDATE fmeca SET name = ?, updated_at = ? WHERE id = ? AND user_id = ?',
        [nextName, new Date().toISOString(), localId, ownerId])
    return getFmecaById(localId, ownerId, connection)
}

export const deleteFmeca = async (id, userId, connection = db) => {
    const ownerId = requiredId(userId, 'User id')
    const localId = requiredId(id, 'FMECA id')
    if (localId === DEMO_FMECA_ID) throw new TypeError('ATDigital FMECA cannot be deleted')
    await ensureFmecaSchema(connection)
    const existing = await accessibleRow(connection, localId, ownerId)
    if (!existing || existing.scope !== 'user') throw new TypeError('FMECA was not found')

    await run(connection, 'BEGIN IMMEDIATE')
    try {
        const current = await get(connection, 'SELECT hi_fmeca_id FROM fmeca_settings WHERE user_id = ?', [ownerId])
        if (current && current.hi_fmeca_id === localId) {
            await run(connection, 'UPDATE fmeca_settings SET hi_fmeca_id = ? WHERE user_id = ?',
                [DEMO_FMECA_ID, ownerId])
        }
        await run(connection, "DELETE FROM fmeca WHERE id = ? AND user_id = ? AND scope = 'user'", [localId, ownerId])
        await run(connection, 'COMMIT')
    } catch (error) {
        await run(connection, 'ROLLBACK')
        throw error
    }
    return {deleted: true, hiSourceId: await ensureHiSource(connection, ownerId)}
}

export const setHiFmeca = async (id, userId, connection = db) => {
    const ownerId = requiredId(userId, 'User id')
    const localId = requiredId(id, 'FMECA id')
    await ensureFmecaSchema(connection)
    if (!await accessibleRow(connection, localId, ownerId)) throw new TypeError('FMECA was not found')
    await run(connection, `INSERT INTO fmeca_settings (user_id, hi_fmeca_id)
        VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET hi_fmeca_id = excluded.hi_fmeca_id`,
    [ownerId, localId])
    return {hiSourceId: localId}
}

export const saveFmeca = async (record, userId, connection = db) => {
    const ownerId = requiredId(userId, 'User id')
    if (record && record.localId) return updateFmeca(record, ownerId, connection)
    const sourceId = requiredId(record && (record.serverId || record.id), 'FMECA server id')
    if (sourceId === DEMO_FMECA_ID) throw new TypeError('ATDigital FMECA cannot be replaced from the server')
    const version = requiredId(record.version, 'FMECA standard version')
    await ensureFmecaSchema(connection)
    await run(connection, 'INSERT OR IGNORE INTO "user"(user_id) VALUES (?)', [ownerId])
    await run(connection, `INSERT INTO fmeca (
        id, server_id, user_id, scope, name, table_fmeca, table_calculate, total, version, updated_at
    ) VALUES (?, ?, ?, 'user', ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, server_id) DO UPDATE SET
        name = excluded.name,
        table_fmeca = excluded.table_fmeca,
        table_calculate = excluded.table_calculate,
        total = excluded.total,
        version = excluded.version,
        updated_at = excluded.updated_at`, [
        uuidv4(),
        sourceId,
        ownerId,
        record.name || null,
        serializeJson(record.tableFmeca),
        serializeJson(record.tableCalculate),
        serializeJson(record.total),
        version,
        new Date().toISOString()
    ])
    return getFmecaByServerId(sourceId, ownerId, connection)
}
