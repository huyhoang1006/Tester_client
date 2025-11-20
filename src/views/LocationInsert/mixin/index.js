/* eslint-disable */
import { mapState } from 'vuex'
import substationDto from '@/views/Dto/Substation'
import uuid from '@/utils/uuid'
import * as subsMapper from '@/views/Mapping/Substation/index'
import ConfigurationEvent from '@/views/Cim/ConfigurationEvent'

export default {
    data() {
        return {
            properties: new substationDto(),
            attachmentData: [],
            personListData: this.personList,
            locationListData: this.locationList,
            locationTemp: "",
            personTemp: "",
            substation: null
        }
    },
    computed: mapState(['user', 'selectedLocation']),
    methods: {
        async saveCtrS() {
            try {
                const { success, data } = await this.saveSubstation()
                if (success) {
                    this.$message.success('Substation saved successfully')
                    this.$emit('reload', this.substation, null)
                }
            } catch (error) {
                console.error('Error saving substation:', error);
            }
        },

        async loadData(data) {
            try {
                const { locationList, personList, dto, substation } = data
                this.properties = dto
                this.locationListData = locationList
                console.log('Location List Data:', this.locationListData);
                this.personListData = personList
                this.locationTemp = this.properties.locationId || ""
                this.personTemp = this.properties.personId || ""
                this.substation = substation
                if (this.properties.attachment && this.properties.attachment.path) {
                    this.attachmentData = JSON.parse(this.properties.attachment.path)
                }
            } catch (error) {
                this.$message.error('Error loading locations: ' + error.message);
                console.error('Error loading locations:', error);
            }
        },

        resetForm() {
            console.log(this.organisationId)
            this.properties = new substationDto()
            this.attachmentData = []
            this.personListData = this.personList
            this.locationListData = this.locationList
            this.locationTemp = ""
            this.personTemp = ""
        },

        async saveSubstation() {
            if (this.properties.name === '') {
                this.$message.error('Please enter the name of the substation')
                return {
                    success: false
                }
            } else {
                if (this.properties.subsId === null || this.properties.subsId === '') {
                    this.properties.subsId = uuid.newUuid()
                }
                const dto = JSON.parse(JSON.stringify(this.properties))
                const sign = this.checkSubstation(dto)
                if (!sign) {
                    return {
                        success: false
                    }
                } else {
                    try {
                        const substationEntity = subsMapper.mapDtoToEntity(dto)
                        const result = await window.electronAPI.insertSubstationEntity(substationEntity)
                        if (result.success) {
                            return {
                                data: result.data,
                                success: true
                            }
                        } else {
                            this.$message.error('Error saving substation: ' + result.message)
                            console.error('Error saving substation:', result.message)
                            return {
                                success: false
                            }
                        }
                    } catch (error) {
                        this.$message.error('Error saving substation: ' + error.message)
                        console.error('Error saving substation:', error)
                        return {
                            success: false
                        }
                    }
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
                    dto.country === '' && dto.district_or_town === '' &&
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

        checkLocation(dto) {
            if (dto.locationId === null || dto.locationId === '') {
                if (dto.streetAddressId === null && dto.positionPoints.x.length === 0) {
                    if (dto.locationName === '') {
                        dto.locationId = null
                    } else {
                        dto.locationId = uuid.newUuid()
                    }
                } else {
                    if (dto.locationName === '') {
                        this.$message.error('Please enter the name of the location')
                        dto.locationId = null
                        return false
                    } else {
                        dto.locationId = uuid.newUuid()
                    }
                }
                return true
            } else {
                return true
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

        checkPersonRole(dto) {
            if (dto.personRoleId === null || dto.personRoleId === '') {
                if (dto.department === '' && dto.position === '') {
                    dto.personRoleId = null
                } else {
                    dto.personRoleId = uuid.newUuid()
                }
            }
        },

        checkPerson(dto) {
            if (dto.personId === null || dto.personId === '') {
                if (dto.electronicAddressId === null &&
                    dto.telephoneNumberId === null && dto.personRoleId === null) {
                    if (dto.personName !== '') {
                        dto.personId = uuid.newUuid()
                    } else {
                        dto.personId = null
                    }
                } else {
                    if (dto.personName !== '') {
                        dto.personId = uuid.newUuid()
                    } else {
                        this.$message.error('Please enter the name of the person')
                        return false
                    }
                }
                return true
            } else {
                return true
            }
        },

        checkPersonSubstation(dto) {
            if (dto.personSubstationId === null || dto.personSubstationId === '') {
                if (dto.personId === null || dto.subsId === null) {
                    dto.personSubstationId = null
                } else {
                    dto.personSubstationId = uuid.newUuid()
                }
            }
        },

        checkOrganisationLocation(dto) {
            if (dto.organisationLocationId === null || dto.organisationLocationId === '') {
                if (dto.organisationId === null || dto.locationId === null) {
                    dto.organisationLocationId = null
                } else {
                    dto.organisationLocationId = uuid.newUuid()
                }
            }
        },

        checkOrganisationPerson(dto) {
            if (dto.organisationPersonId === null || dto.organisationPersonId === '') {
                if (dto.organisationId === null || dto.personId === null) {
                    dto.organisationPersonId = null
                } else {
                    dto.organisationPersonId = uuid.newUuid()
                }
            }
        },

        checkOrganisationPsr(dto) {
            if (dto.organisationPsrId === null || dto.organisationPsrId === '') {
                if (dto.organisationId === null || dto.subsId === null) {
                    dto.organisationPsrId = null
                } else {
                    dto.organisationPsrId = uuid.newUuid()
                }
            }
        },

        checkUser(dto) {
            dto.userId = this.$store.state.user.user_id
            dto.userName = this.$store.state.user.name
        },

        checkOrganisation(dto) {
            dto.organisationId = this.organisationId
        },

        checkUserIdentifiedObject(dto) {
            if (dto.userIdentifiedObjectId === null || dto.userIdentifiedObjectId === '') {
                if (dto.subsId === null || dto.userId === null) {
                    dto.userIdentifiedObjectId = null
                } else {
                    dto.userIdentifiedObjectId = uuid.newUuid()
                }
            }
        },

        checkAttachment(dto) {
            if (dto.attachmentId === null || dto.attachmentId === '') {
                if (this.attachmentData.length > 0) {
                    dto.attachmentId = uuid.newUuid()
                    dto.attachment.id = dto.attachmentId
                    dto.attachment.name = null
                    dto.attachment.path = JSON.stringify(this.attachmentData)
                    dto.attachment.type = 'substation'
                    dto.attachment.id_foreign = dto.subsId
                }
            } else {
                dto.attachment.path = JSON.stringify(this.attachmentData)
            }
        },

        checkPsrType(dto) {
            if (dto.psrTypeId === null || dto.psrTypeId === '') {
                if (dto.type === '') {
                    dto.psrTypeId = null
                } else {
                    dto.psrTypeId = uuid.newUuid()
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
            if (dto.locationId !== null && dto.locationId !== '') {
                const configEventLocation = new ConfigurationEvent()
                configEventLocation.mrid = uuid.newUuid()
                configEventLocation.name = 'Change Location'
                configEventLocation.effective_date_time = new Date().toISOString()
                configEventLocation.changed_location = dto.locationId
                configEventLocation.user_name = this.$store.state.user.name
                configEventLocation.modified_by = this.$store.state.user.user_id
                if (this.mode === this.$constant.ADD) {
                    configEventLocation.type = "INSERT"
                } else if (this.mode === this.$constant.EDIT) {
                    configEventLocation.type = "UPDATE"
                }
                configEventLocation.description = `Location changed to ${dto.locationName}`
                dto.configurationEvent.push(configEventLocation)
            }
            if (dto.personId !== null && dto.personId !== '') {
                const configEventPerson = new ConfigurationEvent()
                configEventPerson.mrid = uuid.newUuid()
                configEventPerson.name = 'Change Person'
                configEventPerson.effective_date_time = new Date().toISOString()
                configEventPerson.changed_person = dto.personId
                configEventPerson.user_name = this.$store.state.user.name
                configEventPerson.modified_by = this.$store.state.user.user_id
                if (this.mode === this.$constant.ADD) {
                    configEventPerson.type = "INSERT"
                } else if (this.mode === this.$constant.EDIT) {
                    configEventPerson.type = "UPDATE"
                }
                configEventPerson.description = `Person changed to ${dto.personName}`
                dto.configurationEvent.push(configEventPerson)
            }

            if (dto.subsId !== null && dto.subsId !== '') {
                const configEventSubstation = new ConfigurationEvent()
                configEventSubstation.mrid = uuid.newUuid()
                configEventSubstation.name = 'Change Substation'
                configEventSubstation.effective_date_time = new Date().toISOString()
                configEventSubstation.power_system_resource = dto.subsId
                configEventSubstation.user_name = this.$store.state.user.name
                configEventSubstation.modified_by = this.$store.state.user.user_id
                if (this.mode === this.$constant.ADD) {
                    configEventSubstation.type = "INSERT"
                } else if (this.mode === this.$constant.EDIT) {
                    configEventSubstation.type = "UPDATE"
                }
                configEventSubstation.description = `Substation changed to ${dto.name}`
                dto.configurationEvent.push(configEventSubstation)
            }

            if (dto.attachmentId !== null && dto.attachmentId !== '') {
                const configEventAttachment = new ConfigurationEvent()
                configEventAttachment.mrid = uuid.newUuid()
                configEventAttachment.name = 'Change Attachment'
                configEventAttachment.effective_date_time = new Date().toISOString()
                configEventAttachment.changed_attachment = dto.attachmentId
                configEventAttachment.user_name = this.$store.state.user.name
                configEventAttachment.modified_by = this.$store.state.user.user_id
                if (this.mode === this.$constant.ADD) {
                    configEventAttachment.type = "INSERT"
                } else if (this.mode === this.$constant.EDIT) {
                    configEventAttachment.type = "UPDATE"
                }
                configEventAttachment.description = `Attachment changed of ${dto.name}`
                dto.configurationEvent.push(configEventAttachment)
            }
        },

        checkSubstation(dto) {
            this.checkPsrType(dto)
            this.checkStreetDetail(dto)
            this.checkTownDetail(dto)
            this.checkStreetAddress(dto)
            if (!this.checkLocation(dto)) {
                return false
            }
            this.checkElectronicAddress(dto)
            this.checkTelephoneNumber(dto)
            this.checkPersonRole(dto)
            if (!this.checkPerson(dto)) {
                return false
            }
            this.checkPersonSubstation(dto)
            this.checkUser(dto)
            this.checkOrganisation(dto)
            this.checkOrganisationLocation(dto)
            this.checkOrganisationPerson(dto)
            this.checkOrganisationPsr(dto)
            this.checkUserIdentifiedObject(dto)
            this.checkAttachment(dto)
            this.checkPositionPoint(dto)
            this.checkConfigurationEvent(dto)
            return true
        },

        async changeLocationName(value) {
            try {
                const index = this.locationListData.findIndex(loc => loc.mrid === value);
                if (index !== -1) {
                    this.properties.locationName = this.locationListData[index].name;
                    this.properties.locationId = this.locationListData[index].mrid;
                    const [streetDetailData, streetAddressData, townDetailData, dataPositionPoint] = await Promise.all([
                        window.electronAPI.getStreetDetailByLocationId(this.properties.locationId)
                        , window.electronAPI.getStreetAddressByMrid(this.locationListData[index].main_address)
                        , window.electronAPI.getTownDetailByLocationId(this.properties.locationId)
                        , window.electronAPI.getPositionPointByLocationId(this.properties.locationId)
                    ])
                    if (streetAddressData.success && streetAddressData.data) {
                        this.properties.streetAddressId = streetAddressData.data.mrid;
                    } else {
                        this.properties.streetAddressId = null;
                    }
                    if (streetDetailData.success && streetDetailData.data) {
                        this.properties.street = streetDetailData.data.address_general || '';
                        this.properties.streetDetailId = streetDetailData.data.mrid;
                    } else {
                        this.properties.streetDetailId = null;
                    }
                    if (townDetailData.success && townDetailData.data) {
                        this.properties.city = townDetailData.data.city || '';
                        this.properties.state_or_province = townDetailData.data.state_or_province || '';
                        this.properties.country = townDetailData.data.country || '';
                        this.properties.district_or_town = townDetailData.data.district_or_town || '';
                        this.properties.ward_or_commune = townDetailData.data.ward_or_commune || '';
                        this.properties.townDetailId = townDetailData.data.mrid;
                    } else {
                        this.properties.townDetailId = null;
                    }

                    if (dataPositionPoint.success && dataPositionPoint.data) {
                        if (dataPositionPoint.data.length !== 0) {
                            dataPositionPoint.data.forEach((element, index) => {
                                const posX = {
                                    id: element.mrid,
                                    coor: element.x_position
                                }
                                const posY = {
                                    id: element.mrid,
                                    coor: element.y_position
                                }
                                const posZ = {
                                    id: element.mrid,
                                    coor: element.z_position
                                }
                                this.properties.positionPoints.x.push(posX);
                                this.properties.positionPoints.y.push(posY);
                                this.properties.positionPoints.z.push(posZ);
                            });
                        }
                    } else {
                        this.properties.positionPoints = { x: [], y: [], z: [] };
                    }

                } else {
                    this.properties.locationName = value;
                }
            } catch (error) {
                this.$message.error('Error changing location name: ' + error.message);
                console.error('Error changing location name:', error);
            }
        },

        async changePersonName(value) {
            try {
                const index = this.personListData.findIndex(loc => loc.mrid === value);
                if (index !== -1) {
                    this.properties.personName = this.personListData[index].name;
                    this.properties.personId = this.personListData[index].mrid;
                    const [telephoneNumberData, electronicAddressData, personRoleData] = await Promise.all([
                        window.electronAPI.getTelephoneNumberByMrid(this.personListData[index].mobile_phone),
                        window.electronAPI.getElectronicAddressByMrid(this.personListData[index].electronic_address),
                        window.electronAPI.getPersonRoleByPersonId(this.properties.personId)
                    ])
                    if (telephoneNumberData.success && telephoneNumberData.data) {
                        this.properties.phoneNumber = telephoneNumberData.data.itu_phone || '';
                        this.properties.telephoneNumberId = telephoneNumberData.data.mrid || null;
                    }
                    if (electronicAddressData.success && electronicAddressData.data) {
                        this.properties.email = electronicAddressData.data.email || '';
                        this.properties.fax = electronicAddressData.data.fax || null;
                        this.properties.electronicAddressId = electronicAddressData.data.mrid || null;
                    }
                    if (personRoleData.success && personRoleData.data) {
                        this.properties.personRole = personRoleData.data.department || '';
                        this.properties.position = personRoleData.data.position || '';
                        this.properties.personRoleId = personRoleData.data.mrid || null;
                    }

                } else {
                    this.properties.personName = value;
                    this.properties.personId = null
                }
            } catch (error) {
                this.$message.error('Error changing person name: ' + error.message);
                console.error('Error changing person name:', error);
            }
        },
    }
}
