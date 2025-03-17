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
                <el-button :disabled="selectedAsset.length !== 1" @click="add()">
                    <i class="fa-solid fa-plus mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedJob.length !== 1" @click="onOpenJob">
                    <i class="fa-solid fa-folder-open mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedJob.length === 0" @click="onDeleteJob">
                    <i class="fa-solid fa-x mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedAsset.length != 1" @click="importJobCSV">
                    <i class="fa-solid fa-file-import mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedJob.length === 0" @click="exportJobCSV">
                    <i class="fa-solid fa-file-export mgr-20 pointer"></i>
                </el-button>

                <el-button :disabled="selectedJob.length === 0" @click="onDupJob">
                    <i class="fa-solid fas fa-clone mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedJob.length === 0" @click="upload">
                    <i class="fa-solid fas fa-upload mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedAsset.length !== 1" @click="openOnlineMonitoringData">
                    <i class="fa fa-television mgr-20 pointer"></i>
                </el-button>
                <span style="float: right">{{ selectedJob.length }} of {{ rowData.length }}</span>
            </div>
            <div class="content-table-main">
                <ag-grid-vue
                    style="height: 100%"
                    class="ag-theme-alpine"
                    @grid-ready="onGridReady"
                    @rowDoubleClicked="onRowDoubleClick"
                    :columnDefs="columnDefs"
                    :rowData="rowData"
                    rowSelection="multiple"
                    @selection-changed="onSelectionChanged">
                </ag-grid-vue>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import {AgGridVue} from 'ag-grid-vue'
import {mapState} from 'vuex'
import * as jobApi from '@/api/job'
import * as mornitorApi from '@/api/monitoring'
import * as FileUploadApi from '@/api/fileUpload'
import * as AttachmentApi from '@/api/attachment'
import * as circuitApi from "@/api/circuit/circuit"
import * as currentApi from "@/api/current/current"
import * as voltageApi from "@/api/voltage/voltage"
import * as disconnectorApi from "@/api/disconnector/disconnector"
import * as surgeApi from "@/api/surge/surge"
import * as powerApi from "@/api/power/power"
import * as jobCircuitApi from "@/api/circuit/jobCircuit"
import * as jobCurrentApi from "@/api/current/jobCurrent"
import * as jobVoltageApi from "@/api/voltage/jobVoltage"
import * as jobDisconnectorApi from "@/api/disconnector/jobDisconnector"
import * as jobSurgeApi from "@/api/surge/jobSurge"
import * as jobPowerApi from "@/api/power/jobPower"
import * as testCircuitApi from "@/api/circuit/testCircuit"
import * as testCurrentApi from "@/api/current/testCurrent"
import * as testVoltageApi from "@/api/voltage/testVoltage"
import * as testDisconnectorApi from "@/api/disconnector/testDisconnector"
import * as testSurgeApi from "@/api/surge/testSurge"
import * as testPowerApi from "@/api/power/testPower"
import * as locationApi from '@/api/location'


