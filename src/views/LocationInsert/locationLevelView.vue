<template>
    <div class="sub-view">
        <!-- Hàng 1: Properties | Comment + Attachment -->
        <div class="sub-row">
            <div class="col-content">
                <section class="sub-card">
                    <div class="sub-header">
                        <i class="fa-solid fa-industry"></i>
                        <span>Properties</span>
                    </div>
                    <div class="sub-body">
                        <el-form :model="properties" :inline-message="true" :label-width="labelWidth" size="mini"
                            label-position="left">
                            <el-form-item label="Name">
                                <el-input v-model="properties.name" v-if="properties"></el-input>
                            </el-form-item>

                            <div class="sub-section">Type</div>
                            <el-form-item label="Substation">
                                <el-select filterable v-model="properties.type">
                                    <el-option v-for="item in substationType" :key="item" :label="item" :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Generation">
                                <el-select filterable v-model="properties.generation">
                                    <el-option v-for="item in generationType" :key="item" :label="item" :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Industry">
                                <el-select filterable v-model="properties.industry">
                                    <el-option v-for="item in industryType" :key="item" :label="item" :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>

                            <div class="sub-section">Location</div>
                            <el-form-item label="Location name">
                                <el-select @change="changeLocationName" filterable allow-create v-model="locationTemp">
                                    <el-option v-for="(item, index) in locationListData" :key="index"
                                        :label="item && item.name ? item.name : ''"
                                        :value="item && item.mrid ? item.mrid : ''"> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Street">
                                <el-input v-model="properties.street"></el-input>
                            </el-form-item>
                            <el-form-item label="Ward/ Commune">
                                <el-input v-model="properties.ward_or_commune"></el-input>
                            </el-form-item>
                            <el-form-item label="District/ Town">
                                <el-input v-model="properties.district_or_town"></el-input>
                            </el-form-item>
                            <el-form-item label="City">
                                <el-input v-model="properties.city"></el-input>
                            </el-form-item>
                            <el-form-item label="State/ Province">
                                <el-input v-model="properties.state_or_province"></el-input>
                            </el-form-item>
                            <el-form-item label="Country">
                                <el-select filterable v-model="properties.country">
                                    <el-option v-for="item in countryData" :key="item" :label="item" :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </div>
                </section>
            </div>
            <div class="col-content sub-col-stack">
                <section class="sub-card sub-comment-card">
                    <div class="sub-header">
                        <i class="fa-solid fa-align-left"></i>
                        <span>Comment</span>
                    </div>
                    <div class="sub-body">
                        <el-form size="mini" class="sub-comment-form">
                            <el-input class="sub-comment-input" type="textarea" v-model="properties.comment"></el-input>
                        </el-form>
                    </div>
                </section>
                <Attachment class="sub-attach-card" :dataParent="this.properties" :deleteList="deleteList"
                    :attachment_="this.attachmentData" title="substation" height="230px"
                    @data-attachment="getDataAttachment"></Attachment>
            </div>
        </div>

        <!-- Hàng 2: Geo location | Contact person -->
        <div class="sub-row">
            <div class="col-content">
                <section class="sub-card">
                    <div class="sub-header">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>Geo location</span>
                    </div>
                    <div class="sub-body">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Geo position x" class="geo-item">
                                <div class="geo-row">
                                    <el-select class="geo-select" @change="changeValueGeo" v-model="properties.x_position">
                                        <el-option v-for="(item, index) in properties.positionPoints.x" :key="index"
                                            :value="index">
                                            <div class="option-content">
                                                <span>
                                                    {{ item.coor }}
                                                </span>
                                                <div class="icons">
                                                    <i @click="editCoor(index)" class="fa-solid fa-pen-to-square"
                                                        style="color: green"></i>
                                                    <i @click="deleteCoor(index)" class="fa-solid fa-trash"
                                                        style="color: red;"></i>
                                                </div>
                                            </div>
                                        </el-option>
                                    </el-select>
                                    <el-button class="geo-add-btn" @click="openAddGeo" type="primary"><i
                                            class="fa-solid fa-plus"></i></el-button>
                                </div>
                            </el-form-item>
                            <el-form-item label="Geo position y" class="geo-item">
                                <div class="geo-row">
                                    <el-select class="geo-select" @change="changeValueGeo" v-model="properties.y_position">
                                        <el-option v-for="(item, index) in properties.positionPoints.y" :key="index"
                                            :value="index">
                                            <div class="option-content">
                                                <span>
                                                    {{ item.coor }}
                                                </span>
                                                <div class="icons">
                                                    <i @click="editCoor(index)" class="fa-solid fa-pen-to-square"
                                                        style="color: green"></i>
                                                    <i @click="deleteCoor(index)" class="fa-solid fa-trash"
                                                        style="color: red;"></i>
                                                </div>
                                            </div>
                                        </el-option>
                                    </el-select>
                                    <el-button class="geo-add-btn" @click="openAddGeo" type="primary"><i
                                            class="fa-solid fa-plus"></i></el-button>
                                </div>
                            </el-form-item>
                            <el-form-item label="Geo position z" class="geo-item">
                                <div class="geo-row">
                                    <el-select class="geo-select" @change="changeValueGeo" v-model="properties.z_position">
                                        <el-option v-for="(item, index) in properties.positionPoints.z" :key="index"
                                            :value="index">
                                            <div class="option-content">
                                                <span>
                                                    {{ item.coor }}
                                                </span>
                                                <div class="icons">
                                                    <i @click="editCoor(index)" class="fa-solid fa-pen-to-square"
                                                        style="color: green"></i>
                                                    <i @click="deleteCoor(index)" class="fa-solid fa-trash"
                                                        style="color: red;"></i>
                                                </div>
                                            </div>
                                        </el-option>
                                    </el-select>
                                    <el-button class="geo-add-btn" @click="openAddGeo" type="primary"><i
                                            class="fa-solid fa-plus"></i></el-button>
                                </div>
                            </el-form-item>
                        </el-form>
                        <Transition>
                            <geo-map class="sub-geo-map" ref='geoMap' :locationGeo='{}'></geo-map>
                        </Transition>
                    </div>
                </section>
            </div>
            <div class="col-content">
                <section class="sub-card">
                    <div class="sub-header">
                        <i class="fa-solid fa-user"></i>
                        <span>Contact person</span>
                    </div>
                    <div class="sub-body">
                        <el-form :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Name">
                                <el-select @change="changePersonName" filterable allow-create v-model="personTemp">
                                    <el-option v-for="(item, index) in personListData" :key="index"
                                        :label="item && item.name ? item.name : ''"
                                        :value="item && item.mrid ? item.mrid : ''"> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Phone number">
                                <el-input type="number" v-model="properties.phoneNumber"></el-input>
                            </el-form-item>
                            <el-form-item label="Fax">
                                <el-input type="number" v-model="properties.fax"></el-input>
                            </el-form-item>
                            <el-form-item label="Email">
                                <el-input v-model="properties.email"></el-input>
                            </el-form-item>
                            <el-form-item label="Department">
                                <el-input v-model="properties.department"></el-input>
                            </el-form-item>
                            <el-form-item label="Position">
                                <el-input v-model="properties.position"></el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </section>
            </div>
        </div>

        <el-dialog custom-class="sub-geo-dialog" :visible.sync="signAddGeo" :title="titleGeo" align-center
            :before-close="handleCloseGeo" :modal="true" append-to-body>
            <el-form label-width="180px" size="mini" label-position="left">
                <el-form-item label="Geographic coordinate x">
                    <el-input type="number" v-model="geoChosen.x"></el-input>
                </el-form-item>
                <el-form-item label="Geographic coordinate y">
                    <el-input type="number" v-model="geoChosen.y"></el-input>
                </el-form-item>
                <el-form-item label="Geographic coordinate z">
                    <el-input type="number" v-model="geoChosen.z"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" type="danger" @click="handleCloseGeo()" size="small">Cancel</el-button>
                <el-button class="footer-btn" type="primary" @click="handleConfirmGeo()"
                    size="small">Confirm</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
