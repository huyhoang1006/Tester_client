<template>
    <div class="location">
        <div @click="hideOption()" class="top-table">
            <el-button :disabled="loading">
                <i class="fa-solid fa-rotate-right mgr-10" :class="{'fa-spin': loading}" @click="refresh()"></i>
            </el-button>
            <span class="bolder">Asset</span>
            <el-input class="float-right" style="width: 50%" size="mini" v-model="search"></el-input>
        </div>
        <div @click="hideOption()" class="content-table">
            <div class="content-table-top">
                <el-button :disabled="selectedLocation.length !== 1 || selectedLocation[0].mode.includes('owner')" @click="$router.push({name: 'property'})">
                    <i class="fa-solid fa-plus mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedAsset.length !== 1" @click="onOpenAsset">
                    <i class="fa-solid fa-folder-open mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedAsset.length === 0" @click="onDeleteAsset">
                    <i class="fa-solid fa-x mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedLocation.length !== 1" @click="importAssetCSV">
                    <i class="fa-solid fa-file-import mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedAsset.length === 0" @click="exportAssetXLS">
                    <i class="fa-solid fa-file-export mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedAsset.length === 0 || selectedLocation.length === 0" @click="ondupAsset">
                    <i class="fa-solid fas fa-clone pointer mgr-20 pointer"></i>
                </el-button>
                <!-- <el-button class="dropbtn" :disabled="selectedLocation.length === 0" @click="onImportHavec">
                    <i class="fa-solid fa-file-arrow-up mgr-20 pointer"></i>
                </el-button> -->
                <el-button @click="onOpenFmeca">
                    <i class="fa-solid mgr-20 fa-table"></i>
                </el-button>
                <el-button :disabled="selectedAsset.length === 0" @click="upload">
                    <i class="fa-solid fas fa-upload pointer"></i>
                </el-button>
                <span style="float: right">{{ selectedAsset.length }} of {{ rowData.length }}</span>
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
                    @cellContextMenu="cellContextMenu"
                    @selection-changed="onSelectionChanged">
                </ag-grid-vue>
            </div>
            
        </div>
        <div ref="option" :class="classOption">
            <div >
                <div @click="relocate()" class="childOption"> 
                    <i class="fa-solid fa-pen-to-square spaceIcon"></i>
                    Relocate asset
                </div>
            </div>
        </div>
        <el-dialog :visible.sync="openRelocateSetting" width="800px">
            <span slot="title" style="color: #012596;"><i class="fa-solid fa-gear"></i> Select a location</span>
            <div >
                <div style="display: flex; width: 100%; height:100%; border-bottom: 5px solid silver;">
                    <div style="border-right: 1px solid white; width: 50%;">
                        <div class="title">Locations</div>
                        <div class="title" style="background-color: #012596; font-size: 15px; color: white;">
                            Please select your target location
                        </div>
                        <div style="margin-top: 20px; margin-bottom: 20px;">
                            <div v-for="(item, index) in listLocation" :key="index">
                                <div :ref="'location' + index" @click="choosenLocation(item, 'location', index)" class="hoverMouse"> 
                                    <i class="fa-solid fa-caret-right" style="margin-right: 10px;" ></i> 
                                    <i class="fa-solid fa-location-dot" style="margin-right: 10px;"></i> 
                                    {{ item.name }}
                                </div>
                                <div v-for="(itemV, indexV) in listVoltage[index]" :key="indexV" >
                                    <div :ref="'voltage' + index + indexV" @click="choosenLocation(itemV, 'voltage', index, indexV)" class="hoverMouse" style="margin-left: 20px;">
                                        <i class="fa-solid fa-caret-right" style="margin-right: 10px;" ></i> 
                                        <i class="fa-solid fa-bolt" style="margin-right: 10px;"></i>
                                        {{ itemV.name }}
                                    </div>
                                    <div v-for="(itemF, indexF) in listFeeder[index][indexV]" :key="indexF">
                                        <div :ref="'feeder' + index + indexV + indexF" @click="choosenLocation(itemF, 'feeder', index, indexV, indexF)" class="hoverMouse" style="margin-left: 60px; display: flex; align-items: center;">
                                            <img style="width: 20px; height:20px; display: block;" src="@/assets/images/electric-pole.png"/>&nbsp;
                                            {{ itemF.name }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="border-left: 1px solid white; width: 50%;">
                        <div class="title">Details</div>
                        <div class="title" style="background-color: #012596; font-size: 15px; color: white;">
                            Additional
                        </div>
                        <div style="margin-top: 20px; margin-bottom: 20px; margin-left: 20px; margin-right: 10px;">
                            <el-row :gutter="20">
                                <el-form label-width="120px" size="mini" label-position="left">
                                    <el-form-item label="Operational state after relocation">
                                        <el-select style="width: 100%;" v-model="operational">
                                            <el-option
                                                label="Out of operation"
                                                value="Out of operation"
                                            />
                                            <el-option
                                                label="In operation"
                                                value="In operation"
                                            />
                                            <el-option
                                                label="No state change"
                                                value="No state change"
                                            />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="Relocated by">
                                        <el-input disabled v-model="relocateBy"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Relocated on">
                                        <el-date-picker 
                                            style="width: 100%;" 
                                            disabled 
                                            v-model="relocateOn"
                                            format="MM/dd/yyyy"
                                            value-format="MM/dd/yyyy"
                                            type="date"
                                            placeholder="Pick a day"
                                        />
                                    </el-form-item>
                                </el-form>
                            </el-row>
                            <el-row :gutter="20" style="margin-top: 10px;">
                                <el-input type="textarea" rows="4" v-model="comment"></el-input>
                            </el-row>
                            <el-row :gutter="20" style="margin-top: 10px;">
                                <div style="float: right;">
                                    <el-button size="small" type="primary" @click="openHistory()">History</el-button>
                                </div>
                            </el-row>
                        </div>
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="primary"  @click="confirmRelocate()">Save</el-button>
                <el-button size="small" @click="cancelRelocate()">Cancel</el-button>
            </span>
        </el-dialog>
        <el-dialog :visible.sync="historyShow" width="800px">
            <span slot="title" style="color: #012596;"><i class="fa-solid fa-clock-rotate-left"></i> Relocated history</span>
            <div>
                <table class="table-strip-input-data" style="width: 100%">
                    <thead>
                        <tr>
                            <th>Operation</th>
                            <th>Relocate by</th>
                            <th>Relocate on</th>
                            <th>comment</th>
                            <th>Source</th>
                            <th>Destination</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in this.chosenAsset.extend" :key="index">
                            <td style="text-align: center;">
                                {{ item.operational }}
                            </td>
                            <td style="text-align: center;">
                                {{ item.relocateBy }}
                            </td>
                            <td style="text-align: center;">
                                {{ item.relocateOn }}
                            </td>
                            <td style="text-align: center;">
                                {{ item.comment }}
                            </td>
                            <td style="text-align: center;">
                                {{ item.locationSource }}
                            </td>
                            <td style="text-align: center;">
                                {{ item.locationDest }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" @click="closeHistory()" type="primary">Close</el-button>
            </span>
        </el-dialog>
        <ul id="right-click-menu" tabindex="-1" v-if="this.openImport" :style="{top: this.top, left: this.left}">
            <li @click="onOpenImport11">Import 1 pha 1 cap</li>
            <li @click="onOpenImport31">Import 3 pha 1 cap</li>
            <li @click="onOpenImport32">Import 3 pha 2 cap</li>
        </ul>
    </div>
</template>

<script>
/* eslint-disable */
import {AgGridVue} from 'ag-grid-vue'
import {mapState} from 'vuex'
import * as assetApi from '@/api/asset'
import * as FileUploadApi from '@/api/fileUpload'
import * as AttachmentApi from '@/api/attachment'
import * as circuitApi from "@/api/circuit/circuit"
import * as currentApi from "@/api/current/current"
import * as voltageApi from "@/api/voltage/voltage"
import * as disconnectorApi from "@/api/disconnector/disconnector"
import * as surgeApi from "@/api/surge/surge"
import * as powerApi from "@/api/power/power"

export default {
    name: 'AssetComponent',
    components: {
        AgGridVue
    },
    computed: {
        ...mapState(['selectedLocation', 'selectedAsset', 'user'])
    },
    data() {
        return {
            columnDefs: [
                {field: 'id', hide: true},
                {
                    field: 'serial_no',
                    headerName: 'Serial no.',
                    sortable: true,
                    headerCheckboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true,
                    checkboxSelection: true
                },
                {field: 'asset', headerName: 'Asset', sortable: true},
                {field: 'asset_type', headerName: 'Asset type', sortable: true},
                {field: 'manufacturer', headerName: 'Manufacturer', sortable: true},
                {field: 'manufacturer_type', headerName: 'Manufacturer type', sortable: true},
                {field: 'asset_system_code', headerName: 'Asset system code', sortable: true},
                {field: 'apparatus_id', headerName: 'Apparatus ID', sortable: true},
                {field: 'feeder', headerName: 'Feeder', sortable: true},
            ],
            rowData: [],
            search: '',
            top: '100px',
            left: '0px',
            openImport: false,
            loading: false,
            classOption : "hide",
            listAllLocation : [],
            listLocation : [],
            listVoltage : [],
            listFeeder : [],
            location : '',
            chosenAsset : '',
            openRelocateSetting : false,
            operational : '',
            relocateBy : '',
            relocateOn : '',
            comment : '',
            historyShow : false
        }
    },
    beforeMount() {
        const date = new Date();
        let currentDay= String(date.getDate()).padStart(2, '0');
        let currentMonth = String(date.getMonth()+1).padStart(2,"0");
        let currentYear = date.getFullYear();
        this.relocateBy = this.user.name
        this.relocateOn = `${currentMonth}/${currentDay}/${currentYear}`
    },
    mounted() {},
    watch: {
        search(newSearch, oldSearch) {
            this.gridApi.setQuickFilter(newSearch)
        },
        async '$store.state.selectedLocation'(newVal, oldVal) {
            if (newVal.length === 1) {
                const locationId = newVal[0].id
                await this.getAssets(locationId)
                this.setSelectedNode()
            } else {
                this.rowData = []
            }
        }
    },
    methods: {
        onImportHavec(event) {
            this.openImport = !this.openImport
            this.left = event.clientX + 'px'
        },
        async onOpenImport31() {
            const rs = await window.electronAPI.importHavec3pha1cap(this.selectedLocation[0].id)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Import successful'
                })
            } else {
                this.$message({
                    type: 'error',
                    message: 'Import failure'
                })
            }
            this.openImport = false
        },
        async onOpenImport32() {
            const rs = await window.electronAPI.importHavec3pha2cap(this.selectedLocation[0].id)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Import Successful'
                })
            } else {
                this.$message({
                    type: 'error',
                    message: 'Import Failure'
                })
            }
            this.openImport = false
        },
        async onOpenImport11() {
            const rs = await window.electronAPI.importHavec1pha1cap(this.selectedLocation[0].id)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Import successful'
                })
            } else {
                this.$message({
                    type: 'error',
                    message: 'Import failure'
                })
            }
            this.openImport = false
        },
        async getAssets(locationId) {
            let dataList = []
            const rs = await window.electronAPI.getAssets(locationId)
            const rt = await window.electronAPI.getCircuitByLocationId(locationId)
            const rc = await window.electronAPI.getCurrentVoltageByLocationId(locationId)
            const rd = await window.electronAPI.getVoltageTransByLocationId(locationId)
            const ri = await window.electronAPI.getDisconnectorByLocationId(locationId)
            const rk = await window.electronAPI.getPowerCableByLocationId(locationId)
            const rv = await window.electronAPI.getSurgeArresterByLocationId(locationId)
            if (rs.success) {
                dataList = dataList.concat(rs.data)
                if(rt.success) {
                    let dataCircuit = []
                    rt.data.forEach((element) => {
                        let data_temp = Object.assign(element,(JSON.parse(element.properties)))
                        dataCircuit.push(data_temp)
                    })
                    dataList = dataList.concat(dataCircuit)
                }
                if(rc.success) {
                    let dataCurrent = []
                    rc.data.forEach((element) => {
                        let data_temp = Object.assign(element,(JSON.parse(element.properties)))
                        dataCurrent.push(data_temp)
                    })
                    dataList = dataList.concat(dataCurrent)
                }
                if(rd.success) {
                    let dataVoltage = []
                    rd.data.forEach((element) => {
                        let data_temp = Object.assign(element,(JSON.parse(element.properties)))
                        dataVoltage.push(data_temp)
                    })
                    dataList = dataList.concat(dataVoltage)
                }
                if(ri.success) {
                    let dataDisconnect = []
                    ri.data.forEach((element) => {
                        let data_temp = Object.assign(element,(JSON.parse(element.properties)))
                        dataDisconnect.push(data_temp)
                    })
                    dataList = dataList.concat(dataDisconnect)
                }
                if(rk.success) {
                    let dataPowerCable = []
                    rk.data.forEach((element) => {
                        let data_temp = Object.assign(element,(JSON.parse(element.properties)))
                        dataPowerCable.push(data_temp)
                    })
                    dataList = dataList.concat(dataPowerCable)
                }
                if(rv.success) {
                    let dataSurgeArrester = []
                    rv.data.forEach((element) => {
                        let data_temp = Object.assign(element,(JSON.parse(element.properties)))
                        dataSurgeArrester.push(data_temp)
                    })
                    dataList = dataList.concat(dataSurgeArrester)
                }
                this.rowData = dataList
            }
        },
        onGridReady(params) {
            this.gridApi = params.api
            this.gridColumnApi = params.columnApi
        },
        onRowDoubleClick(event) {
            const data = event.data
            const asset_id = data.id
            if(data.asset === 'Transformer') {
                this.$router.push({name: 'asset', query: {mode: 'edit', asset_id: asset_id}})
            }
            else if(data.asset === "Circuit breaker") {
                this.$router.push({name: "circuit", query : {mode: 'edit', asset_id: asset_id}})
            } else if (data.asset === "Current transformer") {
                this.$router.push({name: "currentTrans", query : {mode: 'edit', asset_id: asset_id}})
            } else if (data.asset === "Voltage transformer") {
                this.$router.push({name: "voltageTrans", query : {mode: 'edit', asset_id: asset_id}})
            } else if (data.asset === "Disconnector") {
                this.$router.push({name: "disconnector", query : {mode: 'edit', asset_id: asset_id}})
            } else if (data.asset === "Power cable") {
                this.$router.push({name: "powerCable", query : {mode: 'edit', asset_id: asset_id}})
            } else if (data.asset === "Surge arrester") {
                this.$router.push({name: "surgeArrester", query : {mode: 'edit', asset_id: asset_id}})
            }
        },
        ondupAsset() {
            console.log(this.selectedAsset)
            if(this.selectedAsset[0].asset == "Transformer") {
                this.$router.push({name: 'asset', query: {mode: 'dup', asset_id: this.selectedAsset[0].id}})
            } else if (this.selectedAsset[0].asset == "Circuit breaker") {
                this.$router.push({name: 'circuit', query: {mode: 'dup', asset_id: this.selectedAsset[0].id}})
            } else if (this.selectedAsset[0].asset == "Current transformer") {
                this.$router.push({name: 'currentTrans', query: {mode: 'dup', asset_id: this.selectedAsset[0].id}})
            } else if (this.selectedAsset[0].asset == "Voltage transformer") {
                this.$router.push({name: 'voltageTrans', query: {mode: 'dup', asset_id: this.selectedAsset[0].id}})
            } else if (this.selectedAsset[0].asset == "Disconnector") {
                this.$router.push({name: 'disconnector', query: {mode: 'dup', asset_id: this.selectedAsset[0].id}})
            } else if (this.selectedAsset[0].asset == "Surge arrester") {
                this.$router.push({name: 'surgeArrester', query: {mode: 'dup', asset_id: this.selectedAsset[0].id}})
            } else if (this.selectedAsset[0].asset == "Power cable") {
                this.$router.push({name: 'powerCable', query: {mode: 'dup', asset_id: this.selectedAsset[0].id}})
            }
        },
        onSelectionChanged() {
            const selectedAsset = this.gridApi.getSelectedRows()
            this.$store.dispatch('setSelectedAsset', selectedAsset)
        },
        onOpenAsset() {
            this.$router.push({name: 'asset', query: {mode: 'edit', asset_id: this.selectedAsset[0].id}})
        },
        onOpenFmeca() {
            this.$router.push({name: 'fmeca', query: {mode: 'edit'}})
        },
        onDeleteAsset() {
            const assetList = this.selectedAsset.map((asset) => {
                return {
                    id : asset.id,
                    asset : asset.asset
                }
            })
            const assetTranformer = assetList.filter(element => element.asset === 'Transformer').map(e => e.id)
            const assetCircuit = assetList.filter(element => element.asset === 'Circuit breaker').map(e => e.id)
            const assetCurrent = assetList.filter(element => element.asset === 'Current transformer').map(e => e.id)
            const assetVoltage = assetList.filter(element => element.asset === 'Voltage transformer').map(e => e.id)
            const assetDisconnect = assetList.filter(element => element.asset === 'Disconnector').map(e => e.id)
            const assetPoweCable = assetList.filter(element => element.asset === 'Power cable').map(e => e.id)
            const assetSurgeArrester = assetList.filter(element => element.asset === 'Surge arrester').map(e => e.id)
            this.$confirm('Do you want to delete this asset?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    await window.electronAPI.deleteAsset(assetTranformer)
                    await window.electronAPI.deleteCircuit(assetCircuit)
                    await window.electronAPI.deleteCurrentVoltage(assetCurrent)
                    await window.electronAPI.deleteVoltageTrans(assetVoltage)
                    await window.electronAPI.deleteDisconnector(assetDisconnect)
                    await window.electronAPI.deletePowerCable(assetPoweCable)
                    await window.electronAPI.deleteSurgeArrester(assetSurgeArrester)
                    this.$message({
                        type: 'success',
                        message: 'Delete completed'
                    })
                    this.$store.dispatch('setSelectedAsset', [])
                    this.$store.dispatch('setSelectedJob', [])
                    await this.getAssets(this.selectedLocation[0].id)
                    this.setSelectedNode()
                })
                .catch(() => {
                    return
                })
        },
        setSelectedNode() {
            const ids = this.selectedAsset.map((_) => _.id)
            this.gridApi.forEachNode(function (node) {
                node.setSelected(ids.includes(node.data.id))
            })
        },
        async importAssetCSV() {
            const rs = await window.electronAPI.importAssetCSV(this.selectedLocation[0].id)
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
        async exportAssetXLS() {
            if (this.selectedAsset.length === 0) {
                this.$message.error('Please choose asset.')
                return
            }

            const assets = this.selectedAsset
            const assetIds = assets.map(asset => asset.id)
            const listPromiseBushing = assetIds.map(id => window.electronAPI.getBushingsByAssetId(id))
            const listPromiseTapChanger = assetIds.map(id => window.electronAPI.getTapChangerByAssetId(id))

            const listResBushing = await Promise.all(listPromiseBushing)
            const listResTapChanger =  await Promise.all(listPromiseTapChanger)

            const bushings = listResBushing.map(res => res.data)
            const tapChangers = listResTapChanger.map(res=>res.data)
            
            const fullAssets = []
            for (let index = 0; index < assetIds.length; index++) {
                const asset = assets[index]
                const bushing = bushings[index]
                const tapChanger = tapChangers[index]

                fullAssets.push({
                    asset, bushing, tap_changer: tapChanger
                })
            }

            // const countAsset = data.length
            // for (let index = 0; index < countAsset; index++) {
            //     const asset = data[index]
            //     const assetId = asset.Id

            //     let rs = await window.electronAPI.getBushingsByAssetId(assetId)
            //     if (!rs.success) {
            //         this.$message.error(rs.message)
            //         return
            //     }
            //     const bushing = rs.data
            //     data.push({
            //         SerialNumber: String(bushing.serial_no),
            //         Feeder: '',
            //         Phase: '',
            //         Manufacturer: bushing.manufacturer,
            //         ManufacturingYear: bushing.manufacturer_year,
            //         ManufacturerType: bushing.manufacturer_type,
            //         ApparatusId: '',
            //         AssetSystemCode: '',
            //         RatedFrequency: '',
            //         Comment: '',
            //         CustomVectorGroup: '',
            //         NumberOfPhases: '',
            //         ImpedancesBasePower: '',
            //         ImpedancesBaseVoltage: '',
            //         ImpedancesReferenceTemperature: '',
            //         MaxShortCircuitCurrent: '',
            //         FluidWeight: '',
            //         FluidVolume: '',
            //         TotalWeight: '',
            //         Category: '',
            //         TankType: '',
            //         FluidType: '',
            //         InsulationLevelLL: bushing.insull_level,
            //         VoltageLGround: bushing.voltage_gr,
            //         Cap1: bushing.cap_c1,
            //         Cap2: bushing.cap_c2,
            //         CatalogNumber: '',
            //         DrawingNumber: '',
            //         StyleNumber: '',
            //         RatedVoltage: bushing.max_sys_voltage,
            //         RatedCurrent: bushing.rate_current,
            //         PF1: bushing.df_c1,
            //         PF2: bushing.df_c2,
            //         InsulationType: bushing.insulation_type,
            //         Winding: '',
            //         TapScheme: '',
            //         NoOfTaps: '',
            //         VoltageTable: '',
            //         Id: bushing.id,
            //         ParentId: assetId,
            //         AssetKind: 'Bushing',
            //         AssetType: bushing.asset_type,
            //         Location: this.selectedLocation[0].name,
            //         Position: ''
            //     })

            //     rs = await window.electronAPI.getTapChangerByAssetId(assetId)
            //     if (!rs.success) {
            //         this.$message.error(rs.message)
            //         return
            //     }
            //     const tapChanger = rs.data
            //     data.push({
            //         SerialNumber: tapChanger.serial_no,
            //         Feeder: '',
            //         Phase: '',
            //         Manufacturer: tapChanger.manufacturer,
            //         ManufacturingYear: '',
            //         ManufacturerType: tapChanger.manufacturer_type,
            //         ApparatusId: '',
            //         AssetSystemCode: '',
            //         RatedFrequency: '',
            //         Comment: '',
            //         CustomVectorGroup: '',
            //         NumberOfPhases: '',
            //         ImpedancesBasePower: '',
            //         ImpedancesBaseVoltage: '',
            //         ImpedancesReferenceTemperature: '',
            //         MaxShortCircuitCurrent: '',
            //         FluidWeight: '',
            //         FluidVolume: '',
            //         TotalWeight: '',
            //         Category: '',
            //         TankType: '',
            //         FluidType: '',
            //         InsulationLevelLL: '',
            //         VoltageLGround: '',
            //         Cap1: '',
            //         Cap2: '',
            //         CatalogNumber: '',
            //         DrawingNumber: '',
            //         StyleNumber: '',
            //         RatedVoltage: '',
            //         RatedCurrent: '',
            //         PF1: '',
            //         PF2: '',
            //         InsulationType: '',
            //         Winding: tapChanger.winding,
            //         TapScheme: tapChanger.tap_scheme,
            //         NoOfTaps: tapChanger.no_of_taps,
            //         VoltageTable: tapChanger.voltage_table,
            //         Id: tapChanger.id,
            //         ParentId: assetId,
            //         AssetKind: 'Tap changer',
            //         AssetType: tapChanger.mode,
            //         Location: this.selectedLocation[0].name,
            //         Position: ''
            //     })
            // }

            const rs = await window.electronAPI.export(fullAssets)
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
            this.$confirm('Upload assets. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    const listLocation = JSON.parse(JSON.stringify(this.selectedLocation))
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

                    const listPromise = this.selectedAsset.filter(item => item.asset == 'Transformer').map((asset) => {
                        const assetId = asset.id
                        return window.electronAPI.getAssetById(assetId)
                    })
                    const listResponse = await Promise.all(listPromise)
                    const listAsset = listResponse.map((res) => {
                        const data = res.data
                        const fullAsset = {
                            asset: data.asset,
                            bushing: data.bushings,
                            tapChanger: data.tap_changer
                        }
                        return fullAsset
                    })

                    for(let i in listLocation) {
                        if(listLocation[i].ref_id_old != null && listLocation[i].ref_id_old != '') {
                            listLocation[i].refId = JSON.parse(JSON.stringify(listLocation[i].ref_id_old))
                        }
                    }

                    await assetApi
                        .upload(listLocation, listAsset)
                        .then( async(res) => {
                            for (const location of listLocation) {
                                try {
                                    const data = await window.electronAPI.getAllAttachment(location.id, "location");
                                    if (!data?.data?.length) continue; // Kiểm tra nếu data rỗng, bỏ qua

                                    const response = await AttachmentApi.getNameAttachment(location.id);
                                    const oldAttachments = response ? response : []; // Đảm bảo response không bị null
                                    const newAttachments = JSON.parse(data.data[0].name || "[]"); // Chuyển đổi dữ liệu mới an toàn

                                    // Kiểm tra nếu danh sách file khác nhau
                                    if (JSON.stringify(oldAttachments) !== JSON.stringify(newAttachments)) {
                                        const confirm = await this.$confirm(
                                            `Change attachment files in locations ${location.name}. Continue?`,
                                            'Warning',
                                            {
                                                confirmButtonText: 'OK',
                                                cancelButtonText: 'Cancel',
                                                type: 'warning'
                                            }
                                        ).catch(() => false); // Nếu cancel thì return false

                                    if (!confirm) continue; // Nếu người dùng hủy, bỏ qua

                                    // Upload file đồng thời để tăng tốc
                                    const uploadPromises = newAttachments.flatMap(file => 
                                        FileUploadApi.upload(file.path)
                                    );

                                    await Promise.all(uploadPromises); // Chờ tất cả upload hoàn thành
                                    await AttachmentApi.upload(data.data); // Gửi danh sách file mới
                                }
                                } catch (error) {
                                    console.error("Lỗi khi xử lý location:", location.id, error);
                                }
                            }           
                        })
                        .catch((error) => {
                            this.$message.error(error.message)
                        })

                        let circuit = this.selectedAsset.filter(item => item.asset == "Circuit breaker")
                        if(circuit.length != 0) {
                            await circuitApi.save(circuit)
                        }

                        let current = this.selectedAsset.filter(item => item.asset == "Current transformer")
                        if(current.length != 0) {
                            await currentApi.save(current)
                        }

                        let voltage = this.selectedAsset.filter(item => item.asset == "Voltage transformer")
                        if(voltage.length != 0) {
                            await voltageApi.save(voltage)
                        }

                        let disconnector = this.selectedAsset.filter(item => item.asset == "Disconnector")
                        if(disconnector.length != 0) {
                            await disconnectorApi.save(disconnector)
                        }

                        let surge = this.selectedAsset.filter(item => item.asset == "Surge arrester")
                        if(surge.length != 0) {
                            await surgeApi.save(surge)
                        }

                        let power = this.selectedAsset.filter(item => item.asset == "Power cable")
                        if(power.length != 0) {
                            await powerApi.save(power)
                        }

                        this.$message.success('Successful')
                })
                .catch(() => {})
        },
        async refresh() {
            this.loading = true
            this.rowData = []
            this.$store.dispatch('setSelectedAsset', [])
            this.$store.dispatch('setSelectedJob', [])
            await this.$common.simulateLoading(1000)
            if (this.selectedLocation.length == 1) {
                await this.getAssets(this.selectedLocation[0].id)
            }
            this.loading = false
        },
        cellContextMenu(event) {
            this.chosenAsset = event.data
            if(this.chosenAsset.extend == null || this.chosenAsset.extend == "null") {
                this.chosenAsset.extend = []
            } else {
                this.chosenAsset.extend = JSON.parse(this.chosenAsset.extend)
            }
            this.classOption = 'show'
            this.$refs.option.style.left = `${event.event.clientX}px`
            this.$refs.option.style.top = `${event.event.clientY - 138}px`
        },
        async relocate() {
            let rs = await window.electronAPI.getLocations(this.user.user_id)
            this.listAllLocation = rs.data
            this.listLocation = this.listAllLocation.filter(x => x.mode == 'location')
            this.listVoltage = []
            this.listFeeder = []
            for(let i in this.listLocation) {
                let tempFeeder = []
                let tempVoltage = this.listAllLocation.filter(x => x.mode == 'voltage' && x.refId == this.listLocation[i].id)
                this.listVoltage.push(tempVoltage)

                for(let j in tempVoltage) {
                    let tempVolFeeder = this.listAllLocation.filter(x => x.mode == 'feeder' && x.refId == tempVoltage[j].id)
                    tempFeeder.push(tempVolFeeder)
                }
                this.listFeeder.push(tempFeeder)
            }
            this.openRelocateSetting = !this.openRelocateSetting
            this.classOption = 'hide'
        },
        changeLocation(location) {
            this.chosenAsset.location_id = location
        },
        hideOption() {
            this.classOption = 'hide'
        },
        async confirmRelocate() {
            let rs = ''
            let extend = {
                operational : this.operational,
                relocateBy : this.relocateBy,
                relocateOn : this.relocateOn,
                comment : this.comment,
                locationSource : this.selectedLocation[0].name,
                locationDest : this.location.name
            }

            this.chosenAsset.extend.push(extend)
            if(this.location != '') {
                if(this.chosenAsset.asset == 'Transformer') {
                    rs = await window.electronAPI.relocateAsset(this.chosenAsset)
                } else if(this.chosenAsset.asset == 'Circuit breaker') {
                    rs = await window.electronAPI.relocateCircuit(this.chosenAsset)
                } else if(this.chosenAsset.asset == 'Current transformer') {
                    rs = await window.electronAPI.relocateCurrent(this.chosenAsset)
                } else if(this.chosenAsset.asset == 'Voltage transformer') {
                    rs = await window.electronAPI.relocateVoltage(this.chosenAsset)
                } else if(this.chosenAsset.asset == 'Disconnector') {
                    rs = await window.electronAPI.relocateDisconnector(this.chosenAsset)
                } else if(this.chosenAsset.asset == 'Power cable') {
                    rs = await window.electronAPI.relocatePowerCable(this.chosenAsset)
                } else if(this.chosenAsset.asset == 'Surge arrester') {
                    rs = await window.electronAPI.relocateSurgeArrester(this.chosenAsset)
                }
            }
            if(rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Relocate successful'
                })
            }

            this.location = ''
            this.openRelocateSetting = false
            this.classOption = "hide"
            this.refresh()
        },
        cancelRelocate() {
            this.chosenAsset.extend = JSON.stringify(this.chosenAsset.extend)
            this.openRelocateSetting = false
        },
        choosenLocation(item, label, index, indexV, indexF) {
            this.location = item
            this.chosenAsset.location_id = item.id
            for(let i in this.listLocation) {
                this.$refs['location' + i][0].style.backgroundColor = 'rgba(0, 0, 0, 0)'
                this.$refs['location' + i][0].style.color = 'black'
            }
            for(let i in this.listVoltage) {
                    for(let j in this.listVoltage[i]) {
                        this.$refs['voltage' + i + j][0].style.backgroundColor = 'rgba(0, 0, 0, 0)'
                        this.$refs['voltage' + i + j][0].style.color = 'black'
                    }
            }
            for(let i in this.listFeeder) {
                for(let j in this.listFeeder[i]) {
                    for(let k in this.listFeeder[i][j]) {
                        this.$refs['feeder' + i + j + k][0].style.backgroundColor = 'rgba(0, 0, 0, 0)'
                        this.$refs['feeder' + i + j + k][0].style.color = 'black' 
                    }
                }
            }
            if(label == 'location') {
                this.$refs[label + index][0].style.backgroundColor = '#012596'
                this.$refs[label + index][0].style.color = 'white'
            } else if (label == 'voltage') {
                this.$refs[label + index + indexV][0].style.backgroundColor = '#012596'
                this.$refs[label + index + indexV][0].style.color = 'white'
            } else if (label == 'feeder') {
                this.$refs[label + index + indexV + indexF][0].style.backgroundColor = '#012596'
                this.$refs[label + index + indexV + indexF][0].style.color = 'white'
            }
        },
        openHistory() {
            this.historyShow = true
        },
        closeHistory() {
            this.historyShow = false
        },
    }
}
</script>

