<template>
    <div id="location">
        <el-row style="height: fit-content; width: fit-content;">
            <el-col class="col-content">
                <el-form ref="ruleForm" :rules="rules" :model="properties" :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Properties</span>
                    <el-divider></el-divider>
                    <el-form-item label="Name" prop="name">
                        <el-input :disabled="checkSide(this.sideData)" v-model="properties.name"></el-input>
                    </el-form-item>
                    <el-form-item label="Type" prop="mode">
                        <el-input v-model="properties.mode" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="Full name">
                        <el-input :disabled="checkSide(this.sideData)" v-model="properties.full_name"></el-input>
                    </el-form-item>
                    <el-form-item label="Address">
                        <el-input :disabled="checkSide(this.sideData)" v-model="properties.address"></el-input>
                    </el-form-item>
                    <el-form-item label="City">
                        <el-input :disabled="checkSide(this.sideData)" v-model="properties.city"></el-input>
                    </el-form-item>
                    <el-form-item label="Tax code">
                        <el-input :disabled="checkSide(this.sideData)" v-model="properties.tax_code"></el-input>
                    </el-form-item>
                    <el-form-item label="Country">
                        <el-select :disabled="checkSide(this.sideData)" style="width: 100%;" filterable v-model="properties.country">
                            <el-option v-for="item in countryData" :key="item" :label="item" :value="item"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Phone number">
                        <el-input :disabled="checkSide(this.sideData)" v-model="properties.phone_no"></el-input>
                    </el-form-item>
                    <el-form-item label="Email">
                        <el-input :disabled="checkSide(this.sideData)" v-model="properties.email"></el-input>
                    </el-form-item>
                    <el-form-item  label="Geo position x">
                        <el-select style="width: 75%;" @change="changeValueGeo" v-model="properties.x_position">
                            <el-option v-for="(item,index) in properties.positionPoints.x" :key="index" :value="index">
                                <div class="option-content">
                                    <span>
                                        {{ item.coor }}
                                    </span>
                                    <div class="icons">
                                        <i @click="checkSide(sideData) ? null : editCoor(index)" class="fa-solid fa-pen-to-square" style="color: green"></i>
                                        <i @click="checkSide(sideData) ? null : deleteCoor(index)" class="fa-solid fa-trash" style="color: red;"></i>
                                    </div>
                                </div>
                            </el-option>
                        </el-select>
                        <el-button :disabled="checkSide(this.sideData)" @click="openAddGeo" type="primary" style="width:calc(25% - 10px); margin-left: 10px;"><i class="fa-solid fa-plus"></i></el-button>
                    </el-form-item>
                    <el-form-item label="Geo position y">
                        <el-select style="width: 75%;" @change="changeValueGeo" v-model="properties.y_position">
                            <el-option v-for="(item,index) in properties.positionPoints.y" :key="index" :value="index">
                                <div class="option-content">
                                    <span>
                                        {{ item.coor }}
                                    </span>
                                    <div class="icons">
                                        <i @click="checkSide(sideData) ? null : editCoor(index)" class="fa-solid fa-pen-to-square" style="color: green"></i>
                                        <i @click="checkSide(sideData) ? null : deleteCoor(index)" class="fa-solid fa-trash" style="color: red;"></i>
                                    </div>
                                </div>
                            </el-option>
                        </el-select>
                        <el-button :disabled="checkSide(this.sideData)" @click="openAddGeo" type="primary" style="width:calc(25% - 10px); margin-left: 10px;"><i class="fa-solid fa-plus"></i></el-button>
                    </el-form-item>
                    <el-form-item label="Geo position z">
                        <el-select style="width: 75%;" @change="changeValueGeo" v-model="properties.z_position">
                            <el-option v-for="(item,index) in properties.positionPoints.z" :key="index" :value="index">
                                <div class="option-content">
                                    <span>
                                        {{ item.coor }}
                                    </span>
                                    <div class="icons">
                                        <i @click="checkSide(sideData) ? null : editCoor(index)" class="fa-solid fa-pen-to-square" style="color: green"></i>
                                        <i @click="checkSide(sideData) ? null : deleteCoor(index)" class="fa-solid fa-trash" style="color: red;"></i>
                                    </div>
                                </div>
                            </el-option>
                        </el-select>
                        <el-button :disabled="checkSide(this.sideData)" @click="openAddGeo" type="primary" style="width:calc(25% - 10px); margin-left: 10px;"><i class="fa-solid fa-plus"></i></el-button>
                    </el-form-item>
                    <Transition>
                        <geo-map ref='geoMap' :locationGeo='{}'></geo-map>
                    </Transition>
                </el-form>
            </el-col>
            <el-col class="col-content mgt-20 mgb-20">
                <el-form :disabled="checkSide(this.sideData)" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Contact person</span>
                    <el-divider></el-divider>
                    <el-form-item label="Name">
                        <el-input v-model="properties.name_person"></el-input>
                    </el-form-item>
                    <el-form-item label="Phone no.1">
                        <el-input type="number" v-model="properties.phone1"></el-input>
                    </el-form-item>
                    <el-form-item label="Phone no.2">
                        <el-input type="number" v-model="properties.phone2"></el-input>
                    </el-form-item>
                    <el-form-item label="Fax no">
                        <el-input type="number" v-model="properties.fax_contact"></el-input>
                    </el-form-item>
                    <el-form-item label="Email">
                        <el-input v-model="properties.email_contact"></el-input>
                    </el-form-item>
                    <el-form-item label="Department">
                        <el-input v-model="properties.department"></el-input>
                    </el-form-item>
                    <el-form-item label="Position">
                        <el-input v-model="properties.position"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col class="col-content">
                <el-form :disabled="checkSide(this.sideData)" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Comment </span>
                    <el-divider></el-divider>
                    <el-input type="textarea" rows="5" v-model="properties.comment"></el-input>
                    <Attachment :dataParent="this.properties" :deleteList="deleteList" :attachment_="this.attachmentData" :fileUrl="this.fileUrl" title="location" height="120px" @data-attachment = "getDataAttachment"></Attachment>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
