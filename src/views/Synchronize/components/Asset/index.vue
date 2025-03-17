<template>
    <div class="location">
        <div class="top-table">
            <el-button :disabled="loading">
                <i class="fa-solid fa-rotate-right mgr-10" :class="{'fa-spin': loading}" @click="refresh()"></i>
            </el-button>
            <span class="bolder">Asset</span>
            <el-input class="float-right" style="width: 50%" size="mini" v-model="search"></el-input>
        </div>
        <div class="content-table">
            <div style="display: flex">
                <div class="content-table-top">
                    <el-button title="Download" plain class="btn mgr-15" :disabled="selectedAsset.length == 0" @click="download">
                        <i class="fa-solid fa-download pointer"></i>
                    </el-button>
                    <el-button title="Lock" plain class="btn mgr-15" :disabled="selectedAsset.length == 0" @click="lock(true)">
                        <i class="fa-solid fa-lock pointer"></i>
                    </el-button>
                    <el-button title="Unlock" plain class="btn mgr-15" :disabled="selectedAsset.length == 0" @click="lock(false)">
                        <i class="fa-solid fa-unlock pointer"></i>
                    </el-button>
                    <el-button title="Delete" plain class="btn mgr-15" :disabled="selectedAsset.length == 0" @click="deleteMultiple">
                        <i class="fa-solid fa-xmark pointer"></i>
                    </el-button>
                </div>
                <div>
                    <el-select @change="changeSelectedType" size="mini" style="width: 170px" v-model="assetSelected">
                        <el-option value="Transformer" label="Transformer"></el-option>
                        <el-option value="Circuit breaker" label="Circuit breaker"></el-option>
                        <el-option value="Current transformer" label="Current transformer"></el-option>
                        <el-option value="Disconnector" label="Disconnector"></el-option>
                        <el-option value="Surge arrester" label="Surge arrester"></el-option>
                        <el-option value="Power cable" label="Power cable"></el-option>
                        <el-option value="Voltage transformer" label="Voltage transformer"></el-option>
                    </el-select>
                </div>
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
                    ref="AssetSyncPageAlign" 
                    :page-user="this.pageAssetSync" 
                    :display-page-user="this.displayPageAssetSync" 
                    :page-user-instance="this.pageAssetSyncInstance" 
                    :current-page="this.currentAssetSync" 
                    title="AssetSync"
                    :option.sync="this.optionAssetSync"
                    @update-page="updateAssetSyncPage">
                >
                </page-align>
            </div>
            <collab v-if="openDialog" :resource="'asset'" :id="selectedAsset.length == 1 ? selectedAsset[0].id : ''" @onCloseDialog="openDialog = false">
            </collab>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import {AgGridVue} from 'ag-grid-vue'
import Collab from '../Collab'
import cellRenderAssetSync from '../CellRender/cellRenderAssetSync.vue'
import capitalizeRenderer from '../CellRender/capitalizeRenderer.vue'
import * as assetApi from '@/api/asset'
import {mapState} from 'vuex'
import * as fileUploadApi from '@/api/fileUpload'
import * as attachmentApi from '@/api/attachment'
import * as circuitApi from '@/api/circuit/circuit'
import * as currentApi from '@/api/current/current'
import * as disconnectorApi from '@/api/disconnector/disconnector'
import * as voltageApi from '@/api/voltage/voltage'
import * as surgeApi from '@/api/surge/surge'
import * as powerApi from '@/api/power/power'
import * as locationApi from '@/api/location'
import * as assetMapper from '../Mapper/asset'
import pageAlign from '@/views/PageAlign/pageAlign.vue'