export default {
    name: 'JobComponent',
    components: {
        AgGridVue
    },
    computed: mapState(['selectedLocation', 'selectedAsset', 'selectedJob']),
    data() {
        return {
            columnDefs: [
                {field: 'id', hide: true},
                {
                    field: 'name',
                    headerName: 'Name',
                    sortable: true,
                    headerCheckboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true,
                    checkboxSelection: true
                },
                {field: 'tested_by', headerName: 'Tested by', sortable: true},
                {field: 'creation_date', headerName: 'Creation date', sortable: true},
                {field: 'execution_date', headerName: 'Execution date', sortable: true},
                {field: 'status', headerName: 'Status', sortable: true},
                {field: 'work_order', headerName: 'Work order', sortable: true}
            ],
            rowData: [],
            search: '',
            loading: false
        }
    },
    beforeMount() {},
    mounted() {},
    watch: {
        search(newSearch, oldSearch) {
            this.gridApi.setQuickFilter(newSearch)
        },
        async '$store.state.selectedAsset'(newVal, oldVal) {
            if (newVal.length === 1) {
                if(this.selectedAsset[0].asset === 'Transformer') {
                    const assetId = newVal[0].id
                    await this.getJobs(assetId)
                    this.setSelectedNode()
                }
                else if(this.selectedAsset[0].asset === 'Circuit breaker') {
                    const assetId = newVal[0].id
                    await this.getJobCircuit(assetId)
                    this.setSelectedNode()
                }
                else if(this.selectedAsset[0].asset === 'Current transformer') {
                    const assetId = newVal[0].id
                    await this.getJobCurrent(assetId)
                    this.setSelectedNode()
                }
                else if(this.selectedAsset[0].asset === 'Voltage transformer') {
                    const assetId = newVal[0].id
                    await this.getJobVoltage(assetId)
                    this.setSelectedNode()
                }
                else if(this.selectedAsset[0].asset === 'Disconnector') {
                    const assetId = newVal[0].id
                    await this.getJobDisconnect(assetId)
                    this.setSelectedNode()
                }
                else if(this.selectedAsset[0].asset === 'Power cable') {
                    const assetId = newVal[0].id
                    await this.getJobPower(assetId)
                    this.setSelectedNode()
                } else if(this.selectedAsset[0].asset === 'Surge arrester') {
                    const assetId = newVal[0].id
                    await this.getJobSurgeArrester(assetId)
                    this.setSelectedNode()
                }
            } else {
                this.rowData = []
            }
        },
        async '$store.state.selectedLocation'(newVal, oldVal) {
            this.rowData = []
        }
    },
    methods: {
        async getJobs(assetId) {
                const rs = await window.electronAPI.getJobs(assetId)
                if (rs.success) {
                    this.rowData = rs.data
            }
        },
        async getJobCircuit(assetId) {
            const rs = await window.electronAPI.getJobCircuit(assetId)
            if (rs.success) {
                this.rowData = rs.data
            }
        },
        async getJobCurrent(assetId) {
            const rs = await window.electronAPI.getJobCurrentVoltage(assetId)
            if (rs.success) {
                this.rowData = rs.data
            }
        },
        async getJobVoltage(assetId) {
            const rs = await window.electronAPI.getJobVoltageTrans(assetId)
            if (rs.success) {
                this.rowData = rs.data
            }
        },
        async getJobDisconnect(assetId) {
            const rs = await window.electronAPI.getJobDisconnector(assetId)
            if (rs.success) {
                this.rowData = rs.data
            }
        },
        async getJobPower(assetId) {
            const rs = await window.electronAPI.getJobPowerCable(assetId)
            if (rs.success) {
                this.rowData = rs.data
            }
        },
        async getJobSurgeArrester(assetId) {
            const rs = await window.electronAPI.getJobSurgeArrester(assetId)
            if (rs.success) {
                this.rowData = rs.data
            }
        },
        onGridReady(params) {
            this.gridApi = params.api
            this.gridColumnApi = params.columnApi
        },
        onRowDoubleClick(event) {
            const data = event.data
            const job_id = data.id
            if(this.selectedAsset[0].asset === 'Transformer') {
                this.$router.push({name: 'job', query: {mode: 'edit', job_id: job_id}})
            } else if(this.selectedAsset[0].asset === 'Circuit breaker') {
                this.$router.push({name: 'jobCircuit', query: {mode: 'edit', job_id: job_id}})
            }
            else if(this.selectedAsset[0].asset === 'Current transformer') {
                this.$router.push({name: 'jobCurrent', query: {mode: 'edit', job_id: job_id}})
            }
            else if(this.selectedAsset[0].asset === 'Voltage transformer') {
                this.$router.push({name: 'jobVoltage', query: {mode: 'edit', job_id: job_id}})
            }
            else if(this.selectedAsset[0].asset === 'Disconnector') {
                this.$router.push({name: 'jobDisconnect', query: {mode: 'edit', job_id: job_id}})
            }
            else if(this.selectedAsset[0].asset === 'Power cable') {
                this.$router.push({name: 'jobPower', query: {mode: 'edit', job_id: job_id}})
            } else if(this.selectedAsset[0].asset === 'Surge arrester') {
                this.$router.push({name: 'jobSurgeArrester', query: {mode: 'edit', job_id: job_id}})
            }
        },
        onSelectionChanged() {
            const selectedJob = this.gridApi.getSelectedRows()
            this.$store.dispatch('setSelectedJob', selectedJob)
        },
        onOpenJob() {
            if(this.selectedAsset[0].asset === 'Transformer') {
                this.$router.push({name: 'job', query: {mode: 'edit', job_id: this.selectedJob[0].id}})
            } else if(this.selectedAsset[0].asset === 'Circuit breaker') {
                this.$router.push({name: 'jobCircuit', query: {mode: 'edit', job_id: this.selectedJob[0].id}})
            } else if(this.selectedAsset[0].asset === 'Current transformer') {
                this.$router.push({name: 'jobCurrent', query: {mode: 'edit', job_id: this.selectedJob[0].id}})
            } else if(this.selectedAsset[0].asset === 'Voltage transformer') {
                this.$router.push({name: 'jobVoltage', query: {mode: 'edit', job_id: this.selectedJob[0].id}})
            } else if(this.selectedAsset[0].asset === 'Disconnector') {
                this.$router.push({name: 'jobDisconnect', query: {mode: 'edit', job_id: this.selectedJob[0].id}})
            } else if(this.selectedAsset[0].asset === 'Power cable') {
                this.$router.push({name: 'jobPower', query: {mode: 'edit', job_id: this.selectedJob[0].id}})
            } else if(this.selectedAsset[0].asset === 'Surge arrester') {
                this.$router.push({name: 'jobSurgeArrester', query: {mode: 'edit', job_id: this.selectedJob[0].id}})
            }
        },
        onDupJob() {
            if(this.selectedAsset[0].asset === 'Transformer') {
                this.$router.push({name: 'job', query: {mode: 'dup', job_id: this.selectedJob[0].id}})
            } else if(this.selectedAsset[0].asset === 'Circuit breaker') {
                this.$router.push({name: 'jobCircuit', query: {mode: 'dup', job_id: this.selectedJob[0].id}})
            } else if(this.selectedAsset[0].asset === 'Current transformer') {
                this.$router.push({name: 'jobCurrent', query: {mode: 'dup', job_id: this.selectedJob[0].id}})
            } else if(this.selectedAsset[0].asset === 'Voltage transformer') {
                this.$router.push({name: 'jobVoltage', query: {mode: 'dup', job_id: this.selectedJob[0].id}})
            } else if(this.selectedAsset[0].asset === 'Disconnector') {
                this.$router.push({name: 'jobDisconnect', query: {mode: 'dup', job_id: this.selectedJob[0].id}})
            } else if(this.selectedAsset[0].asset === 'Power cable') {
                this.$router.push({name: 'jobPower', query: {mode: 'dup', job_id: this.selectedJob[0].id}})
            } else if(this.selectedAsset[0].asset === 'Surge arrester') {
                this.$router.push({name: 'jobSurgeArrester', query: {mode: 'dup', job_id: this.selectedJob[0].id}})
            }
        },
        onDeleteJob() {
            const jobIds = this.selectedJob.map((job) => job.id)
            this.$confirm('Do you want to delete this job?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    if(this.selectedAsset[0].asset === 'Transformer') {
                        await window.electronAPI.deleteJob(jobIds)
                        this.$message({
                            type: 'success',
                            message: 'Delete completed'
                        })
                        this.$store.dispatch('setSelectedJob', [])
                        await this.getJobs(this.selectedAsset[0].id)
                        this.setSelectedNode()
                    }
                    else if(this.selectedAsset[0].asset === 'Circuit breaker') {
                        await window.electronAPI.deleteJobCircuit(jobIds)
                        this.$message({
                            type: 'success',
                            message: 'Delete completed'
                        })
                        this.$store.dispatch('setSelectedJob', [])
                        await this.getJobCircuit(this.selectedAsset[0].id)
                        this.setSelectedNode()

                    }
                    else if(this.selectedAsset[0].asset === 'Current transformer') {
                        await window.electronAPI.deleteJobCurrentVoltage(jobIds)
                        this.$message({
                            type: 'success',
                            message: 'Delete completed'
                        })
                        this.$store.dispatch('setSelectedJob', [])
                        await this.getJobCurrent(this.selectedAsset[0].id)
                        this.setSelectedNode()

                    }
                    else if(this.selectedAsset[0].asset === 'Voltage transformer') {
                        await window.electronAPI.deleteJobVoltageTrans(jobIds)
                        this.$message({
                            type: 'success',
                            message: 'Delete completed'
                        })
                        this.$store.dispatch('setSelectedJob', [])
                        await this.getJobVoltage(this.selectedAsset[0].id)
                        this.setSelectedNode()

                    }
                    else if(this.selectedAsset[0].asset === 'Disconnector') {
                        await window.electronAPI.deleteJobDisconnector(jobIds)
                        this.$message({
                            type: 'success',
                            message: 'Delete completed'
                        })
                        this.$store.dispatch('setSelectedJob', [])
                        await this.getJobDisconnect(this.selectedAsset[0].id)
                        this.setSelectedNode()
                    }
                    else if(this.selectedAsset[0].asset === 'Power cable') {
                        await window.electronAPI.deleteJobPowerCable(jobIds)
                        this.$message({
                            type: 'success',
                            message: 'Delete completed'
                        })
                        this.$store.dispatch('setSelectedJob', [])
                        await this.getJobPower(this.selectedAsset[0].id)
                        this.setSelectedNode()

                    } else if(this.selectedAsset[0].asset === 'Surge arrester') {
                        await window.electronAPI.deleteJobSurgeArrester(jobIds)
                        this.$message({
                            type: 'success',
                            message: 'Delete completed'
                        })
                        this.$store.dispatch('setSelectedJob', [])
                        await this.getJobSurgeArrester(this.selectedAsset[0].id)
                        this.setSelectedNode()
                    }
                })
                .catch(() => {
                    return
                })
        },
        openOnlineMonitoringData() {
            this.$router.push({name: 'online-monitoring-data', query: {mode: 'edit'}})
        },
        setSelectedNode() {
            const ids = this.selectedJob.map((_) => _.id)
            this.gridApi.forEachNode(function (node) {
                node.setSelected(ids.includes(node.data.id))
            })
        },
        add() {
            // $router.push({name: 'job', query: {mode: 'add'}}
            if(this.selectedAsset[0].asset === 'Transformer') {
                this.$router.push({name: 'job', query: {mode: 'add'}})
            } else if(this.selectedAsset[0].asset === 'Circuit breaker') {
                this.$router.push({name: 'jobCircuit', query: {mode: 'add'}})
            } else if(this.selectedAsset[0].asset === 'Current transformer') {
                this.$router.push({name: 'jobCurrent', query: {mode: 'add'}})
            } else if(this.selectedAsset[0].asset === 'Voltage transformer') {
                this.$router.push({name: 'jobVoltage', query: {mode: 'add'}})
            } else if(this.selectedAsset[0].asset === 'Disconnector') {
                this.$router.push({name: 'jobDisconnect', query: {mode: 'add'}})
            } else if(this.selectedAsset[0].asset === 'Power cable') {
                this.$router.push({name: 'jobPower', query: {mode: 'add'}})
            } else if(this.selectedAsset[0].asset === 'Surge arrester') {
                this.$router.push({name: 'jobSurgeArrester', query: {mode: 'add'}})
            }
        },
        async importJobCSV() {
            const rs = await window.electronAPI.importJobCSV(this.selectedAsset[0].id, this.selectedAsset[0].asset)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Import completed'
                })
                await this.refresh()
            } else {
                this.$message.error(rs.message)
            }
        },
        async exportJobCSV() {
            if (this.selectedJob.length === 0) {
                this.$message.error('Please choose job.')
                return
            }

            let listPromiseTest = []
            const jobs = this.selectedJob
            const jobIds = jobs.map(job => job.id)

            if(this.$store.state.selectedAsset[0].asset == "Transformer") {
                listPromiseTest = jobIds.map(id => window.electronAPI.getTestByJobId(id))
            } else if(this.$store.state.selectedAsset[0].asset == "Circuit breaker") {
                listPromiseTest = jobIds.map(id => window.electronAPI.getTestCircuitByJobId(id))
            } else if(this.$store.state.selectedAsset[0].asset == "Current transformer") {
                listPromiseTest = jobIds.map(id => window.electronAPI.getTestCurrentByJobId(id))
            } else if(this.$store.state.selectedAsset[0].asset == "Voltage transformer") {
                listPromiseTest = jobIds.map(id => window.electronAPI.getTestVoltageByJobId(id))
            } else if(this.$store.state.selectedAsset[0].asset == "Disconnector") {
                listPromiseTest = jobIds.map(id => window.electronAPI.getTestDisconnectorByJobId(id))
            } else if(this.$store.state.selectedAsset[0].asset == "Surge arrester") {
                listPromiseTest = jobIds.map(id => window.electronAPI.getTestSurgeByJobId(id))
            } else if(this.$store.state.selectedAsset[0].asset == "Power cable") {
                listPromiseTest = jobIds.map(id => window.electronAPI.getTestPowerByJobId(id))
            }

            const listResTest = await Promise.all(listPromiseTest)
            const tests = listResTest.map(res => res.data)

            const fullJobs = []
            for (let index = 0; index < jobIds.length; index++) {
                const job = jobs[index]
                const test = tests[index]

                fullJobs.push({
                    job,
                    tests : test
                })
                
            }

            const rs = await window.electronAPI.export(fullJobs)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Export completed'
                })
            } else {
                this.$message.error(rs.message)
            }
        },
        upload() {
            this.$confirm('Upload jobs. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(async () => {

                let testList = []

                //get all data of location
                const listLocation = this.selectedLocation
                let refId = listLocation[0].refId
                if(listLocation[0].mode != "location") {
                    while (refId != "" || refId != null || refId != undefined) {
                        let dataTemp = await window.electronAPI.getLocationById(refId)
                        if(dataTemp.data != undefined) {
                            listLocation.push(dataTemp.data)
                            refId = dataTemp.data.refId
                        } else {
                            break
                        }
                    }
                }

                for(let i in listLocation) {
                    if(listLocation[i].ref_id_old != null && listLocation[i].ref_id_old != '') {
                        listLocation[i].refId = JSON.parse(JSON.stringify(listLocation[i].ref_id_old))
                    }
                }

                await locationApi.upload(listLocation)
                .then(async () => {
                    for (const location of listLocation) {
                        try {
                            // Lấy danh sách file đính kèm từ Electron
                            const data = await window.electronAPI.getAllAttachment(location.id, "location");
                            if (!data?.data?.length) continue; // Kiểm tra nếu không có dữ liệu, bỏ qua

                            // Lấy danh sách file cũ từ server
                            const response = await AttachmentApi.getNameAttachment(location.id);
                            const oldAttachments = response ? response : []; // Đảm bảo không bị null
                            const newAttachments = JSON.parse(data.data[0]?.name || "[]"); // Parse JSON an toàn

                            // Kiểm tra sự thay đổi file
                            if (JSON.stringify(oldAttachments) !== JSON.stringify(newAttachments)) {
                                const confirm = await this.$confirm(
                                    `Change attachment files in location ${location.name}. Continue?`,
                                    'Warning',
                                    {
                                        confirmButtonText: 'OK',
                                        cancelButtonText: 'Cancel',
                                        type: 'warning'
                                    }
                                ).catch(() => false); // Nếu cancel thì return false

                                if (!confirm) continue; // Nếu người dùng hủy, bỏ qua

                                // Upload file đồng thời
                                const uploadPromises = newAttachments.flatMap(file => 
                                    FileUploadApi.upload(file.path)
                                );

                                await Promise.all(uploadPromises); // Đợi tất cả file upload xong
                                await AttachmentApi.upload(data.data); // Cập nhật danh sách mới
                            }
                        } catch (error) {
                            console.error(`Lỗi khi xử lý location ID ${location.id}:`, error);
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.$message.error(error.message);
                });

                // lấy dữ liệu asset
                if(this.selectedAsset[0].asset == 'Transformer') {
                    const listPromiseAsset = this.selectedAsset.map((asset) => {
                        const assetId = asset.id
                        return window.electronAPI.getAssetById(assetId)
                    })
                    const listResponseAsset = await Promise.all(listPromiseAsset)
                    const listAsset = listResponseAsset.map((res) => {
                        const data = res.data
                        const fullAsset = {
                            asset: data.asset,
                            bushing: data.bushings,
                            tapChanger: data.tap_changer
                        }
                        return fullAsset
                    })

                    // lấy dữ liệu job
                    const listPromiseJob = this.selectedJob.map((job) => {
                        const jobId = job.id
                        return window.electronAPI.getJobById(jobId)
                    })

                    const listResponseJob = await Promise.all(listPromiseJob)
                    const listJob = listResponseJob.map((res) => {
                        const data = res.data
                        const fullJob = {
                            listTest: data.testList,
                            job: data.job
                        }
                        return fullJob
                    })

                    for(let index in listJob) {
                        for(let i in listJob[index].listTest ) {
                            let condition = await window.electronAPI.getTestingCondition(listJob[index].listTest[i].id)
                            listJob[index].listTest[i].data = JSON.stringify(Object.assign(JSON.parse(listJob[index].listTest[i].data), {condition : condition.data}))
                        }
                    }
                    await jobApi.upload(listLocation, listAsset, listJob).then(async (res) => {
                        const asset_id = this.selectedAsset[0]

                        if(res) {
                            for(let i in listJob) {
                                testList.concat(listJob[i].listTest)
                            }
                        }

                        const rs = await window.electronAPI.getOnlineMonitoringData(asset_id.id)
                        if (typeof rs.data === "undefined"){
                            this.$message.success("Success but no online mornitoring")
                        }
                        else {
                            const mornitoring = rs.data
                            mornitorApi.getMornitoring(mornitoring.id).then((res) => {
                                mornitorApi.updateMonitoring(mornitoring).then(() => {
                                    this.$message.success("Successful")
                                }).catch((err) => {
                                    this.$message.warning("Success but no online mornitoring")
                                })
                            }).catch((error) => {
                                mornitorApi.creatMonitoring(mornitoring).then(() => {
                                    this.$message.success("Successful")
                                }).catch((error) => {
                                    this.$message.warning("Success but no online mornitoring")
                                })
                            })
                        }

                    }).catch((error) => {
                        console.log(error)
                        this.$message.error(error.message)
                    })
                } else {
                    if(this.selectedAsset[0].asset == 'Circuit breaker') {
                        await circuitApi.save(this.selectedAsset)
                        await jobCircuitApi.save(this.selectedJob)
                        for(let i in this.selectedJob) {
                            let dataJobTest = await window.electronAPI.getJobCircuitById(this.selectedJob[i].id)
                            if(dataJobTest.data.testList.length != 0) {
                                for(let j in dataJobTest.data.testList) {
                                    let condition = await window.electronAPI.getTestingCondition(dataJobTest.data.testList[j].id)
                                    dataJobTest.data.testList[j].data = JSON.parse(dataJobTest.data.testList[j].data)
                                    dataJobTest.data.testList[j].data.condition = condition.data[0]
                                    dataJobTest.data.testList[j].data = JSON.stringify(dataJobTest.data.testList[j].data)
                                    delete dataJobTest.data.testList[j]['created_on']
                                    
                                }
                                await testCircuitApi.save(dataJobTest.data.testList)
                                testList = testList.concat(dataJobTest.data.testList)
                            }
                        }
                    } else if(this.selectedAsset[0].asset == 'Current transformer') {
                        await currentApi.save(this.selectedAsset)
                        await jobCurrentApi.save(this.selectedJob)
                        for(let i in this.selectedJob) {
                            let dataJobTest = await window.electronAPI.getJobCurrentVoltageById(this.selectedJob[i].id)
                            if(dataJobTest.data.testList.length != 0) {
                                for(let j in dataJobTest.data.testList) {
                                    let condition = await window.electronAPI.getTestingCondition(dataJobTest.data.testList[j].id)
                                    dataJobTest.data.testList[j].data = JSON.parse(dataJobTest.data.testList[j].data)
                                    dataJobTest.data.testList[j].data.condition = condition.data[0]
                                    dataJobTest.data.testList[j].data = JSON.stringify(dataJobTest.data.testList[j].data)
                                    delete dataJobTest.data.testList[j]['created_on']
                                }
                                await testCurrentApi.save(dataJobTest.data.testList)
                                testList = testList.concat(dataJobTest.data.testList)
                            }
                        }
                    } else if(this.selectedAsset[0].asset == 'Voltage transformer') {
                        await voltageApi.save(this.selectedAsset)
                        await jobVoltageApi.save(this.selectedJob)
                        for(let i in this.selectedJob) {
                            let dataJobTest = await window.electronAPI.getJobVoltageTransById(this.selectedJob[i].id)
                            if(dataJobTest.data.testList.length != 0) {
                                for(let j in dataJobTest.data.testList) {
                                    let condition = await window.electronAPI.getTestingCondition(dataJobTest.data.testList[j].id)
                                    dataJobTest.data.testList[j].data = JSON.parse(dataJobTest.data.testList[j].data)
                                    dataJobTest.data.testList[j].data.condition = condition.data[0]
                                    dataJobTest.data.testList[j].data = JSON.stringify(dataJobTest.data.testList[j].data)
                                    delete dataJobTest.data.testList[j]['created_on']
                                }
                                await testVoltageApi.save(dataJobTest.data.testList)
                                testList = testList.concat(dataJobTest.data.testList)
                            }
                        }
                    } else if(this.selectedAsset[0].asset == 'Disconnector') {
                        await disconnectorApi.save(this.selectedAsset)
                        await jobDisconnectorApi.save(this.selectedJob)
                        for(let i in this.selectedJob) {
                            let dataJobTest = await window.electronAPI.getJobDisconnectorById(this.selectedJob[i].id)
                            if(dataJobTest.data.testList.length != 0) {
                                for(let j in dataJobTest.data.testList) {
                                    let condition = await window.electronAPI.getTestingCondition(dataJobTest.data.testList[j].id)
                                    dataJobTest.data.testList[j].data = JSON.parse(dataJobTest.data.testList[j].data)
                                    dataJobTest.data.testList[j].data.condition = condition.data[0]
                                    dataJobTest.data.testList[j].data = JSON.stringify(dataJobTest.data.testList[j].data)
                                    delete dataJobTest.data.testList[j]['created_on']
                                }
                                await testDisconnectorApi.save(dataJobTest.data.testList)
                                testList = testList.concat(dataJobTest.data.testList)
                            }
                        }
                    } else if(this.selectedAsset[0].asset == 'Surge arrester') {
                        await surgeApi.save(this.selectedAsset)
                        await jobSurgeApi.save(this.selectedJob)
                        for(let i in this.selectedJob) {
                            let dataJobTest = await window.electronAPI.getJobSurgeArresterById(this.selectedJob[i].id)
                            if(dataJobTest.data.testList.length != 0) {
                                for(let j in dataJobTest.data.testList) {
                                    let condition = await window.electronAPI.getTestingCondition(dataJobTest.data.testList[j].id)
                                    dataJobTest.data.testList[j].data = JSON.parse(dataJobTest.data.testList[j].data)
                                    dataJobTest.data.testList[j].data.condition = condition.data[0]
                                    dataJobTest.data.testList[j].data = JSON.stringify(dataJobTest.data.testList[j].data)
                                    delete dataJobTest.data.testList[j]['created_on']
                                }
                                await testSurgeApi.save(dataJobTest.data.testList)
                                testList = testList.concat(dataJobTest.data.testList)
                            }
                        }
                    } else if(this.selectedAsset[0].asset == 'Power cable') {
                        await powerApi.save(this.selectedAsset)
                        await jobPowerApi.save(this.selectedJob)
                        for(let i in this.selectedJob) {
                            let dataJobTest = await window.electronAPI.getJobPowerCableById(this.selectedJob[i].id)
                            if(dataJobTest.data.testList.length != 0) {
                                for(let j in dataJobTest.data.testList) {
                                    let condition = await window.electronAPI.getTestingCondition(dataJobTest.data.testList[j].id)
                                    dataJobTest.data.testList[j].data = JSON.parse(dataJobTest.data.testList[j].data)
                                    dataJobTest.data.testList[j].data.condition = condition.data[0]
                                    dataJobTest.data.testList[j].data = JSON.stringify(dataJobTest.data.testList[j].data)
                                    delete dataJobTest.data.testList[j]['created_on']
                                }
                                await testPowerApi.save(dataJobTest.data.testList)
                                testList = testList.concat(dataJobTest.data.testList)
                            }
                        }
                    }

                    this.$message.success("Successful")
                }

                for(let index in testList) {
                    const data = await window.electronAPI.getAllAttachment(testList[index].id, "test")
                    AttachmentApi.getNameAttachment(testList[index].id).then(async(response) => {
                        if(response != null) {
                            if(JSON.stringify(response) != JSON.stringify(data.data[0].name)) {
                                this.$confirm('Change attachment files in test ' + testList[index].name + ' . Continue?', 'Warning', {
                                    confirmButtonText: 'OK',
                                    cancelButtonText: 'Cancel',
                                    type: 'warning'
                                }).then(async() => {
                                    for(let i in data.data) {
                                        for(let j in JSON.parse(data.data[i].name)) {
                                            await FileUploadApi.upload(JSON.parse(data.data[i].name)[j].path)
                                        }
                                    }
                                    AttachmentApi.upload(data.data)
                                })
                            }
                        } else {
                            if(JSON.stringify(response) != JSON.stringify(data.data[0].name)) {
                                    for(let i in data.data) {
                                        for(let j in JSON.parse(data.data[i].name)) {
                                            await FileUploadApi.upload(JSON.parse(data.data[i].name)[j].path)
                                        }
                                    AttachmentApi.upload(data.data)
                                }
                            }
                        }
                    })
                }
            }).catch(() => {})
        },
        openOnlineMonitoringData() {
            this.$router.push({name: 'online-monitoring-data', query: {mode: 'edit'}})
        },
        async refresh() {
            this.loading = true
            this.rowData = []
            this.$store.dispatch('setSelectedJob', [])
            await this.$common.simulateLoading(1000)
            if (this.selectedAsset.length == 1) {
                await this.getJobs(this.selectedAsset[0].id)
            }
            this.loading = false
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
</style>
