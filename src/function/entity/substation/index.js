import { insertSubstationTransaction } from '@/function/cim/substation'
import { insertStreetDetailTransaction } from '@/function/cim/streetDetail'
import { insertTownDetailTransaction } from '@/function/cim/townDetail'
import { insertStreetAddressTransaction } from '@/function/cim/streetAddress'
import { insertLocationTransaction } from '@/function/cim/location'
import { insertElectronicAddressTransaction } from '@/function/cim/electronicAddress'
import { insertTelephoneNumberTransaction } from '@/function/cim/telephoneNumber'
import { insertPersonTransaction } from '@/function/cim/person'
import { insertPersonRoleTransaction } from '@/function/cim/personRole'
import { insertUserTransaction } from '@/function/entity/user'
import { insertUserIdentifiedObjectTransaction } from '@/function/entity/userIdentifiedObject'
import { insertPersonSubstationTransaction } from '@/function/entity/personSubstation'
import { insertAttachment } from '@/function/entity/attachment'
import { insertOrganisationLocationTransaction } from '@/function/entity/organisationLocation'
import { insertPositionPointArrayTransaction } from '@/function/cim/positionPoint'
import { insertPsrTypeTransaction } from '@/function/cim/psrType'

export const insertSubstationEntity = async (db, entity) => {
    return new Promise(async (resolve, reject) => {
        try {
            db.serialize(async () => {
                db.run('BEGIN TRANSACTION')
                // Insert từng thành phần, kiểm tra lỗi từng bước
                try {
                    if (entity.substation && entity.substation.mrid) await insertSubstationTransaction(entity.substation)
                    if (entity.psrType && entity.psrType.mrid) await insertPsrTypeTransaction(entity.psrType)
                    if (entity.streetDetail && entity.streetDetail.mrid) await insertStreetDetailTransaction(entity.streetDetail)
                    if (entity.townDetail && entity.townDetail.mrid) await insertTownDetailTransaction(entity.townDetail)
                    if (entity.streetAddress && entity.streetAddress.mrid) await insertStreetAddressTransaction(entity.streetAddress)
                    if (entity.location && entity.location.mrid) await insertLocationTransaction(entity.location)
                    if (entity.electronicAddress && entity.electronicAddress.mrid) await insertElectronicAddressTransaction(entity.electronicAddress)
                    if (entity.telephoneNumber && entity.telephoneNumber.mrid) await insertTelephoneNumberTransaction(entity.telephoneNumber)
                    if (entity.personRole && entity.personRole.mrid) await insertPersonRoleTransaction(entity.personRole)
                    if (entity.person && entity.person.mrid) await insertPersonTransaction(entity.person)
                    if (entity.user && entity.user.mrid) await insertUserTransaction(entity.user)
                    if (entity.userIdentifiedObject && entity.userIdentifiedObject.mrid) await insertUserIdentifiedObjectTransaction(entity.userIdentifiedObject)
                    if (entity.personSubstation && entity.personSubstation.mrid) await insertPersonSubstationTransaction(entity.personSubstation)
                    if (entity.attachment && entity.attachment.mrid) await insertAttachmentTransaction(entity.attachment)
                    if (entity.organisationLocation && entity.organisationLocation.mrid) await insertOrganisationLocationTransaction(entity.organisationLocation)
                    if (entity.positionPoint && Array.isArray(entity.positionPoint)) {
                        await insertPositionPointArrayTransaction(entity.positionPoint)
                    }
                    db.run('COMMIT')
                    return resolve({ success: true, data: entity, message: 'Insert SubstationEntity completed' })
                } catch (err) {
                    db.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Insert SubstationEntity failed' })
                }
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Insert SubstationEntity failed' })
        }
    })
}