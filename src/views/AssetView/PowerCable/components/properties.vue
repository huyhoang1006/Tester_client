<template>
    <div id="properties" class="pc-property-wrap">
        <div class="pc-row property">
            <div class="col-content">
                <section class="pc-card">
                    <div class="pc-header">
                        <i class="fa-solid fa-box"></i>
                        <span>Properties</span>
                    </div>
                    <div class="pc-body">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Asset">
                                <el-select v-model="propertiesData.kind" placeholder="Select asset">
                                    <el-option label="Power cable" value="Power cable"> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Asset type">
                                <el-select v-model="propertiesData.type" placeholder="Select asset type">
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Serial no.">
                                <el-input v-model="propertiesData.serial_no"></el-input>
                            </el-form-item>
                            <el-form-item label="Manufacturer">
                                <el-select filterable v-model="propertiesData.manufacturer">
                                    <el-option v-for="item in manufacturerList" :label="item" :key="item" :value="item">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Manufacturer type">
                                <el-input v-model="propertiesData.manufacturer_type"></el-input>
                            </el-form-item>
                            <el-form-item label="Manufacturing year">
                                <el-input type="text" number="year" v-model="propertiesData.manufacturer_year"></el-input>
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
                <section class="pc-card pc-comment-card">
                    <div class="pc-header">
                        <i class="fa-solid fa-align-left"></i>
                        <span>Comment</span>
                    </div>
                    <div class="pc-body">
                        <el-form :label-width="labelWidth" size="mini" label-position="left" class="pc-comment-form">
                            <el-input class="pc-comment-input" type="textarea" v-model="propertiesData.comment"></el-input>
                        </el-form>
                    </div>
                </section>
            </div>
        </div>
        <div class="pc-row property">
            <div class="col-content">
                <slot name="side-top"></slot>
            </div>
            <div class="col-content">
                <Attachment class="pc-attach-card" :attachment_="this.attachmentData" title="powerCable" height="230px"
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
    name: 'powerCableProperty',
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
            manufacturerList: MANUFACTURER_MAP['PowerCableDTO'],
            attachmentData: []
        }
    },
    methods: {
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
    computed: {
        propertiesData() {
            return this.properties
        }
    },
}
</script>

<style lang="scss" scoped>
.pc-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 20px;
    margin-top: 14px;
}

.col-content {
    min-width: 0;
}

.pc-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.pc-header {
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

.pc-header i {
    color: #909399;
}

.pc-body {
    flex: 1;
    padding: 12px;
}

.pc-comment-card,
.pc-attach-card,
::v-deep(.pc-media-card) {
    height: 310px;
}

::v-deep(.el-select),
::v-deep(.el-input),
::v-deep(.el-textarea) {
    width: 100%;
}

.pc-comment-form,
.pc-comment-input,
.pc-comment-input ::v-deep(.el-textarea__inner) {
    height: 100%;
}

.pc-comment-input ::v-deep(.el-textarea__inner) {
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
    .pc-card,
    .pc-comment-card,
    .pc-attach-card,
    ::v-deep(.pc-media-card) {
        height: auto;
    }
}

@media (max-width: 767px) {
    .pc-row {
        gap: 10px;
        margin-top: 10px;
    }

    .pc-header {
        padding: 8px 10px;
    }

    .pc-body {
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

    .pc-comment-input ::v-deep(.el-textarea__inner) {
        min-height: 120px !important;
    }
}
</style>