/* eslint-disable */
import mixin from './mixin'
import Attachment from '@/views/Common/Attachment.vue'
import * as fileAPI from '@/api/fileAPI/fileUpload.js'
import * as attachmentAPI from '@/api/attachmentAPI/attachmentAPI.js'
import {country} from '../ConstantAsset/index'
import * as ownerAPI from '@/api/owner/owner.js'
import geoMap from '@/views/Common/GeoMap.vue'


export default {
    components: { 
        Attachment,
        geoMap
    },
    name: 'OwnerView',
    mixins: [mixin],
    props : {
        ownerData : {
            type : Object,
            required : true
        },
        sideData : {
            type : String,
            required : true
        }
    },
    data() {
        return {
            geoChosen : {
                x : '',
                y : '',
                z : ''
            },
            indexGeo : '',
            signAddGeo : false,
            titleGeo : 'Add coordinate',
            message : "",
            mode: this.$constant.ADD,
            location_id: null,
            saved: false,
            labelWidth: `${10}vw`,
            rules: {
                name: [{required: true, message: 'Please input location name', trigger: 'blur'}],
                mode: [{required: true, message: 'Please input location type', trigger: 'blur'}]
            },
            typeList : ["HV substation", "UHV substation", "Charging station", "Rooftop Solar", "Solar PP", "Wind PP", "Hydro PP", "Wind and solar PP", "Distribution substation",
                "Power Plant", "Cement Plant", "Steel Plant", "Contract number"],
            countryData : country.default,
            voltageList : ['500 kV', '220 kV', '110 kV', '35 kV', '26 kV', '22 kV', '21 kV', '15.75 kV', '13.8 kV', '10 kV', '6.6 kV', '0.4 kV'],
            deleteList : []
        }
    },
    async mounted() {
        await this.loadData(this.ownerData)
        this.$nextTick(() => {
            this.loadMapForView()
        })
    },
    methods: {
        getDataAttachment(rowData) {
            this.attachmentData = rowData
        },
        async loadData(tab) {
            if(tab != undefined) {
                this.properties = JSON.parse(JSON.stringify(tab))
                if(this.properties.positionPoints == undefined) {
                    this.properties.positionPoints = {
                        x : [],
                        y : [],
                        z : []
                    }
                }
                this.attachmentData = []
                this.attachmentDataImage = {}
                this.fileUrlImage = '-1',
                // this.dataLoadAttachment = await attachmentAPI.getDataAttachment(this.properties.id)
                // if(this.dataLoadAttachment.length != 0) {
                //     this.attachmentData = JSON.parse(this.dataLoadAttachment[0].name).map(element => ({name : element.path}))
                // }
                // this.fileUrl = new Array(this.attachmentData.length)
                this.fileUrl = new Array(this.attachmentData.length)
                this.fileUrl.fill(-1)
                this.deleteList = []
                this.deleteImage = {}
            }
        },
        async saveData() {
            this.$refs.ruleForm.validate(async (valid) => {
                if(valid) {
                    try {

                        let addListData = this.attachmentData.filter(element => element.upload == 'new')
                        let deleteListData = this.deleteList.map(element => element.name)
                        let data = []
                        for(let i in this.attachmentData) {
                            data.push({
                                path : this.attachmentData[i].name
                            })
                        }
                        if(this.dataLoadAttachment.length != 0) {
                            this.dataLoadAttachment[0].name = JSON.stringify(data)
                        } 
                        else {
                            this.dataLoadAttachment.push( 
                                {
                                    id : this.$uuid.newUuid(),
                                    id_foreign : this.properties.id,
                                    name : JSON.stringify(data),
                                    path : null,
                                    type : 'owner'
                                }
                            )
                        }
                        let rs = await fileAPI.updateFile(deleteListData, addListData, this.properties.name, this.properties.id)
                        if(rs == true) {
                            let rt = await attachmentAPI.upload(this.dataLoadAttachment)
                            if(rt == true) {
                                let rx = await ownerAPI.updateOwner(this.properties)
                                this.$message.success("Update successful")
                                this.$emit('update-data', this.properties)
                            } else {
                                let rx = await ownerAPI.updateOwner(this.properties)
                                this.$message.success("Update successful without attachment")
                                this.$emit('update-data', this.properties)
                            }
                        } else {
                            let rx = await ownerAPI.updateOwner(this.properties)
                            this.$message.success("Update successful without attachment")
                            this.$emit('update-data', this.properties)
                        }
                    } catch(e) {
                        this.$message.error("Update failed")
                    }
                } else {
                    console.log('error submit!!')
                    return false
                }
            })
        },
        checkSide(data) {
            if(data == 'server') {
                return true
            } else {
                return false
            }
        },
        async changeValueGeo(index) {
            this.indexGeo = index
            this.properties.x_position = this.properties.positionPoints.x[index].coor
            this.properties.y_position = this.properties.positionPoints.y[index].coor
            this.properties.z_position = this.properties.positionPoints.z[index].coor
            try{
                await this.$refs.geoMap.loadMap(
                    {
                        x : this.properties.x_position,
                        y : this.properties.y_position,
                        z : this.properties.z_position
                    },
                    true
                )
            } catch(e) {
                console.log(e)
                this.$message.error('Cannot load location in map')
            }
        },
        async openAddGeo() {
            this.signAddGeo = true
            this.titleGeo = 'Add coordinate'
        },
        async handleCloseGeo() {
            this.signAddGeo = false
        },
        async handleConfirmGeo() {
            if(this.titleGeo == 'Add coordinate') {
                if(this.geoChosen.x == '' || this.geoChosen.y == '') {
                    this.$message.error("X or Y cannot be null or empty")
                } else {
                    try {
                        this.properties.positionPoints.x.push(
                            {
                                id : '',
                                coor : JSON.parse(JSON.stringify(this.geoChosen.x))
                            }
                        )
                        this.properties.positionPoints.y.push(
                            {
                                id : '',
                                coor : JSON.parse(JSON.stringify(this.geoChosen.y))
                            }
                        )
                        this.properties.positionPoints.z.push(
                            {
                                id : '',
                                coor : JSON.parse(JSON.stringify(this.geoChosen.z))
                            }
                        )
                        this.$message.success("Insert coordinate successful")
                        this.signAddGeo = false
                    } catch(e) {
                        this.$message.error("Cannot add coordinate")
                    }
                }
            } else {
                try {
                    this.properties.positionPoints.x[this.indexGeo].coor = JSON.parse(JSON.stringify(this.geoChosen.x))
                    this.properties.positionPoints.y[this.indexGeo].coor = JSON.parse(JSON.stringify(this.geoChosen.y))
                    this.properties.positionPoints.z[this.indexGeo].coor = JSON.parse(JSON.stringify(this.geoChosen.z))
                    this.$message.success("Update coordinate successful")
                    this.signAddGeo = false
                    await this.changeValueGeo(this.indexGeo)
                } catch(e) {
                    this.$message.error("Cannot update coordinate")
                }
            }
        },
        async editCoor(index) {
            this.signAddGeo = true
            this.indexGeo = index
            this.titleGeo = "Edit coordinate"
            this.geoChosen.x = this.properties.positionPoints.x[index].coor
            this.geoChosen.y = this.properties.positionPoints.y[index].coor
            this.geoChosen.z = this.properties.positionPoints.z[index].coor
        },
        async deleteCoor(index) {
            this.$confirm('Are you sure you want to delete this item?', 'Warning', {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'warning',
            }).then(async () => {
                try {
                    this.properties.positionPoints.x.splice(index, 1);
                    this.properties.positionPoints.y.splice(index, 1);
                    this.properties.positionPoints.z.splice(index, 1);
                    this.$message({
                        type: 'success',
                        message: 'Delete completed!',
                    });
                    this.properties.x_position = ''
                    this.properties.y_position = ''
                    this.properties.z_position = ''
                    await this.loadMapFirst()
                } catch(e) {
                    this.$message.error("Cannot delete coordinate")
                }
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: 'Delete canceled',
                });
            });
        },
        async loadMapForView() {
            try {
                if(this.$refs.geoMap) {
                    this.$refs.geoMap.reloadMap()
                }
            } catch(e) {
                console.log(e)
                this.$message.error('Cannot load location in map')
            }
        }
    },
}
</script>

<style lang="scss" scoped>
#location {
    width: 100%
}

.col-content {
    width: 100%
}

::v-deep(.el-form-item__label) {
    font-size: 0.75vw !important;
}

::v-deep(.el-input__inner) {
    height: 3.2vh !important; /* Đặt chiều cao */
}

.last-right-parent {
    position: relative;
    float: right;
}
.bolder {
    font-weight: bold;
    font-size: 0.75vw;
}
</style>
