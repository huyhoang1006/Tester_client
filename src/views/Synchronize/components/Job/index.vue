<template>
    <div class="location">
        <div class="top-table">
            <el-button :disabled="loading">
                <i class="fa-solid fa-rotate-right mgr-10" :class="{'fa-spin': loading}" @click="refresh()"></i>
            </el-button>
            <span class="bolder">Job</span>
            <el-input class="float-right" style="width: 50%" size="mini" v-model="search"></el-input>
        </div>
        <div class="content-table">
            <div class="content-table-top">
                <el-button title="Download" plain class="btn mgr-15" :disabled="selectedJob.length == 0" @click="download">
                    <i class="fa-solid fa-download pointer"></i>
                </el-button>
                <el-button title="Lock" plain class="btn mgr-15" :disabled="selectedJob.length == 0" @click="lock(true)">
                    <i class="fa-solid fa-lock pointer"></i>
                </el-button>
                <el-button title="Unlock" plain class="btn mgr-15" :disabled="selectedJob.length == 0" @click="lock(false)">
                    <i class="fa-solid fa-unlock pointer"></i>
                </el-button>
                <el-button title="Share" plain class="btn mgr-15" :disabled="selectedJob.length != 1" @click="openDialog = true">
                    <i class="fa-solid fa-share pointer"></i>
                </el-button>
                <el-button title="Delete" plain class="btn mgr-15" :disabled="selectedJob.length == 0" @click="deleteMultiple">
                    <i class="fa-solid fa-xmark pointer"></i>
                </el-button>
            </div>
            <div class="content-table-main">
                <ag-grid-vue
                    style="height: calc(100% - 30px)"
                    class="ag-theme-alpine"
                    @grid-ready="onGridReady"
                    :columnDefs="columnDefs"
                    :rowData="rowData"
                    rowSelection="multiple"
                    @selection-changed="onSelectionChanged">
                </ag-grid-vue>
                <page-align
                    ref="JobSyncPageAlign" 
                    :page-user="this.pageJobSync" 
                    :display-page-user="this.displayPageJobSync" 
                    :page-user-instance="this.pageJobSyncInstance" 
                    :current-page="this.currentJobSync" 
                    title="JobSync"
                    :option.sync="this.optionJobSync"
                    @update-page="updateJobSyncPage">
                >
                </page-align>
            </div>
            <collab :openDialog="this.openDialog" :resource="'job'" :id="selectedJob.length == 1 ? selectedJob[0].id : ''" @onCloseDialog="openDialog = false"> </collab>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import cellRenderAssetSync from '../CellRender/cellRenderAssetSync.vue'
import capitalizeRenderer from '../CellRender/capitalizeRenderer.vue'
import Collab from '../Collab'
import {AgGridVue} from 'ag-grid-vue'
import * as jobApi from '@/api/job'
import {mapState} from 'vuex'
import * as mornitorApi from '@/api/monitoring'
import * as fileUploadApi from '@/api/fileUpload'
import * as attachmentApi from '@/api/attachment'
import * as jobCircuitApi from '@/api/circuit/jobCircuit'
import * as jobCurrentApi from '@/api/current/jobCurrent'
import * as jobVoltageApi from '@/api/voltage/jobVoltage'
import * as jobDisconnectorApi from '@/api/disconnector/jobDisconnector'
import * as jobSurgeApi from '@/api/surge/jobSurge'
import * as jobPowerApi from '@/api/power/jobPower'
import * as locationApi from '@/api/location'
import * as assetApi from '@/api/asset'
import * as assetMapper from '../Mapper/asset'
import * as testCircuitApi from '@/api/circuit/testCircuit'
import * as testCurrentApi from '@/api/current/testCurrent'
import * as testVoltageApi from '@/api/voltage/testVoltage'
import * as testDisconnectorApi from '@/api/disconnector/testDisconnector'
import * as testSurgeApi from '@/api/surge/testSurge'
import * as testPowerApi from '@/api/power/testPower'
import pageAlign from '@/views/PageAlign/pageAlign.vue'

