import db from '../../datacontext/index'
import * as attachmentContext from '../../attachmentcontext/index'
import path from 'path'
import { insertSubstationTransaction, getSubstationById, deleteSubstationByIdTransaction } from '@/function/cim/substation'
import { insertStreetDetailTransaction, getStreetDetailById, deleteStreetDetailByIdTransaction } from '@/function/cim/streetDetail'
import { insertTownDetailTransaction, getTownDetailById, deleteTownDetailByIdTransaction } from '@/function/cim/townDetail'
import { insertStreetAddressTransaction, getStreetAddressById, deleteStreetAddressByIdTransaction } from '@/function/cim/streetAddress'
import { insertLocationTransaction, getLocationById, deleteLocationByIdTransaction } from '@/function/cim/location'
import { insertElectronicAddressTransaction, getElectronicAddressById, deleteElectronicAddressByIdTransaction } from '@/function/cim/electronicAddress'
import { insertTelephoneNumberTransaction, getTelephoneNumberById, deleteTelephoneNumberByIdTransaction } from '@/function/cim/telephoneNumber'
import { insertPersonTransaction, getPersonById, deletePersonByIdTransaction } from '@/function/cim/person'
import { insertPersonRoleTransaction, getPersonRoleByPersonId, deletePersonRoleByIdTransaction } from '@/function/cim/personRole'
import { insertUserTransaction, getUserById } from '@/function/entity/user'
import { insertUserIdentifiedObjectTransaction, getUserIdentifiedObjectByUserIdAndIdentifiedObjectId } from '@/function/entity/userIdentifiedObject'
import { insertPersonSubstationTransaction, getPersonSubstationBySubstationId  } from '@/function/entity/personSubstation'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import { insertOrganisationLocationTransaction, getOrganisationLocationByOrganisationIdAndLocationId } from '@/function/entity/organisationLocation'
import { insertPositionPointArrayTransaction, getPositionPointByLocationId } from '@/function/cim/positionPoint'
import { insertPsrTypeTransaction, getPsrTypeById, deletePsrTypeByIdTransaction } from '@/function/cim/psrType'
import { insertOrganisationPersonTransaction, getOrganisationPersonByOrganisationIdAndPersonId  } from '../organisationPerson'
import { insertOrganisationPsrTransaction, getOrganisationPsrByOrganisationIdAndPsrId } from '../organisationPsr'
import { insertConfigurationEventArrayTransaction, insertConfigurationEventTransaction } from '@/function/cim/configurationEvent/index'
import { getPowerSystemResourceByLocationIdTransaction } from '@/function/cim/powerSystemResource/index'
import ConfigurationEvent from '@/views/Cim/ConfigurationEvent'
import uuid from '@/utils/uuid'
import SubstationEntity from '@/views/Entity/Substation'

