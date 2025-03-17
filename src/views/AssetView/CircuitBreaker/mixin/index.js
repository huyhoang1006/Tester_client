export default {
    data() {
        return {
            id : "",
            properties : {
            },
            circuitBreaker : {
            },
            ratings : {
            },
            contactSys : {
            },
            others : {},
            operating : {
                table : [[],[],{component : "Auxiliary circuits"},{component : "Motor"}]
            },
            assessmentLimits : {
                limits : "Absolute",
                contactSys : {
                    abs : {},
                    rel : {}
                },
                openTime: {
                    abs : [{},{},{},{},{},{},{},{},{}],
                    rel : [{},{},{},{},{},{},{},{},{}]
                },
                contactTravel : {
                    abs : [{},{},{},{},{},{},{},{}],
                    rel : [{},{},{},{},{},{},{},{}]
                },
                auxContact : {
                    abs : {
                        trip : [{},{},{},{},{},{}],
                        close : [{},{},{},{},{},{}],
                    },
                    rel : {
                        trip : [{},{},{},{},{},{}],
                        close : [{},{},{},{},{},{}],
                    }
                }, 
                miscell : {
                    abs : [{},{},{},{}],
                    rel : [{},{},{},{}], 
                },
                coilCharacter : {
                    abs : [{},{},{},{},{},{},{},{}],
                    rel : [{},{},{},{},{},{},{},{}], 
                },
                pickupVol : {
                    abs : [{},{}],
                    rel : [{},{}], 
                },
                motorChar : {
                    abs : [{},{},{},{}],
                    rel : [{},{},{},{}], 
                },
                underVoltageR : {
                    abs : {},
                    rel : {}
                },
                overcurrentR : {
                    abs : {},
                    rel : {}
                }
                
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
            const rs = await window.electronAPI.getCircuitId(asset_id)
            const dataTable = rs.data[0]
            if(rs.success) {
                this.properties = JSON.parse(dataTable.properties)
                this.circuitBreaker = JSON.parse(dataTable.circuitBreaker)
                this.ratings = JSON.parse(dataTable.ratings)
                this.contactSys = JSON.parse(dataTable.contactSys)
                this.others = JSON.parse(dataTable.others)
                this.operating = JSON.parse(dataTable.operating)
                this.assessmentLimits = JSON.parse(dataTable.assessmentLimits)
                this.id = dataTable.id
            }
        } else if(this.$route.query.mode === "dup") {
            const asset_id = this.$route.query.asset_id
            const rs = await window.electronAPI.getCircuitId(asset_id)
            const dataTable = rs.data[0]
            if(rs.success) {
                this.properties = JSON.parse(dataTable.properties)
                this.properties.serial_no = ""
                this.circuitBreaker = JSON.parse(dataTable.circuitBreaker)
                this.ratings = JSON.parse(dataTable.ratings)
                this.contactSys = JSON.parse(dataTable.contactSys)
                this.others = JSON.parse(dataTable.others)
                this.operating = JSON.parse(dataTable.operating)
                this.assessmentLimits = JSON.parse(dataTable.assessmentLimits)
            }
        }
    },
    methods : {
        saveAsset() {
            if(this.$route.query.mode === "add" || this.$route.query.mode == "dup") {
                this.insertCircuitBreaker()
            }
            else if(this.$route.query.mode === "edit") {
                this.updateCircuitBreaker()
            }
        },
        async insertCircuitBreaker() {
            const locationId = this.$store.state.selectedLocation[0].id
            const asset = {
                circuit : {
                    id : this.id,
                    properties : this.properties,
                    circuitBreaker : this.circuitBreaker,
                    ratings : this.ratings,
                    contactSys : this.contactSys,
                    others : this.others,
                },
                operating : this.operating,
                assessmentLimits : this.assessmentLimits
            }
            const rs = await window.electronAPI.insertCircuit(locationId, asset)
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
        async updateCircuitBreaker() {
            const asset = {
                circuit : {
                    id : this.id,
                    properties : this.properties,
                    circuitBreaker : this.circuitBreaker,
                    ratings : this.ratings,
                    contactSys : this.contactSys,
                    others : this.others,
                },
                operating : this.operating,
                assessmentLimits : this.assessmentLimits
            }
            const rs = await window.electronAPI.updateCircuit(asset)
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