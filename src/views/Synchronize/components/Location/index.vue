<template>
    <div class="location">
        <div class="top-table" style="display: flex;">
            <div style="display: flex;">
                <el-button :disabled="loading">
                    <i class="fa-solid fa-rotate-right mgr-10" :class="{'fa-spin': loading}" @click="getOwnerLocation()"></i>
                </el-button>
                <span class="bolder">Location</span>
            </div>
            <div style="width: 100%;">
                <div style="float: right; margin-left: 10px;">
                    <button>Search</button>
                </div>
                <div style="float: right; width: 50%;">
                    <el-input style="width: 100%; float: right;" size="mini" v-model="search"></el-input>
                </div>
            </div>
        </div>
        <div class="content-table">
            <div class="content-table-top">
                <el-button title="Download" plain class="btn mgr-15" :disabled="selectedLocation.length == 0" @click="download">
                    <i class="fa-solid fa-download pointer"></i>
                </el-button>
                <el-button title="Lock" plain class="btn mgr-15" :disabled="selectedLocation.length == 0" @click="lock(true)">
                    <i class="fa-solid fa-lock pointer"></i>
                </el-button>
                <el-button title="Unlock" plain class="btn mgr-15" :disabled="selectedLocation.length == 0" @click="lock(false)">
                    <i class="fa-solid fa-unlock pointer"></i>
                </el-button>
                <el-button title="Delete" plain class="btn mgr-15" :disabled="selectedLocation.length == 0 || selectedLocation[0].mode.includes('OWNER')" @click="deleteMultiple">
                    <i class="fa-solid fa-xmark pointer"></i>
                </el-button>
                <el-button v-if="historyLocationSyncPage.length != 1" title="Back" plain class="btn mgr-15" @click="backPageOwner">
                    <i class="fa-solid fa-arrow-left-long"></i>
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
                    :animateRows="true"
                    @row-double-clicked="rowDbClick"
                    @selection-changed="onSelectionChanged"
                    :getRowStyle="getRowStyle"
                    @rowClicked="onRowClicked">
                </ag-grid-vue>
                <page-align
                    ref="LocationSyncPageAlign" 
                    :page-user="this.pageLocationSync" 
                    :display-page-user="this.displayPageLocationSync" 
                    :page-user-instance="this.pageLocationSyncInstance" 
                    :current-page="this.currentLocationSync" 
                    title="LocationSync"
                    :option.sync="this.optionLocationSync"
                    @update-page="updateLocationSyncPage">
                >
                </page-align>
            </div>
        </div>
        <collab v-if="openDialog" :resource="'location'" :id="selectedLocation.length == 1 ? selectedLocation[0].id : ''" @onCloseDialog="openDialog = false">
        </collab>
    </div>
</template>

<script>
/* eslint-disable */
import CellRender from '../CellRender'
import headerRenderer from '../CellRender/headerRenderer.vue'
import capitalizeRenderer from '../CellRender/capitalizeRenderer.vue'
import Collab from '../Collab'
import {AgGridVue} from 'ag-grid-vue'
import * as locationApi from '@/api/location'
import * as ownerAPI from '@/api/owner/owner.js'
import pageAlign from '@/views/PageAlign/pageAlign.vue'
import {mapState} from 'vuex'
import * as attachmentApi from '@/api/attachment'
import * as fileUploadApi from '@/api/fileUpload'
import medalCellRenderer from '../../../ManageView/components/Location/medalCellRenderer.vue';
import headerCustomize from "../../../ManageView/components/Location/headerCustomize.vue";

