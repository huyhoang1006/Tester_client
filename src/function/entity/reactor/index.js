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
import { insertReactorInfoTransaction, getReactorInfoById, deleteReactorInfoTransaction } from '@/function/cim/reactorInfo';
import ReactorEntity from '@/views/Flatten/Reactor';
import { insertReactivePowerTransaction, getReactivePowerByIds, deleteReactivePowerByIdTransaction } from '@/function/cim/reactivePower';
import { insertMassTransaction, getMassById, deleteMassByIdTransaction } from '@/function/cim/mass';
import { insertInductanceTransaction, getInductanceById, deleteInductanceByIdTransaction } from '@/function/cim/inductance';

export const insertReactorEntity = async (old_entity, entity) => {
    try {
        if (entity.asset.mrid === null || entity.asset.mrid === '') {
            return {
                success: false,
                error: new Error("MRID is required for Reactor Entity"),
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
            console.log("Inserted current flow");

            // frequency
            for (const frequency of entity.frequency) {
                if (frequency.mrid) {
                    await insertFrequencyTransaction(frequency, db);
                }
            }
            console.log("Inserted frequency");

            // voltage
            for (const voltage of entity.voltage) {
                if (voltage.mrid) {
                    await insertVoltageTransaction(voltage, db);
                }
            }
            console.log("Inserted voltage");
            // reactivePower
            for (const reactivePower of entity.reactivePower) {
                if (reactivePower.mrid) {
                    await insertReactivePowerTransaction(reactivePower, db);
                }
            }
            console.log("Inserted reactive power");
            // inductance
            for (const inductance of entity.inductance) {
                if (inductance.mrid) {
                    await insertInductanceTransaction(inductance, db);
                }
            }
            console.log("Inserted inductance");
            // mass
            for (const mass of entity.mass) {
                if (mass.mrid) {
                    await insertMassTransaction(mass, db);
                }
            }
            console.log("Inserted mass");

            await insertReactorInfoTransaction(entity.reactor, db);
            console.log("Inserted reactor info");

            // lifecycleDate
            await insertLifecycleDateTransaction(entity.lifecycleDate, db);
            console.log("Inserted lifecycle date");
            // productAssetModel
            await insertProductAssetModelTransaction(entity.productAssetModel, db);
            console.log("Inserted product asset model");
            // asset
            await insertAssetTransaction(entity.asset, db);
            console.log("Inserted asset");
            // assetPsr
            await insertAssetPsrTransaction(entity.assetPsr, db);
            console.log("Inserted asset psr");
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
            return { success: true, data: entity, message: ' Reactor entity inserted successfully' };
        }
    } catch (error) {
        restoreFiles(null, null, entity.asset.mrid);
        deleteBackupFiles(null, entity.asset.mrid);
        console.error('Error saving Reactor entity:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            entity: JSON.stringify(entity, null, 2)
        });
        await runAsync('ROLLBACK');
        return { success: false, error, message: `Error saving Reactor entity: ${error.message || 'Unknown error'}` };
    }
}

export const getReactorEntity = async (id, psrId) => {
    try {
        if (id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new ReactorEntity()
            const dataReactor = await getAssetById(id);
            if (dataReactor.success) {
                entity.asset = dataReactor.data

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
                const dataReactorInfo = await getReactorInfoById(entity.asset.asset_info);
                if (dataReactorInfo.success) {
                    entity.reactor = dataReactorInfo.data;
                }


                // Load lifecycleDate
                const dataLifecycleDate = await getLifecycleDateById(entity.asset.lifecycle_date);
                if (dataLifecycleDate.success) {
                    entity.lifecycleDate = dataLifecycleDate.data;
                }

                // Load các dữ liệu liên quan từ reactor
                const reactor_arr = {
                    voltage: ['rated_voltage'],
                    currentFlow: ['rated_current'],
                    frequency: ['rated_frequency'],
                    reactivePower: ['rated_power'],
                    inductance: ['inductance'],
                    mass: ['weight_total'],
                }

                let voltage = [];
                let currentFlow = [];
                let frequency = [];
                let reactivePower = [];
                let mass = [];
                let inductance = [];


                for (const key in reactor_arr) {
                    for (const item of reactor_arr[key]) {
                        if (entity.reactor[item]) {
                            switch (key) {
                                case 'voltage':
                                    voltage.push(entity.reactor[item]);
                                    break;
                                case 'currentFlow':
                                    currentFlow.push(entity.reactor[item]);
                                    break;
                                case 'frequency':
                                    frequency.push(entity.reactor[item]);
                                    break;
                                case 'reactivePower':
                                    reactivePower.push(entity.reactor[item]);
                                    break;
                                case 'inductance':
                                    inductance.push(entity.reactor[item]);
                                    break;
                            }
                        }
                    }
                }

                if (entity.productAssetModel.weight_total) {
                    mass.push(entity.productAssetModel.weight_total);
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

                // Load inductance data
                if (inductance.length > 0) {
                    const inductanceData = [];
                    for (const inductanceId of inductance) {
                        const dataInductance = await getInductanceById(inductanceId);
                        if (dataInductance.success) {
                            inductanceData.push(dataInductance.data);
                        }
                    }
                    entity.inductance = inductanceData;
                }

                return {
                    success: true,
                    data: entity,
                    message: 'Reactor entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataReactor.error, message: dataReactor.message };
            }
        }
    } catch (error) {
        console.error("Error retrieving Reactor entity by ID:", error);
        return { success: false, error, message: 'Error retrieving Reactor entity by ID' };
    }
};
export const deleteReactorEntity = async (entity) => {
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