export default {
    name: 'JobComponent',
    components: {
        AgGridVue,
        Collab,
        cellRenderAssetSync,
        capitalizeRenderer,
        pageAlign
    },
    computed: mapState(['user']),
    data() {
        return {
            columnDefs: [
                {field: 'id', hide: true},
                {
                    field: 'locked',
                    headerName: 'Status',
                    cellRenderer: 'cellRenderAssetSync',
                    cellClass: function () {
                        return 'align-center'
                    },
                    width: 120,
                    sortable: true,
                    headerCheckboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true,
                    checkboxSelection: true
                },
                {
                    field: 'name',
                    headerName: 'Name',
                    sortable: true,
                    cellRenderer: 'capitalizeRenderer'
                },
                {field: 'tested_by', headerName: 'Tested by', sortable: true},
                {field: 'creation_date', headerName: 'Creation date', sortable: true},
                {field: 'execution_date', headerName: 'Execution date', sortable: true},
                {field: 'status', headerName: 'Status', sortable: true},
                {field: 'work_order', headerName: 'Work order', sortable: true}
            ],
            rowData: [],
            selectedJob: [],
            search: '',
            loading: false,
            openDialog: false,
            sl : 4,
            count : '',
            pageJobSync : {
                first : 1,
                second : 2,
                third : 3,
                dot : "...",
                end : 10,
            },
            displayPageJobSync : {
                second : true,
                third : true,
                dot : true,
                end : true
            },
            pageJobSyncInstance : {
                first : "",
                second : "",
                third : "",
                dot : "",
                end : "",
            },
            currentJobSync : {
                nextP : '',
                previousP : '',
                current : 1,
            },
            optionJobSync : {
                mode : ''
            },
        }
    },
    async beforeMount() {
    },
    mounted() {},
    watch: {
        search(newSearch, oldSearch) {
            this.gridApi.setQuickFilter(newSearch)
        },
        async '$store.state.selectedAssetSync'(newVal, oldVal) {
            if (newVal.length === 1) {
                const assetId = newVal[0].id
                await this.getJobData(assetId)
            } else {
                this.rowData = []
            }
        },
        async '$store.state.selectedLocationSync'(newVal, oldVal) {
                this.rowData = []
        }
    },
    methods: {

        async getCountOfAsset(name, AssetId) {
            if(name == 'Transformer') {
                let count = await jobApi.countJobByAssetId(AssetId)
                return count
            } else if(name == 'Circuit breaker') {
                let count = await jobCircuitApi.countJobByAssetId(AssetId)
                return count
            } else if(name == 'Current transformer') {
                let count = await jobCurrentApi.countJobByAssetId(AssetId)
                return count
            } else if(name == 'Disconnector') {
                let count = await jobDisconnectorApi.countJobByAssetId(AssetId)
                return count
            } else if(name == 'Surge arrester') {
                let count = await jobSurgeApi.countJobByAssetId(AssetId)
                return count
            } else if(name == 'Power cable') {
                let count = await jobPowerApi.countJobByAssetId(AssetId)
                return count
            } else if(name == 'Voltage transformer') {
                let count = await jobVoltageApi.countJobByAssetId(AssetId)
                return count
            }
        },

        async resetNumberPage() {
            this.pageJobSync = {
                first : 1,
                second : 2,
                third : 3,
                dot : "...",
                end : 10,
            },
            this.displayPageJobSync = {
                second : true,
                third : true,
                dot : true,
                end : true
            },
            this.pageJobSyncInstance = {
                first : "",
                second : "",
                third : "",
                dot : "",
                end : "",
            },
            this.currentJobSync = {
                nextP : '',
                previousP : '',
                current : 1,
            }
        },

        async pageAlignCalc(count, pageUser, displayPageUser ) {
            let sumOfPage = Math.floor(parseInt(count) / this.sl)
            let remainder = parseInt(count) % this.sl
            if(remainder == 0) {
                if(sumOfPage < 4) {
                    displayPageUser.dot = false
                    displayPageUser.end = false
                    pageUser.end = sumOfPage
                    if(sumOfPage <3) {
                        displayPageUser.third = false
                    }
                    if(sumOfPage <2) {
                        displayPageUser.second = false
                    }
                } else if(sumOfPage == 4) {
                    displayPageUser.dot = false
                    pageUser.end = sumOfPage
                } else {
                    pageUser.end = sumOfPage
                }
            } else {
                if(sumOfPage < 3) {
                    if(sumOfPage <2) {
                        displayPageUser.third = false
                    }
                    if(sumOfPage <1) {
                        displayPageUser.second = false
                    }
                    displayPageUser.dot = false
                    displayPageUser.end = false
                    pageUser.end = sumOfPage + 1
                } else if(sumOfPage == 3) {
                    displayPageUser.dot = false
                    pageUser.end = sumOfPage + 1
                } else {
                    pageUser.end = sumOfPage + 1
                }
            }
        },

        async getJobs() {
            if(this.$store.state.selectedAssetSync[0].asset == "Transformer") {
                await jobApi.getAll().then((response) => {
                    this.rowData = response
                })
            } else if(this.$store.state.selectedAssetSync[0].asset == "Circuit breaker") {
                await jobCircuitApi.findAllJobByAssetId(this.$store.state.selectedAssetSync[0].id).then((responseAsset) => {
                    this.rowData = this.rowData.concat(responseAsset)
                })
            } else if(this.$store.state.selectedAssetSync[0].asset == "Current transformer") {
                await jobCurrentApi.findAllJobByAssetId(this.$store.state.selectedAssetSync[0].id).then((responseAsset) => {
                    this.rowData = this.rowData.concat(responseAsset)
                })
            } else if(this.$store.state.selectedAssetSync[0].asset == "Disconnector") {
                await jobDisconnectorApi.findAllJobByAssetId(this.$store.state.selectedAssetSync[0].id).then((responseAsset) => {
                    this.rowData = this.rowData.concat(responseAsset)
                })
            } else if(this.$store.state.selectedAssetSync[0].asset == "Surge arrester") {
                await jobSurgeApi.findAllJobByAssetId(this.$store.state.selectedAssetSync[0].id).then((responseAsset) => {
                    this.rowData = this.rowData.concat(responseAsset)
                })
            } else if(this.$store.state.selectedAssetSync[0].asset == "Power cable") {
                await jobPowerApi.findAllJobByAssetId(this.$store.state.selectedAssetSync[0].id).then((responseAsset) => {
                    this.rowData = this.rowData.concat(responseAsset)
                })
            } else if(this.$store.state.selectedAssetSync[0].asset == "Voltage transformer") {
                await jobVoltageApi.findAllJobByAssetId(this.$store.state.selectedAssetSync[0].id).then((responseAsset) => {
                    this.rowData = this.rowData.concat(responseAsset)
                })
            }
        },
        async getJobData(assetId) {
            if(this.$store.state.selectedAssetSync[0].asset == "Transformer") {
                jobApi.findJobByAssetId(assetId, 1, this.sl).then(async (response) => {
                    this.rowData = response
                    this.count = await jobApi.countJobByAssetId(assetId)
                    await this.resetNumberPage()
                    await this.pageAlignCalc(this.count, this.pageJobSync, this.displayPageJobSync)
                    this.$refs.JobSyncPageAlign.firstUserPage()
                })
            } else if(this.$store.state.selectedAssetSync[0].asset == "Circuit breaker") {
                await jobCircuitApi.findJobByAssetId(assetId, 1, this.sl).then(async (responseAsset) => {
                    this.rowData = responseAsset
                    this.count = await jobCircuitApi.countJobByAssetId(assetId)
                    await this.resetNumberPage()
                    await this.pageAlignCalc(this.count, this.pageJobSync, this.displayPageJobSync)
                    this.$refs.JobSyncPageAlign.firstUserPage()
                })
            } else if(this.$store.state.selectedAssetSync[0].asset == "Current transformer") {
                await jobCurrentApi.findJobByAssetId(assetId, 1, this.sl).then(async (responseAsset) => {
                    this.rowData = responseAsset
                    this.count = await jobCurrentApi.countJobByAssetId(assetId)
                    await this.resetNumberPage()
                    await this.pageAlignCalc(this.count, this.pageJobSync, this.displayPageJobSync)
                    this.$refs.JobSyncPageAlign.firstUserPage()
                })
            } else if(this.$store.state.selectedAssetSync[0].asset == "Disconnector") {
                await jobDisconnectorApi.findJobByAssetId(assetId, 1, this.sl).then(async (responseAsset) => {
                    this.rowData = responseAsset
                    this.count = await jobDisconnectorApi.countJobByAssetId(assetId)
                    await this.resetNumberPage()
                    await this.pageAlignCalc(this.count, this.pageJobSync, this.displayPageJobSync)
                    this.$refs.JobSyncPageAlign.firstUserPage()
                })
            } else if(this.$store.state.selectedAssetSync[0].asset == "Surge arrester") {
                await jobSurgeApi.findJobByAssetId(assetId, 1, this.sl).then(async (responseAsset) => {
                    this.rowData = responseAsset
                    this.count = await jobSurgeApi.countJobByAssetId(assetId)
                    await this.resetNumberPage()
                    await this.pageAlignCalc(this.count, this.pageJobSync, this.displayPageJobSync)
                    this.$refs.JobSyncPageAlign.firstUserPage()
                })
            } else if(this.$store.state.selectedAssetSync[0].asset == "Power cable") {
                await jobPowerApi.findJobByAssetId(assetId, 1, this.sl).then(async (responseAsset) => {
                    this.rowData = responseAsset
                    this.count = await jobPowerApi.countJobByAssetId(assetId)
                    await this.resetNumberPage()
                    await this.pageAlignCalc(this.count, this.pageJobSync, this.displayPageJobSync)
                    this.$refs.JobSyncPageAlign.firstUserPage()
                })
            } else if(this.$store.state.selectedAssetSync[0].asset == "Voltage transformer") {
                await jobVoltageApi.findJobByAssetId(assetId, 1, this.sl).then(async (responseAsset) => {
                    this.rowData = responseAsset
                    this.count = await jobVoltageApi.countJobByAssetId(assetId)
                    await this.resetNumberPage()
                    await this.pageAlignCalc(this.count, this.pageJobSync, this.displayPageJobSync)
                    this.$refs.JobSyncPageAlign.firstUserPage()
                })
            }
        },
        onGridReady(params) {
            this.gridApi = params.api
            this.gridColumnApi = params.columnApi
        },
        onSelectionChanged() {
            this.selectedJob = this.gridApi.getSelectedRows()
            this.$store.state.selectedJobSync = this.gridApi.getSelectedRows()
        },
        lock(value) {
            const listId = this.selectedJob.map((job) => job.id)
            jobApi
                .lock(value, listId)
                .then(async () => {
                    this.$message.success('Successful')
                    this.selectedJob = []
                    await this.getJobs()
                })
                .catch((error) => {
                    console.log(error)
                    this.$message.error(error.message)
                })
        },
        async download() {
            let listTestInsert = []
            let listTestUpdate = []
            let listLocation = this.$store.state.selectedLocationSync
            // let refId = listLocation[0].refId
            // if(listLocation[0].mode != "location") {
            //     while (refId != "" && refId != null && refId != undefined) {
            //         let dataTemp =  await locationApi.getById(refId)
            //         if(dataTemp != undefined) {
            //             listLocation.push(dataTemp)
            //             refId = dataTemp.refId
            //         } else {
            //             break
            //         }
            //     }
            // }
            const locationIds = listLocation.map((location) => location.id)
            const listPromiseLocationExist = locationIds.map(id => window.electronAPI.getLocationById(id))
            const listResLocationExist = await Promise.all(listPromiseLocationExist)  
            const listInsert = []
            const listUpdate = []
            for (let index = 0; index < listResLocationExist.length; index++) {
                const location = listLocation[index];
                const isExist = listResLocationExist[index].data !== undefined

                if (isExist) {
                    listUpdate.push(location)
                }
                else {
                    listInsert.push(location)
                }
            }

            // thêm mới location
            for (let index = 0; index < listInsert.length; index++) {
                const location = listInsert[index]
                const newLocation = this.locationMapper(location)
                let locationParent = await window.electronAPI.getLocationById(newLocation.properties.refId)
                if(locationParent.success) {
                    if(locationParent.data == undefined || locationParent.data.length <= 0) {
                        let ownerParent = await window.electronAPI.getOwnerById(newLocation.properties.refId)
                        if(ownerParent.success) {
                            if(ownerParent.data.length <= 0) {
                                const root = await window.electronAPI.getOwnerByUserId('00000000-0000-0000-0000-000000000000')
                                newLocation.properties.ref_id_old = JSON.parse(JSON.stringify(newLocation.properties.refId))
                                newLocation.properties.refId = root.data[0].id
                            }
                        }
                    }
                }
                await window.electronAPI.insertLocation(this.user.user_id, newLocation)
                attachmentApi.getDataAttachment(location.id).then(async(response) => {
                    if(response != null && response.length > 0) {
                        await window.electronAPI.uploadAttachment(response[0].id_foreign, "location", JSON.parse(response[0].name))
                        for(let i in JSON.parse(response[0].name)) {
                            let data = JSON.parse(response[0].name)[i].path
                            fileUploadApi.download(data).then(async(reply) => {
                                await window.electronAPI.downloadFileData(reply, data)
                            })
                        }
                    }
                })
            }

            // cập nhật location
            for (let index = 0; index < listUpdate.length; index++) {
                const location = listUpdate[index]
                const newLocation = this.locationMapper(location)
                let locationParent = await window.electronAPI.getLocationById(newLocation.properties.refId)
                if(locationParent.success) {
                    if(locationParent.data == undefined || locationParent.data.length <= 0) {
                        let ownerParent = await window.electronAPI.getOwnerById(newLocation.properties.refId)
                        if(ownerParent.success) {
                            if(ownerParent.data.length <= 0) {
                                const root = await window.electronAPI.getOwnerByUserId('00000000-0000-0000-0000-000000000000')
                                newLocation.properties.ref_id_old = JSON.parse(JSON.stringify(newLocation.properties.refId))
                                newLocation.properties.refId = root.data[0].id
                            }
                        }
                    }
                }
                await window.electronAPI.updateLocation(newLocation)
                attachmentApi.getDataAttachment(location.id).then(async(response) => {
                    const data = await window.electronAPI.getAllAttachment(location.id, "location")
                    if(response.length > 0 && data?.data?.length > 0 && response[0].name !== data.data[0].name) {
                        this.$confirm('Change attachment files in locations ' + location.name + ' . Continue?', 'Warning', {
                            confirmButtonText: 'OK',
                            cancelButtonText: 'Cancel',
                            type: 'warning'
                        }).then(async() => {
                            if(response != null && response.length > 0) {
                                await window.electronAPI.updateAttachment(response[0].id_foreign, JSON.parse(response[0].name), "location")
                                for(let i in JSON.parse(response[0].name)) {
                                    let data = JSON.parse(response[0].name)[i].path
                                    fileUploadApi.download(data).then(async(reply) => {
                                        await window.electronAPI.downloadFileData(reply, data)
                                    })
                                }
                            }
                        })
                    }
                })
            }

            let listAsset = JSON.parse(JSON.stringify(this.$store.state.selectedAssetSync))
            if(listAsset[0].asset == "Transformer") {
                const listId = this.selectedJob.map((job) => job.id)
                await assetApi.download([listAsset[0].id]).then(async (response) => {
                    let transformer = response[0].asset.asset 
                    let tapChanger = response[0].asset.tapChanger
                    let bushing = response[0].asset.bushing
                    let check = await window.electronAPI.getAssetById(transformer.id)

                    if(check.data.asset != undefined) {
                        const newAsset = this.assetMapper(transformer)
                        const newBushing = this.bushingMapper(bushing)
                        const newTapChanger = this.tapChangerMapper(tapChanger)
                        await window.electronAPI.updateAsset(newAsset, newTapChanger, newBushing)
                    } else {
                        const newAsset = this.assetMapper(transformer)
                        const newBushing = this.bushingMapper(bushing)
                        const newTapChanger = this.tapChangerMapper(tapChanger)
                        const locationId = listLocation[0].id
                        await window.electronAPI.insertAsset(locationId, newAsset, newTapChanger, newBushing)
                    }
                })

                await jobApi.download(listId).then(async (response) => {
                    console.log(response)
                    for(let i in response) {
                        await window.electronAPI.saveJobTransformer(response[i].job.job)
                        let testList = response[i].job.listTest
                        if(testList != undefined && testList.length != 0) {
                            let res = await window.electronAPI.saveTestTransformer(testList, response[i].job.job.id)
                            if(res.success) {
                                listTestInsert = listTestInsert.concat(res.insert)
                                listTestUpdate = listTestInsert.concat(res.update)
                            }
                        }
                    }
                })

            } else if(listAsset[0].asset == "Circuit breaker") {
                let circuitData = assetMapper.circuitMapper(listAsset[0])
                let check = await window.electronAPI.getCircuitId(circuitData.circuit.id)
                if(check.data.length != 0 && check.data != undefined && check != undefined) {
                    await window.electronAPI.updateCircuit(circuitData)
                } else {
                    await window.electronAPI.insertCircuit(circuitData.circuit.location_id, circuitData)
                }

                let listJob = JSON.parse(JSON.stringify(this.selectedJob))
                for(let i in listJob) {
                    await window.electronAPI.saveJobCircuit(listJob[i])
                    let testList = await testCircuitApi.findAllTestByJobId(listJob[i].id)
                    if(testList != undefined && testList.length != 0) {
                        let res = await window.electronAPI.saveTestCircuit(testList, listJob[i].id)
                        if(res.success) {
                            listTestInsert = listTestInsert.concat(res.insert)
                            listTestUpdate = listTestInsert.concat(res.update)
                        }
                    }
                }
            } else if(listAsset[0].asset == "Current transformer") {
                let currentData = assetMapper.currentMapper(listAsset[0])
                let check = await window.electronAPI.getCurrentVoltageById(currentData.current.id)
                if(check.data.length != 0 && check.data != undefined && check != undefined) {
                    await window.electronAPI.updateCurrentVoltage(currentData)
                } else {
                    await window.electronAPI.insertCurrentVoltage(currentData.current.location_id, currentData)
                }
                let listJob = JSON.parse(JSON.stringify(this.selectedJob))
                for(let i in listJob) {
                    await window.electronAPI.saveJobCurrent(listJob[i])
                    let testList = await testCurrentApi.findAllTestByJobId(listJob[i].id)
                    if(testList != undefined && testList.length != 0) {
                        let res = await window.electronAPI.saveTestCurrent(testList, listJob[i].id)
                        if(res.success) {
                            listTestInsert = listTestInsert.concat(res.insert)
                            listTestUpdate = listTestInsert.concat(res.update)
                        }
                    }
                }
            } else if(listAsset[0].asset == "Voltage transformer") {
                let voltageData = assetMapper.voltageMapper(listAsset[0])
                let check = await window.electronAPI.getVoltageTransById(voltageData.voltage.id)
                if(check.data.length != 0 && check.data != undefined && check != undefined) {
                    await window.electronAPI.updateVoltageTrans(voltageData)
                } else {
                    await window.electronAPI.insertVoltageTrans(voltageData.voltage.location_id, voltageData)
                }
                let listJob = JSON.parse(JSON.stringify(this.selectedJob))
                for(let i in listJob) {
                    await window.electronAPI.saveJobVoltage(listJob[i])
                    let testList = await testVoltageApi.findAllTestByJobId(listJob[i].id)
                    if(testList != undefined && testList.length != 0) {
                        let res = await window.electronAPI.saveTestVoltage(testList, listJob[i].id)
                        if(res.success) {
                            listTestInsert = listTestInsert.concat(res.insert)
                            listTestUpdate = listTestInsert.concat(res.update)
                        }
                    }
                }
            } else if(listAsset[0].asset == "Disconnector") {
                let disconnectorData = assetMapper.disconnectorMapper(listAsset[0])
                let check = await window.electronAPI.getDisconnectorById(disconnectorData.voltage.id)
                if(check.data.length != 0 && check.data != undefined && check != undefined) {
                    await window.electronAPI.updateDisconnector(disconnectorData)
                } else {
                    await window.electronAPI.insertDisconnector(disconnectorData.disconnect.location_id, voltageData)
                }
                let listJob = JSON.parse(JSON.stringify(this.selectedJob))
                for(let i in listJob) {
                    await window.electronAPI.saveJobDisconnector(listJob[i])
                    let testList = await testDisconnectorApi.findAllTestByJobId(listJob[i].id)
                    if(testList != undefined && testList.length != 0) {
                        let res = await window.electronAPI.saveTestDisconnector(testList, listJob[i].id)
                        if(res.success) {
                            listTestInsert = listTestInsert.concat(res.insert)
                            listTestUpdate = listTestInsert.concat(res.update)
                        }
                    }
                }
            } else if(listAsset[0].asset == "Surge arrester") {
                let surgeData = assetMapper.surgeMapper(listAsset[0])
                let check = await window.electronAPI.getSurgeArresterById(surgeData.surge.id)
                if(check.data.length != 0 && check.data != undefined && check != undefined) {
                    await window.electronAPI.updateSurgeArrester(surgeData)
                } else {
                    await window.electronAPI.insertSurgeArrester(surgeData.surge.location_id, surgeData)
                }
                let listJob = JSON.parse(JSON.stringify(this.selectedJob))
                for(let i in listJob) {
                    await window.electronAPI.saveJobSurge(listJob[i])
                    let testList = await testSurgeApi.findAllTestByJobId(listJob[i].id)
                    if(testList != undefined && testList.length != 0) {
                        let res = await window.electronAPI.saveTestSurge(testList, listJob[i].id)
                        if(res.success) {
                            listTestInsert = listTestInsert.concat(res.insert)
                            listTestUpdate = listTestInsert.concat(res.update)
                        }
                    }
                }
            } else if(listAsset[0].asset == "Power cable") {
                let powerData = assetMapper.powerMapper(listAsset[0])
                let check = await window.electronAPI.getPowerCableById(powerData.power.id)
                if(check.data.length != 0 && check.data != undefined && check != undefined) {
                    await window.electronAPI.updatePowerCable(powerData)
                } else {
                    await window.electronAPI.insertPowerCable(powerData.power.location_id, powerData)
                }
                let listJob = JSON.parse(JSON.stringify(this.selectedJob))
                for(let i in listJob) {
                    await window.electronAPI.saveJobPower(listJob[i])
                    let testList = await testPowerApi.findAllTestByJobId(listJob[i].id)
                    if(testList != undefined && testList.length != 0) {
                        let res = await window.electronAPI.saveTestPower(testList, listJob[i].id)
                        if(res.success) {
                            listTestInsert = listTestInsert.concat(res.insert)
                            listTestUpdate = listTestInsert.concat(res.update)
                        }
                    }
                }
            }
            
            for (let index = 0; index < listTestInsert.length; index++) {
                attachmentApi.getDataAttachment(listTestInsert[index].id).then(async(response) => {
                    if(response != null && response.length != 0) {
                        await window.electronAPI.uploadAttachment(response[0].id_foreign, "test", JSON.parse(response[0].name))
                        for(let i in JSON.parse(response[0].name)) {
                            let data = JSON.parse(response[0].name)[i].path
                            fileUploadApi.download(data).then(async(reply) => {
                                await window.electronAPI.downloadFileData(reply, data)
                            })
                        }
                    }
                })
            }

            for (let index = 0; index < listTestUpdate.length; index++) {
                attachmentApi.getDataAttachment(listTestUpdate[index].id).then(async(response) => {
                    const data = await window.electronAPI.getAllAttachment(listTestUpdate[index].id, "test")
                    if(response.length > 0 && data?.data?.length > 0 && response[0].name !== data.data[0].name) {
                        this.$confirm('Change attachment files in test ' + listTestUpdate[index].name + ' . Continue?', 'Warning', {
                            confirmButtonText: 'OK',
                            cancelButtonText: 'Cancel',
                            type: 'warning'
                        }).then(async() => {
                            if(response != null && response.length > 0) {
                                await window.electronAPI.updateAttachment(response[0].id_foreign, JSON.parse(response[0].name), "test")
                                for(let i in JSON.parse(response[0].name)) {
                                    let data = JSON.parse(response[0].name)[i].path
                                    fileUploadApi.download(data).then(async(reply) => {
                                        await window.electronAPI.downloadFileData(reply, data)
                                    })
                                }
                            }
                        })
                    }
                })
            }

            this.$message.success("Successful")
        },
        deleteMultiple() {
            this.$confirm('Delete jobs. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    if(this.$store.state.selectedAssetSync[0].asset == 'Transformer') {
                        const listId = this.selectedJob.map((job) => job.id)
                        jobApi.deleteMultiple(listId).then(async (response) => {
                        }).catch((error) => {
                            console.log(error)
                            this.$message.error(error.message)
                        })
                    } else if(this.$store.state.selectedAssetSync[0].asset == "Circuit breaker") {
                        jobCircuitApi.deleteAll(this.selectedJob)
                    } else if(this.$store.state.selectedAssetSync[0].asset == "Current transformer") {
                        jobCurrentApi.deleteAll(this.selectedJob)
                    } else if(this.$store.state.selectedAssetSync[0].asset == "Voltage transformer") {
                        jobVoltageApi.deleteAll(this.selectedJob)
                    } else if(this.$store.state.selectedAssetSync[0].asset == "Disconnector") {
                        jobDisconnectorApi.deleteAll(this.selectedJob)
                    } else if(this.$store.state.selectedAssetSync[0].asset == "Surge arrester") {
                        jobSurgeApi.deleteAll(this.selectedJob)
                    } else if(this.$store.state.selectedAssetSync[0].asset == "Power cable") {
                        jobPowerApi.deleteAll(this.selectedJob)
                    }

                    await this.refresh()
                    this.$message.success("Successful")
                }).catch(() => {})
        },
        async refresh() {
            this.loading = true
            this.rowData = []
            this.selectedJob = []
            await this.$common.simulateLoading(1000)
            await this.getJobData(this.$store.state.selectedAssetSync[0].id)
            this.loading = false
        },
        locationMapper(location) {
            const newLocation = {
                properties: {
                    id: location.id,
                    name: location.name,
                    region: location.region,
                    division: location.division,
                    area: location.area,
                    plant: location.plant,
                    address: location.address,
                    city: location.city,
                    state_province: location.state_province,
                    postal_code: location.postal_code,
                    country: location.country,
                    geo_coordinates: location.geo_coordinates,
                    location_system_code: location.location_system_code,
                    comment: location.comment,
                    mode : location.mode,
                    refId : location.refId
                },
                contact_person: {
                    name: location.person_name,
                    phone_no1: location.person_phone_no1,
                    phone_no2: location.person_phone_no2,
                    fax_no: location.person_fax_no,
                    email: location.person_email
                },
                company: {
                    company: location.company_company,
                    department: location.company_department,
                    address: location.company_address,
                    city: location.company_city,
                    state_province: location.company_state_province,
                    postal_code: location.company_postal_code,
                    country: location.company_country,
                    phone_no: location.company_phone_no,
                    fax_no: location.company_fax_no,
                    email: location.company_email
                }
            }
            return newLocation
        },
        assetMapper(asset) {
            const newAsset = {
                properties: {
                    id: asset.id,
                    asset: asset.asset,
                    asset_type: asset.asset_type,
                    serial_no: asset.serial_no,
                    manufacturer: asset.manufacturer,
                    manufacturer_type: asset.manufacturer_type,
                    manufacturing_year: asset.manufacturing_year,
                    asset_system_code: asset.asset_system_code,
                    apparatus_id: asset.apparatus_id,
                    feeder: asset.feeder,
                    date_of_warehouse_receipt: asset.date_of_warehouse_receipt,
                    date_of_delivery: asset.date_of_delivery,
                    date_of_production_order: asset.date_of_production_order,
                    date_of_warehouse_delivery: asset.date_of_warehouse_delivery,
                    progress: asset.progress,
                    standard: asset.standard,
                    thermal_meter: asset.thermal_meter,
                    comment: asset.comment
                },
                winding_configuration: {
                    phases: asset.phases,
                    vector_group: JSON.parse(asset.vector_group),
                    vector_group_custom: asset.vector_group_custom,
                    unsupported_vector_group: asset.unsupported_vector_group
                },
                ratings: {
                    rated_frequency: ['16.7', '50', '60'].includes(asset.rated_frequency) ? asset.rated_frequency : 'Custom',
                    rated_frequency_custom: ['16.7', '50', '60'].includes(asset.rated_frequency) ? null : asset.rated_frequency,
                    voltage_ratings: JSON.parse(asset.voltage_ratings),
                    voltage_regulation: JSON.parse(asset.voltage_regulation),
                    power_ratings: JSON.parse(asset.power_ratings),
                    current_ratings: JSON.parse(asset.current_ratings),
                    short_circuit: {
                        ka: JSON.parse(asset.max_short_circuit_current_ka),
                        s: asset.max_short_circuit_current_s
                    }
                },
                impedances: {
                    ref_temp: asset.ref_temp,
                    prim_sec: JSON.parse(asset.prim_sec),
                    prim_tert: JSON.parse(asset.prim_tert),
                    sec_tert: JSON.parse(asset.sec_tert),
                    zero_sequence_impedance: {
                        base_power: JSON.parse(asset.base_power),
                        base_voltage: JSON.parse(asset.base_voltage),
                        zero_percent: asset.zero_percent
                    }
                },
                others: {
                    category: asset.category,
                    status: asset.status,
                    tank_type: asset.tank_type,
                    insulation_medium: asset.insulation_medium,
                    oil_type: asset.oil_type,
                    insulation: {
                        key: asset.insulation_weight != null ? 'Weight' : 'Volume',
                        weight: asset.insulation_weight,
                        volume: asset.insulation_volume
                    },
                    total_weight: asset.total_weight,
                    winding: JSON.parse(asset.winding)
                }
            }
            return newAsset
        },
        tapChangerMapper(tapChanger) {
            const newTapChanger = {
                id: tapChanger.id,
                mode: tapChanger.mode,
                _mode: tapChanger._mode,
                serial_no: tapChanger.serial_no,
                manufacturer: tapChanger.manufacturer,
                manufacturer_type: tapChanger.manufacturer_type,
                winding: tapChanger.winding,
                _winding: tapChanger._winding,
                tap_scheme: tapChanger.tap_scheme,
                no_of_taps: tapChanger.no_of_taps,
                voltage_table: JSON.parse(tapChanger.voltage_table)
            }
            return newTapChanger
        },
        bushingMapper(bushing) {
            const newBushing = {
                id: bushing.id,
                asset_type: JSON.parse(bushing.asset_type),
                serial_no: JSON.parse(bushing.serial_no),
                manufacturer: JSON.parse(bushing.manufacturer),
                manufacturer_type: JSON.parse(bushing.manufacturer_type),
                manufacturer_year: JSON.parse(bushing.manufacturer_year),
                insull_level: JSON.parse(bushing.insull_level),
                voltage_gr: JSON.parse(bushing.voltage_gr),
                rate_current: JSON.parse(bushing.rate_current),
                max_sys_voltage : JSON.parse(bushing.max_sys_voltage),
                df_c1: JSON.parse(bushing.df_c1),
                cap_c1: JSON.parse(bushing.cap_c1),
                df_c2: JSON.parse(bushing.df_c2),
                cap_c2: JSON.parse(bushing.cap_c2),
                insulation_type: JSON.parse(bushing.insulation_type)
            }
            return newBushing
        },
        jobMapper(job) {
            return job
        },
        testMapper(test) {
            const newTest = {
                id: test.id,
                testTypeId: test.testTypeId,
                testTypeCode: test.testTypeCode,
                testTypeName: test.testTypeName,
                name: test.name,
                data: JSON.parse(test.data),
                average_score: test.average_score,
                total_average_score: test.total_average_score,
                total_worst_score: test.total_worst_score,
                weighting_factor: test.weighting_factor,
                weighting_factor_c: test.weighting_factor_c,
                weighting_factor_df: test.weighting_factor_df,
                worst_score: test.worst_score,
                average_score_df : test.average_score_df,
                average_score_c : test.average_score_c,
                worst_score_df : test.worst_score_df,
                worst_score_c: test.worst_score_c,
                created_on: new Date(test.created_on).getTime()
            }
            return newTest
        },
        async updateJobSyncPage(pageStt) {
            if(this.$store.state.selectedAssetSync.length > 0) {
                let assetId = this.$store.state.selectedAssetSync[0].id
                if(this.$store.state.selectedAssetSync[0].asset == "Transformer") {
                    jobApi.findJobByAssetId(assetId, pageStt, this.sl).then(async (response) => {
                        this.rowData = response
                    })
                } else if(this.$store.state.selectedAssetSync[0].asset == "Circuit breaker") {
                    await jobCircuitApi.findJobByAssetId(assetId, pageStt, this.sl).then(async (responseAsset) => {
                        this.rowData = responseAsset
                    })
                } else if(this.$store.state.selectedAssetSync[0].asset == "Current transformer") {
                    await jobCurrentApi.findJobByAssetId(assetId, pageStt, this.sl).then(async (responseAsset) => {
                        this.rowData = responseAsset
                    })
                } else if(this.$store.state.selectedAssetSync[0].asset == "Disconnector") {
                    await jobDisconnectorApi.findJobByAssetId(assetId, pageStt, this.sl).then(async (responseAsset) => {
                        this.rowData = responseAsset
                    })
                } else if(this.$store.state.selectedAssetSync[0].asset == "Surge arrester") {
                    await jobSurgeApi.findJobByAssetId(assetId, pageStt, this.sl).then(async (responseAsset) => {
                        this.rowData = responseAsset
                    })
                } else if(this.$store.state.selectedAssetSync[0].asset == "Power cable") {
                    await jobPowerApi.findJobByAssetId(assetId, pageStt, this.sl).then(async (responseAsset) => {
                        this.rowData = responseAsset
                    })
                } else if(this.$store.state.selectedAssetSync[0].asset == "Voltage transformer") {
                    await jobVoltageApi.findJobByAssetId(assetId, pageStt, this.sl).then(async (responseAsset) => {
                        this.rowData = responseAsset
                    })
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.location {
    height: 100%;

    .el-button {
        border: none;
        background: inherit;
        border-radius: 0;
        margin: 0;
        padding: 0;
    }

    .top-table {
        height: 50px;
        line-height: 30px;
        background-color: #d5d8dc;
        margin-bottom: 5px;
        padding: 10px;
        box-sizing: border-box;
    }

    .content-table {
        height: calc(100% - 55px);
        background-color: #eaecee;
        padding: 10px;
        box-sizing: border-box;

        .content-table-top {
            height: 30px;
            line-height: 30px;
        }

        .content-table-main {
            height: calc(100% - 30px);
        }
    }
}

.btn {
    border: solid 1px #808b96 !important;
    padding: 0.25rem 0.5rem !important;
}
</style>
