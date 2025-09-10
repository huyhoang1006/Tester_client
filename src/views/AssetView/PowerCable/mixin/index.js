export default {
    data() {
        return {
            id : "",
            powerCable : {
                properties : {
                },
                ratings : {
                },
                config : {
                },
                layerConstruction : {},
                others : {},
                data : {
                    conductor : {},
                    insulation : {},
                    sheath_reinforcing : {},
                    armour : {},
                    conductor_shield : {},
                    insulation_screen : {},
                    concentric_neutral : {},
                    oversheath : {},
                    sheath : {},
                    armour_bedding : {}
                },
                attachmentData : []
            },
            assessories : {
                terminal : {},
                joint : {},
                sheath_limits : {}
            }
        }
    },
    async beforeMount() {
        if(this.$route.query.mode === "add") {
            this.powerCable.properties = this.$route.query.dataProperty
        }
        else if (this.$route.query.mode === "edit") {
            /* eslint-disable */
            const asset_id = this.$route.query.asset_id
            const rs = await window.electronAPI.getPowerCableById(asset_id)
            const dataTable = rs.data[0]
            if(rs.success) {
                this.powerCable = JSON.parse(dataTable.powerCable)
                this.id = dataTable.id
                this.assessories = JSON.parse(dataTable.assessories)
            }
        } else if (this.$route.query.mode === "dup") {
            /* eslint-disable */
            const asset_id = this.$route.query.asset_id
            const rs = await window.electronAPI.getPowerCableById(asset_id)
            const dataTable = rs.data[0]
            if(rs.success) {
                this.powerCable = JSON.parse(dataTable.powerCable)
                this.powerCable.properties.serial_no = ''
                this.assessories = JSON.parse(dataTable.assessories)
            }
        }
    },
    methods : {
        saveAsset() {
            if(this.$route.query.mode === "add" || this.$route.query.mode === "dup") {
                this.insertPowerCable()
            }
            else if(this.$route.query.mode === "edit") {
                this.updatePowerCable()
            }
        },
        async insertPowerCable() {
            const locationId = this.$store.state.selectedLocation[0].id
            const asset = {
                power : {
                    id : this.id,
                    properties : this.powerCable.properties,
                    powerCable : this.powerCable,
                    assessories : this.assessories
                },
            }
            const rs = await window.electronAPI.insertPowerCable(locationId, asset)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Insert completed'
                })
                this.$router.push({name: 'manage'})
            } else {
                this.$message.error(rs.message)
            }
        },
        async updatePowerCable() {
            const asset = {
                power : {
                    id : this.id,
                    properties : this.powerCable.properties,
                    powerCable : this.powerCable,
                    assessories : this.assessories
                },
            }
            const rs = await window.electronAPI.updatePowerCable(asset)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Update completed'
                })
            } else {
                this.$message.error(rs.message)
            }
        }
    }
}