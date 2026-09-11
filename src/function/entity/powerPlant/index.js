import db from '../../datacontext/index'
import * as attachmentContext from '../../attachmentcontext/index'
import path from 'path'
import { insertEquipmentContainerTransaction } from '@/function/cim/equipmentContainer'
import { insertPowerSystemResourceTransaction } from '@/function/cim/powerSystemResource'
import { insertActivePowerTransaction } from '@/function/cim/activePower'
import { insertStreetDetailTransaction, getStreetDetailById } from '@/function/cim/streetDetail'
import { insertTownDetailTransaction, getTownDetailById } from '@/function/cim/townDetail'
import { insertStreetAddressTransaction, getStreetAddressById } from '@/function/cim/streetAddress'
import { insertLocationTransaction, getLocationById } from '@/function/cim/location'
import { insertElectronicAddressTransaction, getElectronicAddressById } from '@/function/cim/electronicAddress'
import { insertTelephoneNumberTransaction, getTelephoneNumberById } from '@/function/cim/telephoneNumber'
import { insertPersonTransaction, getPersonById } from '@/function/cim/person'
import { insertPersonRoleTransaction, getPersonRoleByPersonId } from '@/function/cim/personRole'
import { insertUserTransaction, getUserById } from '@/function/entity/user'
import { insertUserIdentifiedObjectTransaction, getUserIdentifiedObjectByUserIdAndIdentifiedObjectId } from '@/function/entity/userIdentifiedObject'
import { insertOrganisationLocationTransaction, getOrganisationLocationByOrganisationIdAndLocationId } from '@/function/entity/organisationLocation'
import { insertOrganisationPersonTransaction, getOrganisationPersonByOrganisationIdAndPersonId } from '@/function/entity/organisationPerson'
import { insertOrganisationPsrTransaction, getOrganisationPsrByOrganisationIdAndPsrId } from '@/function/entity/organisationPsr'
import { insertPositionPointArrayTransaction, getPositionPointByLocationId } from '@/function/cim/positionPoint'
import { insertPsrTypeTransaction, getPsrTypeById } from '@/function/cim/psrType'
import {
    uploadAttachmentTransaction,
    backupAllFilesInDir,
    deleteBackupFiles,
    restoreFiles,
    syncFilesWithDeletion,
    getAttachmentByForeignIdAndType
} from '@/function/entity/attachment'
import { tryWriteAuditLog } from '@/function/entity/auditLog'
import { safePathSegment } from '@/utils/fileName'

const runSQL = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
        if (error) reject(error)
        else resolve(this)
    })
})

const getSQL = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
        if (error) reject(error)
        else resolve(row || null)
    })
})

const allSQL = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
        if (error) reject(error)
        else resolve(rows || [])
    })
})

const auditValue = (value) => {
    if (value === null || value === undefined) return ''
    return String(value)
}

const attachmentNames = (attachment) => {
    if (!attachment || !attachment.path) return []
    try {
        const rows = JSON.parse(attachment.path)
        return Array.isArray(rows)
            ? rows.map((item) => item.name || path.basename(item.path || '')).filter(Boolean).sort()
            : []
    } catch (error) {
        return []
    }
}

const powerValue = (power) => ({
    value: auditValue(power && power.value),
    multiplier: auditValue(power && power.multiplier),
    unit: auditValue(power && power.unit)
})

const powerPlantSnapshot = (entity) => {
    const plant = entity && entity.powerPlant ? entity.powerPlant : {}
    const units = entity && Array.isArray(entity.generatingUnits) ? entity.generatingUnits : []
    return {
        Name: auditValue(plant.name),
        'Plant type': auditValue(plant.plant_type),
        Comment: auditValue(plant.description),
        Street: auditValue(entity && entity.streetDetail && entity.streetDetail.address_general),
        'Ward / Suburb': auditValue(entity && entity.townDetail && entity.townDetail.ward_or_commune),
        'City / Province / State': auditValue(entity && entity.townDetail && entity.townDetail.city),
        Postcode: auditValue(entity && entity.streetAddress && entity.streetAddress.postal_code),
        Country: auditValue(entity && entity.townDetail && entity.townDetail.country),
        Contact: auditValue(entity && entity.person && entity.person.name),
        Phone: auditValue(entity && entity.telephoneNumber && entity.telephoneNumber.itu_phone),
        Email: auditValue(entity && entity.electronicAddress && entity.electronicAddress.email),
        'AC capacity': JSON.stringify(powerValue(entity && entity.acCapacity)),
        'DC capacity': JSON.stringify(powerValue(entity && entity.dcCapacity)),
        'Generating units': JSON.stringify(units
            .map((unit) => ({
                sequence: Number(unit.sequence_number) || 0,
                quantity: Number(unit.quantity) || 0,
                nominalPower: powerValue(unit.nominalPower),
                dcRatedPower: powerValue(unit.dcRatedPower)
            }))
            .sort((left, right) => left.sequence - right.sequence)),
        Attachments: JSON.stringify(attachmentNames(entity && entity.attachment))
    }
}

