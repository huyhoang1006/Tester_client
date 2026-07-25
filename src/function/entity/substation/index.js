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
import { insertPersonSubstationTransaction, getPersonSubstationBySubstationId } from '@/function/entity/personSubstation'
import { uploadAttachmentTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType, deleteAttachmentByIdTransaction, deleteDirectory } from '@/function/entity/attachment'
import { insertOrganisationLocationTransaction, getOrganisationLocationByOrganisationIdAndLocationId } from '@/function/entity/organisationLocation'
import { insertPositionPointArrayTransaction, getPositionPointByLocationId } from '@/function/cim/positionPoint'
import { insertPsrTypeTransaction, getPsrTypeById, deletePsrTypeByIdTransaction } from '@/function/cim/psrType'
import { insertOrganisationPersonTransaction, getOrganisationPersonByOrganisationIdAndPersonId } from '../organisationPerson'
import { insertOrganisationPsrTransaction, getOrganisationPsrByOrganisationIdAndPsrId } from '../organisationPsr'
import { getPowerSystemResourceByLocationIdTransaction } from '@/function/cim/powerSystemResource/index'
import SubstationEntity from '@/views/Flatten/Substation'
import { normaliseAuditValue, tryWriteAuditLog } from '../auditLog/index'

const getAttachmentLogValue = (attachment) => {
    if (!attachment || !attachment.path) return ''
    try {
        const files = JSON.parse(attachment.path)
        if (!Array.isArray(files)) return ''
        return files.map((item) => path.basename(item.path || item.name || '')).filter(Boolean).join(', ')
    } catch (error) {
        return normaliseAuditValue(attachment.path)
    }
}

const getPositionPointLogValue = (positionPoints) => {
    if (!Array.isArray(positionPoints) || positionPoints.length === 0) return ''
    return positionPoints
        .map((point) => [point.x, point.y, point.z].map(normaliseAuditValue).join(','))
        .join(' | ')
}

const readLogValue = (entity, group, field) => {
    if (!entity || !entity[group]) return null
    return entity[group][field]
}

const getSubstationLogFields = (entity) => ({
    'Name': readLogValue(entity, 'substation', 'name'),
    'Alias name': readLogValue(entity, 'substation', 'alias_name'),
    'Comment': readLogValue(entity, 'substation', 'description'),
    'Psr type': readLogValue(entity, 'substation', 'psr_type_id'),
    'Generation': readLogValue(entity, 'substation', 'generation'),
    'Industry': readLogValue(entity, 'substation', 'industry'),
    'Street': readLogValue(entity, 'streetDetail', 'address_general'),
    'Ward/Commune': readLogValue(entity, 'townDetail', 'ward_or_commune'),
    'District/Town': readLogValue(entity, 'townDetail', 'district_or_town'),
    'City': readLogValue(entity, 'townDetail', 'city'),
    'State/Province': readLogValue(entity, 'townDetail', 'state_or_province'),
    'Country': readLogValue(entity, 'townDetail', 'country'),
    'Contact name': readLogValue(entity, 'person', 'name'),
    'Phone number': readLogValue(entity, 'telephoneNumber', 'itu_phone'),
    'Email': readLogValue(entity, 'electronicAddress', 'email'),
    'Attachments': getAttachmentLogValue(entity && entity.attachment),
    'Geo coordinates': getPositionPointLogValue(entity && entity.positionPoint)
})

