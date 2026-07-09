<template>
    <div class="bu-property-wrap">
        <el-row :gutter="20" class="bu-row property">
            <el-col :xs="24" :md="12" class="col-content">
                <section class="bu-card">
                    <div class="bu-header">
                        <i class="fa-solid fa-box"></i>
                        <span>Properties</span>
                    </div>
                    <div class="bu-body">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Asset">
                                <el-input disabled v-model="propertiesData.kind"></el-input>
                            </el-form-item>
                            <el-form-item label="Asset type">
                                <el-select v-model="propertiesData.type" placeholder="Select asset type">
                                    <el-option label="With potential tap" value="With potential tap"> </el-option>
                                    <el-option label="With test tap" value="With test tap"> </el-option>
                                    <el-option label="Without tap" value="Without tap"> </el-option>
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
                                <el-input type="text" number="year" v-model="propertiesData.manufacturer_year"></el-input>
                            </el-form-item>
                            <el-form-item label="Country of origin">
                                <el-select filterable v-model="propertiesData.country_of_origin" placeholder="Select country of origin">
                                    <el-option v-for="item in countryData" :key="item" :label="item" :value="item"> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Asset ID">
                                <el-input v-model="propertiesData.apparatus_id"></el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </section>
            </el-col>
            <el-col :xs="24" :md="12" class="col-content">
                <section class="bu-card bu-comment-card">
                    <div class="bu-header">
                        <i class="fa-solid fa-align-left"></i>
                        <span>Comment</span>
                    </div>
                    <div class="bu-body">
                        <el-form :label-width="labelWidth" size="mini" label-position="left" class="bu-comment-form">
                            <el-input class="bu-comment-input" type="textarea" v-model="propertiesData.comment"></el-input>
                        </el-form>
                    </div>
                </section>
            </el-col>
        </el-row>
        <el-row :gutter="20" class="bu-row property">
            <el-col :xs="24" :md="12" class="col-content">
                <slot name="side-top"></slot>
            </el-col>
            <el-col :xs="24" :md="12" class="col-content">
                <div class="bu-attachment">
                    <Attachment class="bu-media-card" :attachment_="this.attachmentData" title="substation" height="230px"
                        @data-attachment="getDataAttachment"></Attachment>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { country } from '@/views/ConstantAsset/index'
import MANUFACTURER_MAP from '@/views/ConstantAsset/manufacturer.js'
import Attachment from '@/views/Common/Attachment.vue'


export default {
    name: 'Property',
    components: {
        Attachment
    },
    props: {
        data: {
            type: Object,
            required: true,
            default() {
                return {}
            }
        },
        attachment: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {
            labelWidth: `${150}px`,
            countryData: country.default,
            manufacturerList: MANUFACTURER_MAP['BushingAssetDto'],
            attachmentData: [],
        }
    },
    watch: {
        attachment: {
            handler(newVal) {
                this.attachmentData = newVal
            },
            immediate: true
        }
    },
    computed: {
        propertiesData: function () {
            return this.data
        }
    },
    methods: {
        getDataAttachment(rowData) {
            this.attachmentData = rowData
            this.$emit('update-attachment', this.attachmentData)
        },
    }
}
</script>

<style lang="scss" scoped>
.bu-row {
    margin-top: 14px;
}
.bu-card {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    background: #fff;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
}
.bu-header {
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
.bu-header i {
    color: #909399;
}
.bu-body {
    padding: 12px;
    flex: 1;
}
.bu-attachment {
    margin-top: 0;
    height: 100%;
}
.bu-comment-card,
.bu-media-card,
::v-deep(.bushing-media-card) {
    height: 310px;
}

::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
    font-size: 12px !important;
}

::v-deep .el-select,
::v-deep .el-input,
::v-deep .el-textarea {
    width: 100%;
}

.bu-comment-form,
.bu-comment-input,
.bu-comment-input ::v-deep(.el-textarea__inner) {
    height: 100%;
}

.bu-comment-input ::v-deep(.el-textarea__inner) {
    min-height: 230px !important;
    resize: vertical;
}

::v-deep(.el-form-item) {
    margin-bottom: 10px;
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

@media (max-width: 991px) {
    ::v-deep(.col-content) {
        margin-bottom: 10px;
    }

    .bu-card,
    .bu-attachment,
    .bu-comment-card,
    .bu-media-card,
    ::v-deep(.bushing-media-card) {
        height: auto;
    }
}

@media (max-width: 767px) {
    .bu-row {
        margin-top: 10px;
    }

    .bu-header {
        padding: 8px 10px;
    }

    .bu-body {
        padding: 10px;
    }

    ::v-deep(.el-form-item) {
        flex-direction: column;
    }

    ::v-deep(.el-form-item__label) {
        float: none;
        width: 100% !important;
        text-align: left;
    }

    ::v-deep(.el-form-item__content) {
        margin-left: 0 !important;
    }

    .bu-comment-input ::v-deep(.el-textarea__inner) {
        min-height: 120px !important;
    }
}
</style>
