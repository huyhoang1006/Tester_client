<template>
    <div id="dialog-collab">
        <el-dialog
        :visible.sync="show"
        title="Select User"
        width="600px"
        align-center
        :before-close="handleClose"
        >
        <el-select class="w-100" v-model="collabs" multiple placeholder="Select">
            <el-option v-for="item in users" :key="item.id" :label="item.username" :value="item.id">
            </el-option>
        </el-select>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="handleClose()">Cancel</el-button>
            <el-button size="small" @click="save" type="primary">Confirm</el-button>
        </span>
        </el-dialog>
    </div>
</template>


<script>
/* eslint-disable */
import * as userApi from '@/api/user'
import * as locationApi from '@/api/location'
import * as assetApi from '@/api/asset'
import * as jobApi from '@/api/job'
import * as jobCircuitApi from '@/api/circuit/jobCircuit'
import * as jobCurrentApi from '@/api/current/jobCurrent'
import * as jobVoltageApi from '@/api/voltage/jobVoltage'
import * as jobDisconnectorApi from '@/api/disconnector/jobDisconnector'
import * as jobSurgeApi from '@/api/surge/jobSurge'
import * as jobPowerApi from '@/api/power/jobPower'

/* eslint-disable */
// eslint-disable-next-line
export default {
    props: {
        openDialog: {
            type: Boolean,
            required: true
        },
        id: {
            type: String,
            required: true,
            default() {
                return ''
            }
        },
        resource: {
            type: String,
            required: true
        }
    },
    computed: {
        show() {
            return this.openDialog
        }
    },
    data() {
        return {
            users: [],
            collabs: []
        }
    },
    mounted() {
        this.getUser()
        // this.getCollab()
    },
    methods: {
        getUser() {
            // userApi.getAll().then((data) => {
            //     this.users = data
            // })
        },
        getCollab() {
            switch (this.resource) {
                case 'location':
                    this.getCollabLocation()
                    break
                case 'asset':
                    this.getCollabAsset()
                    break
                case 'job':
                    this.getCollabJob()
                    break
            }
        },
        getCollabLocation() {
            locationApi.getById(this.id).then((data) => {
                this.collabs = data.collabs
            })
        },
        getCollabAsset() {
            assetApi.getById(this.id).then((data) => {
                this.collabs = data.collabs
            })
        },
        getCollabJob() {
            // jobApi.getById(this.id).then((data) => {
            //     this.collabs = data.collabs
            // })
        },
        save() {
            switch (this.resource) {
                case 'location':
                    this.saveLocation()
                    break
                case 'asset':
                    this.saveAsset()
                    break
                case 'job':
                    this.saveJob()
                    break
            }

            this.handleClose()
        },
        saveLocation() {
            locationApi
                .collab(this.id, this.collabs)
                .then((data) => {
                    this.$message.success('Successful')
                })
                .catch((error) => {
                    console.log(error)
                    this.$message.error(error.message)
                })
        },
        saveAsset() {            // assetApi
            //     .collab(this.id, this.collabs)
            //     .then((data) => {
            //         this.$message.success('Successful')
            //     })
            //     .catch((error) => {
            //         console.log(error)
            //         this.$message.error(error.message)
            //     })
        },
        async saveJob() {
            let listLocation = this.$store.state.selectedLocationSync
            let refId = listLocation[0].refId
            if(listLocation[0].mode != "location") {
                while (refId != "" && refId != null && refId != undefined) {
                    let dataTemp =  await locationApi.getById(refId)
                    if(dataTemp != undefined) {
                        listLocation.push(dataTemp)
                        refId = dataTemp.refId
                    }
                }
            }

            for(let i in listLocation) {
                await locationApi.collab(listLocation[i].id, this.collabs)
            }

            if(this.$store.state.selectedAssetSync[0].asset == "Transformer") {
                jobApi.collab(this.id, this.collabs).then((data) => {
                    this.$message.success('Successful')
                }).catch((error) => {
                    console.log(error)
                    this.$message.error(error.message)
                })
            } else {
                if(this.$store.state.selectedAssetSync[0].asset == "Circuit breaker") {
                    jobCircuitApi.collab(this.$store.state.selectedJobSync[0].id, this.collabs)
                    this.$message.success('Successful')
                } else if(this.$store.state.selectedAssetSync[0].asset == "Current transformer") {
                    jobCurrentApi.collab(this.$store.state.selectedJobSync[0].id, this.collabs)
                    this.$message.success('Successful')
                } else if(this.$store.state.selectedAssetSync[0].asset == "Voltage transformer") {
                    jobVoltageApi.collab(this.$store.state.selectedJobSync[0].id, this.collabs)
                    this.$message.success('Successful')
                } else if(this.$store.state.selectedAssetSync[0].asset == "Disconnector") {
                    jobDisconnectorApi.collab(this.$store.state.selectedJobSync[0].id, this.collabs)
                    this.$message.success('Successful')
                } else if(this.$store.state.selectedAssetSync[0].asset == "Surge arrester") {
                    jobSurgeApi.collab(this.$store.state.selectedJobSync[0].id, this.collabs)
                    this.$message.success('Successful')
                } else if(this.$store.state.selectedAssetSync[0].asset == "Power cable") {
                    jobPowerApi.collab(this.$store.state.selectedJobSync[0].id, this.collabs)
                    this.$message.success('Successful')
                }
            }
        },
        handleClose() {
            this.$emit('onCloseDialog', false)
        },
    }
}
</script>

<style lang="scss" scoped></style>
