import db from '../../datacontext/index'
import path from 'path'
import * as attachmentContext from '../../attachmentcontext/index'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import { insertVoltageTransaction, getVoltageByIds, deleteVoltageByIdTransaction } from '@/function/cim/voltage';
import { insertCurrentFlowTransaction, getCurrentFlowByIds, deleteCurrentFlowByIdTransaction } from '@/function/cim/currentFlow';
import { insertLifecycleDateTransaction, getLifecycleDateById, deleteLifecycleDateByIdTransaction } from '@/function/cim/lifecycleDate';
import { insertProductAssetModelTransaction, getProductAssetModelById, deleteProductAssetModelByIdTransaction } from '@/function/cim/productAssetModel';
import { insertAssetPsrTransaction, getAssetPsrByAssetIdAndPsrId, deleteAssetPsrTransaction } from '@/function/entity/assetPsr'
import { insertFrequencyTransaction, getFrequencyByIds, deleteFrequencyByIdTransaction } from '@/function/cim/frequency';
import { insertAssetTransaction, getAssetById, deleteAssetByIdTransaction } from '@/function/cim/asset';
import { insertRotatingMachineInfoTransaction, getRotatingMachineInfoById, deleteRotatingMachineInfoTransaction } from '@/function/cim/rotatingMachineInfo';
import { insertApparentPowerTransaction, getApparentPowerByIds, deleteApparentPowerByIdTransaction } from '@/function/cim/apparentPower';
import RotatingMachineEntity from '@/views/Flatten/RotatingMachine';



export const insertRotatingMachineEntity = async (entity) => {
    try {
        if (entity.asset.mrid === null || entity.asset.mrid === '') {
            return {
                success: false,
                error: new Error("MRID is required for Rotating Machine Entity"),
                message: '',
            };
        } else {
            backupAllFilesInDir(null, null, entity.asset.mrid);
            const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.asset.mrid);

            if (!syncResult.success) {
                restoreFiles(null, null, entity.asset.mrid);
                deleteBackupFiles(null, entity.asset.mrid);
                return {
                    success: false,
                    error: new Error("MRID is required for Rotating Machine Entity"),
                    message: '',
                };
            }
            await runAsync('BEGIN TRANSACTION');

            // current flow
            for (const currentFlow of entity.currentFlow) {
                if (currentFlow.mrid) {
                    await insertCurrentFlowTransaction(currentFlow, db);
                }
            }
            console.log('Inserted current flow');

            // frequency
            for (const frequency of entity.frequency) {
                if (frequency.mrid) {
                    await insertFrequencyTransaction(frequency, db);
                }
            }
            console.log('Inserted frequency');

            // voltage
            for (const voltage of entity.voltage) {
                if (voltage.mrid) {
                    await insertVoltageTransaction(voltage, db);
                }
            }
            console.log('Inserted voltage');

            // apparentPower
            for (const apparentPower of entity.apparentPower) {
                if (apparentPower.mrid) {
                    await insertApparentPowerTransaction(apparentPower, db);
                }
            }
            console.log('Inserted apparentPower');

            await insertRotatingMachineInfoTransaction(entity.rotatingMachine, db);
            console.log('Inserted rotatingMachineInfo');

            // lifecycleDate
            await insertLifecycleDateTransaction(entity.lifecycleDate, db);
            console.log('Inserted lifecycleDate');

            // productAssetModel
            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            console.log('Inserted productAssetModel');

            // asset
            await insertAssetTransaction(entity.asset, db);
            console.log('Inserted asset');

            // assetPsr
            await insertAssetPsrTransaction(entity.assetPsr, db);
            console.log('Inserted assetPsr');

            // attachment
            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                const pathData = JSON.parse(entity.attachment.path);
                const newPath = [];
                for (let i = 0; i < pathData.length; i++) {
                    const namefile = path.basename(pathData[i].path);
                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), entity.asset.mrid, namefile);
                    newPath.push(pathData[i]);
                }
                entity.attachment.path = JSON.stringify(newPath);
                await uploadAttachmentTransaction(entity.attachment, db);
            }
            console.log('Inserted attachment');

            await runAsync('COMMIT');
            deleteBackupFiles(null, entity.asset.mrid);
            return { success: true, data: entity, message: 'Rotating machine entity inserted successfully' };
        }
    } catch (error) {
        restoreFiles(null, null, entity.asset.mrid);
        deleteBackupFiles(null, entity.asset.mrid);
        console.error('Error retrieving Rotating Machine entity:', error);
        await runAsync('ROLLBACK');
        return { success: false, error, message: 'Error retrieving Rotating Machine entity' };
    }
}

