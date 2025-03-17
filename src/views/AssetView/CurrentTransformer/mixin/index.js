export default {
    data() {
        return {
            id : "",
            properties : {
            },
            ratings : {
                show : {}
            },
            config : {
                cores : 1,
                dataCT : [{
                    taps : "2",
                    commonTap : "1",
                    fullTap: {
                        table : {
                            isShow : true,
                            name : "S1-S2"
                        },
                        classRating : {class : ''}
                    },
                    mainTap : {
                        data : [
                        ]
                    },
                    interTap : {
                        data : []
                    }
                }]
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
            const rs = await window.electronAPI.getCurrentVoltageById(asset_id)
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
            const rs = await window.electronAPI.getCurrentVoltageById(asset_id)
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
            if(this.$route.query.mode === "add" || this.$route.query.mode == "dup") {
                this.insertCurrentVoltage()
            }
            else if(this.$route.query.mode === "edit") {
                this.updateCurrentVoltage()
            }
        },
        async insertCurrentVoltage() {
            const locationId = this.$store.state.selectedLocation[0].id
            const asset = {
                current : {
                    id : this.id,
                    properties : this.properties,
                    ratings : this.ratings,
                    config : this.config,
                },
            }
            const rs = await window.electronAPI.insertCurrentVoltage(locationId, asset)
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
        async updateCurrentVoltage() {
            const asset = {
                current : {
                    id : this.id,
                    properties : this.properties,
                    ratings : this.ratings,
                    config : this.config,
                },
            }
            const rs = await window.electronAPI.updateCurrentVoltage(asset)
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