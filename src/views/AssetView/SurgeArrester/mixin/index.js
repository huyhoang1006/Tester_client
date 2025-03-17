export default {
    data() {
        return {
            id : "",
            properties : {
            },
            ratings : {
                unitStack : '',
                tableRating : []
            },
        }
    },
    async beforeMount() {
        if(this.$route.query.mode === "add") {
            this.properties = this.$route.query.dataProperty
        }
        else if (this.$route.query.mode === "edit") {
            /* eslint-disable */
            const asset_id = this.$route.query.asset_id
            const rs = await window.electronAPI.getSurgeArresterById(asset_id)
            const dataTable = rs.data[0]
            if(rs.success) {
                this.properties = JSON.parse(dataTable.properties)
                this.ratings = JSON.parse(dataTable.ratings)
                this.id = dataTable.id
            }
        } else if (this.$route.query.mode === "dup") {
            /* eslint-disable */
            const asset_id = this.$route.query.asset_id
            const rs = await window.electronAPI.getSurgeArresterById(asset_id)
            const dataTable = rs.data[0]
            if(rs.success) {
                this.properties = JSON.parse(dataTable.properties)
                this.properties.serial_no = ""
                this.ratings = JSON.parse(dataTable.ratings)
            }
        }
    },
    methods : {
        saveAsset() {
            if(this.$route.query.mode == "add" || this.$route.query.mode == "dup") {
                this.insertSurgeArrester()
            }
            else if(this.$route.query.mode == "edit") {
                this.updateSurgeArrester()
            }
        },
        async insertSurgeArrester() {
            const locationId = this.$store.state.selectedLocation[0].id
            const asset = {
                surge : {
                    id : this.id,
                    properties : this.properties,
                    ratings : this.ratings,
                },
            }
            const rs = await window.electronAPI.insertSurgeArrester(locationId, asset)
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
        async updateSurgeArrester() {
            const asset = {
                surge : {
                    id : this.id,
                    properties : this.properties,
                    ratings : this.ratings,
                },
            }
            const rs = await window.electronAPI.updateSurgeArrester(asset)
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