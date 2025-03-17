<template>
    <div @click="hideOption()" class="location">
        <div class="top-table">
            <el-button :disabled="loading">
                <i class="fa-solid fa-rotate-right mgr-10" :class="{'fa-spin': loading}" @click="refresh()"></i>
            </el-button>
            <span class="bolder">Location</span>
            <el-input class="float-right" style="width: 50%" size="mini" v-model="search"></el-input>
        </div>
        <div class="content-table">
            <div class="content-table-top">
                <el-button @click="$router.push({name: 'locationInsert', query: {mode: 'add', disable:true}})">
                    <i class="fa-solid fa-plus mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedLocation.length !== 1" @click="onOpenLocation">
                    <i class="fa-solid fa-folder-open mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedLocation.length === 0" @click="onDeleteLocation">
                    <i class="fa-solid fa-x mgr-20 pointer"></i>
                </el-button>
                <el-button @click="importLocationCSV">
                    <i class="fa-solid fa-file-import mgr-20 pointer"></i>
                </el-button>
                <!-- <el-dropdown @command="handleImport" size="mini" trigger="click" :disabled="selectedLocation.length !== 1">
                    <el-button :disabled="selectedLocation.length !== 1">
                        <i class="fa-solid fa-file-import mgr-20 pointer"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="at-template">AT Template</el-dropdown-item>
                        <el-dropdown-item command="havec-template">Havec Template</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown> -->
                
                <el-button :disabled="selectedLocation.length === 0" @click="exportLocationCSV">
                    <i class="fa-solid fa-file-export mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedLocation.length === 0" @click="onDupLocation">
                    <i class="fa-solid fas fa-clone mgr-20 pointer"></i>
                </el-button>
                <el-button :disabled="selectedLocation.length == 0" @click="upload">
                    <i class="fa-solid fas fa-upload pointer"></i>
                </el-button>
                <span style="float: right">{{ selectedLocation.length }} of {{ rowData.length }}</span>
            </div>
            <div class="content-table-main">
                <ag-grid-vue
                    style="height: 100%;"
                    class="ag-theme-alpine"
                    @grid-ready="onGridReady"
                    @rowDoubleClicked="onRowDoubleClick"
                    :columnDefs="columnDefs"
                    :rowData="rowdata_data"
                    rowSelection="multiple"
                    @selection-changed="onSelectionChanged"
                    @cellContextMenu="cellContextMenu"
                    :doesExternalFilterPass="doesExternalFilterPass"
                    :isExternalFilterPresent="isExternalFilterPresent"
                    :enableColResize="true"
                    :enableColumnResize="true"
                    :animateRows="true"
                    >
                </ag-grid-vue>
            </div>
            <div ref="option" :class="classOption">
                <div v-if="dataGetRight.mode != undefined">
                    <div v-if="dataGetRight.mode == 'location'" @click="addVoltageLevel()" class="childOption"> <i class="fa-solid fa-plus spaceIcon"></i>Add voltage level</div>
                    <div v-else-if="dataGetRight.mode.includes('owner')" @click="addlocation()" class="childOption"> <i class="fa-solid fa-plus spaceIcon"></i>Add location</div>
                    <div v-else @click="addFeederLevel()" class="childOption"> <i class="fa-solid fa-plus spaceIcon"></i>Add feeder</div>
                    <div v-if="['location', 'voltage', 'feeder'].includes(dataGetRight.mode)" @click="deleteLocation()" class="childOption"> <i class="fa-solid fa-trash spaceIcon"></i>Delete Location</div>
                    <div v-else-if="dataGetRight.mode.includes('owner')" @click="deleteOwner()" class="childOption"> <i class="fa-solid fa-trash spaceIcon"></i>Delete owner</div>
                    <div v-if="['location', 'voltage', 'feeder'].includes(dataGetRight.mode)" @click="editLocation()" class="childOption"> <i class="fa-solid fa-pen-to-square spaceIcon"></i>Edit location</div>
                    <div v-else-if="dataGetRight.mode.includes('owner')" @click="editowner()" class="childOption"> <i class="fa-solid fa-pen-to-square spaceIcon"></i>Edit owner</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import {AgGridVue} from 'ag-grid-vue'
import {mapState} from 'vuex'
import * as locationApi from '@/api/location'
import * as FileUploadApi from '@/api/fileUpload'
import * as AttachmentApi from '@/api/attachment'
import loader from "@/utils/preload"
import medalCellRenderer from './medalCellRenderer.vue';
import headerCustomize from "./headerCustomize.vue";

