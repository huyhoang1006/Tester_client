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
import { insertCapacitorInfoTransaction, getCapacitorInfoById, deleteCapacitorInfoTransaction } from '@/function/cim/capacitorInfo';
import { insertCapacitanceCapacitorInfoTransaction, getCapacitanceCapacitorInfoById, getCapacitanceCapacitorInfoByIds, deleteCapacitanceInfoTransaction } from '@/function/cim/capacitanceInfo';
import { insertDissipationFactorCapacitorInfoTransaction, getDissipationFactorCapacitorInfoById, getDissipationFactorCapacitorInfoByIds, deleteDissipationFactorCapacitorInfoTransaction } from '@/function/cim/dissipationFactorInfo';
import CapacitorEntity from '@/views/Flatten/Capacitor';
import { insertReactivePowerTransaction, getReactivePowerByIds, deleteReactivePowerByIdTransaction } from '@/function/cim/reactivePower';
import { insertCapacitanceTransaction, getCapacitanceById, deleteCapacitanceByIdTransaction } from '@/function/cim/capacitance';
import { insertPercentTransaction, getPercentById, deletePercentByIdTransaction } from '@/function/cim/percent';
import { insertMassTransaction, getMassById, deleteMassByIdTransaction } from '@/function/cim/mass';
export const insertCapacitorEntity = async (old_entity, entity) => {
    try {
        if (entity.asset.mrid === null || entity.asset.mrid === '') {
            return {
                success: false,
                error: new Error("MRID is required for Capacitor Entity"),
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

            // Nếu có old_entity và phase thay đổi, xóa dữ liệu phase cũ
            if (old_entity && old_entity.capacitor && entity.capacitor) {
                const oldPhase = old_entity.capacitor.phase_number;
                const newPhase = entity.capacitor.phase_number;

                // Nếu phase thay đổi (từ 1→3 hoặc 3→1), xóa dữ liệu phase cũ
                if (oldPhase !== newPhase) {
                    // Xóa capacitanceCapacitorInfo cũ và capacitance values
                    if (old_entity.capacitanceCapacitorInfo && old_entity.capacitanceCapacitorInfo.length > 0) {
                        for (const oldCapInfo of old_entity.capacitanceCapacitorInfo) {
                            // Xóa capacitanceCapacitorInfo record
                            if (oldCapInfo.mrid) {
                                await deleteCapacitanceInfoTransaction(oldCapInfo.mrid, db);
                            }
                            // Xóa capacitance value (oldCapInfo.value là mrid của capacitance)
                            if (oldCapInfo.value) {
                                await deleteCapacitanceByIdTransaction(oldCapInfo.value, db);
                            }
                        }
                    }

                    // Xóa dissipationFactorCapacitorInfo cũ và percent values
                    if (old_entity.dissipationFactorCapacitorInfo && old_entity.dissipationFactorCapacitorInfo.length > 0) {
                        for (const oldDfInfo of old_entity.dissipationFactorCapacitorInfo) {
                            // Xóa dissipationFactorCapacitorInfo record
                            if (oldDfInfo.mrid) {
                                await deleteDissipationFactorCapacitorInfoTransaction(oldDfInfo.mrid, db);
                            }
                            // Xóa percent value (oldDfInfo.value là mrid của percent)
                            if (oldDfInfo.value) {
                                await deletePercentByIdTransaction(oldDfInfo.value, db);
                            }
                        }
                    }
                }
            }

            // current flow

            for (const currentFlow of entity.currentFlow) {
                if (currentFlow.mrid) {
                    await insertCurrentFlowTransaction(currentFlow, db);
                }
            }

            // frequency
            for (const frequency of entity.frequency) {
                if (frequency.mrid) {
                    await insertFrequencyTransaction(frequency, db);
                }
            }

            // voltage
            for (const voltage of entity.voltage) {
                if (voltage.mrid) {
                    await insertVoltageTransaction(voltage, db);
                }
            }

            // reactivePower
            for (const reactivePower of entity.reactivePower) {
                if (reactivePower.mrid) {
                    await insertReactivePowerTransaction(reactivePower, db);
                }
            }

            for (const capacitance of entity.capacitance) {
                if (capacitance.mrid) {
                    await insertCapacitanceTransaction(capacitance, db);
                }
            }

            for (const mass of entity.mass) {
                if (mass.mrid) {
                    await insertMassTransaction(mass, db);
                }
            }

            for (const percent of entity.percent) {
                if (percent.mrid) {
                    await insertPercentTransaction(percent, db);
                }
            }
            await insertCapacitorInfoTransaction(entity.capacitor, db);

            // capacitanceInfo
            for (const capacitanceInfo of entity.capacitanceCapacitorInfo) {
                if (capacitanceInfo.mrid) {
                    await insertCapacitanceCapacitorInfoTransaction(capacitanceInfo, db);
                }
            }

            // dissipationFactorInfo
            for (const dissipationFactorInfo of entity.dissipationFactorCapacitorInfo) {
                if (dissipationFactorInfo.mrid) {
                    await insertDissipationFactorCapacitorInfoTransaction(dissipationFactorInfo, db);
                }
            }

            // lifecycleDate
            await insertLifecycleDateTransaction(entity.lifecycleDate, db);

            // productAssetModel
            await insertProductAssetModelTransaction(entity.productAssetModel, db);

            // asset
            await insertAssetTransaction(entity.asset, db);

            // assetPsr
            await insertAssetPsrTransaction(entity.assetPsr, db);

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

            await runAsync('COMMIT');
            deleteBackupFiles(null, entity.asset.mrid);
            return { success: true, data: entity, message: 'Capacitor entity inserted successfully' };
        }
    } catch (error) {
        restoreFiles(null, null, entity.asset.mrid);
        deleteBackupFiles(null, entity.asset.mrid);
        console.error('Error saving Capacitor entity:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            entity: JSON.stringify(entity, null, 2)
        });
        await runAsync('ROLLBACK');
        return { success: false, error, message: `Error saving Capacitor entity: ${error.message || 'Unknown error'}` };
    }
}