const getSubstationChanges = (beforeEntity, afterEntity) => {
    const before = getSubstationLogFields(beforeEntity)
    const after = getSubstationLogFields(afterEntity)
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

const getOrganisationId = (entity) => {
    if (!entity) return null
    if (entity.organisationPsr && entity.organisationPsr.organisation_id) return entity.organisationPsr.organisation_id
    if (entity.organisationLocation && entity.organisationLocation.organisation_id) return entity.organisationLocation.organisation_id
    if (entity.organisationPerson && entity.organisationPerson.organisation_id) return entity.organisationPerson.organisation_id
    return null
}

const getExistingSubstationEntity = async (entity) => {
    if (!entity || !entity.substation || !entity.substation.mrid) return null
    const user = getEntityUser(entity)
    const organisationId = getOrganisationId(entity)
    const result = await getSubstationEntityById(entity.substation.mrid, user.id, organisationId)
    return result && result.success ? result.data : null
}

const writeSubstationSaveLog = async (beforeEntity, afterEntity) => {
    const name = normaliseAuditValue(readLogValue(afterEntity, 'substation', 'name')) || 'Unnamed Substation'
    const objectId = readLogValue(afterEntity, 'substation', 'mrid')
    const changes = beforeEntity ? getSubstationChanges(beforeEntity, afterEntity) : []
    const result = await tryWriteAuditLog({
        objectType: 'Substation',
        objectId,
        objectName: name,
        action: beforeEntity ? 'UPDATE' : 'INSERT',
        changes,
        user: getEntityUser(afterEntity)
    })
    return { ...result, changed: beforeEntity ? changes.length > 0 : true }
}

const writeSubstationDeleteLog = async (entity) => {
    const name = normaliseAuditValue(readLogValue(entity, 'substation', 'name')) || 'Unnamed Substation'
    await tryWriteAuditLog({
        objectType: 'Substation',
        objectId: readLogValue(entity, 'substation', 'mrid'),
        objectName: name,
        action: 'DELETE',
        user: getEntityUser(entity)
    })
}

export const moveSubstationToOrganisation = async (substationId, organisationId) => {
    if (!substationId || !organisationId) {
        return { success: false, message: 'Missing substation or organisation id' }
    }

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            db.get(
                `SELECT s.mrid, psr.location
                 FROM substation s
                 LEFT JOIN power_system_resource psr ON psr.mrid = s.mrid
                 WHERE s.mrid = ?`,
                [substationId],
                (subErr, substation) => {
                if (subErr) {
                    db.run('ROLLBACK')
                    reject({ success: false, err: subErr, message: 'Get substation failed' })
                    return
                }
                if (!substation) {
                    db.run('ROLLBACK')
                    resolve({ success: false, message: 'Substation not found' })
                    return
                }

                db.run(
                    'UPDATE organisation_psr SET organisation_id = ? WHERE psr_id = ?',
                    [organisationId, substationId],
                    function (psrErr) {
                        if (psrErr) {
                            db.run('ROLLBACK')
                            reject({ success: false, err: psrErr, message: 'Update organisation_psr failed' })
                            return
                        }

                        const updateLocation = (done) => {
                            if (!substation.location) {
                                done()
                                return
                            }
                            db.run(
                                'UPDATE organisation_location SET organisation_id = ? WHERE location_id = ?',
                                [organisationId, substation.location],
                                function (locErr) {
                                    if (locErr) {
                                        done(locErr)
                                        return
                                    }
                                    done()
                                }
                            )
                        }

                        const updatePerson = (done) => {
                            db.get('SELECT person_id FROM person_substation WHERE substation_id = ? LIMIT 1', [substationId], (personErr, personSubstation) => {
                                if (personErr) {
                                    done(personErr)
                                    return
                                }
                                if (!personSubstation || !personSubstation.person_id) {
                                    done()
                                    return
                                }
                                db.run(
                                    'UPDATE organisation_person SET organisation_id = ? WHERE person_id = ?',
                                    [organisationId, personSubstation.person_id],
                                    function (orgPersonErr) {
                                        done(orgPersonErr)
                                    }
                                )
                            })
                        }

                        updateLocation((locErr) => {
                            if (locErr) {
                                db.run('ROLLBACK')
                                reject({ success: false, err: locErr, message: 'Update organisation_location failed' })
                                return
                            }
                            updatePerson((personErr) => {
                                if (personErr) {
                                    db.run('ROLLBACK')
                                    reject({ success: false, err: personErr, message: 'Update organisation_person failed' })
                                    return
                                }
                                db.run('COMMIT')
                                resolve({
                                    success: true,
                                    data: { substationId, organisationId },
                                    message: 'Move substation completed'
                                })
                            })
                        })
                    }
                )
            })
        })
    })
}