export default {
    name: 'LocationComponent',
    components: {
        AgGridVue,
        medalCellRenderer,
        headerCustomize
    },
    props : {
        reload : Boolean
    },
    computed: {
        ...mapState(['user', 'selectedLocation']),
        reloadData() {
            return this.reload
        }
    },
    data() {
        return {
            coor : {
                x : "",
                y : ""
            },
            columnDefs: [
                {field: 'id', hide: true, filter: true,},
                {
                    field: 'name',
                    headerName: "Location",
                    sortable: true,
                    resizable: true,
                    headerCheckboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true,
                    cellRenderer: 'medalCellRenderer',
                    cellRendererParams: {
                        clicked: function(x, y) {
                            this.context.coor.x = x
                            this.context.coor.y = y
                        },
                        onclick : function(id, sign, mode, signCheck) {
                            if(sign == 'out') {
                                this.context.rowdata_data.filter(x => x.id == id)[0].show = "true"
                                this.context.rowdata_data.filter(x => x.refId == id || x.ref_id == id).map((x) => {x.show = 'true'; return x}) 
                            } else {
                                if(signCheck != 5) {
                                    let i = JSON.parse(JSON.stringify(signCheck))
                                    let downL = this.context.rowdata_data.filter(x => x.refId == id || x.ref_id == id)
                                    while(i < 5 && downL.length >0 ) {
                                        var dataDown = []
                                        for(let j in downL) {
                                            downL[j].show = "false"
                                            var temp = this.context.rowdata_data.filter(x => x.refId == downL[j].id || x.ref_id == downL[j].id)
                                            dataDown = dataDown.concat(temp)
                                        }
                                        downL = dataDown
                                        i = i +1
                                    }
                                }
                            }
                            this.context.gridApi.onFilterChanged();
                        },
                        context : this
                    },
                    headerComponent: 'headerCustomize',
                    headerComponentParams : {
                        onclick : function(sign) {
                            if(sign == '') {
                                this.context.rowdata_data = JSON.parse(JSON.stringify(this.context.tempSort))
                            } else if(sign == 'desc') {
                                let resultCustom = []
                                let locationData = this.context.rowdata_data.filter(x => x.mode == 'location')
                                locationData = locationData.sort((a,b) => { if(a.name < b.name) { return -1 } })
                                for(let i in locationData) {
                                    let dataTemp = []
                                    resultCustom.push(locationData[i])
                                    let temp = this.context.rowdata_data.filter(x => x.refId == locationData[i].id)
                                    temp = temp.sort((a,b) => { if(a.name < b.name) { return -1 } })
                                    for(let j in temp) {
                                        dataTemp.push(temp[j])
                                        let feeder = this.context.rowdata_data.filter(x => x.refId == temp[j].id)
                                        feeder = feeder.sort((a,b) => { if(a.name < b.name) { return -1 } })
                                        dataTemp = dataTemp.concat(feeder)
                                    }
                                    resultCustom = resultCustom.concat(dataTemp)
                                }
                                this.context.rowdata_data = resultCustom
                            } else {
                                let resultCustom = []
                                let locationData = this.context.rowdata_data.filter(x => x.mode == 'location')
                                locationData = locationData.sort((a,b) => { if(a.name > b.name) { return -1 } })
                                for(let i in locationData) {
                                    let dataTemp = []
                                    resultCustom.push(locationData[i])
                                    let temp = this.context.rowdata_data.filter(x => x.refId == locationData[i].id)
                                    temp = temp.sort((a,b) => { if(a.name > b.name) { return -1 } })
                                    for(let j in temp) {
                                        dataTemp.push(temp[j])
                                        let feeder = this.context.rowdata_data.filter(x => x.refId == temp[j].id)
                                        feeder = feeder.sort((a,b) => { if(a.name > b.name) { return -1 } })
                                        dataTemp = dataTemp.concat(feeder)
                                    }
                                    resultCustom = resultCustom.concat(dataTemp)
                                }
                                this.context.rowdata_data = resultCustom
                            }
                        },
                        context : this
                    }
                },
                {field: 'address', headerName: 'Address', resizable: true},
                {field: 'city', headerName: 'City'},
                {field: 'postal_code', headerName: 'Postal Code'},
                {field: 'state_province', headerName: 'State/Province'},
                {field: 'country', headerName: 'Country'},
                {field: 'company_company', headerName: 'Company'},
                {field: 'region', headerName: 'Region'},
                {field: 'division', headerName: 'Division'}
            ],
            rowData: [],
            search: '',
            loading: false,
            rowdata_data: [],
            classOption : "hide",
            dataGetRight : '',
            showVoltage : '',
            tempSort : []
        }
    },
    async beforeMount() {
        await this.getLocations()  
    },
    mounted() {
        this.rowdata_data = this.rowData
    },
    watch: {
        rowData() {
            this.rowdata_data = this.rowData
        },
        async search() {
            if (this.search === '') {
                this.rowdata_data = this.rowData
            } else {
                this.rowdata_data = []
                this.rowData.forEach((element) => {
                    if(element.name.toLowerCase().includes(this.search.toLowerCase())) {
                        this.rowdata_data.push(element)
                    }     
                })
            }
        },
        reloadData() {
            if(this.reloadData == true) {
                this.refresh()
                this.$emit("cancelReload", false)
            }
        },
        coor : {
            deep : true,
            immediate : true,
            handler() {
                if(this.coor.x != '' || this.coor.y != '') {
                    this.classOption = 'show'
                    this.$refs.option.style.left = `${this.coor.x}px`
                    this.$refs.option.style.top = `${this.coor.y - 138}px`
                }
            }
        },
        showVoltage() {
            this.gridApi.onFilterChanged();
        },

    },
    methods: {
        async getLocations() {
            // TODO user_id
            const rs = await window.electronAPI.getLocations(this.user.user_id)
            const rt = await window.electronAPI.getOwnerByUserId(this.user.user_id)
            const root = await window.electronAPI.getOwnerByName('root')
            var parentId = root.data[0].id

            if(rt.success && rs.success) {
                let resultCustom = []
                let resultOwner = rt.data
                let resultLocation = rs.data
                let ownerData = resultOwner.filter(x => x.ref_id == parentId)
                let locationData = resultLocation.filter(x => x.refId == parentId)
                let result = ownerData.concat(locationData)
                result.forEach((e) => e.signCheck = 1)
                for(let i in result) {
                    resultCustom.push(result[i])
                    let ownerData1 = resultOwner.filter(x => x.ref_id == result[i].id)
                    let locationData1 = resultLocation.filter(x => x.refId == result[i].id)
                    let result1 = ownerData1.concat(locationData1)
                    result1.forEach((e) => e.signCheck = 2)
                    for(let j in result1) {
                        resultCustom.push(result1[j])
                        let ownerData2 = resultOwner.filter(x => x.ref_id == result1[j].id)
                        let locationData2 = resultLocation.filter(x => x.refId == result1[j].id)
                        let result2 = ownerData2.concat(locationData2)
                        result2.forEach((e) => e.signCheck = 3)
                        for(let k in result2) {
                            resultCustom.push(result2[k])
                            let ownerData3 = resultOwner.filter(x => x.ref_id == result2[k].id)
                            let locationData3 = resultLocation.filter(x => x.refId == result2[k].id)
                            let result3 = ownerData3.concat(locationData3)
                            result3.forEach((e) => e.signCheck = 4)
                            for(let h in result3) {
                                resultCustom.push(result3[h])
                                let ownerData4 = resultOwner.filter(x => x.ref_id == result3[h].id)
                                let locationData4 = resultLocation.filter(x => x.refId == result3[h].id)
                                let result4 = ownerData4.concat(locationData4)
                                result4.forEach((e) => e.signCheck = 5)
                                for(let n in result4) {
                                    resultCustom.push(result4[n])
                                    let ownerData5 = resultOwner.filter(x => x.ref_id == result4[n].id)
                                    let locationData5 = resultLocation.filter(x => x.refId == result4[n].id)
                                    let result5 = ownerData5.concat(locationData5)
                                    result5.forEach((e) => e.signCheck = 6)
                                }
                            }
                        }
                    }
                }

                this.rowData = resultCustom
                this.tempSort = resultCustom
            }
        },
        onGridReady(params) {
            this.gridApi = params.api
            this.gridColumnApi = params.columnApi
            
            this.setSelectedNode()
        },
        onRowDoubleClick(event) {
            const data = event.data
            const location_id = data.id
            if(['location','voltage', 'feeder'].includes(data.mode)) {
                this.$router.push({name: 'location', query: {mode: 'edit', location_id: location_id}})
            } else {
                this.$router.push({name: 'owner', query: {modeSave: 'editSave', owner_id: data.id, signCheck: data.signCheck}})
            }
        },
        onSelectionChanged() {
            const selectedLocation = this.gridApi.getSelectedRows()
            this.$store.dispatch('setSelectedLocation', selectedLocation)
        },
        onOpenLocation() {
            this.$router.push({name: 'location', query: {mode: 'edit', location_id: this.selectedLocation[0].id}})
        },
        onDupLocation() {
            this.$router.push({name: 'location', query: {mode: 'dup', location_id: this.selectedLocation[0].id}})
        },
        async onDeleteLocation() {
            let listLocationDelete = []
            let ownerListDelete = []

            for(let i in this.selectedLocation) {
                if(this.selectedLocation[i].mode == "location") {
                    listLocationDelete.push(this.selectedLocation[i].id)
                    let listTempVol = this.rowData.filter(x => x.refId == this.selectedLocation[i].id)
                    for(let j in listTempVol) {
                        listLocationDelete.push(listTempVol[j].id)
                    }
                    for(let j in listTempVol) {
                        let listTempFeeder = this.rowData.filter(x => x.refId == listTempVol[j].id)
                        for(let index in listTempFeeder) {
                            listLocationDelete.push(listTempFeeder[index].id)
                        }
                    }
                } else if (this.selectedLocation[i].mode == "voltage") {
                    listLocationDelete.push(this.selectedLocation[i].id)
                    let listTempFeeder = this.rowData.filter(x => x.refId == this.selectedLocation[i].id)
                    for(let j in listTempFeeder) {
                        listLocationDelete.push(listTempFeeder[j].id)
                    }
                } else if (this.selectedLocation[i].mode == "feeder") {
                    listLocationDelete.push(this.selectedLocation[i].id)
                } else if (this.selectedLocation[i].mode.includes("owner")) {
                    let ownerList = []
                    let listLocation = []
                    let rt = this.rowData.filter(x => x.ref_id == this.selectedLocation[i].id)
                    ownerList = ownerList.concat(rt)
                    let ownerListCheck = ownerList

                    while(true) {
                        let listOwnerTemp = []
                        for(let i in ownerListCheck) {
                            let rs = this.rowData.filter(x => x.ref_id == ownerListCheck[i].id)
                            listOwnerTemp = listOwnerTemp.concat(rs)
                            
                        }
                        if(listOwnerTemp.length == 0) {
                            break
                        } else {
                            ownerList = ownerList.concat(listOwnerTemp)
                            ownerListCheck = listOwnerTemp
                        }
                    }
                    ownerList.push(this.selectedLocation[i])
                    
                    for(let i in ownerList) {
                        let rs = this.rowData.filter(x => x.refId == ownerList[i].id)
                        listLocation = listLocation.concat(rs)
                    }

                    let listLocationCheck = listLocation

                    while(true) {
                        let listLocationTemp = []
                        for(let i in listLocationCheck) {
                            let rs = this.rowData.filter(x => x.refId == listLocationCheck[i].id)
                            listLocationTemp = listLocationTemp.concat(rs)
                        }

                        if(listLocationTemp.length == 0) {
                            break
                        } else {
                            listLocation = listLocation.concat(listLocationTemp)
                            listLocationCheck = listLocationTemp
                        }
                    }

                    ownerListDelete = ownerListDelete.concat(ownerList.map(x => x.id))
                    listLocationDelete = listLocationDelete.concat(listLocation.map(x => x.id))
                }
            }

            console.log(ownerListDelete)
            this.$confirm('Do you want to delete this location?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    loader.loaderStart()
                    const rs = await window.electronAPI.deleteLocation(listLocationDelete)
                    const rt = await window.electronAPI.deleteOwner(ownerListDelete)
                    loader.loaderEnd()
                    if(rs.success === true && rt.success) {
                        this.$message({
                            type: 'success',
                            message: 'Delete completed'
                        })
                        this.$store.dispatch('setSelectedLocation', [])
                        this.$store.dispatch('setSelectedAsset', [])
                        this.$store.dispatch('setSelectedJob', [])
                        await this.getLocations()
                    }
                    else {
                        this.$message({
                            type: 'error',
                            message: 'Delete cannot completed'
                        })
                    }
                })
                .catch(() => {
                    return
                })
        },
        async exportLocationCSV() {
            if (this.selectedLocation.length === 0) {
                this.$message.error('Please choose location.')
                return
            }
            let locations = JSON.parse(JSON.stringify(this.selectedLocation))
            if(locations[0].mode == "voltage") {
                let locationData = this.rowData.filter(item => item.id == locations[0].refId)
                locations = locations.concat(locationData)
            } else if (locations[0].mode == "feeder") {
                let voltage = this.rowData.filter(item => item.id == locations[0].refId)
                let locationData = this.rowData.filter(item => item.id == voltage[0].refId)
                locations = locations.concat(voltage)
                locations = locations.concat(locationData)
            }

            const rs = await window.electronAPI.export(locations)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Export completed'
                })
            } else {
                this.$message.error(rs.message)
            }
        },
        async importLocationCSV() {
            const rs = await window.electronAPI.importLocationCSV(this.user.user_id)
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
        setSelectedNode() {
            const ids = this.selectedLocation.map((_) => _.id)
            this.gridApi.forEachNode(function (node) {
                node.setSelected(ids.includes(node.data.id))
            })
        },
        async upload() {
            this.$confirm('Upload locations. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(() => {
                    let id = []
                    loader.loaderStart()
                    let listLocation = this.selectedLocation
                    let locationLists = listLocation.filter(item => item.mode == "location")
                    let volgateLists = listLocation.filter(item => item.mode == "voltage")
                    let feederLists = listLocation.filter(item => item.mode == "feeder")

                    for(let i in volgateLists) {
                        let temp = this.rowData.filter(item => item.id == volgateLists[i].refId)
                        locationLists = locationLists.concat(temp)
                        locationLists = locationLists.concat(volgateLists[i])
                    }

                    for(let i in feederLists) {
                        let tempVoltage = this.rowData.filter(item => item.id == feederLists[i].refId)
                        if(tempVoltage.length > 0) {
                            let tempLocation = this.rowData.filter(item => item.id == tempVoltage[0].refId)
                            locationLists = locationLists.concat(tempVoltage)
                            locationLists = locationLists.concat(tempLocation)
                            locationLists = locationLists.concat(feederLists[i])
                        } else {
                            locationLists = locationLists.concat(feederLists[i])
                        }
                    }

                    listLocation = locationLists
                    
                    listLocation.forEach(element => {
                        id.push(element.id)
                    })

                    for(let i in listLocation) {
                        if(listLocation[i].ref_id_old != null && listLocation[i].ref_id_old != '') {
                            listLocation[i].refId = JSON.parse(JSON.stringify(listLocation[i].ref_id_old))
                        }
                    }
                    locationApi
                        .upload(listLocation)
                        .then(async () => {
                            for(let index in listLocation) {
                                const data = await window.electronAPI.getAllAttachment(listLocation[index].id, "location")
                                if(data.data.length > 0) {
                                    AttachmentApi.getNameAttachment(listLocation[index].id).then(async(response) => {
                                        if(response != null) {
                                            if(JSON.stringify(response) != JSON.stringify(data.data[0].name)) {
                                                this.$confirm('Change attachment files in locations ' + listLocation[index].name + ' . Continue?', 'Warning', {
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
                            }                            
                            loader.loaderEnd()
                            this.$message.success('Successful')
                        })
                        .catch((error) => {
                            loader.loaderEnd()
                            console.log(error)
                            this.$message.error(error.message)
                        })
                })
                .catch((err) => {this.$message.error(err.message)})
        },
        async refresh() {
            this.loading = true
            this.rowData = []
            this.$store.dispatch('setSelectedLocation', [])
            this.$store.dispatch('setSelectedAsset', [])
            this.$store.dispatch('setSelectedJob', [])
            await this.$common.simulateLoading(1000)
            await this.getLocations()
            this.loading = false
        }, 
        handleImport() {
        },
        hideOption() {
            this.classOption = 'hide'
        },
        addVoltageLevel() {
            this.$router.push({name: 'location', query: {mode: 'voltageAdd', dataLocation : this.dataGetRight}})
        },
        addFeederLevel() {
            this.$router.push({name: 'location', query: {mode: 'feederAdd', dataLocation : this.dataGetRight}})
        },
        deleteLocation() {
            let listLocationDelete = []
            if(this.dataGetRight.mode == "location") {
                listLocationDelete.push(this.dataGetRight.id)
                let listTempVol = this.rowData.filter(x => x.refId == this.dataGetRight.id)
                for(let j in listTempVol) {
                    listLocationDelete.push(listTempVol[j].id)
                }
                for(let j in listTempVol) {
                    let listTempFeeder = this.rowData.filter(x => x.refId == listTempVol[j].id)
                    for(let index in listTempFeeder) {
                        listLocationDelete.push(listTempFeeder[index].id)
                    }
                }
            } else if (this.dataGetRight.mode == "voltage") {
                listLocationDelete.push(this.dataGetRight.id)
                let listTempFeeder = this.rowData.filter(x => x.refId == this.dataGetRight.id)
                for(let j in listTempFeeder) {
                    listLocationDelete.push(listTempFeeder[j].id)
                }
            } else if (this.dataGetRight.mode == "feeder") {
                listLocationDelete.push(this.dataGetRight.id)
            }
            this.$confirm('Do you want to delete this location?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    loader.loaderStart()
                    const rs = await window.electronAPI.deleteLocation(listLocationDelete)
                    loader.loaderEnd()
                    if(rs.success === true) {
                        this.$message({
                            type: 'success',
                            message: 'Delete completed'
                        })
                        this.$store.dispatch('setSelectedLocation', [])
                        this.$store.dispatch('setSelectedAsset', [])
                        this.$store.dispatch('setSelectedJob', [])
                        await this.getLocations()
                    }
                    else {
                        this.$message({
                            type: 'error',
                            message: 'Delete cannot completed'
                        })
                    }
                })
                .catch(() => {
                    return
                })
        },
        editLocation() {
            this.$router.push({name: 'location', query: {mode: 'edit', location_id: this.dataGetRight.id}})
        },
        cellContextMenu(event) {
            const data = event.data
            this.dataGetRight = data
        },
        doesExternalFilterPass(node) {
            if (node.data) {
                if(node.data.signCheck == 1) {
                    return true
                } else {
                    if(node.data.signCheck == 2) {
                        if(node.data.show == "true") {
                            return true
                        } else {
                            return false
                        }
                    } else {
                        if(node.data.signCheck == '3') {
                            if(node.data.show == "true") {
                                return true
                            } else {
                                return false
                            }
                        } else {
                            if(node.data.signCheck == '4') {
                                if(node.data.show == "true") {
                                    return true
                                } else {
                                    return false
                                }
                            } else {
                                if(node.data.signCheck == '5') {
                                    if(node.data.show == "true") {
                                        return true
                                    } else {
                                        return false
                                    }
                                } else {
                                    return false
                                } 
                            }
                        }
                    }
                }
            }
            return true;
        },
        isExternalFilterPresent() {
            return true
        },
        addOwner() {
            this.$router.push({name: 'owner', query: {modeSave: 'editInsert', ownerData : this.dataGetRight}})
        },
        addlocation() {
            this.$router.push({name: 'location', query: {mode: this.$constant.ADD, dataLocation : this.dataGetRight}})
        },
        editowner() {
            this.$router.push({name: 'owner', query: {modeSave: 'editSave', owner_id: this.dataGetRight.id, signCheck : this.dataGetRight.signCheck}})
        },
        deleteOwner() {
            let listOwnerData = []
            let locationData = []
            listOwnerData.push(this.dataGetRight)
            let tempOwner = []
            tempOwner.push(this.dataGetRight)
            let tempLocation = []

            while(tempOwner.length != 0) {
                let temp = []
                for(let i in tempOwner) {
                    let dataOwner = this.rowData.filter(x => x.ref_id == tempOwner[i].id)
                    temp = temp.concat(dataOwner)
                }
                tempOwner = temp
                listOwnerData = listOwnerData.concat(temp)
            }

            tempLocation = JSON.parse(JSON.stringify(listOwnerData))

            while(tempLocation.length != 0) {
                let temp = []
                for(let i in tempLocation) {
                    let dataLocation = this.rowData.filter(x => x.refId == tempLocation[i].id)
                    temp = temp.concat(dataLocation)
                }
                tempLocation = temp
                locationData = locationData.concat(temp)
            }
            
            this.$confirm('Do you want to delete this location?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(async () => {
                loader.loaderStart()
                locationData = locationData.map(x => x.id)
                listOwnerData = listOwnerData.map(x => x.id)
                const rs = await window.electronAPI.deleteLocation(locationData)
                const rt = await window.electronAPI.deleteOwner(listOwnerData)
                loader.loaderEnd()
                if(rs.success === true) {
                    this.$message({
                        type: 'success',
                        message: 'Delete completed'
                    })
                    this.$store.dispatch('setSelectedLocation', [])
                    this.$store.dispatch('setSelectedAsset', [])
                    this.$store.dispatch('setSelectedJob', [])
                    await this.getLocations()
                }
                else {
                    this.$message({
                        type: 'error',
                        message: 'Delete cannot completed'
                    })
                }
            }).catch(() => {
                return
            })
            
        }
    },
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

</style>