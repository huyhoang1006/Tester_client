<template>
    <div id="properties" class="vt-property-wrap">
        <div class="vt-row property">
            <div class="col-content">
                <section class="vt-card">
                    <div class="vt-header">
                        <i class="fa-solid fa-box"></i>
                        <span>Properties</span>
                    </div>
                    <div class="vt-body">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Asset">
                                <el-select v-model="propertiesData.kind" placeholder="Select asset">
                                    <el-option label="Voltage transformer" value="Voltage transformer"> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Asset type">
                                <el-select v-model="propertiesData.asset_type" placeholder="Select asset type">
                                    <el-option label="IVT" value="IVT"> </el-option>
                                    <el-option label="CVT / CCVT" value="CVTCCTV"> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Serial no.">
                                <el-input v-model="propertiesData.serial_no"></el-input>
                            </el-form-item>
                            <el-form-item label="Manufacturer">
                                <el-select filterable v-model="propertiesData.manufacturer">
                                    <el-option v-for="item in manufacturerList" :label="item" :key="item" :value=item> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Manufacturer type">
                                <el-input v-model="propertiesData.manufacturer_type"></el-input>
                            </el-form-item>
                            <el-form-item label="Manufacturing year">
                                <el-input type="text" number="year" v-model="propertiesData.manufacturing_year"></el-input>
                            </el-form-item>
                            <el-form-item label="Country of origin">
                                <el-select filterable v-model="propertiesData.country_of_origin">
                                    <el-option v-for="item in countryData" :key="item" :label="item" :value="item"> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Asset ID">
                                <el-input v-model="propertiesData.apparatus_id"></el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </section>
            </div>
            <div class="col-content">
                <section class="vt-card vt-comment-card">
                    <div class="vt-header">
                        <i class="fa-solid fa-align-left"></i>
                        <span>Comment</span>
                    </div>
                    <div class="vt-body">
                        <el-form :label-width="labelWidth" size="mini" label-position="left" class="vt-comment-form">
                            <el-input class="vt-comment-input" type="textarea" v-model="propertiesData.comment"></el-input>
                        </el-form>
                    </div>
                </section>
            </div>
        </div>
        <div class="vt-row property">
            <div class="col-content">
                <slot name="side-top"></slot>
            </div>
            <div class="col-content">
                <Attachment class="vt-attach-card" :attachment_="this.attachmentData" title="circuit" height="230px"
                    @data-attachment="getDataAttachment"></Attachment>
            </div>
        </div>
    </div>
</template>

<script>
import { country } from '@/views/ConstantAsset/index'
import Attachment from '@/views/Common/Attachment.vue'
import MANUFACTURER_MAP from '@/views/ConstantAsset/manufacturer';


export default {
    name: 'voltageTransProperty',
    components: {
        Attachment
    },
    props: {
        properties: {
            type: Object,
            require: true,
        },
        manufact: {
            require: true,
        },
        title: {
            require: true
        },
        updateNew: {
            require: true
        },
        update: {
            require: true
        },
        attachment: {
            type: Array,
            default: () => []
        },
    },
    data() {
        return {
            labelWidth: `120px`,
            countryData: country.default,
            manufacturerCurrent: '',
            sign: '',
            manufacturerPast: '',
            manufacturerList: MANUFACTURER_MAP['VoltageTransformerDto'],
            manufacturerListAll: [],
            itemUpdate: '',
            attachmentData: []
        }
    },
    methods: {
        createNew(data) {
            if (data == 'Create new') {
                this.propertiesData.manufacturer = JSON.parse(JSON.stringify(this.manufacturerCurrent))
                this.$emit('createAdd', true)
            }
            if (this.sign == "past") {
                this.propertiesData.manufacturer = JSON.parse(JSON.stringify(this.manufacturerPast))
                this.sign = ''
            }
        },
        deleteManu(item) {
            this.sign = 'past'
            this.$confirm('This will delete this manufacturer. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(async () => {
                let rs = await window.electronAPI.getManufacturerByName(item)
                if (rs.success && rs.data.length != 0) {
                    var dataType = rs.data[0].type.split(',')
                    if (dataType.includes(this.title)) {
                        if (dataType.length == 1) {
                            const rt = await window.electronAPI.deleteManufacturerByName(item)
                            if (rt.success) {
                                this.$message.success("Delete completed")
                                if (this.propertiesData.manufacturer == item) {
                                    this.propertiesData.manufacturer = ''
                                    this.sign = ''
                                }
                            } else {
                                this.$message.error(); ("Delete cannot be done")
                            }
                        } else {
                            var newType = dataType.filter(e => e != this.title).join(",")
                            const rt = await window.electronAPI.updateManufacturerByName(item, { type: newType })
                            if (rt.success) {
                                this.$message.success("Delete completed")
                                if (this.propertiesData.manufacturer == item) {
                                    this.propertiesData.manufacturer = ''
                                    this.sign = ''
                                }
                            } else {
                                this.$message.error(); ("Delete cannot be done")
                            }
                        }
                    }
                }
                this.$emit('reloadManu')

            }).catch(() => {
                return
            })
        },
        editManu(item) {
            this.itemUpdate = item
            this.sign = 'past'
            this.$emit('editManu', item)
        },
        getDataAttachment(rowData) {
            this.attachmentData = rowData
            this.$emit('update-attachment', this.attachmentData)
        },
        onChangeNumberOfPhase(val) {
            if (val === '3') {
                this.propertiesData.phase = ''
            }
        }
    },
    watch: {
        attachment: {
            deep: true,
            immediate: true,
            handler(val) {
                this.attachmentData = val
            },
        }
    },
    mounted() {
        this.manufacturerListAll = JSON.parse(JSON.stringify(this.manufact))
        this.countryData = country.default
    },
    computed: {
        propertiesData() {
            return this.properties
        }
    },
}
</script>

<style lang="scss" scoped>
.vt-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 20px;
    margin-top: 14px;
}

.col-content {
    min-width: 0;
}

.vt-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.vt-header {
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

.vt-header i {
    color: #909399;
}

.vt-body {
    flex: 1;
    padding: 12px;
}

.vt-comment-card,
.vt-attach-card,
::v-deep(.vt-media-card) {
    height: 310px;
}

::v-deep(.el-select),
::v-deep(.el-input),
::v-deep(.el-textarea) {
    width: 100%;
}

.vt-comment-form,
.vt-comment-input,
.vt-comment-input ::v-deep(.el-textarea__inner) {
    height: 100%;
}

.vt-comment-input ::v-deep(.el-textarea__inner) {
    min-height: 230px !important;
    resize: vertical;
}

::v-deep(.el-form-item) {
    margin-bottom: 10px;
}

::v-deep(.el-input__inner),
::v-deep(.el-select .el-input__inner),
::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

@media (max-width: 991px) {
    .vt-card,
    .vt-comment-card,
    .vt-attach-card,
    ::v-deep(.vt-media-card) {
        height: auto;
    }
}

@media (max-width: 767px) {
    .vt-row {
        gap: 10px;
        margin-top: 10px;
    }

    .vt-header {
        padding: 8px 10px;
    }

    .vt-body {
        padding: 10px;
    }

    ::v-deep(.el-form-item) {
        display: block;
    }

    ::v-deep(.el-form-item__label) {
        width: 100%;
        text-align: left;
        margin-bottom: 4px;
    }

    ::v-deep(.el-form-item__content) {
        margin-left: 0 !important;
    }

    .vt-comment-input ::v-deep(.el-textarea__inner) {
        min-height: 120px !important;
    }
}
</style>