export const insertSubstationEntity = async (entity) => {
    if (entity == null || typeof entity !== 'object') {
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
            const beforeEntity = await getExistingSubstationEntity(entity)
            if (entity.attachment && entity.attachment.path && entity.attachment.path.length > 0) {
                backupAllFilesInDir(null, null, entity.substation.mrid);
                const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.substation.mrid);
                if (!syncResult.success) {
                    restoreFiles(null, null, entity.substation.mrid);
                    result.error = syncResult.error;
                    result.message = 'Failed syncing files';
                    await tryWriteAuditLog({
                        objectType: 'Substation',
                        objectId: entity && entity.substation ? entity.substation.mrid : null,
                        objectName: entity && entity.substation ? entity.substation.name : null,
                        action: 'ERROR',
                        description: `Attachment changed of ${entity.substation && entity.substation.name ? entity.substation.name : 'Substation'} failed`,
                        user: getEntityUser(entity)
                    })
                    return result;
                }

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
                                for (let i = 0; i < pathData.length; i++) {
                                    const namefile = path.basename(pathData[i].path);
                                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), entity.substation.mrid, namefile);
                                    newPath.push(pathData[i]);
                                }
                                entity.attachment.path = JSON.stringify(newPath);
                                await uploadAttachmentTransaction(entity.attachment, db);
                            }
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
                                for (let i = 0; i < pathData.length; i++) {
                                    const namefile = path.basename(pathData[i].path);
                                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), namefile);
                                    newPath.push(pathData[i]);
                                }
                                entity.attachment.path = JSON.stringify(newPath);
                                await uploadAttachmentTransaction(entity.attachment, db);
                            }
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
            const auditResult = await writeSubstationSaveLog(beforeEntity, entity)
            result.changed = auditResult.changed
            return result;
        } catch (err) {
            if (entity.attachment && entity.attachment.path && entity.attachment.path.length > 0) {
                try {
                    restoreFiles(null, null, entity.substation.mrid);
                } catch (err) {
                    console.error('Restore files failed:', err);
                    result.error = err.message;
                    result.message = 'Insert SubstationEntity failed and rollback executed';
                    await tryWriteAuditLog({
                        objectType: 'Substation',
                        objectId: entity && entity.substation ? entity.substation.mrid : null,
                        objectName: entity && entity.substation ? entity.substation.name : null,
                        action: 'ERROR',
                        description: `Substation changed of ${entity.substation && entity.substation.name ? entity.substation.name : 'Substation'} failed`,
                        user: getEntityUser(entity)
                    })
                    return result;
                }

            }
            console.error(err);
            result.error = err.message;
            result.message = 'Insert SubstationEntity failed and rollback executed';
            await tryWriteAuditLog({
                objectType: 'Substation',
                objectId: entity && entity.substation ? entity.substation.mrid : null,
                objectName: entity && entity.substation ? entity.substation.name : null,
                action: 'ERROR',
                description: `Substation changed of ${entity.substation && entity.substation.name ? entity.substation.name : 'Substation'} failed`,
                user: getEntityUser(entity)
            })
            return result;
        }
    }
}

export const getSubstationEntityById = async (id, user_id, organisation_id) => {
    const entity = new SubstationEntity();
    if (id == null || id === '') {
        return { success: false, error: new Error('Invalid ID') };
    } else {
        try {
            const dataSubstation = await getSubstationById(id);
            if (dataSubstation.success) {
                entity.substation = dataSubstation.data;
                const dataPrsType = await getPsrTypeById(entity.substation.psr_type_id);
                if (dataPrsType.success) {
                    entity.psrType = dataPrsType.data;
                }

                const dataLocation = await getLocationById(entity.substation.location);
                if (dataLocation.success) {
                    entity.location = dataLocation.data;
                }

                const dataStreetAddress = await getStreetAddressById(entity.location.main_address);
                if (dataStreetAddress.success) {
                    entity.streetAddress = dataStreetAddress.data;
                }

                const dataStreetDetail = await getStreetDetailById(entity.streetAddress.street_detail);
                if (dataStreetDetail.success) {
                    entity.streetDetail = dataStreetDetail.data;
                }

                const dataTownDetail = await getTownDetailById(entity.streetAddress.town_detail);
                if (dataTownDetail.success) {
                    entity.townDetail = dataTownDetail.data;
                }

                const dataPersonSubstation = await getPersonSubstationBySubstationId(entity.substation.mrid);
                if (dataPersonSubstation.success) {
                    entity.personSubstation = dataPersonSubstation.data;
                }

                const dataPerson = await getPersonById(entity.personSubstation.person_id);
                if (dataPerson.success) {
                    entity.person = dataPerson.data;
                }

                const dataPersonRole = await getPersonRoleByPersonId(entity.person.mrid);
                if (dataPersonRole.success) {
                    entity.personRole = dataPersonRole.data;
                }

                const dataElectronicAddress = await getElectronicAddressById(entity.person.electronic_address);
                if (dataElectronicAddress.success) {
                    entity.electronicAddress = dataElectronicAddress.data;
                }

                const dataTelephoneNumber = await getTelephoneNumberById(entity.person.mobile_phone);
                if (dataTelephoneNumber.success) {
                    entity.telephoneNumber = dataTelephoneNumber.data;
                }

                const dataPositionPoint = await getPositionPointByLocationId(entity.location.mrid);
                if (dataPositionPoint.success) {
                    entity.positionPoint = dataPositionPoint.data;
                }

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.substation.mrid, 'substation');
                if (dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                const userIdentifiedObject = await getUserIdentifiedObjectByUserIdAndIdentifiedObjectId(user_id, entity.substation.mrid);
                if (userIdentifiedObject.success) {
                    entity.userIdentifiedObject = userIdentifiedObject.data;
                }

                const dataUser = await getUserById(user_id);
                if (dataUser.success) {
                    entity.user = dataUser.data;
                }

                const organisationLocation = await getOrganisationLocationByOrganisationIdAndLocationId(organisation_id, entity.location.mrid);
                if (organisationLocation.success) {
                    entity.organisationLocation = organisationLocation.data;
                }

                const organisationPerson = await getOrganisationPersonByOrganisationIdAndPersonId(organisation_id, entity.person.mrid);
                if (organisationPerson.success) {
                    entity.organisationPerson = organisationPerson.data;
                }

                const organisationPsr = await getOrganisationPsrByOrganisationIdAndPsrId(organisation_id, entity.substation.mrid);
                if (organisationPsr.success) {
                    entity.organisationPsr = organisationPsr.data;
                }

                return { success: true, data: entity, message: 'Substation entity retrieved successfully' };

            } else {
                return { success: false, error: new Error('Substation not found') };
            }

        } catch (error) {
            console.error('Error retrieving substation entity:', error);
            return { success: false, error, message: 'Error retrieving substation entity' };
        }
    }
}

