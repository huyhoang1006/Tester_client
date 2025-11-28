import db from '../../datacontext/index'
import * as attachmentContext from '../../attachmentcontext/index'
import OrganisationEntity from '@/views/Flatten/Organisation'
import { insertStreetDetailTransaction, getStreetDetailById, deleteStreetDetailByIdTransaction } from '@/function/cim/streetDetail'
import { insertTownDetailTransaction, getTownDetailById, deleteTownDetailByIdTransaction } from '@/function/cim/townDetail'
import { insertStreetAddressTransaction, getStreetAddressById, deleteStreetAddressByIdTransaction } from '@/function/cim/streetAddress'
import { insertElectronicAddressTransaction, getElectronicAddressById, deleteElectronicAddressByIdTransaction } from '@/function/cim/electronicAddress'
import { insertTelephoneNumberTransaction, getTelephoneNumberById, deleteTelephoneNumberByIdTransaction } from '@/function/cim/telephoneNumber'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, deleteDirectory, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction } from '@/function/entity/attachment'
import { insertConfigurationEventArrayTransaction, insertConfigurationEventTransaction} from '@/function/cim/configurationEvent/index'
import ConfigurationEvent from '@/views/Cim/ConfigurationEvent'
import { insertParentOrganizationTransaction, getParentOrganizationById, deleteParentOrganizationByIdTransaction } from '@/function/cim/parentOrganization'
import { insertGeoMapArrayTransaction, getGeoMapByOrganisationId, deleteGeoMapByArrayMridTransaction } from '../geoMap'
import uuid from '@/utils/uuid'
import path from 'path'

export const insertOrganisationEntity = async (entity) => {
    if(entity == null || typeof entity !== 'object') {
        return { success: false, error: new Error('Invalid entity data') };
    } else if (entity.organisation.mrid == null || entity.organisation.mrid === '') {
        return { success: false, error: new Error('Entity must have a valid MRID') };
    } else {
        const result = {
            success: false,
            error: null,
            message: '',
        };
        try {
            if(entity.attachment && entity.attachment.path && entity.attachment.path.length > 0) {
                backupAllFilesInDir(null, null, entity.organisation.mrid);
                const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.organisation.mrid);
                if (!syncResult.success) {
                    restoreFiles(null, null, entity.organisation.mrid);
                    result.error = syncResult.error;
                    result.message = 'Failed syncing files';
                    return result;
                }
                await new Promise((resolve, reject) => {
                    db.serialize(async () => {
                        db.run('BEGIN TRANSACTION');
                        try {
                            if (entity.streetDetail.mrid) await insertStreetDetailTransaction(entity.streetDetail, db);
                            if (entity.townDetail.mrid) await insertTownDetailTransaction(entity.townDetail, db);
                            if (entity.streetAddress.mrid) await insertStreetAddressTransaction(entity.streetAddress, db);
                            if (entity.electronicAddress.mrid) await insertElectronicAddressTransaction(entity.electronicAddress, db);
                            if (entity.telephoneNumber.mrid) await insertTelephoneNumberTransaction(entity.telephoneNumber, db);
                            if (entity.organisation.mrid) await insertParentOrganizationTransaction(entity.organisation, db);
                            if (Array.isArray(entity.positionPoints) && entity.positionPoints.length > 0) await insertGeoMapArrayTransaction(entity.positionPoints, db);
                            if (entity.attachment.id) {
                                const pathData = JSON.parse(entity.attachment.path);
                                const newPath = []
                                for(let i = 0; i < pathData.length; i++) {
                                    const namefile = path.basename(pathData[i].path);
                                    pathData[i].path = path.join(attachmentContext.getAttachmentPath(entity.organisation.mrid), namefile);
                                    newPath.push(pathData[i]);
                                }
                                entity.attachment.path = JSON.stringify(newPath);
                                await uploadAttachmentTransaction(entity.attachment, db);
                            }
                            if (Array.isArray(entity.configurationEvent) && entity.configurationEvent.length > 0)  await insertConfigurationEventArrayTransaction(entity.configurationEvent, db);
                            db.run('COMMIT');
                            resolve({ success: true, data: entity, message: 'Insert entity completed' });
                        } catch (err) {
                            db.run('ROLLBACK');
                            reject({ success: false, err, message: 'Insert entity failed' });
                        }
                    })
                })
                deleteBackupFiles(null, entity.organisation.mrid);
                result.success = true;
                result.data = entity;
                result.message = 'Insert ParentOrganisationEntity completed';
            } else {
                await new Promise((resolve, reject) => {
                    db.serialize(async () => {
                        db.run('BEGIN TRANSACTION');
                        try {
                            if (entity.streetDetail.mrid) await insertStreetDetailTransaction(entity.streetDetail, db);
                            if (entity.townDetail.mrid) await insertTownDetailTransaction(entity.townDetail, db);
                            if (entity.streetAddress.mrid) await insertStreetAddressTransaction(entity.streetAddress, db);                            if (entity.electronicAddress.mrid) await insertElectronicAddressTransaction(entity.electronicAddress, db);
                            if (entity.telephoneNumber.mrid) await insertTelephoneNumberTransaction(entity.telephoneNumber, db);
                            if (entity.organisation.mrid) await insertParentOrganizationTransaction(entity.organisation, db);
                            if (Array.isArray(entity.positionPoints) && entity.positionPoints.length > 0) await insertGeoMapArrayTransaction(entity.positionPoints, db);
                            if (entity.attachment.id) {
                                const pathData = JSON.parse(entity.attachment.path);
                                const newPath = []
                                for(let i = 0; i < pathData.length; i++) {
                                    const namefile = path.basename(pathData[i].path);
                                    pathData[i].path = path.join(attachmentContext.getAttachmentPath(entity.organisation.mrid), namefile);
                                    newPath.push(pathData[i]);
                                }
                                entity.attachment.path = JSON.stringify(newPath);
                                await uploadAttachmentTransaction(entity.attachment, db);
                            }
                            if (Array.isArray(entity.configurationEvent) && entity.configurationEvent.length > 0)  await insertConfigurationEventArrayTransaction(entity.configurationEvent, db);
                            db.run('COMMIT');
                            resolve({ success: true, data: entity, message: 'Insert entity completed' });
                        } catch (err) {
                            db.run('ROLLBACK');
                            reject({ success: false, err, message: 'Insert entity failed' });
                        }
                    })
                })
                result.success = true;
                result.data = entity;
                result.message = 'Insert ParentOrganisationEntity completed';
            }
            return result;
        } catch (err) {
            console.error('Insert ParentOrganisationEntity failed:', err);
            if(entity.attachment && entity.attachment.path && entity.attachment.path.length > 0) {
                try {
                    restoreFiles(null, null, entity.organisation.mrid);
                    deleteBackupFiles(null, entity.organisation.mrid);
                } catch (restoreErr) {
                    console.error('Restore files failed:', restoreErr);
                }
            }
            result.error = err.message;
            result.message = 'Insert ParentOrganisationEntity failed and rollback executed';
            const configEvent = new ConfigurationEvent();
            configEvent.mrid = uuid.newUuid()
            configEvent.name = 'Change organisation'
            configEvent.effective_date_time = new Date().toISOString()
            configEvent.user_name = entity.user.name
            configEvent.modified_by = entity.user.user_id
            configEvent.type = "ERROR"
            configEvent.description = `Organisation changed of ${entity.organisation.name} failed`
            try {
                await insertConfigurationEventTransaction(configEvent, db);
            } catch (err) {
                console.error('Insert ConfigurationEvent failed:', err);
            }
            return result;
        }
    }
}