/* eslint-disable */
import mixin from './mixin'
import Attachment from '@/views/Common/Attachment.vue'
import namePlate from '@/views/Common/NamePlate.vue'
import { country } from '../ConstantAsset/index'
import geoMap from '@/views/Common/GeoMap.vue'

export default {
    components: {
        Attachment,
        namePlate,
        geoMap
    },
    name: 'LocationViewData',
    mixins: [mixin],
    props: {
        organisationId: {
            type: String,
            default: '00000000-0000-0000-0000-000000000000'
        },
        locationList: {
            type: Array,
            default: () => []
        },
        personList: {
            type: Array,
            default: () => []
        },
        dataMapping: {
            type: Object,
            default: () => ({})
        },
        mode: {
            type: String,
            default: "add"
        },
    },
    data() {
        return {
            geoChosen: {
                x: '',
                y: '',
                z: ''
            },
            substationType: ["Step-Up Substation", "Step-Down Substation", "Transmission Substation",
                "Distribution Substation", "Switching Substation", "Converter Substation", "Interconnection Substation", ""],
            generationType: ["Hydro Power Plant", "Thermal Power Plant", "Solar Power Plant",
                "Wind Power Plant", "Nuclear Power Plant", "Battery Energy Storage Systems", ""],
            industryType: ["Industrial Zone", "Manufacturer Factory", "Steel Plant", "Cement Plant",
                "Oil Refinery Plant", "Mining Plant", ""],
            indexGeo: '',
            signAddGeo: false,
            titleGeo: 'Add coordinate',
            saved: false,
            labelWidth: `130px`,
            countryData: country.default,
            voltageList: ['500 kV', '220 kV', '110 kV', '35 kV', '26 kV', '22 kV', '21 kV', '15.75 kV', '13.8 kV', '10 kV', '6.6 kV', '0.4 kV'],
            deleteList: [],
            deleteImage: {}
        }
    },
    methods: {
        getDataAttachment(rowData) {
            this.attachmentData = rowData
        },
        async changeValueGeo(index) {
            this.indexGeo = index
            this.properties.x_position = this.properties.positionPoints.x[index].coor
            this.properties.y_position = this.properties.positionPoints.y[index].coor
            this.properties.z_position = this.properties.positionPoints.z[index].coor
            try {
                await this.$refs.geoMap.loadMap(
                    {
                        x: this.properties.x_position,
                        y: this.properties.y_position,
                        z: this.properties.z_position
                    },
                    true
                )
            } catch (e) {
                console.log(e)
                this.$message.error('Cannot load location in map')
            }
        },
        async loadMapFirst() {
            try {
                await this.$refs.geoMap.loadMap(undefined, false)
            } catch (e) {
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
            if (this.titleGeo == 'Add coordinate') {
                if (this.geoChosen.x == '' || this.geoChosen.y == '') {
                    this.$message.error("X or Y cannot be null or empty")
                } else {
                    try {
                        this.properties.positionPoints.x.push(
                            {
                                id: '',
                                coor: JSON.parse(JSON.stringify(this.geoChosen.x))
                            }
                        )
                        this.properties.positionPoints.y.push(
                            {
                                id: '',
                                coor: JSON.parse(JSON.stringify(this.geoChosen.y))
                            }
                        )
                        this.properties.positionPoints.z.push(
                            {
                                id: '',
                                coor: JSON.parse(JSON.stringify(this.geoChosen.z))
                            }
                        )
                        this.$message.success("Insert coordinate successful")
                        this.signAddGeo = false
                    } catch (e) {
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
                } catch (e) {
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
                } catch (e) {
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
                if (this.$refs.geoMap) {
                    this.$refs.geoMap.reloadMap()
                }
            } catch (e) {
                console.log(e)
                this.$message.error('Cannot load location in map')
            }
        }
    },
}
</script>

<style lang="scss" scoped>
.sub-view {
    display: flex;
    flex-direction: column;
    padding: 0 4px 16px;
}

.sub-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 20px;
    margin-top: 14px;
}

.col-content {
    min-width: 0;
}

.sub-col-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.sub-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.sub-col-stack .sub-comment-card {
    flex: 1;
}

.sub-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
}

.sub-header i {
    color: #909399;
}

.sub-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px;
}

