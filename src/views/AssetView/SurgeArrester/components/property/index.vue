<template>
    <div class="sa-property-wrap">
        <div class="sa-row property">
            <div class="col-content">
                <section class="sa-card">
                    <div class="sa-header">
                        <i class="fa-solid fa-box"></i>
                        <span>Properties</span>
                    </div>
                    <div class="sa-body">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Asset">
                                <el-input disabled v-model="propertiesData.kind"></el-input>
                            </el-form-item>
                            <el-form-item label="Asset type">
                                <el-select disabled v-model="propertiesData.type" placeholder="Select asset type">
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
                                <el-select filterable v-model="propertiesData.country_of_origin"
                                    placeholder="Select country of origin">
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
                <section class="sa-card sa-comment-card">
                    <div class="sa-header">
                        <i class="fa-solid fa-align-left"></i>
                        <span>Comment</span>
                    </div>
                    <div class="sa-body">
                        <el-form :label-width="labelWidth" size="mini" label-position="left" class="sa-comment-form">
                            <el-input class="sa-comment-input" type="textarea" v-model="propertiesData.comment"></el-input>
                        </el-form>
                    </div>
                </section>
            </div>
        </div>
        <div class="sa-row property">
            <div class="col-content">
                <slot name="side-top"></slot>
            </div>
            <div class="col-content">
                <Attachment class="sa-attach-card" :attachment_="this.attachmentData" title="substation" height="230px"
                    @data-attachment="getDataAttachment"></Attachment>
            </div>
        </div>
    </div>
</template>

<script>
import { country } from '@/views/ConstantAsset/index'
import Attachment from '@/views/Common/Attachment.vue'
import MANUFACTURER_MAP from '@/views/ConstantAsset/manufacturer.js';

export default {
    name: 'property',
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
            labelWidth: `${120}px`,
            countryData: country.default,
            manufacturerList: MANUFACTURER_MAP['SurgeArresterDto'],
            attachmentData: [],
        }
    },
    computed: {
        propertiesData: function () {
            return this.data
        }
    },
    watch: {
        attachment: {
            handler(newVal) {
                this.attachmentData = newVal
            },
            deep: true,
            immediate: true
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
    }
}
</script>

<style lang="scss" scoped>
.sa-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 20px;
    margin-top: 14px;
}

.col-content {
    min-width: 0;
}

.sa-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.sa-header {
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

.sa-header i {
    color: #909399;
}

.sa-body {
    flex: 1;
    padding: 12px;
}

.sa-comment-card,
.sa-attach-card,
::v-deep(.sa-media-card) {
    height: 310px;
}

::v-deep(.el-select),
::v-deep(.el-input),
::v-deep(.el-textarea) {
    width: 100%;
}

.sa-comment-form,
.sa-comment-input,
.sa-comment-input ::v-deep(.el-textarea__inner) {
    height: 100%;
}

.sa-comment-input ::v-deep(.el-textarea__inner) {
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
    .sa-card,
    .sa-comment-card,
    .sa-attach-card,
    ::v-deep(.sa-media-card) {
        height: auto;
    }
}

@media (max-width: 767px) {
    .sa-row {
        gap: 10px;
        margin-top: 10px;
    }

    .sa-header {
        padding: 8px 10px;
    }

    .sa-body {
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

    .sa-comment-input ::v-deep(.el-textarea__inner) {
        min-height: 120px !important;
    }
}
</style>