const powerPlantChanges = (beforeEntity, afterEntity) => {
    if (!beforeEntity) return []
    const before = powerPlantSnapshot(beforeEntity)
    const after = powerPlantSnapshot(afterEntity)
    return Object.keys(after)
        .map((field) => ({ field, from: before[field], to: after[field] }))
        .filter((change) => change.from !== change.to)
}

export const ensurePowerPlantSchema = async () => {
    await runSQL(`CREATE TABLE IF NOT EXISTS power_plant (
        mrid TEXT NOT NULL PRIMARY KEY,
        plant_type TEXT NOT NULL,
        ac_capacity TEXT,
        dc_capacity TEXT,
        FOREIGN KEY(mrid) REFERENCES equipment_container(mrid) ON DELETE CASCADE,
        FOREIGN KEY(ac_capacity) REFERENCES active_power(mrid),
        FOREIGN KEY(dc_capacity) REFERENCES active_power(mrid)
    )`)
    await runSQL(`CREATE TABLE IF NOT EXISTS generating_unit (
        mrid TEXT NOT NULL PRIMARY KEY,
        nominal_p TEXT,
        dc_rated_power TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        sequence_number INTEGER,
        FOREIGN KEY(mrid) REFERENCES equipment(mrid) ON DELETE CASCADE,
        FOREIGN KEY(nominal_p) REFERENCES active_power(mrid),
        FOREIGN KEY(dc_rated_power) REFERENCES active_power(mrid)
    )`)
    await runSQL(`CREATE TABLE IF NOT EXISTS person_power_plant (
        mrid TEXT NOT NULL PRIMARY KEY,
        person_id TEXT,
        power_plant_id TEXT,
        FOREIGN KEY(person_id) REFERENCES person(mrid) ON DELETE CASCADE,
        FOREIGN KEY(power_plant_id) REFERENCES power_plant(mrid) ON DELETE CASCADE
    )`)
}

const insertPowerPlantRowTransaction = async (powerPlant) => {
    await insertEquipmentContainerTransaction(powerPlant, db)
    await runSQL(
        `INSERT INTO power_plant(mrid, plant_type, ac_capacity, dc_capacity)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(mrid) DO UPDATE SET
            plant_type = excluded.plant_type,
            ac_capacity = excluded.ac_capacity,
            dc_capacity = excluded.dc_capacity`,
        [powerPlant.mrid, powerPlant.plant_type, powerPlant.ac_capacity, powerPlant.dc_capacity]
    )
}

const insertGeneratingUnitTransaction = async (unit) => {
    if (unit.nominalPower && unit.nominalPower.mrid) {
        await insertActivePowerTransaction(unit.nominalPower, db)
    }
    if (unit.dcRatedPower && unit.dcRatedPower.mrid) {
        await insertActivePowerTransaction(unit.dcRatedPower, db)
    }

    await insertPowerSystemResourceTransaction(unit, db)
    await runSQL(
        `INSERT INTO equipment(
            mrid, aggregate, in_service, network_analysis_enabled,
            normally_in_service, equipment_container
         ) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(mrid) DO UPDATE SET
            aggregate = excluded.aggregate,
            in_service = excluded.in_service,
            network_analysis_enabled = excluded.network_analysis_enabled,
            normally_in_service = excluded.normally_in_service,
            equipment_container = excluded.equipment_container`,
        [
            unit.mrid,
            unit.aggregate,
            unit.in_service,
            unit.network_analysis_enabled,
            unit.normally_in_service,
            unit.equipment_container
        ]
    )
    await runSQL(
        `INSERT INTO generating_unit(mrid, nominal_p, dc_rated_power, quantity, sequence_number)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(mrid) DO UPDATE SET
            nominal_p = excluded.nominal_p,
            dc_rated_power = excluded.dc_rated_power,
            quantity = excluded.quantity,
            sequence_number = excluded.sequence_number`,
        [
            unit.mrid,
            unit.nominalPower ? unit.nominalPower.mrid : null,
            unit.dcRatedPower ? unit.dcRatedPower.mrid : null,
            unit.quantity,
            unit.sequence_number
        ]
    )
    if (unit.userIdentifiedObject && unit.userIdentifiedObject.mrid) {
        await insertUserIdentifiedObjectTransaction(unit.userIdentifiedObject, db)
    }
}

