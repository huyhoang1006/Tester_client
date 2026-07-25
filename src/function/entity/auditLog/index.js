import db from '../../datacontext/index'
import ConfigurationEvent from '@/views/Cim/ConfigurationEvent'
import { insertConfigurationEventTransaction } from '@/function/cim/configurationEvent/index'
import uuid from '@/utils/uuid'
import { markExistingNodeDirty } from '../syncState/index'

const DEFAULT_AUDIT_LOG_LIMIT = 10000

export const normaliseAuditValue = (value) => {
    if (value === undefined || value === null) return ''
    if (Array.isArray(value)) return JSON.stringify(value)
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value).trim()
}

export const formatAuditValue = (value) => {
    const normalised = normaliseAuditValue(value)
    return normalised === '' ? '' : `"${normalised}"`
}

const getAuditUser = (user) => {
    const safeUser = user || {}
    return {
        name: safeUser.name || safeUser.user_name || safeUser.userName || 'Unknown',
        id: safeUser.user_id || safeUser.userId || safeUser.id || null
    }
}

const buildChangeDescription = (changes) => {
    if (!Array.isArray(changes) || changes.length === 0) return ''
    return changes
        .map((change) => `${change.field} changed from ${formatAuditValue(change.from)} to ${formatAuditValue(change.to)}`)
        .join('; ')
}

export const buildAuditDescription = (options) => {
    const safeOptions = options || {}
    const objectType = safeOptions.objectType || 'Object'
    const objectName = normaliseAuditValue(safeOptions.objectName) || 'Unnamed'
    const action = safeOptions.action || 'UPDATE'
    const changes = Array.isArray(safeOptions.changes) ? safeOptions.changes : []

    if (safeOptions.description) return safeOptions.description
    if (action === 'INSERT') return `${objectType} created: ${objectName}`
    if (action === 'DELETE') return `${objectType} deleted: ${objectName}`
    if (action === 'ERROR') return `${objectType} failed: ${objectName}`

    const detail = buildChangeDescription(changes)
    if (!detail) return ''
    return `${objectType} updated: ${objectName}. ${detail}`
}

const deleteOldAuditLogs = async (ids, dbsql) => {
    if (!Array.isArray(ids) || ids.length === 0) return
    const placeholders = ids.map(() => '?').join(',')
    await new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM identified_object WHERE mrid IN (${placeholders})`,
            ids,
            function (err) {
                if (err) reject(err)
                else resolve()
            }
        )
    })
}

export const cleanupAuditLogs = async (limit = DEFAULT_AUDIT_LOG_LIMIT, dbsql = db) => {
    if (!limit || limit <= 0) return { success: true, deleted: 0 }

    const rows = await new Promise((resolve, reject) => {
        dbsql.all(
            `SELECT ce.mrid
             FROM configuration_event ce
             LEFT JOIN activity_record ar ON ce.mrid = ar.mrid
             ORDER BY COALESCE(ce.effective_date_time, ar.created_date_time, '') DESC
             LIMIT -1 OFFSET ?`,
            [limit],
            (err, data) => {
                if (err) reject(err)
                else resolve(data || [])
            }
        )
    })

    const ids = rows.map((row) => row.mrid).filter(Boolean)
    await deleteOldAuditLogs(ids, dbsql)
    return { success: true, deleted: ids.length }
}

export const detachAuditLogReference = async (referenceField, objectId, dbsql = db) => {
    const allowedFields = [
        'power_system_resource',
        'changed_location',
        'changed_asset',
        'changed_organisation_role',
        'changed_organisation',
        'changed_person_role',
        'changed_person',
        'changed_attachment'
    ]

    if (!referenceField || allowedFields.indexOf(referenceField) === -1 || !objectId) {
        return { success: true, changed: 0 }
    }

    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE configuration_event SET ${referenceField} = NULL WHERE CAST(${referenceField} AS TEXT) = CAST(? AS TEXT)`,
            [objectId],
            function (err) {
                if (err) reject(err)
                else resolve({ success: true, changed: this.changes || 0 })
            }
        )
    })
}

export const writeAuditLog = async (options, dbsql = db) => {
    const safeOptions = options || {}
    const action = safeOptions.action || 'UPDATE'
    const changes = Array.isArray(safeOptions.changes) ? safeOptions.changes : []

    if (action === 'UPDATE' && changes.length === 0 && !safeOptions.description) {
        return { success: true, skipped: true, message: 'No audit changes to write' }
    }

    const description = buildAuditDescription(safeOptions)
    if (!description) {
        return { success: true, skipped: true, message: 'No audit description to write' }
    }

    const user = getAuditUser(safeOptions.user)
    const configEvent = new ConfigurationEvent()
    configEvent.mrid = uuid.newUuid()
    configEvent.name = safeOptions.objectType || 'Audit log'
    configEvent.effective_date_time = safeOptions.timestamp || new Date().toISOString()
    configEvent.user_name = user.name
    configEvent.modified_by = user.id
    configEvent.type = action
    configEvent.description = description
    configEvent.remark = JSON.stringify({
        objectType: safeOptions.objectType || null,
        objectId: safeOptions.objectId || null,
        objectName: safeOptions.objectName || null,
        action,
        changes,
        timestamp: configEvent.effective_date_time
    })

    const result = await insertConfigurationEventTransaction(configEvent, dbsql)
    if (action === 'UPDATE' && changes.length > 0 && safeOptions.objectId) {
        try {
            await markExistingNodeDirty(safeOptions.objectId, safeOptions.objectType, null)
        } catch (syncError) {
            console.error('Mark sync state dirty failed:', syncError)
        }
    }
    try {
        await cleanupAuditLogs(safeOptions.limit || DEFAULT_AUDIT_LOG_LIMIT, dbsql)
    } catch (cleanupError) {
        console.error('Cleanup audit logs failed:', cleanupError)
    }
    return { ...result, skipped: false }
}

export const tryWriteAuditLog = async (options, dbsql = db) => {
    try {
        return await writeAuditLog(options, dbsql)
    } catch (error) {
        console.error('Write audit log failed:', error)
        return { success: false, error }
    }
}