export default {
    name: 'AssetComponent',
    components: {
        AgGridVue,
        Collab,
        pageAlign,
        cellRenderAssetSync,
        capitalizeRenderer
    },
    data() {
        return {
            columnDefs: [
                {field: 'id', hide: true},
                {field: 'mrid', hide: true},
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
                    field: 'serial_no',
                    headerName: 'Serial no.',
                    sortable: true
                },
                {field: 'asset', headerName: 'Asset', sortable: true, cellRenderer: 'capitalizeRenderer'},
                {field: 'asset_type', headerName: 'Asset type', sortable: true},
                {field: 'manufacturer', headerName: 'Manufacturer', sortable: true},
                {field: 'manufacturer_type', headerName: 'Manufacturer type', sortable: true},
                {field: 'asset_system_code', headerName: 'Asset system code', sortable: true},
                {field: 'apparatus_id', headerName: 'Apparatus ID', sortable: true},
                {field: 'feeder', headerName: 'Feeder', sortable: true},
                {field: 'phase', headerName: 'Phase', sortable: true}
            ],
            rowData: [],
            selectedAsset: [],
            search: '',
            loading: false,
            openDialog: false,
            sl : 4,
            assetSelected : "",

            pageAssetSync : {
                first : 1,
                second : 2,
                third : 3,
                dot : "...",
                end : 10,
            },
            displayPageAssetSync : {
                second : true,
                third : true,
                dot : true,
                end : true
            },
            pageAssetSyncInstance : {
                first : "",
                second : "",
                third : "",
                dot : "",
                end : "",
            },
            currentAssetSync : {
                nextP : '',
                previousP : '',
                current : 1,
            },
            optionAssetSync : {
                mode : ''
            },
            count : ''
        }
    },
    computed: {
        ...mapState(['selectedLocationSync', 'selectedAssetSync', 'user'])
    },
    async beforeMount() {
        // await this.getAssets()
    },
    mounted() {
    },
    watch: {
        search(newSearch, oldSearch) {
            this.gridApi.setQuickFilter(newSearch)
        },
        async '$store.state.selectedLocationSync'(newVal, oldVal) {
            if (newVal.length === 1) {
                let locationId = ''
                if(!newVal[0].mode.includes("OWNER")) {
                    locationId = newVal[0].id
                    await this.getAssetSync(locationId)
                }
            } else {
                this.rowData = []
            }
        }
    },
    methods: {
        async getCountOfAsset(name, locationId) {
            if(name == 'Transformer') {
                let count = await assetApi.countAssetByLocationId(locationId)
                return count
            } else if(name == 'Circuit breaker') {
                let count = await circuitApi.countAssetByLocationId(locationId)
                return count
            } else if(name == 'Current transformer') {
                let count = await currentApi.countAssetByLocationId(locationId)
                return count
            } else if(name == 'Disconnector') {
                let count = await voltageApi.countAssetByLocationId(locationId)
                return count
            } else if(name == 'Surge arrester') {
                let count = await disconnectorApi.countAssetByLocationId(locationId)
                return count
            } else if(name == 'Power cable') {
                let count = await surgeApi.countAssetByLocationId(locationId)
                return count
            } else if(name == 'Voltage transformer') {
                let count = await powerApi.countAssetByLocationId(locationId)
                return count
            }
        },

        async resetNumberPage() {
            this.pageAssetSync = {
                first : 1,
                second : 2,
                third : 3,
                dot : "...",
                end : 10,
            },
            this.displayPageAssetSync = {
                second : true,
                third : true,
                dot : true,
                end : true
            },
            this.pageAssetSyncInstance = {
                first : "",
                second : "",
                third : "",
                dot : "",
                end : "",
            },
            this.currentAssetSync = {
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

        async getAssetSync(locationId) {
            if(this.assetSelected != '') {
                if(this.assetSelected == 'Transformer') {
                    await assetApi.findAssetByLocationId(locationId, 1, this.sl).then(async(response) => {
                        this.rowData = response
                        this.count = await this.getCountOfAsset(this.assetSelected, locationId)
                        await this.resetNumberPage()
                        await this.pageAlignCalc(this.count, this.pageAssetSync, this.displayPageAssetSync)
                        this.$refs.AssetSyncPageAlign.firstUserPage()
                    })
                } else if(this.assetSelected == 'Circuit breaker') {
                    await circuitApi.findAssetByLocationId(locationId, 1, this.sl).then(async(responseAsset) => {
                        this.rowData = responseAsset
                        this.count = await this.getCountOfAsset(this.assetSelected, locationId)
                        await this.resetNumberPage()
                        await this.pageAlignCalc(this.count, this.pageAssetSync, this.displayPageAssetSync)
                        this.$refs.AssetSyncPageAlign.firstUserPage()
                    })
                } else if(this.assetSelected == 'Current transformer') {
                    await currentApi.findAssetByLocationId(locationId, 1, this.sl).then(async(responseAsset) => {
                        this.rowData = responseAsset
                        this.count = await this.getCountOfAsset(this.assetSelected, locationId)
                        await this.resetNumberPage()
                        await this.pageAlignCalc(this.count, this.pageAssetSync, this.displayPageAssetSync)
                        this.$refs.AssetSyncPageAlign.firstUserPage()
                    })
                } else if(this.assetSelected == 'Disconnector') {
                    await voltageApi.findAssetByLocationId(locationId, 1, this.sl).then(async(responseAsset) => {
                        this.rowData = responseAsset
                        this.count = await this.getCountOfAsset(this.assetSelected, locationId)
                        await this.resetNumberPage()
                        await this.pageAlignCalc(this.count, this.pageAssetSync, this.displayPageAssetSync)
                        this.$refs.AssetSyncPageAlign.firstUserPage()
                    })
                } else if(this.assetSelected == 'Surge arrester') {
                    await disconnectorApi.findAssetByLocationId(locationId, 1, this.sl).then(async(responseAsset) => {
                        this.rowData = responseAsset
                        this.count = await this.getCountOfAsset(this.assetSelected, locationId)
                        await this.resetNumberPage()
                        await this.pageAlignCalc(this.count, this.pageAssetSync, this.displayPageAssetSync)
                        this.$refs.AssetSyncPageAlign.firstUserPage()
                    })
                } else if(this.assetSelected == 'Power cable') {
                    await surgeApi.findAssetByLocationId(locationId, 1, this.sl).then(async(responseAsset) => {
                        this.rowData = responseAsset
                        this.count = await this.getCountOfAsset(this.assetSelected, locationId)
                        await this.resetNumberPage()
                        await this.pageAlignCalc(this.count, this.pageAssetSync, this.displayPageAssetSync)
                        this.$refs.AssetSyncPageAlign.firstUserPage()
                    })
                } else if(this.assetSelected == 'Voltage transformer') {
                    await powerApi.findAssetByLocationId(locationId, 1, this.sl).then(async(responseAsset) => {
                        this.rowData = responseAsset
                        this.count = await this.getCountOfAsset(this.assetSelected, locationId)
                        await this.resetNumberPage()
                        await this.pageAlignCalc(this.count, this.pageAssetSync, this.displayPageAssetSync)
                        this.$refs.AssetSyncPageAlign.firstUserPage()
                    })
                }
            }
        },
        async getAssets() {
            let locationId = this.$store.state.selectedLocationSync[0].id
            await assetApi.getAll().then((response) => {
                this.rowData = response
            })
            await circuitApi.findByLocationId(locationId).then(async(responseAsset) => {
                this.rowData = this.rowData.concat(responseAsset)
            })
            await currentApi.findByLocationId(locationId).then(async(responseAsset) => {
                this.rowData = this.rowData.concat(responseAsset)
            })
            await voltageApi.findByLocationId(locationId).then(async(responseAsset) => {
                this.rowData = this.rowData.concat(responseAsset)
            })
            await disconnectorApi.findByLocationId(locationId).then(async(responseAsset) => {
                this.rowData = this.rowData.concat(responseAsset)
            })
            await surgeApi.findByLocationId(locationId).then(async(responseAsset) => {
                this.rowData = this.rowData.concat(responseAsset)
            })
            await powerApi.findByLocationId(locationId).then(async(responseAsset) => {
                this.rowData = this.rowData.concat(responseAsset)
            })
        },
        onGridReady(params) {
            this.gridApi = params.api
            this.gridColumnApi = params.columnApi
        },
        onSelectionChanged() {
            this.selectedAsset = this.gridApi.getSelectedRows()
            this.$store.state.selectedAssetSync = this.gridApi.getSelectedRows()
        },
        lock(value) {
            const listId = this.selectedAsset.map((asset) => asset.id)
            assetApi
                .lock(value, listId)
                .then(async () => {
                    this.$message.success('Successful')
                    this.selectedAsset = []
                    await this.getAssets()
                })
                .catch((error) => {
                    console.log(error)
                    this.$message.error(error.message)
                })
        },
        async download() {
            const listId = this.selectedAsset.map((asset) => asset.id)
            let listLocation = this.$store.state.selectedLocationSync

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
                await window.electronAPI.updateLocation(newLocation);

                try {
                    const response = await attachmentApi.getDataAttachment(location.id);
                    const data = await window.electronAPI.getAllAttachment(location.id, "location");

                    // Kiểm tra nếu response hoặc data rỗng
                    if (!response?.length || !data?.data?.length) return;

                    const oldAttachments = JSON.parse(response[0]?.name || "[]");
                    const newAttachments = JSON.parse(data.data[0]?.name || "[]");

                    // So sánh dữ liệu file
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

                        if (!confirm) return; // Nếu người dùng hủy, thoát luôn

                        // Cập nhật file đính kèm
                        await window.electronAPI.updateAttachment(response[0].id_foreign, oldAttachments, "location");

                        // Download tất cả file đồng thời
                        await Promise.all(oldAttachments.map(async (file) => {
                            try {
                                const reply = await fileUploadApi.download(file.path);
                                await window.electronAPI.downloadFileData(reply, file.path);
                            } catch (error) {
                                console.error(`Lỗi khi tải file ${file.path}:`, error);
                            }
                        }));
                    }
                } catch (error) {
                    console.error("Lỗi xử lý file đính kèm:", error);
                }
            }
            console.log("B")
            let transformer = this.selectedAsset.filter(item => item.asset == "Transformer")
            if(transformer.length != 0) {
                assetApi.download(listId).then(async (response) => {
                    const listAssetFull = response.map((res) => res.asset)
                    const assetIds = listAssetFull.map((assetFull) => assetFull.asset.id)

                    // asset
                    const listPromiseAssetExist = assetIds.map(id => window.electronAPI.getAssetById(id))
                    const listResAssetExist = await Promise.all(listPromiseAssetExist)

                    const listAssetFullInsert = []
                    const listAssetFullUpdate = []

                    for (let index = 0; index < listAssetFull.length; index++) {
                        const assetFull = listAssetFull[index];
                        const isExist = listResAssetExist[index].data.asset !== undefined

                        if (isExist) {
                            listAssetFullUpdate.push(assetFull)
                        }
                        else {
                            listAssetFullInsert.push(assetFull)
                        }
                    }

                    // thêm mới asset
                    for (let index = 0; index < listAssetFullInsert.length; index++) {
                        const assetFull = listAssetFullInsert[index];
                        const { asset, tapChanger, bushing } = assetFull
                        const newAsset = this.assetMapper(asset)
                        const newBushing = this.bushingMapper(bushing)
                        const newTapChanger = this.tapChangerMapper(tapChanger)
                        const locationId = listLocation[0].id
                        await window.electronAPI.insertAsset(locationId, newAsset, newTapChanger, newBushing)
                    }

                    // cập nhật asset
                    for (let index = 0; index < listAssetFullUpdate.length; index++) {
                        const assetFull = listAssetFullUpdate[index];
                        const { asset, tapChanger, bushing } = assetFull
                        const newAsset = this.assetMapper(asset)
                        const newBushing = this.bushingMapper(bushing)
                        const newTapChanger = this.tapChangerMapper(tapChanger)
                        await window.electronAPI.updateAsset(newAsset, newTapChanger, newBushing)
                    }
                })
            }

            let circuit = this.selectedAsset.filter(item => item.asset == "Circuit breaker")
            if(circuit.length != 0) {
                for(let i in circuit) {
                    let circuitData = assetMapper.circuitMapper(circuit[i])
                    let check = await window.electronAPI.getCircuitId(circuitData.circuit.id)
                    if(check.data.length != 0 && check.data != undefined && check != undefined) {
                        await window.electronAPI.updateCircuit(circuitData)
                    } else {
                        await window.electronAPI.insertCircuit(circuitData.circuit.location_id, circuitData)
                    }
                }
            }

            let current = this.selectedAsset.filter(item => item.asset == "Current transformer")
            if(current.length != 0) {
                for(let i in current) {
                    let currentData = assetMapper.currentMapper(current[i])
                    let check = await window.electronAPI.getCurrentVoltageById(currentData.current.id)
                    if(check.data.length != 0 && check.data != undefined && check != undefined) {
                        await window.electronAPI.updateCurrentVoltage(currentData)
                    } else {
                        await window.electronAPI.insertCurrentVoltage(currentData.current.location_id, currentData)
                    }
                }
            }

            let voltage = this.selectedAsset.filter(item => item.asset == "Voltage transformer")
            if(voltage.length != 0) {
                for(let i in voltage) {
                    let voltageData = assetMapper.voltageMapper(voltage[i])
                    let check = await window.electronAPI.getVoltageTransById(voltageData.voltage.id)
                    if(check.data.length != 0 && check.data != undefined && check != undefined) {
                        await window.electronAPI.updateVoltageTrans(voltageData)
                    } else {
                        await window.electronAPI.insertVoltageTrans(voltageData.voltage.location_id, voltageData)
                    }
                }
            }

            let disconnector = this.selectedAsset.filter(item => item.asset == "Disconnector")
            if(disconnector.length != 0) {
                for(let i in disconnector) {
                    let disconnectorData = assetMapper.disconnectorMapper(disconnector[i])
                    let check = await window.electronAPI.getDisconnectorById(disconnectorData.voltage.id)
                    if(check.data.length != 0 && check.data != undefined && check != undefined) {
                        await window.electronAPI.updateDisconnector(disconnectorData)
                    } else {
                        await window.electronAPI.insertDisconnector(disconnectorData.disconnect.location_id, voltageData)
                    }
                }
            }

            let surge = this.selectedAsset.filter(item => item.asset == "Surge arrester")
            if(surge.length != 0) {
                for(let i in surge) {
                    let surgeData = assetMapper.surgeMapper(surge[i])
                    let check = await window.electronAPI.getSurgeArresterById(surgeData.surge.id)
                    if(check.data.length != 0 && check.data != undefined && check != undefined) {
                        await window.electronAPI.updateSurgeArrester(surgeData)
                    } else {
                        await window.electronAPI.insertSurgeArrester(surgeData.surge.location_id, surgeData)
                    }
                }
            }

            let power = this.selectedAsset.filter(item => item.asset == "Power cable")
            if(power.length != 0) {
                for(let i in power) {
                    let powerData = assetMapper.powerMapper(power[i])
                    let check = await window.electronAPI.getPowerCableById(powerData.power.id)
                    if(check.data.length != 0 && check.data != undefined && check != undefined) {
                        await window.electronAPI.updatePowerCable(powerData)
                    } else {
                        await window.electronAPI.insertPowerCable(powerData.power.location_id, powerData)
                    }
                }
            }
            this.$message.success("Successful")
        },
        deleteMultiple() {
            this.$confirm('Delete assets. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    const listId = this.selectedAsset.filter(item => item.asset == "Transformer").map((asset) => asset.id)
                    const listCircuit = this.selectedAsset.filter(item => item.asset == "Circuit breaker")
                    const listCurrent = this.selectedAsset.filter(item => item.asset == "Current transformer")
                    const listVoltage = this.selectedAsset.filter(item => item.asset == "Voltage transformer")
                    const listDisconnector = this.selectedAsset.filter(item => item.asset == "Disconnector")
                    const listSurge = this.selectedAsset.filter(item => item.asset == "Surge arrester")
                    const listPower = this.selectedAsset.filter(item => item.asset == "Power cable")
                    
                    circuitApi.deleteAll(listCircuit)
                    currentApi.deleteAll(listCurrent)
                    voltageApi.deleteAll(listVoltage)
                    disconnectorApi.deleteAll(listDisconnector)
                    surgeApi.deleteAll(listSurge)
                    powerApi.deleteAll(listPower)
                    
                    assetApi
                        .deleteMultiple(listId)
                        .then(async (response) => {
                            this.$message.success('Successful')
                            await this.refresh()
                        })
                        .catch((error) => {
                            console.log(error)
                            this.$message.error(error.message)
                        })
                })
                .catch(() => {})
        },
        async refresh() {
            this.loading = true
            this.rowData = []
            this.selectedAsset = []
            await this.$common.simulateLoading(1000)
            await this.getAssets()
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
        async updateAssetSyncPage(pageStt) {
            if(this.assetSelected != '') {
                if(this.assetSelected == 'Transformer') {
                    await assetApi.findAssetByLocationId(this.$store.state.selectedLocationSync[0].id, pageStt, this.sl).then(async(response) => {
                        this.rowData = response
                    })
                } else if(this.assetSelected == 'Circuit breaker') {
                    await circuitApi.findAssetByLocationId(this.$store.state.selectedLocationSync[0].id, pageStt, this.sl).then(async(responseAsset) => {
                        this.rowData = responseAsset
                    })
                } else if(this.assetSelected == 'Current transformer') {
                    await currentApi.findAssetByLocationId(this.$store.state.selectedLocationSync[0].id, pageStt, this.sl).then(async(responseAsset) => {
                        this.rowData = responseAsset
                    })
                } else if(this.assetSelected == 'Disconnector') {
                    await voltageApi.findAssetByLocationId(this.$store.state.selectedLocationSync[0].id, pageStt, this.sl).then(async(responseAsset) => {
                        this.rowData = responseAsset
                    })
                } else if(this.assetSelected == 'Surge arrester') {
                    await disconnectorApi.findAssetByLocationId(this.$store.state.selectedLocationSync[0].id, pageStt, this.sl).then(async(responseAsset) => {
                        this.rowData = responseAsset
                    })
                } else if(this.assetSelected == 'Power cable') {
                    await surgeApi.findAssetByLocationId(this.$store.state.selectedLocationSync[0].id, pageStt, this.sl).then(async(responseAsset) => {
                        this.rowData = responseAsset
                    })
                } else if(this.assetSelected == 'Voltage transformer') {
                    await powerApi.findAssetByLocationId(this.$store.state.selectedLocationSync[0].id, pageStt, this.sl).then(async(responseAsset) => {
                        this.rowData = responseAsset
                    })
                }
            }
        },
        changeSelectedType() {
            if(this.$store.state.selectedLocationSync.length > 0) {
                if(this.$store.state.selectedLocationSync[0].mode.includes("OWNER")) {
                    this.getAssetSync(this.$store.state.selectedLocationSync[0].mrid)
                } else {
                    this.getAssetSync(this.$store.state.selectedLocationSync[0].id)
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