const syncRemovedGeneratingUnitsTransaction = async (plantId, currentUnits) => {
    const existing = await allSQL(
        `SELECT gu.mrid, gu.nominal_p, gu.dc_rated_power
         FROM generating_unit gu
         JOIN equipment e ON e.mrid = gu.mrid
         WHERE e.equipment_container = ?`,
        [plantId]
    )
    const currentIds = new Set(currentUnits.map((unit) => unit.mrid))
    for (const row of existing) {
        if (currentIds.has(row.mrid)) continue
        await runSQL('DELETE FROM user_identified_object WHERE identified_object_id = ?', [row.mrid])
        await runSQL('DELETE FROM identified_object WHERE mrid = ?', [row.mrid])
        if (row.nominal_p) await runSQL('DELETE FROM active_power WHERE mrid = ?', [row.nominal_p])
        if (row.dc_rated_power) await runSQL('DELETE FROM active_power WHERE mrid = ?', [row.dc_rated_power])
    }
}

const insertAttachmentTransaction = async (entity) => {
    if (!entity.attachment || !entity.attachment.id || !entity.attachment.path) return
    const pathData = JSON.parse(entity.attachment.path)
    if (!Array.isArray(pathData)) return
    const destination = safePathSegment(entity.powerPlant.mrid)
    const stored = pathData.map((item) => ({
        ...item,
        path: path.join(attachmentContext.getAttachmentDir(), destination, path.basename(item.path))
    }))
    entity.attachment.path = JSON.stringify(stored)
    await uploadAttachmentTransaction(entity.attachment, db)
}

export const insertPowerPlantEntity = async (entity) => {
    if (!entity || !entity.powerPlant || !entity.powerPlant.mrid) {
        return { success: false, message: 'Power Plant must have a valid MRID' }
    }

    await ensurePowerPlantSchema()
    const hasAttachments = Boolean(entity.attachment && entity.attachment.path)
    const plantId = entity.powerPlant.mrid
    const userId = entity.user && entity.user.user_id
    const organisationId = entity.organisationPsr && entity.organisationPsr.organisation_id
    const existingResult = await getPowerPlantEntityById(plantId, userId, organisationId)
    const existingEntity = existingResult.success ? existingResult.data : null
    const changes = powerPlantChanges(existingEntity, entity)
    const changed = !existingEntity || changes.length > 0

    try {
        if (hasAttachments) {
            backupAllFilesInDir(null, null, plantId)
            const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, plantId)
            if (!syncResult.success) throw syncResult.error || new Error('Failed syncing files')
        }

        await runSQL('BEGIN TRANSACTION')
        if (entity.psrType && entity.psrType.mrid) await insertPsrTypeTransaction(entity.psrType, db)
        if (entity.streetDetail && entity.streetDetail.mrid) await insertStreetDetailTransaction(entity.streetDetail, db)
        if (entity.townDetail && entity.townDetail.mrid) await insertTownDetailTransaction(entity.townDetail, db)
        if (entity.streetAddress && entity.streetAddress.mrid) await insertStreetAddressTransaction(entity.streetAddress, db)
        if (entity.location && entity.location.mrid) await insertLocationTransaction(entity.location, db)
        if (entity.acCapacity && entity.acCapacity.mrid) await insertActivePowerTransaction(entity.acCapacity, db)
        if (entity.dcCapacity && entity.dcCapacity.mrid) await insertActivePowerTransaction(entity.dcCapacity, db)

        await insertPowerPlantRowTransaction(entity.powerPlant)

        if (entity.electronicAddress && entity.electronicAddress.mrid) await insertElectronicAddressTransaction(entity.electronicAddress, db)
        if (entity.telephoneNumber && entity.telephoneNumber.mrid) await insertTelephoneNumberTransaction(entity.telephoneNumber, db)
        if (entity.person && entity.person.mrid) await insertPersonTransaction(entity.person, db)
        if (entity.personRole && entity.personRole.mrid) await insertPersonRoleTransaction(entity.personRole, db)
        if (entity.user && entity.user.user_id) await insertUserTransaction(entity.user, db)
        if (entity.userIdentifiedObject && entity.userIdentifiedObject.mrid) {
            await insertUserIdentifiedObjectTransaction(entity.userIdentifiedObject, db)
        }
        if (entity.personPowerPlant && entity.personPowerPlant.mrid) {
            await runSQL(
                `INSERT INTO person_power_plant(mrid, person_id, power_plant_id)
                 VALUES (?, ?, ?)
                 ON CONFLICT(mrid) DO UPDATE SET
                    person_id = excluded.person_id,
                    power_plant_id = excluded.power_plant_id`,
                [entity.personPowerPlant.mrid, entity.personPowerPlant.person_id, entity.personPowerPlant.power_plant_id]
            )
        }
        if (entity.organisationLocation && entity.organisationLocation.mrid) {
            await insertOrganisationLocationTransaction(entity.organisationLocation, db)
        }
        if (entity.organisationPsr && entity.organisationPsr.mrid) {
            await insertOrganisationPsrTransaction(entity.organisationPsr, db)
        }
        if (entity.organisationPerson && entity.organisationPerson.mrid) {
            await insertOrganisationPersonTransaction(entity.organisationPerson, db)
        }
        if (Array.isArray(entity.positionPoint) && entity.positionPoint.length > 0) {
            await insertPositionPointArrayTransaction(entity.positionPoint, entity.location.mrid, db)
        }

        const units = Array.isArray(entity.generatingUnits) ? entity.generatingUnits : []
        await syncRemovedGeneratingUnitsTransaction(plantId, units)
        for (const unit of units) await insertGeneratingUnitTransaction(unit)
        await insertAttachmentTransaction(entity)
        await runSQL('COMMIT')

        if (hasAttachments) deleteBackupFiles(null, plantId)
        if (changed) {
            await tryWriteAuditLog({
                objectType: 'Power Plant',
                objectId: plantId,
                objectName: entity.powerPlant.name || 'Unnamed Power Plant',
                action: existingEntity ? 'UPDATE' : 'INSERT',
                changes,
                user: {
                    id: entity.user && entity.user.user_id,
                    name: entity.user && (entity.user.name || entity.user.username)
                }
            })
        }
        return { success: true, data: entity, changed, message: 'Power Plant saved successfully' }
    } catch (error) {
        try {
            await runSQL('ROLLBACK')
        } catch (rollbackError) {
            console.error('Rollback Power Plant save failed:', rollbackError)
        }
        if (hasAttachments) {
            try {
                restoreFiles(null, null, plantId)
            } catch (restoreError) {
                console.error('Restore Power Plant attachments failed:', restoreError)
            }
        }
        return { success: false, error, message: error.message || 'Power Plant save failed' }
    }
}

