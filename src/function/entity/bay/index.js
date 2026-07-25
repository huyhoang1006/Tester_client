import db from '../../datacontext/index.js'
import { insertBayTransaction, getBayById, deleteBayByIdTransaction} from '@/function/cim/bay';
import { normaliseAuditValue, tryWriteAuditLog } from '../auditLog/index'

const getBayLogFields = (entity) => ({
    'Name': entity && entity.name,
    'Alias name': entity && entity.alias_name,
    'Comment': entity && entity.description,
    'Energy measurement flag': entity && entity.bay_energy_meas_flag,
    'Power measurement flag': entity && entity.bay_power_meas_flag,
    'Breaker configuration': entity && entity.breaker_configuration,
    'Bus bar configuration': entity && entity.bus_bar_configuration,
    'Substation': entity && entity.substation,
    'Voltage level': entity && entity.voltage_level
})

const getBayChanges = (beforeEntity, afterEntity) => {
    const before = getBayLogFields(beforeEntity)
    const after = getBayLogFields(afterEntity)
    return Object.keys(after)
        .map((field) => ({
            field,
            from: normaliseAuditValue(before[field]),
            to: normaliseAuditValue(after[field])
        }))
        .filter((change) => change.from !== change.to)
}

const getEntityUser = (entity) => {
    const user = entity && entity.user ? entity.user : {}
    return {
        name: user.name || user.user_name || user.username || 'Unknown',
        id: user.user_id || user.id || null
    }
}

const writeBaySaveLog = async (beforeEntity, afterEntity) => {
    const name = normaliseAuditValue(afterEntity && afterEntity.name) || 'Unnamed Bay'
    const changes = beforeEntity ? getBayChanges(beforeEntity, afterEntity) : []
    const result = await tryWriteAuditLog({
        objectType: 'Bay',
        objectId: afterEntity && afterEntity.mrid,
        objectName: name,
        action: beforeEntity ? 'UPDATE' : 'INSERT',
        changes,
        user: getEntityUser(afterEntity)
    })
    return { ...result, changed: beforeEntity ? changes.length > 0 : true }
}

const writeBayDeleteLog = async (entity) => {
    const name = normaliseAuditValue(entity && entity.name) || 'Unnamed Bay'
    await tryWriteAuditLog({
        objectType: 'Bay',
        objectId: entity && entity.mrid,
        objectName: name,
        action: 'DELETE',
        user: getEntityUser(entity)
    })
}

export const insertBayEntity = async (entity) => {
    try {
        if(entity.mrid) {
            const beforeResult = await getBayById(entity.mrid)
            const beforeEntity = beforeResult && beforeResult.success ? beforeResult.data : null
            await runAsync('BEGIN TRANSACTION');
            await insertBayTransaction(entity, db);
            await runAsync('COMMIT');
            const auditResult = await writeBaySaveLog(beforeEntity, entity)
            return { success: true, data: entity, changed: auditResult.changed, message: 'Voltage level entity inserted successfully' };
        } else {
            return { success: false, message: 'Error retrieving voltage entity, id is required'};
        }
    } catch (error) {
        console.error('Error retrieving voltage entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving voltage entity'};
    }
}

export const getBayEntity = async (id) => {
    try {
        const dataBay = await getBayById(id);
        if (dataBay.success) {
            return { success: true, data : dataBay.data, message: 'Bay entity retrieved successfully' };
        } else {
            return { success: false, message: 'Error retrieving bay entity' };
        }
    } catch (error) {
        console.error('Error retrieving bay entity:', error);
        return { success: false, error, message: 'Error retrieving bay entity' };
    }
}

export const deleteBayEntityById = async (data) => {
    try {
        await runAsync('BEGIN TRANSACTION')
        await deleteBayByIdTransaction(data.mrid, db);
        await runAsync('COMMIT');
        await writeBayDeleteLog(data)
        return { success: true, data: data, message: 'Bay deleted successfully' };
    } catch (error) {
        await runAsync('ROLLBACK');
        console.error('Error deleting bay by id:', error);
        return { success: false, error, message: 'Error deleting bay by id' };
    }
}

const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};
