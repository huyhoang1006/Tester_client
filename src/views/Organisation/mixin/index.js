/* eslint-disable */
import {mapState} from 'vuex'
import uuid from '@/utils/uuid'
import OrganisationDto from '@/views/Dto/Organisation'
import * as orgMapper from '@/views/Mapping/Organisation/index'
import ConfigurationEvent from '@/views/Cim/ConfigurationEvent'

export default {
    data() {
        return {
            properties : new OrganisationDto(),
            attachmentData : [],
        }
    },
    methods: {
        saveCtrS() {
            this.saveOrganisation()
        },

        resetForm() {
            this.properties = new OrganisationDto()
            this.attachmentData = []
        },

        async saveOrganisation() {
            if(this.properties.name === '') {
                this.$message.error("Name is required")
            } else {
                try {
                    this.properties.organisationId = uuid.newUuid()
                    this.properties.parentId = this.parent ? this.parent.mrid : null
                    const dto = JSON.parse(JSON.stringify(this.properties))
                    const dtoData = this.checkOrganisation(dto)
                    const data = orgMapper.OrgDtoToOrgEntity(dtoData)
                    const result = await window.electronAPI.insertParentOrganizationEntity(data)
                    if(result.success) {
                        return {
                            data: result.data,
                            success: true
                        }
                    } else {
                        this.$message.error('Error saving organisation: ' + result.message)
                        console.error('Error saving organisation:', result.message)
                        return {
                            success: false
                        }
                    }

                } catch (err) {
                    return {success : false}
                }
                
            }
        },
        
        checkElectronicAddress(dto) {
            if(dto.electronicAddressId === null || dto.electronicAddressId === '') {
                if(dto.email === '' && dto.fax === '') {
                    dto.electronicAddressId = null
                } else {
                    dto.electronicAddressId = uuid.newUuid()
                }
            }
        },

        checkTelephoneNumber(dto) {
            if(dto.telephoneNumberId === null || dto.telephoneNumberId === '') {
                if(dto.phoneNumber === '') {
                    dto.telephoneNumberId = null
                } else {
                    dto.telephoneNumberId = uuid.newUuid()
                }
            }
        },

        checkStreetDetail(dto) {
            if (dto.streetDetailId === null || dto.streetDetailId === '') {
                if(dto.street === '') {
                    dto.streetDetailId = null
                } else {
                    dto.streetDetailId = uuid.newUuid()
                }
            }
        },

        checkTownDetail(dto) {
            if(dto.townDetailId === null || dto.townDetailId === '') {
                if(dto.city === '' && dto.state_or_province === '' &&
                    dto.country === '' && dto.district_or_town === '' &&
                    dto.ward_or_commune === '') {
                    dto.townDetailId = null
                } else {
                    dto.townDetailId = uuid.newUuid()
                }
            }
        },

        checkStreetAddress(dto) {
            if(dto.streetAddressId === null || dto.streetAddressId === '') {
                if((dto.streetDetailId === null || dto.streetDetailId === '') && (dto.townDetailId === null || dto.townDetailId === '')) {
                    dto.streetAddressId = null
                } else {
                    dto.streetAddressId = uuid.newUuid()
                }
            }
        },

        checkPositionPoint(dto) {
            if (dto.positionPoints.x.length !== 0) {
                dto.positionPoints.x.forEach((element, index) => {
                    if (element.id === null || element.id === '') {
                        element.id = uuid.newUuid()
                    }
                    if (dto.positionPoints.y[index].id === null || dto.positionPoints.y[index].id === '') {
                        dto.positionPoints.y[index].id = uuid.newUuid()
                    }
                    if (dto.positionPoints.z[index].id === null || dto.positionPoints.z[index].id === '') {
                        dto.positionPoints.z[index].id = uuid.newUuid()
                    }
                });
            }
        },

        checkConfigurationEvent(dto) {
            if(dto.attachmentId !== null && dto.attachmentId !== '') {
                const configEventAttachment = new ConfigurationEvent()
                configEventAttachment.mrid = uuid.newUuid()
                configEventAttachment.name = 'Change Attachment'
                configEventAttachment.effective_date_time = new Date().toISOString()
                configEventAttachment.changed_attachment = dto.attachmentId
                configEventAttachment.user_name = this.$store.state.user.name
                configEventAttachment.modified_by = this.$store.state.user.user_id
                if(this.mode === this.$constant.ADD) {
                    configEventAttachment.type = "INSERT"
                } else if(this.mode === this.$constant.EDIT) {
                    configEventAttachment.type = "UPDATE"
                }
                configEventAttachment.description = `Attachment changed of ${dto.name}`
                dto.configurationEvent.push(configEventAttachment)
            }

            if(dto.organisationId !== null && dto.organisationId !== '') {
                const configEventAttachment = new ConfigurationEvent()
                configEventAttachment.mrid = uuid.newUuid()
                configEventAttachment.name = 'Change organisation'
                configEventAttachment.effective_date_time = new Date().toISOString()
                configEventAttachment.changed_attachment = dto.organisationId
                configEventAttachment.user_name = this.$store.state.user.name
                configEventAttachment.modified_by = this.$store.state.user.user_id
                if(this.mode === this.$constant.ADD) {
                    configEventAttachment.type = "INSERT"
                } else if(this.mode === this.$constant.EDIT) {
                    configEventAttachment.type = "UPDATE"
                }
                configEventAttachment.description = `Organisation changed of ${dto.name}`
                dto.configurationEvent.push(configEventAttachment)
            }
        },
        
        checkUser(dto) {
            dto.user_id = this.$store.state.user.user_id
            dto.user_name = this.$store.state.user.name
        },

        checkAttachment(dto) {
            if(dto.attachmentId === null || dto.attachmentId === '') {
                if (this.attachmentData.length > 0) {
                    dto.attachmentId = uuid.newUuid()
                    dto.attachment.id = dto.attachmentId
                    dto.attachment.name = null
                    dto.attachment.path = JSON.stringify(this.attachmentData)
                    dto.attachment.type = 'organisation'
                    dto.attachment.id_foreign = this.properties.orgId
                }
            } 
        },

        checkOrganisation(dto) {
            this.checkElectronicAddress(dto)
            this.checkTelephoneNumber(dto)
            this.checkStreetDetail(dto)
            this.checkTownDetail(dto)
            this.checkStreetAddress(dto)
            this.checkPositionPoint(dto)
            this.checkAttachment(dto)
            this.checkUser(dto)
            this.checkConfigurationEvent(dto)
            return dto
        }
        
    }
}