export const getPowerPlantsInOrganisationForUser = async (organisationId, userId) => {
    await ensurePowerPlantSchema()
    const rows = await allSQL(
        `SELECT pp.*, io.name, io.alias_name, io.description
         FROM power_plant pp
         JOIN identified_object io ON io.mrid = pp.mrid
         JOIN organisation_psr opsr ON opsr.psr_id = pp.mrid
         JOIN user_identified_object uio ON uio.identified_object_id = pp.mrid
         WHERE CAST(opsr.organisation_id AS TEXT) = CAST(? AS TEXT)
           AND CAST(uio.user_id AS TEXT) = CAST(? AS TEXT)
         ORDER BY io.name`,
        [organisationId, userId]
    )
    return { success: rows.length > 0, data: rows, message: rows.length > 0 ? 'Power Plants retrieved' : 'No Power Plants found' }
}

export const getPowerPlantEntityById = async (plantId, userId, organisationId) => {
    await ensurePowerPlantSchema()
    const powerPlant = await getSQL(
        `SELECT pp.*, io.name, io.alias_name, io.description, psr.psr_type_id, psr.location
         FROM power_plant pp
         JOIN identified_object io ON io.mrid = pp.mrid
         JOIN power_system_resource psr ON psr.mrid = pp.mrid
         WHERE pp.mrid = ?`,
        [plantId]
    )
    if (!powerPlant) return { success: false, message: 'Power Plant not found' }

    const entity = {
        powerPlant,
        streetDetail: {},
        townDetail: {},
        streetAddress: {},
        location: {},
        electronicAddress: {},
        telephoneNumber: {},
        person: {},
        personRole: {},
        user: {},
        attachment: {},
        positionPoint: [],
        userIdentifiedObject: {},
        personPowerPlant: {},
        organisationLocation: {},
        organisationPerson: {},
        organisationPsr: {},
        psrType: {},
        acCapacity: {},
        dcCapacity: {},
        generatingUnits: []
    }

    const psrType = await getPsrTypeById(powerPlant.psr_type_id)
    if (psrType.success) entity.psrType = psrType.data
    const location = await getLocationById(powerPlant.location)
    if (location.success) entity.location = location.data
    if (entity.location.main_address) {
        const streetAddress = await getStreetAddressById(entity.location.main_address)
        if (streetAddress.success) entity.streetAddress = streetAddress.data
        if (entity.streetAddress.street_detail) {
            const streetDetail = await getStreetDetailById(entity.streetAddress.street_detail)
            if (streetDetail.success) entity.streetDetail = streetDetail.data
        }
        if (entity.streetAddress.town_detail) {
            const townDetail = await getTownDetailById(entity.streetAddress.town_detail)
            if (townDetail.success) entity.townDetail = townDetail.data
        }
    }

    const personLink = await getSQL('SELECT * FROM person_power_plant WHERE power_plant_id = ? LIMIT 1', [plantId])
    if (personLink) {
        entity.personPowerPlant = personLink
        const person = await getPersonById(personLink.person_id)
        if (person.success) entity.person = person.data
        if (entity.person.mrid) {
            const role = await getPersonRoleByPersonId(entity.person.mrid)
            if (role.success) entity.personRole = role.data
        }
        if (entity.person.electronic_address) {
            const address = await getElectronicAddressById(entity.person.electronic_address)
            if (address.success) entity.electronicAddress = address.data
        }
        if (entity.person.mobile_phone) {
            const phone = await getTelephoneNumberById(entity.person.mobile_phone)
            if (phone.success) entity.telephoneNumber = phone.data
        }
    }

    const [positionPoints, attachment, uio, user, orgLocation, orgPerson, orgPsr] = await Promise.all([
        entity.location.mrid ? getPositionPointByLocationId(entity.location.mrid) : Promise.resolve({ success: false }),
        getAttachmentByForeignIdAndType(plantId, 'power-plant'),
        getUserIdentifiedObjectByUserIdAndIdentifiedObjectId(userId, plantId),
        getUserById(userId),
        entity.location.mrid ? getOrganisationLocationByOrganisationIdAndLocationId(organisationId, entity.location.mrid) : Promise.resolve({ success: false }),
        entity.person.mrid ? getOrganisationPersonByOrganisationIdAndPersonId(organisationId, entity.person.mrid) : Promise.resolve({ success: false }),
        getOrganisationPsrByOrganisationIdAndPsrId(organisationId, plantId)
    ])
    if (positionPoints.success) entity.positionPoint = positionPoints.data
    if (attachment.success) entity.attachment = attachment.data
    if (uio.success) entity.userIdentifiedObject = uio.data
    if (user.success) entity.user = user.data
    if (orgLocation.success) entity.organisationLocation = orgLocation.data
    if (orgPerson.success) entity.organisationPerson = orgPerson.data
    if (orgPsr.success) entity.organisationPsr = orgPsr.data

    if (powerPlant.ac_capacity) entity.acCapacity = await getSQL('SELECT * FROM active_power WHERE mrid = ?', [powerPlant.ac_capacity]) || {}
    if (powerPlant.dc_capacity) entity.dcCapacity = await getSQL('SELECT * FROM active_power WHERE mrid = ?', [powerPlant.dc_capacity]) || {}

    const units = await allSQL(
        `SELECT gu.*, io.name, io.alias_name, io.description,
                e.aggregate, e.in_service, e.network_analysis_enabled,
                e.normally_in_service, e.equipment_container
         FROM generating_unit gu
         JOIN equipment e ON e.mrid = gu.mrid
         JOIN identified_object io ON io.mrid = gu.mrid
         WHERE e.equipment_container = ?
         ORDER BY gu.sequence_number`,
        [plantId]
    )
    for (const unit of units) {
        unit.nominalPower = unit.nominal_p
            ? await getSQL('SELECT * FROM active_power WHERE mrid = ?', [unit.nominal_p]) || {}
            : {}
        unit.dcRatedPower = unit.dc_rated_power
            ? await getSQL('SELECT * FROM active_power WHERE mrid = ?', [unit.dc_rated_power]) || {}
            : {}
        const unitUio = await getUserIdentifiedObjectByUserIdAndIdentifiedObjectId(userId, unit.mrid)
        unit.userIdentifiedObject = unitUio.success ? unitUio.data : {}
    }
    entity.generatingUnits = units
    return { success: true, data: entity, message: 'Power Plant retrieved successfully' }
}