export const insertSubstationEntity = async (entity) => {
    if(entity == null || typeof entity !== 'object') {
        return { success: false, error: new Error('Invalid entity data') };
    } else if (entity.substation.mrid == null || entity.substation.mrid === '') {
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
                backupAllFilesInDir(null, null, entity.substation.mrid);
                console.log('Files backed up successfully');
                console.log('Syncing files with deletion...');
                const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.substation.mrid);
                if (!syncResult.success) {
                    restoreFiles(null, null, entity.substation.mrid);
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
                        await insertConfigurationEventTransaction(configEvent, db);
                    } catch (err) {
                        console.error('Insert ConfigurationEvent failed:', err);
                    }
                    return result;
                }
                console.log('Files synced successfully');
                
                await new Promise((resolve, reject) => {
                    db.serialize(async () => {
                        db.run('BEGIN TRANSACTION');
                        try {
                            if (entity.psrType.mrid) await insertPsrTypeTransaction(entity.psrType, db);
                            if (entity.streetDetail.mrid) await insertStreetDetailTransaction(entity.streetDetail, db);
                            if (entity.townDetail.mrid) await insertTownDetailTransaction(entity.townDetail, db);
                            if (entity.streetAddress.mrid) await insertStreetAddressTransaction(entity.streetAddress, db);
                            if (entity.location.mrid) await insertLocationTransaction(entity.location, db);
                            if (entity.substation.mrid) await insertSubstationTransaction(entity.substation, db);
                            if (entity.electronicAddress.mrid) await insertElectronicAddressTransaction(entity.electronicAddress, db);
                            if (entity.telephoneNumber.mrid) await insertTelephoneNumberTransaction(entity.telephoneNumber, db);
                            if (entity.person.mrid) await insertPersonTransaction(entity.person, db);
                            if (entity.personRole.mrid) await insertPersonRoleTransaction(entity.personRole, db);
                            if (entity.user.user_id) await insertUserTransaction(entity.user, db);
                            if (entity.userIdentifiedObject.mrid) await insertUserIdentifiedObjectTransaction(entity.userIdentifiedObject, db);
                            if (entity.personSubstation.mrid) await insertPersonSubstationTransaction(entity.personSubstation, db);
                            if (entity.organisationLocation.mrid) await insertOrganisationLocationTransaction(entity.organisationLocation, db);
                            if (entity.organisationPsr.mrid) await insertOrganisationPsrTransaction(entity.organisationPsr, db);
                            if (entity.organisationPerson.mrid) await insertOrganisationPersonTransaction(entity.organisationPerson, db);
                            if (Array.isArray(entity.positionPoint) && entity.positionPoint.length > 0) await insertPositionPointArrayTransaction(entity.positionPoint, entity.location.mrid, db);
                            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                                const pathData = JSON.parse(entity.attachment.path);
                                const newPath = []
                                for(let i = 0; i < pathData.length; i++) {
                                    const namefile = path.basename(pathData[i].path);
                                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), entity.substation.mrid, namefile);
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
                result.message = 'Insert SubstationEntity completed';
            } else {
                await new Promise((resolve, reject) => {
                    db.serialize(async () => {
                        db.run('BEGIN TRANSACTION');
                        try {
                            if (entity.psrType.mrid) await insertPsrTypeTransaction(entity.psrType, db);
                            if (entity.streetDetail.mrid) await insertStreetDetailTransaction(entity.streetDetail, db);
                            if (entity.townDetail.mrid) await insertTownDetailTransaction(entity.townDetail, db);
                            if (entity.streetAddress.mrid) await insertStreetAddressTransaction(entity.streetAddress, db);
                            if (entity.location.mrid) await insertLocationTransaction(entity.location, db);
                            if (entity.substation.mrid) await insertSubstationTransaction(entity.substation, db);
                            if (entity.electronicAddress.mrid) await insertElectronicAddressTransaction(entity.electronicAddress, db);
                            if (entity.telephoneNumber.mrid) await insertTelephoneNumberTransaction(entity.telephoneNumber, db);
                            if (entity.person.mrid) await insertPersonTransaction(entity.person, db);
                            if (entity.personRole.mrid) await insertPersonRoleTransaction(entity.personRole, db);
                            if (entity.user.user_id) await insertUserTransaction(entity.user, db);
                            if (entity.userIdentifiedObject.mrid) await insertUserIdentifiedObjectTransaction(entity.userIdentifiedObject, db);
                            if (entity.personSubstation.mrid) await insertPersonSubstationTransaction(entity.personSubstation, db);
                            if (entity.organisationLocation.mrid) await insertOrganisationLocationTransaction(entity.organisationLocation, db);
                            if (entity.organisationPsr.mrid) await insertOrganisationPsrTransaction(entity.organisationPsr, db);
                            if (entity.organisationPerson.mrid) await insertOrganisationPersonTransaction(entity.organisationPerson, db);
                            if (Array.isArray(entity.positionPoint) && entity.positionPoint.length > 0) await insertPositionPointArrayTransaction(entity.positionPoint, entity.location.mrid, db);
                            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                                const pathData = JSON.parse(entity.attachment.path);
                                const newPath = []
                                for(let i = 0; i < pathData.length; i++) {
                                    const namefile = path.basename(pathData[i].path);
                                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), namefile);
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
                result.message = 'Insert SubstationEntity completed';      
            }
            return result;
        } catch (err) {
            if(entity.attachment && entity.attachment.path && entity.attachment.path.length > 0) {
                try {
                    restoreFiles(null, null, entity.substation.mrid);
                } catch(err) {
                    console.log('Error restoring files:', err);
                    console.error('Restore files failed:', err);
                    result.error = err.message;
                    result.message = 'Insert SubstationEntity failed and rollback executed';
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
                        await insertConfigurationEventTransaction(configEvent, db);
                    } catch (err) {
                        console.error('Insert ConfigurationEvent failed:', err);
                    }
                    return result;
                }
                    
            }
            console.error(err);
            result.error = err.message;
            result.message = 'Insert SubstationEntity failed and rollback executed';
            const configEvent = new ConfigurationEvent();
            configEvent.mrid = uuid.newUuid()
            configEvent.name = 'Change Attachment'
            configEvent.effective_date_time = new Date().toISOString()
            configEvent.changed_attachment = entity.attachmentId
            configEvent.user_name = entity.user.username
            configEvent.modified_by = entity.user.user_id
            configEvent.type = "ERROR"
            configEvent.description = `Attachment changed of ${entity.name}`
            try {
                await insertConfigurationEventTransaction(configEvent, db);
            } catch (err) {
                console.error('Insert ConfigurationEvent failed:', err);
            }
            return result;
        }
    }
}

export const getSubstationEntityById = async (id, user_id, organisation_id) => {
    const entity = new SubstationEntity();
    if(id == null || id === '') {
        return { success: false, error: new Error('Invalid ID') };
    } else {
        try {
            const dataSubstation = await getSubstationById(id);
            if(dataSubstation.success) {
                entity.substation = dataSubstation.data;
                const dataPrsType = await getPsrTypeById(entity.substation.psr_type_id);
                if(dataPrsType.success) {
                    entity.psrType = dataPrsType.data;
                }

                const dataLocation = await getLocationById(entity.substation.location);
                if(dataLocation.success) {
                    entity.location = dataLocation.data;
                }

                const dataStreetAddress = await getStreetAddressById(entity.location.main_address);
                if(dataStreetAddress.success) {
                    entity.streetAddress = dataStreetAddress.data;
                }

                const dataStreetDetail = await getStreetDetailById(entity.streetAddress.street_detail);
                if(dataStreetDetail.success) {
                    entity.streetDetail = dataStreetDetail.data;
                }

                const dataTownDetail = await getTownDetailById(entity.streetAddress.town_detail);
                if(dataTownDetail.success) {
                    entity.townDetail = dataTownDetail.data;
                }

                const dataPersonSubstation = await getPersonSubstationBySubstationId(entity.substation.mrid);
                if(dataPersonSubstation.success) {
                    entity.personSubstation = dataPersonSubstation.data;
                }

                const dataPerson = await getPersonById(entity.personSubstation.person_id);
                if(dataPerson.success) {
                    entity.person = dataPerson.data;
                }

                const dataPersonRole = await getPersonRoleByPersonId(entity.person.mrid);
                if(dataPersonRole.success) {
                    entity.personRole = dataPersonRole.data;
                }

                const dataElectronicAddress = await getElectronicAddressById(entity.person.electronic_address);
                if(dataElectronicAddress.success) {
                    entity.electronicAddress = dataElectronicAddress.data;
                }

                const dataTelephoneNumber = await getTelephoneNumberById(entity.person.mobile_phone);
                if(dataTelephoneNumber.success) {
                    entity.telephoneNumber = dataTelephoneNumber.data;
                }

                const dataPositionPoint = await getPositionPointByLocationId(entity.location.mrid);
                if(dataPositionPoint.success) {
                    entity.positionPoint = dataPositionPoint.data;
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.substation.mrid, 'substation');
                if(dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                const userIdentifiedObject = await getUserIdentifiedObjectByUserIdAndIdentifiedObjectId(user_id, entity.substation.mrid);
                if(userIdentifiedObject.success) {
                    entity.userIdentifiedObject = userIdentifiedObject.data;
                }

                const dataUser = await getUserById(user_id);
                if(dataUser.success) {
                    entity.user = dataUser.data;
                }

                const organisationLocation = await getOrganisationLocationByOrganisationIdAndLocationId(organisation_id, entity.location.mrid);
                if(organisationLocation.success) {
                    entity.organisationLocation = organisationLocation.data;
                }

                const organisationPerson = await getOrganisationPersonByOrganisationIdAndPersonId(organisation_id, entity.person.mrid);
                if(organisationPerson.success) {
                    entity.organisationPerson = organisationPerson.data;
                }

                const organisationPsr = await getOrganisationPsrByOrganisationIdAndPsrId(organisation_id, entity.substation.mrid);
                if(organisationPsr.success) {
                    entity.organisationPsr = organisationPsr.data;
                }

                return { success: true, data: entity, message: 'Substation entity retrieved successfully' };

            } else {
                return { success: false, error: new Error('Substation not found') };
            }
            
        } catch (error) {
            console.error('Error retrieving substation entity:', error);
            return { success: false, error, message: 'Error retrieving substation entity'};
        }
    }
}

export const deleteSubstationEntityById = async (data) => {
    try {
        if(data.substation == null || data.substation.mrid == null || data.substation.mrid === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {  
            try {
                await runSQL('BEGIN TRANSACTION');
                if(data.attachment && data.attachment.id) {
                    const pathData = JSON.parse(data.attachment.path || '[]')
                    if (Array.isArray(pathData) && pathData.length > 0) {
                        syncFilesWithDeletion(pathData, null, data.mrid);
                    }
                }
                if( data.attachment.id) {
                    await deleteAttachmentByIdTransaction(data.attachment.id, db);
                }
                if(data.substation && data.substation.mrid) {
                    await deleteSubstationByIdTransaction(data.substation.mrid, db);
                }
                if(data.psrType && data.psrType.mrid) {
                    await deletePsrTypeByIdTransaction(data.psrType.mrid, db);
                }
                if(data.location && data.location.mrid) {
                    const powerSystemResource = await getPowerSystemResourceByLocationIdTransaction(data.location.mrid, db);
                    if(powerSystemResource.success) {
                        if(powerSystemResource.data.length - 1 <= 0) {
                            await deleteLocationByIdTransaction(data.location.mrid, db);
                            if(data.streetAddress && data.streetAddress.mrid) {
                                await deleteStreetAddressByIdTransaction(data.streetAddress.mrid, db);
                            }
                            if(data.streetDetail && data.streetDetail.mrid) {
                                await deleteStreetDetailByIdTransaction(data.streetDetail.mrid, db);
                            }
                            if(data.townDetail && data.townDetail.mrid) {
                                await deleteTownDetailByIdTransaction(data.townDetail.mrid, db);
                            }
                        }
                    }
                }
                if(data.personRole && data.personRole.mrid) {
                    await deletePersonRoleByIdTransaction(data.personRole.mrid, db);
                }
                if(data.person && data.person.mrid) {
                    await deletePersonByIdTransaction(data.person.mrid, db);
                }
                if(data.electronicAddress && data.electronicAddress.mrid) {
                    await deleteElectronicAddressByIdTransaction(data.electronicAddress.mrid, db);
                }
                if(data.telephoneNumber && data.telephoneNumber.mrid) {
                    await deleteTelephoneNumberByIdTransaction(data.telephoneNumber.mrid, db);
                }
                await runSQL('COMMIT');
                if(data.attachment && data.attachment.id) {
                    deleteDirectory(null, data.substation.mrid);
                }
                return { success: true, message: 'Substation entity deleted successfully' };
            } catch (err) {
                await runSQL('ROLLBACK');
                reject({ success: false, err, message: 'Substation entity deleted failed' });
            }
        }
    } catch (error) {
        console.error('Error deleting substation entity:', error);
        return { success: false, error, message: 'Error deleting substation entity' };
    }
}

const runSQL = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};