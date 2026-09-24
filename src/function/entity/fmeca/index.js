import db from '../../datacontext/index'
import { v4 as uuidv4 } from 'uuid'
import demoFmeca from '../../../config/fmeca/transformer-condition-assessment-rev1.json'

export const DEMO_FMECA_ID = '11111111-1111-4111-8111-111111111111'

const run = (connection, sql, params = []) => new Promise((resolve, reject) => {
    connection.run(sql, params, (error) => error ? reject(error) : resolve())
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

export const ensureFmecaSchema = async (connection = db) => {
    await run(connection, `CREATE TABLE IF NOT EXISTS fmeca ${tableDefinition}`)

    const columns = new Set((await all(connection, 'PRAGMA table_info(fmeca)')).map(row => row.name))
    if (columns.has('schema_version')) {
        const oldValue = (name) => columns.has(name) ? name : 'NULL'
        await run(connection, 'BEGIN IMMEDIATE')
        try {
            // SQLite 3.33 cannot drop a column, so copy the old rows into the new shape.
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
        for (const name of ['updated_at', 'server_id', 'user_id', 'version', 'scope']) {
            columns.add(name)
        }
    }
    if (!columns.has('updated_at')) {
        await run(connection, 'ALTER TABLE fmeca ADD COLUMN updated_at TEXT')
    }
    if (!columns.has('server_id')) {
        await run(connection, 'ALTER TABLE fmeca ADD COLUMN server_id TEXT')
    }
    if (!columns.has('user_id')) {
        await run(connection, 'ALTER TABLE fmeca ADD COLUMN user_id TEXT REFERENCES "user"(user_id)')
    }
    if (!columns.has('version')) {
        await run(connection, 'ALTER TABLE fmeca ADD COLUMN version TEXT')
    }
    if (!columns.has('scope')) {
        await run(connection, "ALTER TABLE fmeca ADD COLUMN scope TEXT NOT NULL DEFAULT 'user' CHECK(scope IN ('user', 'demo'))")
    }
    await run(connection, `CREATE UNIQUE INDEX IF NOT EXISTS idx_fmeca_user_server
        ON fmeca(user_id, server_id)`)

    const existingDemo = await get(connection, 'SELECT name, version FROM fmeca WHERE id = ?', [DEMO_FMECA_ID])
    if (existingDemo && (existingDemo.name !== demoFmeca.name || existingDemo.version !== demoFmeca.version)) {
        throw new Error('Reserved FMECA demo id belongs to another record')
    }
    await run(connection, `UPDATE fmeca SET scope = 'demo', user_id = NULL, server_id = NULL
        WHERE id = ? AND (scope <> 'demo' OR user_id IS NOT NULL OR server_id IS NOT NULL)`, [DEMO_FMECA_ID])
    await run(connection, `INSERT OR IGNORE INTO fmeca (
        id, name, version, scope, table_fmeca, table_calculate, total, updated_at
    ) VALUES (?, ?, ?, 'demo', ?, ?, NULL, ?)`, [
        DEMO_FMECA_ID,
        demoFmeca.name,
        demoFmeca.version,
        JSON.stringify({ ...demoFmeca.tableFmeca, sourceFile: demoFmeca.sourceFile, sourceSha256: demoFmeca.sourceSha256 }),
        JSON.stringify(demoFmeca.tableCalculate),
        new Date().toISOString()
    ])
}

const parseJson = (value) => {
    if (value === null || value === undefined) return null
    try {
        return JSON.parse(value)
    } catch (error) {
        return value
    }
}

const mapRow = (row) => row && ({
    id: row.server_id || row.id,
    localId: row.id,
    serverId: row.server_id,
    userId: row.user_id,
    scope: row.scope,
    name: row.name,
    version: row.version,
    updatedAt: row.updated_at,
    tableFmeca: parseJson(row.table_fmeca),
    tableCalculate: parseJson(row.table_calculate),
    total: parseJson(row.total)
})

const serializeJson = (value) => {
    if (value === undefined || value === null) return null
    const json = JSON.stringify(value)
    if (json === undefined) throw new TypeError('FMECA data must be JSON-serializable')
    return json
}

const requiredId = (value, label) => {
    const id = String(value || '').trim()
    if (!id) throw new TypeError(`${label} is required`)
    return id
}

export const getFmecaByServerId = async (serverId, userId, connection = db) => {
    const sourceId = requiredId(serverId, 'FMECA server id')
    const ownerId = requiredId(userId, 'User id')
    await ensureFmecaSchema(connection)
    return mapRow(await get(connection,
        "SELECT * FROM fmeca WHERE server_id = ? AND user_id = ? AND scope = 'user'", [sourceId, ownerId]))
}

export const getFmecaById = async (id, userId, connection = db) => {
    const localId = requiredId(id, 'FMECA id')
    const ownerId = requiredId(userId, 'User id')
    await ensureFmecaSchema(connection)
    return mapRow(await get(connection,
        "SELECT * FROM fmeca WHERE id = ? AND (scope = 'demo' OR (scope = 'user' AND user_id = ?))",
        [localId, ownerId]))
}

export const listFmeca = async (userId, connection = db) => {
    const ownerId = requiredId(userId, 'User id')
    await ensureFmecaSchema(connection)
    return (await all(connection,
        `SELECT * FROM fmeca WHERE scope = 'demo' OR (scope = 'user' AND user_id = ?)
         ORDER BY CASE WHEN scope = 'demo' THEN 0 ELSE 1 END, name, version, server_id`, [ownerId])).map(mapRow)
}

export const saveFmeca = async (record, userId, connection = db) => {
    const ownerId = requiredId(userId, 'User id')
    const sourceId = requiredId(record && (record.serverId || record.id), 'FMECA server id')
    if (sourceId === DEMO_FMECA_ID) throw new TypeError('The FMECA demo is read-only')
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
