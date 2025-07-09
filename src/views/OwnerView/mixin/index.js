import {mapState} from 'vuex'

/* eslint-disable */
export default {
    computed: mapState(['user', 'selectedLocation']),
    methods: {
        async saveLocationData() {
            if(this.$route.query.modeSave == 'editSave') {
                const rs = await window.electronAPI.updateOwnerById(this.owner.id, this.owner)
                if(rs.success) {
                    const rt = await window.electronAPI.updateAttachment(this.owner.id, this.Attachment, "owner")
                    if(rt.success) {
                        this.$message.success("Update complete")
                    } else {
                        this.$message({
                            type: 'warning',
                            message: 'Update completed but cannot save attachment'
                        })
                    }
                    this.$router.push({name: 'manage'})
                } else {
                    this.$message.error("Update fail")
                }
            } else if(this.$route.query.modeSave == 'editInsert') {
                this.owner.user_id = this.user.user_id
                this.owner.ref_id = this.$route.query.ownerData.id
                var rv = await window.electronAPI.insertOwner(this.owner)
                if(rv.success) {
                    const rt = await window.electronAPI.uploadAttachment(rv.data, "owner", this.Attachment)
                    if(rt.success) {
                        this.$message.success("Insert complete")
                    } else {
                        this.$message({
                            type: 'warning',
                            message: 'Save completed but cannot save attachment'
                        })
                    }
                    this.$router.push({name: 'manage'})
                } else {
                    this.$message.error("Insert fail")
                }
            } else {
                this.saveLocationOwner()
            }
        },
        async saveLocationOwner() {
            var signOwner = true
            var ownerId = ''
            var locationOwnerId = ''
            if(this.type == 'owner1') {
                this.copyOwner[2] = this.owner
            }
            if(this.copyOwner[2].name != '') {
                if(this.copyOwner[1].name == "" ||  this.copyOwner[0].name == "") {
                    this.$message.error("Name cannot be null")
                    signOwner = false
                }
            } else {
                if(this.copyOwner[1].name != "") {
                    if(this.copyOwner[0].name == "") {
                        this.$message.error("Name cannot be null")
                        signOwner = false
                    }
                }
            }
            if(signOwner == true) {
                if(this.dataLocation.properties.name != '' && this.dataLocation.voltage != '') {
                    var rt = await window.electronAPI.getOwnerByName("root")
                    if(rt.success) {
                        ownerId = rt.data[0].id
                        locationOwnerId = rt.data[0].id
                    }
                    this.copyOwner = this.copyOwner.filter(e => e.name != '' && e.name != undefined)
                    
                    if(this.copyOwner.length == 3) {
                        this.copyOwner[2].mode = 'owner1'
                        this.copyOwner[2].ref_id = ownerId
                        this.copyOwner[2].user_id = this.user.user_id
                        var rv = await window.electronAPI.insertOwner(this.copyOwner[2])
                        if(rv.success) {
                            this.copyOwner[1].mode = 'owner2'
                            this.copyOwner[1].ref_id = rv.data
                            this.copyOwner[1].user_id = this.user.user_id
                            rv = await window.electronAPI.insertOwner(this.copyOwner[1])
                            if(rv.success) {
                                this.copyOwner[0].mode = 'owner3'
                                this.copyOwner[0].ref_id = rv.data
                                this.copyOwner[0].user_id = this.user.user_id
                                var rv = await window.electronAPI.insertOwner(this.copyOwner[0])
                                locationOwnerId = rv.data
                            }
                        }
                    } else if(this.copyOwner.length == 2) {
                        this.copyOwner[1].mode = 'owner1'
                        this.copyOwner[1].ref_id = ownerId
                        this.copyOwner[1].user_id = this.user.user_id
                        var rv = await window.electronAPI.insertOwner(this.copyOwner[1])
                        if(rv.success) {
                            this.copyOwner[0].mode = 'owner2'
                            this.copyOwner[0].ref_id = rv.data
                            this.copyOwner[0].user_id = this.user.user_id
                            rv = await window.electronAPI.insertOwner(this.copyOwner[0])
                            locationOwnerId = rv.data
                        }
                    } else if(this.copyOwner.length == 1) {
                        this.copyOwner[0].mode = 'owner1'
                        this.copyOwner[0].ref_id = ownerId
                        this.copyOwner[0].user_id = this.user.user_id
                        var rv = await window.electronAPI.insertOwner(this.copyOwner[0])
                        locationOwnerId = rv.data
                    }

                    console.log(locationOwnerId)

                    var location = JSON.parse(JSON.stringify(this.dataLocation))
                    location.properties.mode = 'location'
                    location.properties.id = this.$uuid.newUuid()
                    location.properties.owner_id = locationOwnerId
                    location.properties.refId = locationOwnerId
                    const rs = await window.electronAPI.insertLocation(this.user.user_id, location)
                    if (rs.success) {
                        var locationVoltage = JSON.parse(JSON.stringify(this.dataLocation))
                        locationVoltage.properties.name = this.dataLocation.voltage
                        locationVoltage.properties.mode = 'voltage'
                        locationVoltage.properties.id = this.$uuid.newUuid()
                        locationVoltage.properties.refId = location.properties.id
                        locationVoltage.properties.owner_id = locationOwnerId
                        const rt = await window.electronAPI.insertLocation(this.user.user_id, locationVoltage)
                        if(rt.success) {      
                            this.$message({
                                type: 'success',
                                message: 'Insert completed'
                            })
                            this.$router.push({name: 'manage'})
                        } else {
                            this.$message.error(rs.message)
                        }
                    }
                } else {
                    this.$message.error('Name and voltage cannot be null or empty')
                }
                
            } else {
                this.$message.error('Name owner cannot be null or empty') 
            }
        }
    }
}