<style lang="scss" scoped>
.location {
    height: 100%;

    .top-table {
        height: 50px;
        line-height: 30px;
        background-color: #d5d8dc;
        margin-bottom: 5px;
        padding: 10px;
        box-sizing: border-box;
        .el-button {
            border: none;
            background: inherit;
            border-radius: 0;
            margin: 0;
            padding: 0;
        }
    }

    .content-table {
        height: calc(100% - 55px);
        background-color: #eaecee;
        padding: 10px;
        box-sizing: border-box;

        .content-table-top {
            height: 30px;
            line-height: 30px;

            .el-button {
                border: none;
                background: inherit;
                border-radius: 0;
                margin: 0;
                padding: 0;
            }
        }

        .content-table-main {
            height: calc(100% - 30px);
        }
    }
}

#right-click-menu {
    background: #fafafa;
    border: 1px solid #bdbdbd;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    width: 250px;
    z-index: 999999;
}

#right-click-menu li {
    border-bottom: 1px solid #e0e0e0;
    margin: 0;
    padding: 5px 35px;
}

#right-click-menu li:last-child {
    border-bottom: none;
}

#right-click-menu li:hover {
    background: #1e88e5;
    color: #fafafa;
    cursor: pointer;
}

.childOption {
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 10px;
    padding-right: 10px;
    border: 0.001px solid rgb(221, 215, 215);
}
.childOption:hover {
    cursor: pointer;
    background-color: #dee8f1;
}
.spaceIcon {
    padding-right: 8px;
}

.show {
  z-index: 1000;
  position: absolute;
  background-color: white;
  border: 0.5px solid rgb(187, 180, 180);
  display: block;
}

.hide {
  display: none;
}

.showList {
    display: flex;
}

.title {
    background-color: silver; 
    width: 100%; font-size: 30px; 
    text-align: center; 
    padding-top: 10px; 
    padding-bottom: 10px;
}

.hoverMouse:hover {
    background-color: rgb(156, 153, 153) !important;
}
.hoverMouse {
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 10px;
}

</style>
