export default {
    data() {
        return {
            id : "",
            properties : {
            },
            ratings : {
            },
            config : {
                windings : '',
                dataVT : []
            }
        }
    },
    async beforeMount() {
        if(this.$route.query.mode === "add") {
            this.properties = this.$route.query.dataProperty
        }
        else if (this.$route.query.mode === "edit") {
            /* eslint-disable */
            const asset_id = this.$route.query.asset_id
            const rs = await window.electronAPI.getVoltageTransById(asset_id)
            const dataTable = rs.data[0]
            if(rs.success) {
                this.properties = JSON.parse(dataTable.properties)
                this.ratings = JSON.parse(dataTable.ratings)
                this.id = dataTable.id
                this.config = JSON.parse(dataTable.config)
            }
        } else if (this.$route.query.mode === "dup") {
            /* eslint-disable */
            const asset_id = this.$route.query.asset_id
            const rs = await window.electronAPI.getVoltageTransById(asset_id)
            const dataTable = rs.data[0]
            if(rs.success) {
                this.properties = JSON.parse(dataTable.properties)
                this.properties.serial_no = ''
                this.ratings = JSON.parse(dataTable.ratings)
                this.config = JSON.parse(dataTable.config)
            }
        }
    },
    methods : {
        saveAsset() {
            if(this.$route.query.mode === "add" || this.$route.query.mode === "dup") {
                this.insertVoltageTrans()
            }
            else if(this.$route.query.mode === "edit") {
                this.updateVoltageTrans()
            }
        },
        async insertVoltageTrans() {
            const locationId = this.$store.state.selectedLocation[0].id
            const asset = {
                voltage : {
                    id : this.id,
                    properties : this.properties,
                    ratings : this.ratings,
                    config : this.config,
                },
            }
            const rs = await window.electronAPI.insertVoltageTrans(locationId, asset)
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
        async updateVoltageTrans() {
            const asset = {
                voltage : {
                    id : this.id,
                    properties : this.properties,
                    ratings : this.ratings,
                    config : this.config,
                },
            }
            const rs = await window.electronAPI.updateVoltageTrans(asset)
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