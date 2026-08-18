/* eslint-disable */
import { mapState } from 'vuex'
import uuid from '@/utils/uuid'
import OrganisationDto from '@/views/Dto/Organisation'
import * as orgMapper from '@/views/Mapping/Organisation/index'

export default {
    data() {
        return {
            properties: new OrganisationDto(),
            attachmentData: [],
        }
    },
    methods: {
        async saveCtrS() {
            console.log('[ORGANISATION] saveCtrS called')
            const data = await this.saveOrganisation()
            console.log('[ORGANISATION] saveOrganisation result:', data)
            if (data.success) {
                this.$message.success("Organisation saved successfully")
                
                console.log('[ORGANISATION] Emitting reload event with saved data')
                // ✅ Emit reload event với data đã save - KHÔNG cần gọi API!
                this.$emit('reload', { savedData: this.properties, changed: data.changed === true })
                console.log('[ORGANISATION] Reload event emitted')
            } else {
                this.$message.error("Failed to save organisation")
            }
        },

        resetForm() {
            this.properties = new OrganisationDto()
            this.attachmentData = []
        },

        loadData(data) {
            this.properties = data
            if (data.attachment && data.attachment.path) {
                this.attachmentData = JSON.parse(data.attachment.path)
            } else {
                this.attachmentData = []
            }
        },

        async saveOrganisation() {
            if (this.properties.name === '') {
                this.$message.error("Name is required")
                return
            } else {
                try {
                    if (this.properties.organisationId === null || this.properties.organisationId === '') {
                        this.properties.organisationId = uuid.newUuid()
                    }
                    if (this.properties.parentId === null || this.properties.parentId === '') {
                        this.properties.parentId = this.parent ? this.parent.mrid : null
                    }
                    const dto = JSON.parse(JSON.stringify(this.properties))
                    const dtoData = this.checkOrganisation(dto)
                    const data = orgMapper.OrgDtoToOrgEntity(dtoData)
                    const result = await window.electronAPI.insertParentOrganizationEntity(data)
                    if (result.success) {
                        if (window.electronAPI.ensureUserOwnership) {
                            await window.electronAPI.ensureUserOwnership(
                                this.$store.state.user.user_id,
                                dtoData.organisationId
                            )
                        }
                        return {
                            data: result.data,
                            success: true,
                            changed: result.changed
                        }
                    } else {
                        this.$message.error('Error saving organisation: ' + result.message)
                        console.error('Error saving organisation:', result.message)
                        return {
                            success: false
                        }
                    }

                } catch (err) {
                    console.error('Error saving organisation:', err)
                    return { success: false }
                }

            }
        },

        checkElectronicAddress(dto) {
            if (dto.electronicAddressId === null || dto.electronicAddressId === '') {
                if (dto.email === '' && dto.fax === '') {
                    dto.electronicAddressId = null
                } else {
                    dto.electronicAddressId = uuid.newUuid()
                }
            }
        },

        checkTelephoneNumber(dto) {
            if (dto.telephoneNumberId === null || dto.telephoneNumberId === '') {
                if (dto.phoneNumber === '') {
                    dto.telephoneNumberId = null
                } else {
                    dto.telephoneNumberId = uuid.newUuid()
                }
            }
        },

        checkStreetDetail(dto) {
            if (dto.streetDetailId === null || dto.streetDetailId === '') {
                if (dto.street === '') {
                    dto.streetDetailId = null
                } else {
                    dto.streetDetailId = uuid.newUuid()
                }
            }
        },

        checkTownDetail(dto) {
            if (dto.townDetailId === null || dto.townDetailId === '') {
                if (dto.city === '' && dto.state_or_province === '' &&
                    dto.country === '' && dto.postal_code === '' && dto.district_or_town === '' &&
                    dto.ward_or_commune === '') {
                    dto.townDetailId = null
                } else {
                    dto.townDetailId = uuid.newUuid()
                }
            }
        },

        checkStreetAddress(dto) {
            if (dto.streetAddressId === null || dto.streetAddressId === '') {
                if ((dto.streetDetailId === null || dto.streetDetailId === '') && (dto.townDetailId === null || dto.townDetailId === '')) {
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

        checkUser(dto) {
            dto.user_id = this.$store.state.user.user_id
            dto.user_name = this.$store.state.user.name
        },

        checkAttachment(dto) {
            if (dto.attachmentId === null || dto.attachmentId === '') {
                if (this.attachmentData.length > 0) {
                    dto.attachmentId = uuid.newUuid()
                    dto.attachment.id = dto.attachmentId
                    dto.attachment.name = null
                    dto.attachment.path = JSON.stringify(this.attachmentData)
                    dto.attachment.type = 'organisation'
                    dto.attachment.id_foreign = this.properties.organisationId
                }
            } else {
                dto.attachment.path = JSON.stringify(this.attachmentData)
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
            return dto
        }

    }
}