export default {
    name: 'LocationComponent',
    components: {
        AgGridVue,
        CellRender,
        Collab,
        medalCellRenderer,
        headerCustomize,
        pageAlign,
        headerRenderer,
        capitalizeRenderer
    },
    computed: {
        ...mapState(['selectedLocationSync', 'selectedAssetSync', 'user'])
    },
    data() {
        return {
            columnDefs: [
                {field: 'id', hide: true},
                {
                    field: 'name',
                    headerName: 'Name',
                    width: 300,
                    headerCheckboxSelectionFilteredOnly: true,
                    resizable: true,
                    cellRenderer: 'headerRenderer',
                    cellStyle: params => ({
                        paddingLeft: `${params.data.level * 20 + 10}px`
                    })
                    // cellRenderer: 'medalCellRenderer',
                    // tooltipField: 'mode',
                    // cellRendererParams: {
                    //     onclick : function(id, sign, mode) {
                    //         if(mode == 'location') {
                    //             if(sign == 'out') {
                    //                 this.context.rowData.filter(x => x.id == id)[0].show = "true"
                    //                 this.context.rowData.filter(x => x.mode =="voltage" && x.refId == id).map((x) => {x.show = 'true'; return x}) 
                    //             } else {
                    //                 this.context.rowData.filter(x => x.id == id)[0].show = "false"
                    //                 let voltageList = this.context.rowData.filter(x => x.mode =="voltage" && x.refId == id)
                    //                 this.context.rowData.filter(x => x.mode =="voltage" && x.refId == id).map((x) => {x.show = 'false'; return x})
                    //                 for(let i in voltageList) {
                    //                     this.context.rowData.filter(x => x.mode =="feeder" && x.refId == voltageList[i].id).map((x) => {x.show = 'false'; return x})
                    //                 }
                    //             }
                    //         } else if(mode == 'voltage') {
                    //             if(sign == 'out') {  
                    //                 this.context.rowData.filter(x => x.mode =="feeder" && x.refId == id).map((x) => {x.show = 'true'; return x}) 
                    //             } else {
                    //                 this.context.rowData.filter(x => x.mode =="feeder" && x.refId == id).map((x) => {x.show = 'false'; return x})
                    //             }
                    //         }
                    //         this.context.gridApi.onFilterChanged();
                    //     },
                    //     context : this
                    // },
                },
                {
                    field: 'locked',
                    headerName: 'Locked',
                    cellRenderer: 'CellRender',
                    width: 100,
                    sortable: true,
                    tooltipField: 'status'
                },
                {field: 'mode', headerName: 'Mode', resizable: true, cellRenderer: 'capitalizeRenderer'},
                {
                    headerName: 'Type',
                    cellRenderer: 'headerRenderer',
                    width: 100,
                    sortable: true,
                    field : 'mode'
                },
                {field: 'address', headerName: 'Address', sortable: true, resizable: true,},
                {field: 'city', headerName: 'City', sortable: true},
                {field: 'postal_code', headerName: 'Postal Code', sortable: true},
                {field: 'state_province', headerName: 'State/Province', sortable: true},
                {field: 'country', headerName: 'Country', sortable: true},
                {field: 'company_company', headerName: 'Company', sortable: true},
                {field: 'region', headerName: 'Region', sortable: true},
                {field: 'division', headerName: 'Division', sortable: true}
            ],
            rowData: [],
            selectedLocation: [],
            search: '',
            loading: false,
            openDialog: false,
            signMode : 'first',
            currentId : '',
            sl : 10,

            pageLocationSync : {
                first : 1,
                second : 2,
                third : 3,
                dot : "...",
                end : 10,
            },
            displayPageLocationSync : {
                second : true,
                third : true,
                dot : true,
                end : true
            },
            pageLocationSyncInstance : {
                first : "",
                second : "",
                third : "",
                dot : "",
                end : "",
            },
            currentLocationSync : {
                nextP : '',
                previousP : '',
                current : 1,
            },
            optionLocationSync : {
                mode : ''
            },
            historyLocationSyncPage :[],
            LocationIdCurrent : '',
            count : ''
        }
    },
    async beforeMount() {
        await this.getOwnerLocation()
    },
    watch: {
        search(newSearch, oldSearch) {
            this.gridApi.setQuickFilter(newSearch)
        },
    },
    methods: {
        async getOwnerLocation() {
            this.$store.state.selectedLocationSync = []
            this.pageCurrent = 1
            this.count = await ownerAPI.countOwnerByRole("OWNER3")
            let sumOfPage = Math.floor(parseInt(this.count) / this.sl)
            let remainder = parseInt(this.count) % this.sl

            if(remainder == 0) {
                if(sumOfPage < 4) {
                    this.displayPageLocationSync.dot = false
                    this.displayPageLocationSync.end = false
                    this.pageLocationSync.end = sumOfPage
                    if(sumOfPage <3) {
                        this.displayPageLocationSync.third = false
                    }
                    if(sumOfPage <2) {
                        this.displayPageLocationSync.second = false
                    }
                } else if(sumOfPage == 4) {
                    this.displayPageLocationSync.dot = false
                    this.pageLocationSync.end = sumOfPage
                } else {
                    this.pageLocationSync.end = sumOfPage
                }
            } else {
                if(sumOfPage < 3) {
                    if(sumOfPage <2) {
                        this.displayPageLocationSync.third = false
                    }
                    if(sumOfPage <1) {
                        this.displayPageLocationSync.second = false
                    }
                    this.displayPageLocationSync.dot = false
                    this.displayPageLocationSync.end = false
                    this.pageLocationSync.end = sumOfPage + 1
                } else if(sumOfPage == 3) {
                    this.displayPageLocationSync.dot = false
                    this.pageLocationSync.end = sumOfPage + 1
                } else {
                    this.pageLocationSync.end = sumOfPage + 1
                }
            }
            await ownerAPI.getOwnerByRole("OWNER3", 1, this.sl).then((res) => {
                if(res != null && res.length != 0) {
                    for(let i in res) {
                        res[i].id = res[i].mrid
                        res[i].isExpanded = false
                        res[i].level = 0
                        res[i].parentId = ''
                    }
                    this.rowData = res
                }
            })
            this.$refs.LocationSyncPageAlign.firstUserPage()
            this.signMode = 'first'
            this.historyLocationSyncPage.push({
                id : '',
                signMode : JSON.parse(JSON.stringify(this.signMode)),
                currentId : '',
            })
        },
        async getLocations() {
            await locationApi.getAll().then((response) => {
                let result = response
                let resultCustom = []
                let locationData = result.filter(x => x.mode == 'location')
                for(let i in locationData) {
                    let dataTemp = []
                    resultCustom.push(locationData[i])
                    let temp = result.filter(x => x.refId == locationData[i].id)
                    for(let j in temp) {
                        dataTemp.push(temp[j])
                        let feeder = result.filter(x => x.refId == temp[j].id)
                        dataTemp = dataTemp.concat(feeder)
                    }

                    resultCustom = resultCustom.concat(dataTemp)
                }
                this.rowData = resultCustom
            })
        },
        async refreshDataRow() {
            if(this.signMode == "first") {
                await ownerAPI.findOwnerParentById(this.currentLocationSync.current, this.sl).then((res) => {
                    for(let i in res) {
                        res[i].id = res[i].mrid
                    }
                    this.rowData = JSON.parse(JSON.stringify(res))
                })
                let dataLocation = await locationApi.findLocationByRefIdAndUser(this.currentId,this.currentLocationSync.current, this.sl)
                this.rowData = JSON.parse(JSON.stringify(dataLocation))
            } else {
                let res = await ownerAPI.getOwnerByRefAndCreated(this.$store.state.user.user_id,this.currentId,this.currentLocationSync.current, this.sl)
                for(let i in res) {
                    res[i].id = res[i].mrid
                }
                this.rowData = JSON.parse(JSON.stringify(res))
                let dataLocation = await locationApi.findLocationByRefIdAndUser(this.currentId,this.currentLocationSync.current, this.sl)
                this.rowData = this.rowData.concat(JSON.parse(JSON.stringify(dataLocation)))
            }
        },
        onGridReady(params) {
            this.gridApi = params.api
            this.gridColumnApi = params.columnApi
        },
        onSelectionChanged() {
            this.selectedLocation = this.gridApi.getSelectedRows()
            this.$store.state.selectedLocationSync = JSON.parse(JSON.stringify(this.gridApi.getSelectedRows()))
        },
        lock(value) {
            const listLocation = this.selectedLocation.filter((location) => !location.mode.includes("OWNER"))
            const listId = listLocation.map((location) => location.id)
            if(listId.length != 0) {
                locationApi
                    .lock(value, listId)
                    .then(async () => {
                        this.$message.success('Successful')
                        // 🔥 Cập nhật trạng thái khóa (locked) của mỗi row dựa vào `value`
                        this.rowData.forEach(row => {
                            if (listId.includes(row.id)) {
                                row.locked = value  // Thay đổi giá trị `locked` thành true hoặc false
                            }
                        });
                        // 🔥 Làm mới UI để hiển thị dữ liệu mới
                        this.gridApi.refreshCells({
                            force: true,
                            columns: ["locked"],  // Chỉ làm mới cột `locked`
                        });
                        // await this.getOwnerLocation()
                    })
                    .catch((error) => {
                        console.log(error)
                        this.$message.error(error.message)
                    })
            } else {
                this.$message.error("Only locations have the locking feature")
            }
        },
        async download() {
            try {
                let listLocation = this.$store.state.selectedLocationSync.filter((location) => !location.mode.includes("OWNER"))
                let listOwner = this.$store.state.selectedLocationSync.filter((location) => location.mode.includes("OWNER"))
                if(listOwner.length != 0) {
                    const root = await window.electronAPI.getOwnerByUserId('00000000-0000-0000-0000-000000000000')
                    if(root.success && root.data.length > 0) {
                        for(let i in listOwner) {
                            let owner = await window.electronAPI.getOwnerById(listOwner[i].mrid)
                            let ownerParent = await window.electronAPI.getOwnerById(listOwner[i].ref_id)
                            if(owner.success) {
                                listOwner[i].mode = listOwner[i].mode.toLowerCase()
                                listOwner[i].user_id = this.user.user_id
                                listOwner[i].id = listOwner[i].mrid
                                if(owner.data.length > 0) {
                                    if(ownerParent.success) {
                                        if(ownerParent.data.length > 0) {
                                            listOwner[i].ref_id = ownerParent.data[i].id
                                            let updateData = await window.electronAPI.updateOwnerById(owner.data[0].id, listOwner[i])
                                        } else {
                                            listOwner[i].ref_id = root.data[i].id
                                            let updateData = await window.electronAPI.updateOwnerById(owner.data[0].id, listOwner[i])
                                        }
                                    }
                                } else {
                                    if(ownerParent.success) {
                                        if(ownerParent.data.length > 0) {
                                            listOwner[i].ref_id = ownerParent.data[0].id
                                            let insertOwner = await window.electronAPI.insertOwner(listOwner[i])
                                        } else {
                                            listOwner[i].ref_id = root.data[0].id
                                            let insertOwner = await window.electronAPI.insertOwner(listOwner[i])
                                        }
                                    } else {
                                        let insertOwner = await window.electronAPI.insertOwner(listOwner[i])
                                    }
                                }
                            }
                        }
                    }
                }
                
                if(listLocation.length != 0) {

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
                }

                this.$message.success("Successful")
            } catch (err) {
                console.log(err)
                this.$message.error("Error")
            }
        },
        deleteMultiple() {
            this.$confirm('Delete locations. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(() => {
                    const listId = this.selectedLocation.map((location) => location.id)
                    locationApi
                        .deleteMultiple(listId)
                        .then(async (response) => {
                            if(response == null) {
                                this.$message.error("Not privileges on this data")
                            } else {
                                this.$message.success('Successful')
                                const deletedIds = response // Giả sử server trả về danh sách các ID đã xóa
                                this.removeDeletedRows(deletedIds);
                            }
                        })
                        .catch((error) => {
                            console.log(error)
                            this.$message.error("Some error occur")
                            // this.$message.error(error.message)
                        })
                })
                .catch(() => {})
        },
        async refresh() {
            this.loading = true
            this.rowData = []
            this.selectedLocation = []
            await this.$common.simulateLoading(1000)
            await this.getLocations()
            this.loading = false
        },
        doesExternalFilterPass(node) {
            if (node.data) {
                if(node.data.mode == 'location') {
                    return true
                } else {
                    if(node.data.mode == 'voltage') {
                        if(node.data.show == "true") {
                            return true
                        } else {
                            return false
                        }
                    } else {
                        if(node.data.mode == 'feeder') {
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
            return true;
        },
        isExternalFilterPresent() {
            return true
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
                    refId : location.refId,
                    ref_id_old : ''
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
        async updateLocationSyncPage(pageStt) {
            if(this.optionLocationSync.mode == 'update') {
                await ownerAPI.getOwnerByRole("OWNER3", pageStt, this.sl).then((res) => {
                    if(res != null && res.length != 0) {
                        for(let i in res) {
                            res[i].id = res[i].mrid
                            res[i].isExpanded = false
                            res[i].level = 0
                            res[i].parentId = ''
                        }
                        this.rowData = res
                        this.selectedLocation = []
                    }
                })

                // if(this.signMode == "first") {
                //     await ownerAPI.findOwnerParentById(pageStt, this.sl).then((res) => {
                //         for(let i in res) {
                //             res[i].id = res[i].mrid
                //         }
                //         this.rowData = JSON.parse(JSON.stringify(res))
                //     })
                //     let dataLocation = await locationApi.findLocationByRefIdAndUser(this.currentId, pageStt, this.sl)
                //     this.rowData = JSON.parse(JSON.stringify(dataLocation))
                // } else {
                //     let res = await ownerAPI.getOwnerByRefAndCreated(this.$store.state.user.user_id,this.currentId, pageStt, this.sl)
                //     for(let i in res) {
                //         res[i].id = res[i].mrid
                //     }
                //     this.rowData = JSON.parse(JSON.stringify(res))
                //     let dataLocation = await locationApi.findLocationByRefIdAndUser(this.currentId, pageStt, this.sl)
                //     this.rowData = this.rowData.concat(JSON.parse(JSON.stringify(dataLocation)))
                // }
            }
        },
        async rowDbClick(params) {
            // if(params.data.mode.includes("OWNER")) {
            //     let countData = await ownerAPI.countOwnerByRef(this.$store.state.user.user_id, params.data.mrid)
            //     let countDataLocation = await locationApi.countLocationByRefIdAndUser(params.data.mrid)
            //     let data = await ownerAPI.getOwnerByRefAndCreated(this.$store.state.user.user_id, params.data.mrid, 1, this.sl)
            //     for(let i in data) {
            //         data[i].id = data[i].mrid
            //     }
            //     this.signMode = 'noFirst'
            //     this.currentId = JSON.parse(JSON.stringify(params.data.mrid))
            //     let dataLocation = await locationApi.findLocationByRefIdAndUser(params.data.mrid, 1, this.sl)
            //     this.rowData = JSON.parse(JSON.stringify(data)).concat(JSON.parse(JSON.stringify(dataLocation)))
            //     this.historyLocationSyncPage.push({
            //         pageLocationSync : JSON.parse(JSON.stringify(this.pageLocationSync)),
            //         displayPageLocationSync : JSON.parse(JSON.stringify(this.displayPageLocationSync)),
            //         pageLocationSyncInstance : JSON.parse(JSON.stringify(this.pageLocationSyncInstance)),
            //         currentLocationSync : JSON.parse(JSON.stringify(this.currentLocationSync)),
            //         id : JSON.parse(JSON.stringify(params.data.mrid)),
            //         signMode : JSON.parse(JSON.stringify(this.signMode)),
            //         currentId : JSON.parse(JSON.stringify(params.data.mrid))
            //     })
            //     this.pageLocationSync = {
            //         first : 1,
            //         second : 2,
            //         third : 3,
            //         dot : "...",
            //         end : 10,
            //     },
            //     this.displayPageLocationSync = {
            //         second : true,
            //         third : true,
            //         dot : true,
            //         end : true
            //     },
            //     this.pageLocationSyncInstance = {
            //         first : "",
            //         second : "",
            //         third : "",
            //         dot : "",
            //         end : "",
            //     },
            //     this.currentLocationSync = {
            //         nextP : '',
            //         previousP : '',
            //         current : 1,
            //     }
            //     if(countData >= countDataLocation) {
            //         await this.pageAlignCalc(countData, this.pageLocationSync, this.displayPageLocationSync)
            //     } else {
            //         await this.pageAlignCalc(countDataLocation, this.pageLocationSync, this.displayPageLocationSync)
            //     }
            //     await this.$refs.LocationSyncPageAlign.firstUserPageNoMode()
            //     this.$store.state.selectedLocationSync = []
            //     this.$selectedLocation = []
            // } else {
            //     let countDataLocation = await locationApi.countLocationByRefIdAndUser(params.data.id)
            //     this.signMode = 'noFirst'
            //     this.currentId = JSON.parse(JSON.stringify(params.data.id))
            //     let dataLocation = await locationApi.findLocationByRefIdAndUser(params.data.id, 1, this.sl)
            //     this.rowData = JSON.parse(JSON.stringify(dataLocation))
            //     this.historyLocationSyncPage.push({
            //         pageLocationSync : JSON.parse(JSON.stringify(this.pageLocationSync)),
            //         displayPageLocationSync : JSON.parse(JSON.stringify(this.displayPageLocationSync)),
            //         pageLocationSyncInstance : JSON.parse(JSON.stringify(this.pageLocationSyncInstance)),
            //         currentLocationSync : JSON.parse(JSON.stringify(this.currentLocationSync)),
            //         id : JSON.parse(JSON.stringify(params.data.id)),
            //         signMode : JSON.parse(JSON.stringify(this.signMode)),
            //         currentId : JSON.parse(JSON.stringify(params.data.id))
            //     })
            //     this.pageLocationSync = {
            //         first : 1,
            //         second : 2,
            //         third : 3,
            //         dot : "...",
            //         end : 10,
            //     },
            //     this.displayPageLocationSync = {
            //         second : true,
            //         third : true,
            //         dot : true,
            //         end : true
            //     },
            //     this.pageLocationSyncInstance = {
            //         first : "",
            //         second : "",
            //         third : "",
            //         dot : "",
            //         end : "",
            //     },
            //     this.currentLocationSync = {
            //         nextP : '',
            //         previousP : '',
            //         current : 1,
            //     }
            //     await this.pageAlignCalc(countDataLocation, this.pageLocationSync, this.displayPageLocationSync)
            //     await this.$refs.LocationSyncPageAlign.firstUserPageNoMode()
            //     this.$store.state.selectedLocationSync = []
            //     this.$selectedLocation = []
            // }

        },
        async backPageOwner() {
            this.optionLocationSync.mode = 'mode'
            if(this.optionLocationSync.mode == 'mode') {
                let historyData = JSON.parse(JSON.stringify(this.historyLocationSyncPage[this.historyLocationSyncPage.length - 1]))
                let historyDataOwner = JSON.parse(JSON.stringify(this.historyLocationSyncPage[this.historyLocationSyncPage.length - 2]))

                this.pageLocationSync = JSON.parse(JSON.stringify(historyData.pageLocationSync))
                this.displayPageLocationSync = JSON.parse(JSON.stringify(historyData.displayPageLocationSync))
                this.pageLocationSyncInstance = JSON.parse(JSON.stringify(historyData.pageLocationSyncInstance))
                this.currentLocationSync = JSON.parse(JSON.stringify(historyData.currentLocationSync))
                this.LocationIdCurrent = JSON.parse(JSON.stringify(historyDataOwner.id))
                this.signMode = JSON.parse(JSON.stringify(historyDataOwner.signMode))
                this.currentId = JSON.parse(JSON.stringify(historyDataOwner.currentId))
                this.historyLocationSyncPage.pop()

                if(historyDataOwner.id != '') {
                    let res = await ownerAPI.getOwnerByRefAndCreated(this.$store.state.user.user_id,historyDataOwner.id, historyData.currentLocationSync.current, this.sl)
                    for(let i in res) {
                        res[i].id = res[i].mrid
                    }
                    this.rowData = JSON.parse(JSON.stringify(res))
                    let dataLocation = await locationApi.findLocationByRefIdAndUser(this.currentId, historyData.currentLocationSync.current, this.sl)
                    this.rowData = this.rowData.concat(dataLocation)
                    let count = await ownerAPI.countOwnerByRef(this.$store.state.user.user_id, historyDataOwner.id)
                    let countLocation = await locationApi.countLocationByRefIdAndUser(this.currentId)
                    if(count >= countLocation) {
                        await this.pageAlignCalc(count, this.pageLocationSync, this.displayPageLocationSync)
                    } else {
                        await this.pageAlignCalc(countLocation, this.pageLocationSync, this.displayPageLocationSync)
                    }
                } else {
                    await ownerAPI.findOwnerParentById(historyData.currentLocationSync.current, this.sl).then(async (res) => {
                        for(let i in res) {
                            res[i].id = res[i].mrid
                        }
                        this.rowData = JSON.parse(JSON.stringify(res))
                        let count = await ownerAPI.countOwnerPre()
                        await this.pageAlignCalc(count, this.pageLocationSync, this.displayPageLocationSync)
                    })
                }

                if(this.currentLocationSync.nextP == 'second') {
                    this.$refs.LocationSyncPageAlign.firstUserPage()
                } else if(this.currentLocationSync.nextP == 'third') {
                    this.$refs.LocationSyncPageAlign.secondUser()
                } else if(this.currentLocationSync.nextP == 'dot') {
                    this.$refs.LocationSyncPageAlign.thirdUser()
                } else if(this.currentLocationSync.nextP == '') {
                    this.$refs.LocationSyncPageAlign.endUser()
                }
                this.selectedLocation = []
                this.$store.state.selectedLocationSync = []
            }
        },
        async getRowStyle(params) {
            return { paddingLeft: `${params.data.level * 10}px` };
        },
        async onRowClicked(params) {
            const clickedRow = params.data;
            const rowIndex = params.node.rowIndex;

            // Nếu row đã mở rộng, thì xóa tất cả các row con của nó
            if (clickedRow.isExpanded) {
                this.rowData = this.rowData.filter(row => !this.isChildOf(row, clickedRow.id));
                clickedRow.isExpanded = false;
                this.$nextTick(() => {
                    if (this.gridApi) {
                        this.gridApi.ensureIndexVisible(rowIndex, "middle");
                    }
                });
                return;
            } // ✅ Gọi API song song
            try {
                const [newRowsOwner, newRowLocation] = await Promise.all([
                    ownerAPI.getOwnerByParentId(clickedRow.id),
                    locationApi.findAllLocationByRefId(clickedRow.id)
                ]);

                let newRows = [];

                // ✅ Thêm Owner Rows
                if (newRowsOwner && newRowsOwner.length > 0) {
                    newRowsOwner.forEach(row => {
                        row.level = clickedRow.level + 1;
                        row.parentId = clickedRow.id;
                        row.isExpanded = false;
                    });
                    newRows.push(...newRowsOwner);
                }

                // ✅ Thêm Location Rows
                if (newRowLocation && newRowLocation.length > 0) {
                    newRowLocation.forEach(row => {
                        row.level = clickedRow.level + 1;
                        row.parentId = clickedRow.id;
                        row.isExpanded = false;
                    });
                    newRows.push(...newRowLocation);
                }

                // ✅ Thêm vào vị trí đúng
                if (newRows.length > 0) {
                    this.rowData.splice(rowIndex + 1, 0, ...newRows);
                    clickedRow.isExpanded = true;
                    this.$nextTick(() => {
                        if (this.gridApi) {
                            this.gridApi.ensureIndexVisible(rowIndex, "middle");
                        }
                    });
                }

            } catch (error) {
                this.$message.error("Error getting data")
                console.error("Lỗi khi lấy dữ liệu:", error);
            }
        },
        removeDeletedRows(deletedIds) {
            this.rowData = this.rowData.filter(row => !deletedIds.includes(row.id));

            // ✅ Cập nhật lại dữ liệu trong AG-Grid
            if (this.gridApi) {
                this.gridApi.setRowData(this.rowData);
            }
        },
        isChildOf(row, parentId) {
            if (!row.parentId)
                return false;
            if (row.parentId === parentId) 
                return true;
            return this.isChildOf(this.rowData.find(r => r.id === row.parentId), parentId);
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