export const getCapacitorEntity = async (id, psrId) => {
    try {
        if (id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new CapacitorEntity()
            const dataCapacitor = await getAssetById(id);
            if (dataCapacitor.success) {
                entity.asset = dataCapacitor.data

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

                // Load capacitorInfo trước
                const dataCapacitorInfo = await getCapacitorInfoById(entity.asset.asset_info);
                if (dataCapacitorInfo.success) {
                    entity.capacitor = dataCapacitorInfo.data;
                }

                // Load capacitanceCapacitorInfo
                const dataCapacitanceCapacitorInfo = await getCapacitanceCapacitorInfoByIds([entity.asset.asset_info]);
                if (dataCapacitanceCapacitorInfo.success) {
                    entity.capacitanceCapacitorInfo = dataCapacitanceCapacitorInfo.data;
                }

                // Load dissipationFactorCapacitorInfo
                const dataDissipationFactorCapacitorInfo = await getDissipationFactorCapacitorInfoByIds([entity.asset.asset_info]);
                if (dataDissipationFactorCapacitorInfo.success) {
                    entity.dissipationFactorCapacitorInfo = dataDissipationFactorCapacitorInfo.data;
                }

                // Load lifecycleDate
                const dataLifecycleDate = await getLifecycleDateById(entity.asset.lifecycle_date);
                if (dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }

                // Load các dữ liệu liên quan từ capacitorInfo
                const capacitor_arr = {
                    voltage: ['rated_voltage'],
                    currentFlow: ['rated_current'],
                    frequency: ['rated_frequency'],
                    reactivePower: ['rated_power'],
                    mass: ['weight'],
                }

                let voltage = [];
                let currentFlow = [];
                let frequency = [];
                let reactivePower = [];
                let capacitance = [];
                let mass = [];
                let percent = [];

                for (const key in capacitor_arr) {
                    for (const item of capacitor_arr[key]) {
                        if (entity.capacitor[item]) {
                            switch (key) {
                                case 'voltage':
                                    voltage.push(entity.capacitor[item]);
                                    break;
                                case 'currentFlow':
                                    currentFlow.push(entity.capacitor[item]);
                                    break;
                                case 'frequency':
                                    frequency.push(entity.capacitor[item]);
                                    break;
                                case 'reactivePower':
                                    reactivePower.push(entity.capacitor[item]);
                                    break;
                                case 'mass':
                                    mass.push(entity.capacitor[item]);
                                    break;
                            }
                        }
                    }
                }

                // Load capacitance từ capacitanceCapacitorInfo
                for (const capInfo of entity.capacitanceCapacitorInfo) {
                    if (capInfo.value) {
                        // Tạo object capacitance với mrid từ capInfo và value là ID của capacitance
                        const capacitanceObj = {
                            mrid: capInfo.mrid, // mrid của capacitanceCapacitorInfo record
                            valueId: capInfo.value, // ID của capacitance
                            phase: capInfo.phase || '1' // Sử dụng phase từ capInfo
                        };
                        capacitance.push(capacitanceObj);
                    }
                }

                // Load percent từ dissipationFactorCapacitorInfo
                for (const dfInfo of entity.dissipationFactorCapacitorInfo) {
                    if (dfInfo.value) {
                        const percentObj = {
                            mrid: dfInfo.mrid, // mrid của dissipationFactorCapacitorInfo record
                            valueId: dfInfo.value, // ID của dissipation factor
                            phase: dfInfo.phase || '1' // Sử dụng phase từ dfInfo
                        };
                        percent.push(percentObj);
                    }
                }

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

                // Load reactivePower data
                if (reactivePower.length > 0) {
                    const dataReactivePower = await getReactivePowerByIds(reactivePower);
                    if (dataReactivePower.success) {
                        entity.reactivePower = dataReactivePower.data;
                    }
                }

                // Load capacitance data
                if (capacitance.length > 0) {
                    const capacitanceData = [];
                    for (const capObj of capacitance) {
                        const dataCapacitance = await getCapacitanceById(capObj.valueId);
                        if (dataCapacitance.success) {
                            // Thêm phase và dissipationFactorCapacitorInfo mrid vào dữ liệu capacitance
                            const capacitanceWithPhase = {
                                ...dataCapacitance.data,
                                phase: capObj.phase,
                                capacitanceCapacitorInfo_mrid: capObj.mrid // mrid của capacitanceCapacitorInfo record
                            };
                            capacitanceData.push(capacitanceWithPhase);
                        }
                    }
                    entity.capacitance = capacitanceData;
                }

                // Load mass data
                if (mass.length > 0) {
                    const massData = [];
                    for (const massId of mass) {
                        const dataMass = await getMassById(massId);
                        if (dataMass.success) {
                            massData.push(dataMass.data);
                        }
                    }
                    entity.mass = massData;
                }

                // Load percent data
                if (percent.length > 0) {
                    const percentData = [];
                    for (const percentObj of percent) {
                        const dataPercent = await getPercentById(percentObj.valueId);
                        if (dataPercent.success) {
                            // Thêm phase và dissipationFactorCapacitorInfo mrid vào dữ liệu percent
                            const percentWithPhase = {
                                ...dataPercent.data,
                                phase: percentObj.phase,
                                dissipationFactorCapacitorInfo_mrid: percentObj.mrid // mrid của dissipationFactorCapacitorInfo record
                            };
                            percentData.push(percentWithPhase);
                        }
                    }
                    entity.percent = percentData;
                }

                return {
                    success: true,
                    data: entity,
                    message: 'Capacitor entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataCapacitor.error, message: dataCapacitor.message };
            }
        }
    } catch (error) {
        console.error("Error retrieving Capacitor entity by ID:", error);
        return { success: false, error, message: 'Error retrieving Capacitor entity by ID' };
    }
};
export const deleteCapacitorEntity = async (entity) => {
    try {
        await runAsync('BEGIN TRANSACTION');

        // 1. Xóa attachment trước (thứ tự ngược với insert)
        if (entity.attachment && entity.attachment.id) {
            await deleteAttachmentByIdTransaction(entity.attachment.id, db);
            if (entity.asset && entity.asset.mrid) {
                const dirPath = path.join(attachmentContext.getAttachmentDir(), entity.asset.mrid);
                await deleteDirectory(dirPath);
            }
        }

        // 2. Xóa assetPsr
        if (entity.assetPsr && entity.assetPsr.mrid) {
            await deleteAssetPsrTransaction(entity.assetPsr.mrid, db);
        }

        // 3. Xóa asset
        if (entity.asset && entity.asset.mrid) {
            await deleteAssetByIdTransaction(entity.asset.mrid, db);
        }

        // 4. Xóa productAssetModel
        if (entity.productAssetModel && entity.productAssetModel.mrid) {
            await deleteProductAssetModelByIdTransaction(entity.productAssetModel.mrid, db);
        }

        // 5. Xóa lifecycleDate
        if (entity.lifecycleDate && entity.lifecycleDate.mrid) {
            await deleteLifecycleDateByIdTransaction(entity.lifecycleDate.mrid, db);
        }

        // 6. Xóa dissipationFactorCapacitorInfo
        for (const dissipationFactorInfo of entity.dissipationFactorCapacitorInfo || []) {
            if (dissipationFactorInfo.mrid) {
                await deleteDissipationFactorCapacitorInfoTransaction(dissipationFactorInfo.mrid, db);
            }
        }

        // 7. Xóa capacitanceCapacitorInfo
        for (const capacitanceInfo of entity.capacitanceCapacitorInfo || []) {
            if (capacitanceInfo.mrid) {
                await deleteCapacitanceInfoTransaction(capacitanceInfo.mrid, db);
            }
        }

        // 8. Xóa capacitorInfo
        if (entity.capacitor && entity.capacitor.mrid) {
            await deleteCapacitorInfoTransaction(entity.capacitor.mrid, db);
        }

        // 9. Xóa percent
        for (const percent of entity.percent || []) {
            if (percent.mrid) {
                await deletePercentByIdTransaction(percent.mrid, db);
            }
        }

        // 10. Xóa mass
        for (const mass of entity.mass || []) {
            if (mass.mrid) {
                await deleteMassByIdTransaction(mass.mrid, db);
            }
        }

        // 11. Xóa capacitance
        for (const capacitance of entity.capacitance || []) {
            if (capacitance.mrid) {
                await deleteCapacitanceByIdTransaction(capacitance.mrid, db);
            }
        }

        // 12. Xóa reactivePower
        for (const power of entity.reactivePower || []) {
            if (power.mrid) {
                await deleteReactivePowerByIdTransaction(power.mrid, db);
            }
        }

        // 13. Xóa voltage
        for (const volt of entity.voltage || []) {
            if (volt.mrid) {
                await deleteVoltageByIdTransaction(volt.mrid, db);
            }
        }

        // 14. Xóa frequency
        for (const freq of entity.frequency || []) {
            if (freq.mrid) {
                await deleteFrequencyByIdTransaction(freq.mrid, db);
            }
        }

        // 15. Xóa currentFlow (cuối cùng)
        for (const currentFlow of entity.currentFlow || []) {
            if (currentFlow.mrid) {
                await deleteCurrentFlowByIdTransaction(currentFlow.mrid, db);
            }
        }
        await runAsync('COMMIT');
        return { success: true, message: 'Capacitor entity deleted successfully' };
    } catch (error) {
        await runAsync('ROLLBACK');
        console.error('Error deleting Capacitor entity:', error);
        return { success: false, error, message: 'Error deleting Capacitor entity' };
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