export const getOrganisationEntityById = async (id) => {
    try {
        if(!id) {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const orgEntity = new OrganisationEntity();
            const dataParentOrganization = await getParentOrganizationById(id);
            if (dataParentOrganization.success) {
                orgEntity.organisation = dataParentOrganization.data
            }

            const dataStreetAddress = await getStreetAddressById(orgEntity.organisation.street_address);
            if (dataStreetAddress.success) {
                orgEntity.streetAddress = dataStreetAddress.data;
            }

            const dataStreetDetail = await getStreetDetailById(orgEntity.streetAddress.street_detail);
            if (dataStreetDetail.success) {
                orgEntity.streetDetail = dataStreetDetail.data;
            }

            const dataTownDetail = await getTownDetailById(orgEntity.streetAddress.town_detail);
            if (dataTownDetail.success) {
                orgEntity.townDetail = dataTownDetail.data;
            }

            const dataElectronicAddress = await getElectronicAddressById(orgEntity.organisation.electronic_address);
            if (dataElectronicAddress.success) {
                orgEntity.electronicAddress = dataElectronicAddress.data;
            }

            const dataTelephoneNumber = await getTelephoneNumberById(orgEntity.organisation.phone);
            if (dataTelephoneNumber.success) {
                orgEntity.telephoneNumber = dataTelephoneNumber.data;
            }

            const dataAttachment = await getAttachmentByForeignIdAndType(orgEntity.organisation.mrid, 'organisation');
            if (dataAttachment.success) {
                orgEntity.attachment = dataAttachment.data;
            }
            const dataGeoMap = await getGeoMapByOrganisationId(orgEntity.organisation.mrid);
            if (dataGeoMap.success) {
                orgEntity.positionPoints = dataGeoMap.data;
            } else {
                orgEntity.positionPoints = [];
            }
            return { success: true, data: orgEntity , message: 'Get OrganisationEntity by ID completed' };

        }
    } catch (error) {
        console.error('Error fetching OrganisationEntity by ID:', error);
        return { success: false, error };
    }
}

export const deleteOrganisationEntityById = async (data) => {
    if (!data || !data.organisation || !data.organisation.mrid) {
        return { success: false, error: new Error('Invalid organisation data') };
    }

    const runSQL = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    try {
        // Bắt đầu transaction
        await runSQL('BEGIN TRANSACTION');

        if (data.organisation.mrid)
            await deleteParentOrganizationByIdTransaction(data.organisation.mrid, db);

        if (data.streetAddress && data.streetAddress.mrid)
            await deleteStreetAddressByIdTransaction(data.streetAddress.mrid, db);

        if (data.attachment && data.attachment.id)
            await deleteAttachmentByIdTransaction(data.attachment.id, db);

        if (data.electronicAddress && data.electronicAddress.mrid)
            await deleteElectronicAddressByIdTransaction(data.electronicAddress.mrid, db);

        if (data.telephoneNumber && data.telephoneNumber.mrid)
            await deleteTelephoneNumberByIdTransaction(data.telephoneNumber.mrid, db);

        if (data.streetDetail && data.streetDetail.mrid)
            await deleteStreetDetailByIdTransaction(data.streetDetail.mrid, db);

        if (data.townDetail && data.townDetail.mrid)
            await deleteTownDetailByIdTransaction(data.townDetail.mrid, db);

        // Commit nếu thành công
        await runSQL('COMMIT');

        deleteDirectory(null, data.organisation.mrid);

        return { success: true, data, message: 'Organisation deleted successfully' };

    } catch (error) {
        console.error('Error deleting organisation:', error);
        try {
            await runSQL('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Rollback failed:', rollbackErr);
        }
        return { success: false, error, message: 'Failed to delete organisation' };
    }
};
