import {mapState} from 'vuex'
import loader from "@/utils/preload"


export default {
    data() {
        return {
            properties: {
                type : '',
                id: '',
                name: '',
                region: '',
                division: '',
                area: '',
                plant: '',
                address: '',
                city: '',
                state_province: '',
                postal_code: '',
                country: 'Vietnam',
                geo_coordinates: '',
                location_system_code: '',
                mode : 'location',
                refId : '',
                comment: ''
            },
            contact_person: {
                name: '',
                phone_no1: '',
                phone_no2: '',
                fax_no: '',
                email: '',
                department: '',
                position : ''
            },
            company: {
                company: '',
                department: '',
                address: '',
                city: '',
                state_province: '',
                postal_code: '',
                country: '',
                phone_no: '',
                fax_no: '',
                email: ''
            },
            Attachment : []
        }
    },
    computed: mapState(['user', 'selectedLocation']),
    async beforeMount() {
        loader.loaderStart()
        this.mode = this.$route.query.mode
        if (this.mode === this.$constant.EDIT || this.mode === this.$constant.DUP) {
            this.location_id = this.$route.query.location_id
            const rs = await window.electronAPI.getLocationById(this.location_id)
            const rt = await window.electronAPI.getAllAttachment(this.location_id, "location")
            if(rt.success) {
                if(rt.data.length !== 0) {
                    this.Attachment = JSON.parse(rt.data[0].name)
                }
            }
            if (rs.success) {
                const data = rs.data
                if (this.mode === this.$constant.DUP) {
                    data.id = ''
                    data.name = ''
                }
                this.properties = {
                    id: data.id,
                    type : data.type,
                    name: data.name,
                    region: data.region,
                    division: data.division,
                    area: data.area,
                    plant: data.plant,
                    address: data.address,
                    city: data.city,
                    state_province: data.state_province,
                    postal_code: data.postal_code,
                    country: data.country,
                    geo_coordinates: data.geo_coordinates,
                    location_system_code: data.location_system_code,
                    mode : data.mode,
                    comment: data.comment,
                    refId : data.refId
                }
                this.contact_person = {
                    name: data.person_name,
                    phone_no1: data.person_phone_no1,
                    phone_no2: data.person_phone_no2,
                    fax_no: data.person_fax_no,
                    email: data.person_email,
                    department : data.department,
                    position : data.position,
                }
                this.company = {
                    company: data.company_company,
                    department: data.company_department,
                    address: data.company_address,
                    city: data.company_city,
                    state_province: data.company_state_province,
                    postal_code: data.company_postal_code,
                    country: data.company_country,
                    phone_no: data.company_phone_no,
                    fax_no: data.company_fax_no,
                    email: data.company_email
                }
            } else {
                this.$message.error(rs.message)
            }
        }
        else if(this.mode == 'voltageAdd') {
            this.properties.mode = 'voltage'
            this.properties.refId = this.$route.query.dataLocation.id
        }
        else if(this.mode == 'feederAdd') {
            this.properties.mode = 'feeder'
            this.properties.refId = this.$route.query.dataLocation.id
        }
        loader.loaderEnd()
    },
    methods: {
        saveLocation(formName) {
            this.$refs[formName].validate(async (valid) => {
                if (valid) {
                    if (this.mode === this.$constant.ADD || this.mode === this.$constant.DUP) {
                        await this.insertLocation()
                    } else if(this.mode == 'voltageAdd' || this.mode == 'feederAdd') {
                        this.properties.owner_id = this.$route.query.dataLocation.owner_id
                        await this.insertLocation()
                    }
                    else {
                        await this.updateLocation()
                    }
                } else {
                    console.log('error submit!!')
                    return false
                }
            })
        },
        async insertLocation() {
            this.properties.id = this.$uuid.newUuid()
            const properties = this.properties
            const contact_person = this.contact_person
            const company = this.company
            if(this.$route.query.dataLocation != undefined) {
                this.properties.refId = this.$route.query.dataLocation.id
            }
            const location = {
                properties,
                contact_person,
                company
            }

            // TODO user_id
            const rs = await window.electronAPI.insertLocation(this.user.user_id, location)
            const rt = await window.electronAPI.uploadAttachment(location.properties.id, "location", this.Attachment)
            if (rs.success && rt.success) {
                this.$message({
                    type: 'success',
                    message: 'Insert completed'
                })
                this.$router.push({name: 'manage'})
            } else if(rs.success && rt.success !== true) {
                this.$message({
                    type: 'warning',
                    message: 'Update completed but cannot save attachment'
                })
                this.$router.push({name: 'manage'})
            } else {
                this.$message.error(rs.message)
            }
        },
        async updateLocation() {
            const properties = this.properties
            const contact_person = this.contact_person
            const company = this.company
            const location = {
                properties,
                contact_person,
                company
            }
            const rs = await window.electronAPI.updateLocation(location)
            const rt = await window.electronAPI.updateAttachment(this.properties.id, this.Attachment, "location")
            if (rs.success && rt.success) {
                this.$message({
                    type: 'success',
                    message: 'Update completed'
                })
            } else if(rs.success && rt.success !== true) {
                this.$message({
                    type: 'warning',
                    message: 'Update completed but cannot save attachment'
                })
            } else {
                this.$message.error(rs.message)
            }
        },
        backToManage() {
            this.$confirm('Do you want to exit?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    this.$router.push({name: 'manage'})
                })
                .catch(() => {
                    return
                })
        },
        async saveAttachement() {
            // await window.electronAPI.updateLocation(location)
        }
    }
}