export const deleteSubstationEntityById = async (data) => {
    try {
        if (data.substation == null || data.substation.mrid == null || data.substation.mrid === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            try {
                await runSQL('BEGIN TRANSACTION');
                if (data.attachment && data.attachment.id) {
                    const pathData = JSON.parse(data.attachment.path || '[]')
                    if (Array.isArray(pathData) && pathData.length > 0) {
                        syncFilesWithDeletion(pathData, null, data.mrid);
                    }
                }
                if (data.attachment.id) {
                    await deleteAttachmentByIdTransaction(data.attachment.id, db);
                }
                if (data.substation && data.substation.mrid) {
                    await deleteSubstationByIdTransaction(data.substation.mrid, db);
                }
                if (data.psrType && data.psrType.mrid) {
                    await deletePsrTypeByIdTransaction(data.psrType.mrid, db);
                }
                if (data.location && data.location.mrid) {
                    const powerSystemResource = await getPowerSystemResourceByLocationIdTransaction(data.location.mrid, db);
                    if (powerSystemResource.success) {
                        if (powerSystemResource.data.length - 1 <= 0) {
                            await deleteLocationByIdTransaction(data.location.mrid, db);
                            if (data.streetAddress && data.streetAddress.mrid) {
                                await deleteStreetAddressByIdTransaction(data.streetAddress.mrid, db);
                            }
                            if (data.streetDetail && data.streetDetail.mrid) {
                                await deleteStreetDetailByIdTransaction(data.streetDetail.mrid, db);
                            }
                            if (data.townDetail && data.townDetail.mrid) {
                                await deleteTownDetailByIdTransaction(data.townDetail.mrid, db);
                            }
                        }
                    }
                }
                if (data.personRole && data.personRole.mrid) {
                    await deletePersonRoleByIdTransaction(data.personRole.mrid, db);
                }
                if (data.person && data.person.mrid) {
                    await deletePersonByIdTransaction(data.person.mrid, db);
                }
                if (data.electronicAddress && data.electronicAddress.mrid) {
                    await deleteElectronicAddressByIdTransaction(data.electronicAddress.mrid, db);
                }
                if (data.telephoneNumber && data.telephoneNumber.mrid) {
                    await deleteTelephoneNumberByIdTransaction(data.telephoneNumber.mrid, db);
                }
                await runSQL('COMMIT');
                if (data.attachment && data.attachment.id) {
                    deleteDirectory(null, data.substation.mrid);
                }
                await writeSubstationDeleteLog(data)
                return { success: true, message: 'Substation entity deleted successfully' };
            } catch (err) {
                await runSQL('ROLLBACK');
                return { success: false, err, message: 'Substation entity deleted failed' };
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
