import db from '../../datacontext/index'
import path from 'path'
import * as attachmentContext from '../../attachmentcontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import {insertBushingTransaction, getBushingById, deleteBushingTransaction} from '@/function/cim/bushing';
import {insertVoltageTransaction, getVoltageById, deleteVoltageByIdTransaction} from '@/function/cim/voltage';
import {insertPercentTransaction, getPercentById} from '@/function/cim/percent'
import {insertCapacitanceTransaction, getCapacitanceById} from '@/function/cim/capacitance'
import {insertCurrentFlowTransaction, getCurrentFlowById, deleteCurrentFlowByIdTransaction} from '@/function/cim/currentFlow';
import {insertFrequencyTransaction, deleteFrequencyByIdTransaction, getFrequencyById} from '@/function/cim/frequency'
import {insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction} from '@/function/cim/lifecycleDate';
import {insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction} from '@/function/cim/productAssetModel';
import {insertAssetPsrTransaction, getAssetPsrById, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction} from '@/function/entity/assetPsr'
import { insertOldBushingInfoTransaction, getOldBushingInfoById, deleteOldBushingInfoTransaction } from '@/function/cim/oldBushingInfo';
import BushingEntity from '@/views/Entity/Bushing';

export const insertBushingEntity = async (entity) => {
    try {
        if(entity.bushing.mrid === null || entity.bushing.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for bushing Entity"),
                message: '',
            }
            return result;
        } else {
            backupAllFilesInDir(null, null, entity.bushing.mrid);
            const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.bushing.mrid);
            if (!syncResult.success) {
                restoreFiles(null, null, entity.bushing.mrid);
                deleteBackupFiles(null, entity.bushing.mrid);
                const result = {
                    success: false,
                    error: new Error("MRID is required for bushing Entity"),
                    message: '',
                }
                return result;
            }
            await runAsync('BEGIN TRANSACTION');

            //voltage
            for (const voltage of entity.voltage) {
                await insertVoltageTransaction(voltage, db);
            }

            //currentFlow
            for (const currentFlow of entity.currentFlow) {
                await insertCurrentFlowTransaction(currentFlow, db);
            }

            //frequency
            for (const frequency of entity.frequency) {
                await insertFrequencyTransaction(frequency, db);
            }

            //percent
            for (const percent of entity.percent) {
                await insertPercentTransaction(percent, db);
            }

            //capacitance
            for (const capacitance of entity.capacitance) {
                await insertCapacitanceTransaction(capacitance, db);
            }

            await insertLifecycleDateTransaction(entity.lifecycleDate, db);
            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            await insertOldBushingInfoTransaction(entity.oldBushingInfo, db)
            await insertBushingTransaction(entity.bushing, db);
            await insertAssetPsrTransaction(entity.assetPsr, db);

            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                const pathData = JSON.parse(entity.attachment.path);
                const newPath = []
                for(let i = 0; i < pathData.length; i++) {
                    const namefile = path.basename(pathData[i].path);
                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), entity.bushing.mrid, namefile);
                    newPath.push(pathData[i]);
                }
                entity.attachment.path = JSON.stringify(newPath);
                await uploadAttachmentTransaction(entity.attachment, db);
            }

            await runAsync('COMMIT');
            deleteBackupFiles(null, entity.bushing.mrid);
            return { success: true, data: entity, message: 'Bushing entity inserted successfully' };
        }
    } catch (error) {
        restoreFiles(null, null, entity.bushing.mrid);
        deleteBackupFiles(null, entity.bushing.mrid);
        console.error('Error retrieving bushing entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving bushing entity' };
    }
}

