import db from '../../datacontext/index'
import { backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion } from '@/function/entity/attachment'
import { insertVoltageTransaction, deleteVoltageByIdTransaction } from '@/function/cim/voltage';
import { insertSecondsTransaction, deleteSecondsByIdTransaction } from '@/function/cim/seconds';
import { insertCurrentFlowTransaction, deleteCurrentFlowByIdTransaction } from '@/function/cim/currentFlow';
import { insertDisconnectorInfoTransaction } from '@/function/cim/disconnectorInfo';



export const insertDisconnectorEntity = async (old_entity,entity) => {
    try {
        if(entity.asset.mrid === null || entity.asset.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for Disconnector Entity"),
                message: '',
            }
            return result;
        } else {
            backupAllFilesInDir(null, null, entity.asset.mrid);
            const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.asset.mrid);
            if (!syncResult.success) {
                restoreFiles(null, null, entity.asset.mrid);
                deleteBackupFiles(null, entity.asset.mrid);
                const result = {
                    success: false,
                    error: new Error("MRID is required for Disconnector Entity"),
                    message: '',
                }
                return result;
            }
            await runAsync('BEGIN TRANSACTION');
            //voltage
            console.log('start voltage' );
            const oldIds = (old_entity.voltage || []).map(v => v.mrid).filter(id => id);
            const toAdd = entity.voltage.filter(v => v.mrid && !oldIds.includes(v.mrid));
            const toUpdate = entity.voltage.filter(v => v.mrid && oldIds.includes(v.mrid));
            for (const voltage of toAdd) {
                await insertVoltageTransaction(voltage, db);
            }
            for (const voltage of toUpdate) {
                await insertVoltageTransaction(voltage, db);
            }
            console.log('voltage' );
            //seconds
            const oldSecondsIds = (old_entity.seconds || []).map(s => s.mrid).filter(id => id);
            const toAddSeconds = entity.seconds.filter(s => s.mrid && !oldSecondsIds.includes(s.mrid));
            const toUpdateSeconds = entity.seconds.filter(s => s.mrid && oldSecondsIds.includes(s.mrid));
            for (const seconds of toAddSeconds) {
                await insertSecondsTransaction(seconds, db);
            }
            for (const seconds of toUpdateSeconds) {
                await insertSecondsTransaction(seconds, db);
            }
            console.log('seconds' );
            //currentFlow
            const oldCurrentFlowIds = (old_entity.currentFlow || []).map(c => c.mrid).filter(id => id);
            const toAddCurrentFlow = entity.currentFlow.filter(c => c.mrid && !oldCurrentFlowIds.includes(c.mrid));
            const toUpdateCurrentFlow = entity.currentFlow.filter(c => c.mrid && oldCurrentFlowIds.includes(c.mrid));
            for (const currentFlow of toAddCurrentFlow) {
                await insertCurrentFlowTransaction(currentFlow, db);
            }
            for (const currentFlow of toUpdateCurrentFlow) {
                await insertCurrentFlowTransaction(currentFlow, db);
            }
            console.log('currentFlow' );
           //disconnectorInfo
           await insertDisconnectorInfoTransaction(entity.disconnectorInfo, db);
           console.log('disconnectorInfo' );
           await runAsync('COMMIT');
           return { success: true, data: entity, message: 'Insert disconnector entity completed' };

        }
    } catch (error) {
        restoreFiles(null, null, entity.asset.mrid);
        deleteBackupFiles(null, entity.asset.mrid);
        console.error('Error retrieving disconnector entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving disconnector entity' };
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