<template>
    <div>
        <el-row :gutter="20">
            <el-col :xs="24" :md="12">
                <div class="col-content">
                    <el-form :model="properties" :inline-message="true" :label-width="labelWidth" size="mini"
                        label-position="left">
                        <span class="bolder">Properties</span>
                        <el-divider class="thick-divider"></el-divider>
                        <el-form-item label="Organisation">
                        </el-form-item>
                        <el-form-item label="Name" class="custom-label">
                            <el-input v-model="properties.name"></el-input>
                        </el-form-item>
                        <el-form-item label="Tax code" class="custom-label">
                            <el-input v-model="properties.tax_code"></el-input>
                        </el-form-item>
                        <el-form-item label="Street" class="custom-label">
                            <el-input v-model="properties.street"></el-input>
                        </el-form-item>
                        <el-form-item label="Ward/ Commune" class="custom-label">
                            <el-input v-model="properties.ward_or_commune"></el-input>
                        </el-form-item>
                        <el-form-item label="District/ Town" class="custom-label">
                            <el-input v-model="properties.district_or_town"></el-input>
                        </el-form-item>
                        <el-form-item label="City" class="custom-label">
                            <el-input v-model="properties.city"></el-input>
                        </el-form-item>
                        <el-form-item label="State/ Province" class="custom-label">
                            <el-input v-model="properties.state_or_province"></el-input>
                        </el-form-item>
                        <el-form-item label="Country" class="custom-label">
                            <el-select style="width: 100%;" filterable v-model="properties.country">
                                <el-option v-for="item in countryData" :key="item" :label="item" :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Geo position x" class="custom-label geo-item">
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
                        <el-form-item label="Geo position y" class="custom-label geo-item">
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
                        <el-form-item label="Geo position z" class="custom-label geo-item">
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
                        <Transition>
                            <geo-map class="mgt-20" ref='geoMap' :locationGeo='{}'></geo-map>
                        </Transition>
                    </el-form>
                </div>
            </el-col>
            <el-col :xs="24" :md="12">
                <div class="col-content">
                    <el-form :label-width="labelWidth" size="mini" label-position="left">
                        <span class="bolder">Contact</span>
                        <el-divider></el-divider>
                        <el-form-item label="Phone number">
                            <el-input type="number" v-model="properties.phoneNumber"></el-input>
                        </el-form-item>
                        <el-form-item label="Fax">
                            <el-input type="number" v-model="properties.fax"></el-input>
                        </el-form-item>
                        <el-form-item label="Email">
                            <el-input v-model="properties.email"></el-input>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="col-content mgt-20">
                    <el-form :label-width="labelWidth" size="mini" label-position="left">
                        <span class="bolder">Comment </span>
                        <el-divider></el-divider>
                        <el-input type="textarea" rows="5" v-model="properties.comment"></el-input>
                        <Attachment :dataParent="this.properties" :deleteList="deleteList"
                            :attachment_="this.attachmentData" title="substation" height="120px"
                            @data-attachment="getDataAttachment"></Attachment>
                    </el-form>
                </div>
            </el-col>
        </el-row>
        <el-dialog :visible.sync="signAddGeo" :title="titleGeo" align-center :before-close="handleCloseGeo"
            :modal="true" append-to-body>
            <el-form :label-width="labelWidth" size="mini" label-position="left">
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
import GeoMap from '../Common/GeoMap.vue'
import { country } from '../ConstantAsset/index'

export default {
    components: {
        Attachment,
        GeoMap
    },
    name: 'OrganisationView',
    mixins: [mixin],
    props: {
        organisationId: {
            type: String,
            default: '00000000-0000-0000-0000-000000000000'
        },
        mode: {
            type: String,
            default: "add"
        },
        parent: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            geoChosen: {
                x: '',
                y: '',
                z: ''
            },
            saved: false,
            labelWidth: `150px`,
            indexGeo: '',
            signAddGeo: false,
            titleGeo: 'Add coordinate',
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
#location {
    width: fit-content;
}

.col-content {
    width: 100%
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

::v-deep(.el-input__inner) {
    height: 3.2vh !important;
    /* Đặt chiều cao */
}

.last-right-parent {
    position: relative;
    float: right;
}

.option-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.bolder {
    font-weight: bold;
    font-size: 12px;
}

.icons {
    display: flex;
    gap: 8px;
    /* Khoảng cách giữa các icon */
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
    width: 30px;
    height: 30px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.geo-add-btn i {
    font-size: 14px;
    line-height: 1;
}

::v-deep(.custom-footer) {
    display: flex;
    justify-content: space-between;
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
}

::v-deep(.el-dialog) {
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 35%;
}

::v-deep(el.dialog__body) {
    overflow-y: auto;
    flex: 1;
}

::v-deep(.el-dialog .el-form-item__label) {
    word-break: normal !important;
    overflow-wrap: break-word;
    white-space: normal;
}

@media (max-width: 991px) {
    .col-content {
        margin-bottom: 20px;
    }

    ::v-deep(.el-dialog) {
        width: 50%;
    }
}

@media (max-width: 767px) {
    ::v-deep(.el-form-item) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    ::v-deep(.el-form-item__label) {
        width: auto !important;
        margin-left: 0 !important;
        padding-bottom: 0;
        text-align: left;
    }

    ::v-deep(.el-form-item__content) {
        width: 100%;
        margin-left: 0 !important;
    }

    ::v-deep(.el-form-item.custom-label .el-form-item__label) {
        padding-left: 20px;
    }

    ::v-deep(.custom-footer) {
        flex-direction: column;
        align-items: stretch;
    }

    ::v-deep(.custom-footer .footer-btn) {
        width: 100%;
        margin: 0;
    }
}
</style>

<style>
.el-form-item.custom-label .el-form-item__label {
    margin-left: 20px;
    width: 130px !important;
    /* Đặt chiều rộng cố định cho nhãn */
    font-style: italic;
}
</style>