export const getRotatingMachineEntity = async (id, psrId) => {
    try {
        if (id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new RotatingMachineEntity()
            const dataRotatingMachine = await getAssetById(id);
            console.log('getAssetById result:', dataRotatingMachine);
            if (dataRotatingMachine.success) {
                entity.asset = dataRotatingMachine.data
                const dataLifecycleDate = await getLifecycleDateById(entity.asset.lifecycle_date);
                if (dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }

                const dataRotatingMachineInfo = await getRotatingMachineInfoById(entity.asset.asset_info);
                console.log('getRotatingMachineInfoById result:', dataRotatingMachineInfo);
                if (dataRotatingMachineInfo.success) {
                    entity.rotatingMachine = dataRotatingMachineInfo.data;
                }


                const dataProductAssetModel = await getProductAssetModelById(entity.asset.product_asset_model);
                if (dataProductAssetModel.success) {
                    entity.productAssetModel = dataProductAssetModel.data;
                }

                const dataAssetPsr = await getAssetPsrByAssetIdAndPsrId(entity.asset.mrid, psrId);
                if (dataAssetPsr.success) {
                    entity.assetPsr = dataAssetPsr.data;
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.asset.mrid, 'asset');
                if (dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                const rotating_arr = {
                    voltage: ['rated_u', 'rated_ufd'],
                    currentFlow: ['rated_current', 'rated_ifd'],
                    frequency: ['rated_frequency'],
                    apparentPower: ['rated_power'],
                }

                let voltage = [];
                let currentFlow = [];
                let frequency = [];
                let apparentPower = [];

                for (const key in rotating_arr) {
                    for (const item of rotating_arr[key]) {
                        console.log(`Processing ${key}.${item}:`, entity.rotatingMachine[item]);
                        if (entity.rotatingMachine[item]) {
                            switch (key) {
                                case 'voltage':
                                    voltage.push(entity.rotatingMachine[item]);
                                    break;
                                case 'currentFlow':
                                    currentFlow.push(entity.rotatingMachine[item]);
                                    break;
                                case 'frequency':
                                    frequency.push(entity.rotatingMachine[item]);
                                    break;
                                case 'apparentPower':
                                    apparentPower.push(entity.rotatingMachine[item]);
                                    break;
                            }
                        }
                    }
                }

                console.log('Collected IDs:', { voltage, currentFlow, frequency, apparentPower });

                // Load voltage data
                if (voltage.length > 0) {
                    const dataVoltage = await getVoltageByIds(voltage);
                    if (dataVoltage.success) {
                        entity.voltage = dataVoltage.data;
                    }
                }

                // Load currentFlow data
                if (currentFlow.length > 0) {
                    const dataCurrentFlow = await getCurrentFlowByIds(currentFlow);
                    if (dataCurrentFlow.success) {
                        entity.currentFlow = dataCurrentFlow.data;
                    }
                }

                // Load frequency data
                if (frequency.length > 0) {
                    const dataFrequency = await getFrequencyByIds(frequency);
                    if (dataFrequency.success) {
                        entity.frequency = dataFrequency.data;
                    }
                }

                // Load apparentPower data
                if (apparentPower.length > 0) {
                    const dataApparentPower = await getApparentPowerByIds(apparentPower);
                    if (dataApparentPower.success) {
                        entity.apparentPower = dataApparentPower.data;
                    }
                }
                return {
                    success: true,
                    data: entity,
                    message: 'Rotating Machine entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataRotatingMachine.error, message: dataRotatingMachine.message };
            }
        }
    } catch (error) {
        console.error("Error retrieving Rotating Machine entity by ID:", error);
        return { success: false, error, message: 'Error retrieving Rotating Machine entity by ID' };
    }
};
export const deleteRotatingMachineEntity = async (entity) => {
    try {
        await runAsync('BEGIN TRANSACTION');

        // Xóa attachment trước
        if (entity.attachment && entity.attachment.id) {
            await deleteAttachmentByIdTransaction(entity.attachment.id, db);
            // Xóa thư mục vật lý nếu cần
            if (entity.asset && entity.asset.mrid) {
                const dirPath = path.join(attachmentContext.getAttachmentDir(), entity.asset.mrid);
                await deleteDirectory(dirPath);
            }
        }
        console.log('1')

        // Xóa assetPsr
        if (entity.assetPsr && entity.assetPsr.mrid) {
            await deleteAssetPsrTransaction(entity.assetPsr.mrid, db);
        }
        console.log('2')
        // Xóa asset
        if (entity.asset && entity.asset.mrid) {
            await deleteAssetByIdTransaction(entity.asset.mrid, db);
        }
        console.log('3')
        // Xóa productAssetModel
        if (entity.productAssetModel && entity.productAssetModel.mrid) {
            await deleteProductAssetModelByIdTransaction(entity.productAssetModel.mrid, db);
        }
        console.log('4')
        // Xóa lifecycleDate
        if (entity.lifecycleDate && entity.lifecycleDate.mrid) {
            await deleteLifecycleDateByIdTransaction(entity.lifecycleDate.mrid, db);
        }
        console.log('5')
        // Xóa rotatingMachineInfo
        if (entity.rotatingMachine && entity.rotatingMachine.mrid) {
            await deleteRotatingMachineInfoTransaction(entity.rotatingMachine.mrid, db);
        }
        console.log('6')
        // Xóa các bảng liên quan đến dòng điện, điện áp, tần số, công suất biểu kiến
        for (const currentFlow of entity.currentFlow || []) {
            if (currentFlow.mrid) await deleteCurrentFlowByIdTransaction(currentFlow.mrid, db);
        }
        console.log('7')
        for (const volt of entity.voltage || []) {
            if (volt.mrid) await deleteVoltageByIdTransaction(volt.mrid, db);
        }
        console.log('8')
        for (const freq of entity.frequency || []) {
            if (freq.mrid) await deleteFrequencyByIdTransaction(freq.mrid, db);
        }
        console.log('9')
        for (const power of entity.apparentPower || []) {
            if (power.mrid) await deleteApparentPowerByIdTransaction(power.mrid, db);
        }

        console.log('10')

        await runAsync('COMMIT');
        return { success: true, message: 'Rotating Machine entity deleted successfully' };
    } catch (error) {
        await runAsync('ROLLBACK');
        console.error('Error deleting Rotating Machine entity:', error);
        return { success: false, error, message: 'Error deleting Rotating Machine entity' };
    }
};


const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};