/* Tiêu đề nhóm nhỏ trong card (Type / Location) */
.sub-section {
    margin: 6px 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e4e7ed;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
}

.sub-comment-form,
.sub-comment-input,
.sub-comment-input ::v-deep(.el-textarea__inner) {
    height: 100%;
}

.sub-comment-form {
    display: flex;
    flex: 1;
}

.sub-comment-input ::v-deep(.el-textarea__inner) {
    min-height: 120px !important;
    resize: vertical;
}

::v-deep(.sub-attach-card) {
    min-height: 310px;
}

.sub-geo-map {
    margin-top: 12px;
}

::v-deep(.el-select),
::v-deep(.el-input),
::v-deep(.el-textarea) {
    width: 100%;
}

::v-deep(.el-form-item) {
    margin-bottom: 10px;
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
    color: #303133;
}

::v-deep(.el-input__inner),
::v-deep(.el-select .el-input__inner) {
    width: 100%;
    font-size: 12px !important;
    height: 32px;
    line-height: 32px;
}

.option-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.icons {
    display: flex;
    gap: 8px;
}

.geo-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
}

.geo-select {
    flex: 1;
}

.geo-add-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
}

.geo-add-btn i {
    font-size: 14px;
    line-height: 1;
}

::v-deep(.custom-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

::v-deep(.custom-footer .footer-btn) {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100px;
}

::v-deep(.sub-geo-dialog) {
    box-sizing: border-box;
}

::v-deep(.sub-geo-dialog.el-dialog) {
    width: 92%;
    max-width: 520px;
    margin-top: 8vh !important;
    border-radius: 6px;
    max-height: 90vh;
    height: auto !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

::v-deep(.sub-geo-dialog .el-dialog__body) {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

::v-deep(.sub-geo-dialog .el-dialog__body::-webkit-scrollbar) {
    width: 0px;
    height: 0px;
}

::v-deep(.sub-geo-dialog .el-dialog__footer) {
    padding: 10px 20px;
    border-top: 1px solid #ebeef5;
}

::v-deep(.el-dialog .el-form-item__label) {
    word-break: normal !important;
    overflow-wrap: break-word;
    white-space: normal;
}

@media (max-width: 767px) {
    .sub-view {
        padding: 0 0 12px;
    }

    .sub-row {
        gap: 10px;
        margin-top: 10px;
    }

    .sub-header {
        padding: 8px 10px;
    }

    .sub-body {
        padding: 10px;
    }

    ::v-deep(.el-form-item) {
        display: block;
    }

    ::v-deep(.el-form-item__label) {
        float: none;
        display: block;
        width: 100% !important;
        margin-left: 0 !important;
        padding: 0 0 4px;
        text-align: left;
    }

    ::v-deep(.el-form-item__content) {
        width: 100%;
        margin-left: 0 !important;
    }

    ::v-deep(.custom-footer) {
        justify-content: center;
    }
}
</style>
