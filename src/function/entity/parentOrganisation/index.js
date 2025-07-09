import db from '../../datacontext/index'
import * as attachmentContext from '../../attachmentcontext/index'
import { insertStreetDetailTransaction } from '@/function/cim/streetDetail'
import { insertTownDetailTransaction } from '@/function/cim/townDetail'
import { insertStreetAddressTransaction } from '@/function/cim/streetAddress'
import { insertElectronicAddressTransaction } from '@/function/cim/electronicAddress'
import { insertTelephoneNumberTransaction } from '@/function/cim/telephoneNumber'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion } from '@/function/entity/attachment'
import { insertConfigurationEventArrayTransaction, insertConfigurationEventTransaction } from '@/function/cim/configurationEvent/index'
import ConfigurationEvent from '@/views/Cim/ConfigurationEvent'
import { insertParentOrganizationTransaction } from '@/function/cim/parentOrganization'
import { insertGeoMapArrayTransaction } from '../geoMap'
import uuid from '@/utils/uuid'

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
                console.log('Backing up files...');
                backupAllFilesInDir(entity.attachment.path, null, entity.organisation.mrid);
                const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.organisation.mrid);
                if (!syncResult.success) {
                    restoreFiles(null, null, entity.organisation.mrid);
                    result.error = syncResult.error;
                    result.message = 'Failed syncing files';
                    const configEvent = new ConfigurationEvent();
                    configEvent.mrid = uuid.newUuid()
                    configEvent.name = 'Change Attachment'
                    configEvent.effective_date_time = new Date().toISOString()
                    configEvent.changed_attachment = entity.attachmentId
                    configEvent.user_name = entity.user.name
                    configEvent.modified_by = entity.user.user_id
                    configEvent.type = "ERROR"
                    configEvent.description = `Attachment changed of ${entity.name}`
                    try {
                        await insertConfigurationEventTransaction(configEvent);
                    } catch (err) {
                        console.error('Insert ConfigurationEvent failed:', err);
                    }
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
                                    pathData[i].path = path.join(attachmentContext.getAttachmentPath(), namefile);
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
                deleteBackupFiles(null, entity.substation.mrid);
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
                                    pathData[i].path = path.join(attachmentContext.getAttachmentPath(), namefile);
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
                } catch (restoreErr) {
                    result.error = restoreErr.message;
                    result.message = 'Insert ParentOrganisationEntity failed and rollback failed';
                    console.error('Restore files failed:', restoreErr);
                    const configEvent = new ConfigurationEvent();
                    configEvent.mrid = uuid.newUuid()
                    configEvent.name = 'Change Attachment'
                    configEvent.effective_date_time = new Date().toISOString()
                    configEvent.changed_attachment = entity.attachmentId
                    configEvent.user_name = entity.user.name
                    configEvent.modified_by = entity.user.user_id
                    configEvent.type = "ERROR"
                    configEvent.description = `Attachment changed of ${entity.name}`
                    try {
                        await insertConfigurationEventTransaction(configEvent);
                    } catch (err) {
                        console.error('Insert ConfigurationEvent failed:', err);
                    }
                    return result;
                }
            }
            result.error = err.message;
            result.message = 'Insert ParentOrganisationEntity failed and rollback executed';
            const configEvent = new ConfigurationEvent();
            configEvent.mrid = uuid.newUuid()
            configEvent.name = 'Change Attachment'
            configEvent.effective_date_time = new Date().toISOString()
            configEvent.changed_attachment = entity.attachmentId
            configEvent.user_name = entity.user.name
            configEvent.modified_by = entity.user.user_id
            configEvent.type = "ERROR"
            configEvent.description = `Attachment changed of ${entity.name}`
            try {
                await insertConfigurationEventTransaction(configEvent);
            } catch (err) {
                console.error('Insert ConfigurationEvent failed:', err);
            }
            return result;
        }
    }
}