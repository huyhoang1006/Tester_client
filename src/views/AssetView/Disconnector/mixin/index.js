export default {
    data() {
        return {
            id : "",
            properties : {
            },
            ratings : {
            },
            config : {

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
            const rs = await window.electronAPI.getDisconnectorById(asset_id)
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
            const rs = await window.electronAPI.getDisconnectorById(asset_id)
            const dataTable = rs.data[0]
            if(rs.success) {
                this.properties = JSON.parse(dataTable.properties)
                this.properties.serial_no = ""
                this.ratings = JSON.parse(dataTable.ratings)
                this.config = JSON.parse(dataTable.config)
            }
        }
    },
    methods : {
        saveAsset() {
            if(this.$route.query.mode === "add" || this.$route.query.mode === "dup") {
                this.insertDisconnector()
            }
            else if(this.$route.query.mode === "edit") {
                this.updateDisconnector()
            }
        },
        async insertDisconnector() {
            const locationId = this.$store.state.selectedLocation[0].id
            const asset = {
                disconnect : {
                    id : this.id,
                    properties : this.properties,
                    ratings : this.ratings,
                    config : this.config,
                },
            }
            const rs = await window.electronAPI.insertDisconnector(locationId, asset)
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
        async updateDisconnector() {
            const asset = {
                disconnect : {
                    id : this.id,
                    properties : this.properties,
                    ratings : this.ratings,
                    config : this.config,
                },
            }
            const rs = await window.electronAPI.updateDisconnector(asset)
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