export const getBushingEntityById = async (id, psrId) => {
    try {
        if(id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new BushingEntity()
            const dataBushing = await getBushingById(id);
            if(dataBushing.success) {
                entity.bushing = dataBushing.data
                const dataLifecycleDate = await getLifecycleDateById(entity.bushing.lifecycle_date);
                if(dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }
                const dataOldBushingInfo = await getOldBushingInfoById(entity.bushing.asset_info);
                if(dataOldBushingInfo.success) {
                    entity.oldBushingInfo = dataOldBushingInfo.data;
                }
                
                const productAssetModelId = entity.oldBushingInfo.product_asset_model;
                const dataProductAssetModel = await getProductAssetModelById(productAssetModelId);
                if(dataProductAssetModel.success) {
                    entity.productAssetModel = dataProductAssetModel.data;
                }
                
                const dataAssetPsr = await getAssetPsrByAssetIdAndPsrId(entity.bushing.mrid, psrId);
                if(dataAssetPsr.success) {
                    entity.assetPsr = dataAssetPsr.data;
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.bushing.mrid, 'asset');
                if(dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                const voltageArr = ['high_voltage_limit','rated_impulse_withstand_voltage', 'rated_line_to_ground_voltage']
                const currentFlowArr = ['rated_current']
                const percentArr = ['c2_power_factor', 'c_power_factor']
                const capacitanceArr = ['c2_capacitance', 'c_capacitance']
                const frequencyArr = ['rated_frequency']

                for(let attribute of voltageArr) {
                    const voltage = await getVoltageById(entity.oldBushingInfo[attribute])
                    if(voltage.success) {
                        entity.voltage.push(voltage.data);
                    }
                }

                for(let attribute of currentFlowArr) {
                    const currentFlow = await getCurrentFlowById(entity.oldBushingInfo[attribute])
                    if(currentFlow.success) {
                        entity.currentFlow.push(currentFlow.data);
                    }
                }

                for(let attribute of percentArr) {
                    const percent = await getPercentById(entity.oldBushingInfo[attribute])
                    if(percent.success) {
                        entity.percent.push(percent.data);
                    }
                }

                for(let attribute of capacitanceArr) {
                    const capacitance = await getCapacitanceById(entity.oldBushingInfo[attribute])
                    if(capacitance.success) {
                        entity.capacitance.push(capacitance.data);
                    }
                }

                for(let attribute of frequencyArr) {
                    const frequency = await getFrequencyById(entity.oldBushingInfo[attribute])
                    if(frequency.success) {
                        entity.frequency.push(frequency.data);
                    }
                }

                return {
                    success: true,
                    data: entity,
                    message: 'Bushing entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataBushing.error, message: dataBushing.message };
            }
        }
    } catch (error) {
        console.error("Error retrieving Bushing entity by ID:", error);
        return { success: false, error, message: 'Error retrieving Bushing entity by ID' };
    }
}

export const deleteBushingEntity = async (data) => {
    try {
        if(data.bushing == null || data.bushing.mrid == null || data.bushing.mrid === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            try {
                await runAsync('BEGIN TRANSACTION');
                if(data.attachment && data.attachment.id) {
                    const pathData = JSON.parse(data.attachment.path || '[]')
                    if (Array.isArray(pathData) && pathData.length > 0) {
                        syncFilesWithDeletion(pathData, null, data.mrid);
                    }
                }
                if( data.attachment.id) {
                    await deleteAttachmentByIdTransaction(data.attachment.id, db);
                }
                if(data.assetPsr && data.assetPsr.mrid) {
                    await deleteAssetPsrTransaction(data.assetPsr.mrid, db);
                }
                
                if (data.oldBushingInfo.mrid) {
                    await deleteOldBushingInfoTransaction(data.oldBushingInfo.mrid, db);
                }
                
                if(data.bushing.mrid) {
                    await deleteBushingTransaction(data.bushing.mrid, db);
                }

                if(data.lifecycleDate && data.lifecycleDate.mrid) {
                    await deleteLifecycleDateByIdTransaction(data.lifecycleDate.mrid, db);
                }

                if(data.productAssetModel && data.productAssetModel.mrid) {
                    await deleteProductAssetModelByIdTransaction(data.productAssetModel.mrid, db);
                }

                for (const voltage of data.voltage) {
                    if (voltage.mrid) {
                        await deleteVoltageByIdTransaction(voltage.mrid, db);
                    }
                }
                for (const frequency of data.frequency) {
                    if (frequency.mrid) {
                        await deleteFrequencyByIdTransaction(frequency.mrid, db);
                    }
                }
                for (const currentFlow of data.currentFlow) {
                    if (currentFlow.mrid) {
                        await deleteCurrentFlowByIdTransaction(currentFlow.mrid, db);
                    }
                }
                await runAsync('COMMIT');
                if(data.attachment && data.attachment.id) {
                    deleteDirectory(null, data.bushing.mrid);
                }
                return { success: true, message: 'Bushing entity deleted successfully' };
            } catch (error) {
                await runAsync('ROLLBACK');
                console.error('Error deleting Bushing entity:', error);
                return { success: false, error, message: 'Error deleting Bushing entity' };
            }
        }
    } catch (error) {
        console.error('Error deleting Bushing entity:', error);
        return { success: false, error, message: 'Error deleting Bushing entity' };
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