import {mapState} from 'vuex'
import substationDto from '@/views/Dto/Substation'
import uuid from '@/utils/uuid'

export default {
    data() {
        return {
            properties: new substationDto(),
            attachmentData : [],
        }
    },
    computed: mapState(['user', 'selectedLocation']),
    methods: {
        async saveAttachement() {
        },
        async saveSubstation() {
            if (this.properties.name === '') {
                this.$message.error('Please enter the name of the substation')
                return false
            } else {
                this.properties.subsId = uuid.newUuid()
                // this.checkSubstation()
                console.log(this.attachmentData)
            }
        },
        checkStreetDetail() {
            if(this.properties.street === '') {
                this.properties.streetDetailId = null
            } else {
                this.properties.streetDetailId = uuid.newUuid()
            }
        },

        checkTownDetail() {
            if(this.properties.city === '' && this.properties.state_or_province === '' &&
                this.properties.country === '' && this.properties.district_or_town === '' &&
                this.properties.ward_or_commune === '') {
                this.properties.townDetailId = null
            } else {
                this.properties.townDetailId = uuid.newUuid()
            }
        },

        checkStreetAddress() {
            if(this.properties.streetDetailId === null && this.properties.townDetailId === null)
                this.properties.streetAddressId = null
            else {
                this.properties.streetAddressId = uuid.newUuid()
            }
        },

        checkLocation() {
            if(this.properties.streetAddressId === null) {
                this.properties.locationId = null
            } else {
                this.properties.locationId = uuid.newUuid()
            }
        },

        checkElectronicAddress() {
            if(this.properties.email === '' && this.properties.fax === '') {
                this.properties.electronicAddressId = null
            } else {
                this.properties.electronicAddressId = uuid.newUuid()
            }
        },

        checkTelephoneNumber() {
            if(this.properties.phoneNumber === '') {
                this.properties.telephoneNumberId = null
            } else {
                this.properties.telephoneNumberId = uuid.newUuid()
            }
        },

        checkPersonRole() {
            if(this.properties.department === '' && this.properties.position === '') {
                this.properties.personRoleId = null
            } else {
                this.properties.personRoleId = uuid.newUuid()
            }
        },

        checkPerson() {
            if(this.properties.electronicAddressId === null &&
                this.properties.telephoneNumberId === null && this.properties.personRoleId === null) {
                if(this.properties.personName !== null) {
                    this.properties.personId = uuid.newUuid()
                } else {
                    this.properties.personId = null
                }
            } else {
                if(this.properties.personName !== null) {
                    this.properties.personId = uuid.newUuid()
                } else {
                    this.$message.error('Please enter the name of the person')
                    return false
                }
            }
        },

        checkPersonSubstation() {
            if(this.properties.personId === null || this.properties.subsId === null) {
                this.properties.personSubstationId = null
            } else {
                this.properties.personSubstationId = uuid.newUuid()
            }
        },

        checkOrganisationLocation() {
            if(this.properties.organisationId === null || this.properties.locationId === null) {
                this.properties.organisationLocationId = null
            } else {
                this.properties.organisationLocationId = uuid.newUuid()
            }
        },

        checkUser() {
            this.properties.userId = this.$store.state.user.userId
        },

        checkUserIdentifiedObject() {
            if(this.properties.subsId === null || this.properties.userId === null) {
                this.properties.userIdentifiedObjectId = null
            } else {
                this.properties.userIdentifiedObjectId = uuid.newUuid()
            }
        },

        checkAttacment() {
            if (this.attachmentData.length > 0) {
                this.properties.attachmentId = uuid.newUuid()
                this.properties.attachment.name = JSON.stringify(this.attachmentData)
                this.properties.attachment.path = ''
                this.properties.attachment.type = 'substation'
                this.properties.attachment.id_foreign = this.properties.subsId
            } else {
                this.properties.attachmentId = null
            }
        },

        checkPsrType() {
            if (this.properties.type === '') {
                this.properties.psrTypeId = null
            } else {
                this.properties.psrTypeId = uuid.newUuid()
            }
        },

        checkSubstation() {
            this.checkStreetDetail()
            this.checkTownDetail()
            this.checkStreetAddress()
            this.checkLocation()
            this.checkElectronicAddress()
            this.checkTelephoneNumber()
            this.checkPersonRole()
            this.checkPerson()
            this.checkPersonSubstation()
            this.checkOrganisationLocation()
            this.checkUser()
            this.checkUserIdentifiedObject()
            this.checkAttacment()
        }
    }
}
