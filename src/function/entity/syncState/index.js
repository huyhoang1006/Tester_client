import db from '../../datacontext/index'

const nowIso = () => new Date().toISOString()

const normalizeState = (state = {}) => ({
    node_mrid: state.node_mrid || state.nodeMrid || state.mrid,
    node_type: state.node_type || state.nodeType || state.type,
    server_id: state.server_id || state.serverId || null,
    sync_status: state.sync_status || state.syncStatus || 'synced',
    last_synced_at: state.last_synced_at || state.lastSyncedAt || null,
    last_modified_at: state.last_modified_at || state.lastModifiedAt || null,
    last_error: state.last_error || state.lastError || null,
    updated_at: state.updated_at || state.updatedAt || nowIso()
})

const ensureRequired = (state) => {
    if (!state.node_mrid) throw new Error('node_mrid is required')
    if (!state.node_type) throw new Error('node_type is required')
}

export const getSyncStateByMrid = async (nodeMrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM sync_state WHERE node_mrid = ?',
            [nodeMrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get sync state failed' })

                // `db.get` tra undefined khi khong co dong. Tra success:true kem data
                // undefined la noi doi voi cho goi: ho kiem `success` roi dung `.data`
                // ngay, va nhan TypeError. Khong co dong thi phai la success:false.
                if (!row) return resolve({ success: false, data: null, message: 'Not found' })
                return resolve({ success: true, data: row || null, message: 'Get sync state completed' })
            }
        )
    })
}

export const getSyncStatesByMrids = async (nodeMrids = []) => {
    return new Promise((resolve, reject) => {
        const ids = Array.from(new Set((nodeMrids || []).filter(Boolean)))
        if (!ids.length) {
            return resolve({ success: true, data: [], message: 'Get sync states completed' })
        }
        const placeholders = ids.map(() => '?').join(',')
        db.all(
            `SELECT * FROM sync_state WHERE node_mrid IN (${placeholders})`,
            ids,
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get sync states failed' })
                return resolve({ success: true, data: rows || [], message: 'Get sync states completed' })
            }
        )
    })
}

export const getSyncStatesByStatus = async (status) => {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM sync_state WHERE sync_status = ? ORDER BY updated_at DESC',
            [status],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get sync states by status failed' })
                return resolve({ success: true, data: rows || [], message: 'Get sync states by status completed' })
            }
        )
    })
}

export const upsertSyncStateTransaction = async (state, dbsql) => {
    const data = normalizeState(state)
    ensureRequired(data)
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO sync_state (
                node_mrid, node_type, server_id, sync_status,
                last_synced_at, last_modified_at, last_error, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(node_mrid) DO UPDATE SET
                node_type = excluded.node_type,
                server_id = excluded.server_id,
                sync_status = excluded.sync_status,
                last_synced_at = excluded.last_synced_at,
                last_modified_at = excluded.last_modified_at,
                last_error = excluded.last_error,
                updated_at = excluded.updated_at`,
            [
                data.node_mrid,
                data.node_type,
                data.server_id,
                data.sync_status,
                data.last_synced_at,
                data.last_modified_at,
                data.last_error,
                data.updated_at
            ],
            (err) => {
                if (err) return reject({ success: false, err, message: 'Upsert sync state failed' })
                return resolve({ success: true, data, message: 'Upsert sync state completed' })
            }
        )
    })
}

export const upsertSyncState = async (state) => upsertSyncStateTransaction(state, db)

export const markSyncStateTransaction = async (nodeMrid, patch, dbsql) => {
    const current = await getSyncStateByMrid(nodeMrid)
    const currentData = current && current.data ? current.data : {}
    return upsertSyncStateTransaction({
        ...currentData,
        ...patch,
        node_mrid: nodeMrid,
        node_type: patch.node_type || patch.nodeType || currentData.node_type
    }, dbsql)
}

export const markSyncState = async (nodeMrid, patch) => markSyncStateTransaction(nodeMrid, patch, db)

export const markNodeDirty = async (nodeMrid, nodeType, lastError = null) => {
    return markSyncState(nodeMrid, {
        node_type: nodeType,
        sync_status: 'dirty',
        last_modified_at: nowIso(),
        last_error: lastError,
        updated_at: nowIso()
    })
}

export const markExistingNodeDirty = async (nodeMrid, nodeType, lastError = null) => {
    const current = await getSyncStateByMrid(nodeMrid)
    if (!current || !current.data) {
        return { success: true, skipped: true, message: 'No sync state to mark dirty' }
    }
    return markNodeDirty(nodeMrid, nodeType || current.data.node_type, lastError)
}

export const markNodeSyncing = async (nodeMrid, nodeType) => {
    return markSyncState(nodeMrid, {
        node_type: nodeType,
        sync_status: 'syncing',
        last_error: null,
        updated_at: nowIso()
    })
}

export const markNodeSynced = async (nodeMrid, nodeType, serverId = null) => {
    const timestamp = nowIso()
    return markSyncState(nodeMrid, {
        node_type: nodeType,
        server_id: serverId,
        sync_status: 'synced',
        last_synced_at: timestamp,
        last_error: null,
        updated_at: timestamp
    })
}

export const markNodeSyncFailed = async (nodeMrid, nodeType, error) => {
    return markSyncState(nodeMrid, {
        node_type: nodeType,
        sync_status: 'failed',
        last_error: error ? String(error.message || error) : null,
        updated_at: nowIso()
    })
}

export const deleteSyncStateByMridTransaction = async (nodeMrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            'DELETE FROM sync_state WHERE node_mrid = ?',
            [nodeMrid],
            (err) => {
                if (err) return reject({ success: false, err, message: 'Delete sync state failed' })
                return resolve({ success: true, message: 'Delete sync state completed' })
            }
        )
    })
}

export const deleteSyncStateByMrid = async (nodeMrid) => deleteSyncStateByMridTransaction(nodeMrid, db)
