<template>
    <div id="properties" class="ct-property-wrap">
        <div class="ct-row property">
            <div class="col-content">
                <section class="ct-card">
                    <div class="ct-header">
                        <i class="fa-solid fa-box"></i>
                        <span>Properties</span>
                    </div>
                    <div class="ct-body">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Asset">
                                <el-select v-model="propertiesData.kind" placeholder="Select asset">
                                    <el-option label="Current transformer" value="Current transformer"> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Asset type">
                                <el-select v-model="propertiesData.asset_type" placeholder="Select asset type">
                                    <el-option label="Inductive" value="inductive"> </el-option>
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
                <section class="ct-card ct-comment-card">
                    <div class="ct-header">
                        <i class="fa-solid fa-align-left"></i>
                        <span>Comment</span>
                    </div>
                    <div class="ct-body">
                        <el-form :label-width="labelWidth" size="mini" label-position="left" class="ct-comment-form">
                            <el-input class="ct-comment-input" type="textarea" v-model="propertiesData.comment"></el-input>
                        </el-form>
                    </div>
                </section>
            </div>
        </div>
        <div class="ct-row property">
            <div class="col-content">
                <slot name="side-top"></slot>
            </div>
            <div class="col-content">
                <Attachment class="ct-attach-card" :attachment_="this.attachmentData" title="circuit" height="230px"
                    @data-attachment="getDataAttachment"></Attachment>
            </div>
        </div>
    </div>
</template>

<script>
import { country } from '@/views/ConstantAsset/index'
import Attachment from '@/views/Common/Attachment.vue'
import MANUFACTURER_MAP from '@/views/ConstantAsset/manufacturer.js'
export default {
    name: 'currentTransProperty',
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
            countryData: [],
            manufacturerCurrent: '',
            sign: '',
            manufacturerPast: '',
            manufacturerList: MANUFACTURER_MAP['CurrentTransformerDto'],
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
.ct-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 20px;
    margin-top: 14px;
}

.col-content {
    min-width: 0;
}

.ct-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.ct-header {
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

.ct-header i {
    color: #909399;
}

.ct-body {
    flex: 1;
    padding: 12px;
}

.ct-comment-card,
.ct-attach-card,
::v-deep(.ct-media-card) {
    height: 310px;
}

::v-deep(.el-select),
::v-deep(.el-input),
::v-deep(.el-textarea) {
    width: 100%;
}

.ct-comment-form,
.ct-comment-input,
.ct-comment-input ::v-deep(.el-textarea__inner) {
    height: 100%;
}

.ct-comment-input ::v-deep(.el-textarea__inner) {
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
    .ct-card,
    .ct-comment-card,
    .ct-attach-card,
    ::v-deep(.ct-media-card) {
        height: auto;
    }
}

@media (max-width: 767px) {
    .ct-row {
        gap: 10px;
        margin-top: 10px;
    }

    .ct-header {
        padding: 8px 10px;
    }

    .ct-body {
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

    .ct-comment-input ::v-deep(.el-textarea__inner) {
        min-height: 120px !important;
    }
}
</style>
