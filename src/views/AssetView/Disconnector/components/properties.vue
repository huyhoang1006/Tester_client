<template>
    <div id="properties" class="ds-property-wrap">
        <div class="ds-row property">
            <div class="col-content">
                <section class="ds-card">
                    <div class="ds-header">
                        <i class="fa-solid fa-box"></i>
                        <span>Properties</span>
                    </div>
                    <div class="ds-body">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Asset">
                                <el-select v-model="propertiesData.kind" placeholder="Select asset">
                                    <el-option label="Disconnector" value="Disconnector"> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Asset type">
                                <el-select v-model="propertiesData.type" placeholder="Select asset type">
                                    <el-option label="Center-break disconnector" value="centerBreak"> </el-option>
                                    <el-option label="Double-break disconnector" value="doubleBreak"> </el-option>
                                    <el-option label="Horizontal knee disconnector" value="horizontalKnee"> </el-option>
                                    <el-option label="Pantograph disconnector" value="pantograph"> </el-option>
                                    <el-option label="Vertical-break disconnector" value="verticalBreak"> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Serial no.">
                                <el-input v-model="propertiesData.serial_no"></el-input>
                            </el-form-item>
                            <el-form-item label="Manufacturer">
                                <el-select v-model="propertiesData.manufacturer" placeholder="Manufacturer" size="mini">
                                    <el-option v-for="m in manufacturerList" :key="m" :label="m" :value="m">
                                    </el-option>
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
                            <el-form-item label="Feeder">
                                <el-input v-model="propertiesData.feeder"></el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </section>
            </div>
            <div class="col-content">
                <section class="ds-card ds-comment-card">
                    <div class="ds-header">
                        <i class="fa-solid fa-align-left"></i>
                        <span>Comment</span>
                    </div>
                    <div class="ds-body">
                        <el-form :label-width="labelWidth" size="mini" label-position="left" class="ds-comment-form">
                            <el-input class="ds-comment-input" type="textarea" v-model="propertiesData.comment"></el-input>
                        </el-form>
                    </div>
                </section>
            </div>
        </div>
        <div class="ds-row property">
            <div class="col-content">
                <slot name="side-top"></slot>
            </div>
            <div class="col-content">
                <Attachment class="ds-attach-card" :attachment_="this.attachmentData" title="disconnector" height="230px"
                    @data-attachment="getDataAttachment"></Attachment>
            </div>
        </div>
    </div>
</template>

<script>
import { country } from '@/views/ConstantAsset/index'
import MANUFACTURER_MAP from '@/views/ConstantAsset/manufacturer'
import Attachment from '@/views/Common/Attachment.vue'

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
        title: {
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
            manufacturerList: MANUFACTURER_MAP['DisconnectorDTO'],
            attachmentData: []
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
    methods: {
        getDataAttachment(rowData) {
            this.attachmentData = rowData
            this.$emit('update-attachment', this.attachmentData)
        },
    },
    computed: {
        propertiesData() {
            return this.properties
        }
    },
}
</script>

<style lang="scss" scoped>
.ds-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 20px;
    margin-top: 14px;
}

.col-content {
    min-width: 0;
}

.ds-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.ds-header {
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

.ds-header i {
    color: #909399;
}

.ds-body {
    flex: 1;
    padding: 12px;
}

.ds-comment-card,
.ds-attach-card,
::v-deep(.ds-media-card) {
    height: 310px;
}

::v-deep(.el-select),
::v-deep(.el-input),
::v-deep(.el-textarea) {
    width: 100%;
}

.ds-comment-form,
.ds-comment-input,
.ds-comment-input ::v-deep(.el-textarea__inner) {
    height: 100%;
}

.ds-comment-input ::v-deep(.el-textarea__inner) {
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
    .ds-card,
    .ds-comment-card,
    .ds-attach-card,
    ::v-deep(.ds-media-card) {
        height: auto;
    }
}

@media (max-width: 767px) {
    .ds-row {
        gap: 10px;
        margin-top: 10px;
    }

    .ds-header {
        padding: 8px 10px;
    }

    .ds-body {
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

    .ds-comment-input ::v-deep(.el-textarea__inner) {
        min-height: 120px !important;
    }
}
</style>
