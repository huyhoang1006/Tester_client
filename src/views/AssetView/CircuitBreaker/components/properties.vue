<template>
    <div id="properties" class="cb-property-wrap">
        <div class="cb-row property">
            <div class="col-content">
                <section class="cb-card">
                    <div class="cb-header">
                        <i class="fa-solid fa-box"></i>
                        <span>Properties</span>
                    </div>
                    <div class="cb-body">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Asset">
                                <el-select v-model="propertiesData.kind" placeholder="Select asset">
                                    <el-option label="Circuit breaker" value="Circuit breaker"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Asset type">
                                <el-select v-model="propertiesData.type" placeholder="Select asset type">
                                    <el-option label="Live tank SF6 breaker" value="LiveSF6"> </el-option>
                                    <el-option label="Minium oil breaker" value="MiniOil"> </el-option>
                                    <el-option label="Air-blast breaker" value="AirBlast"> </el-option>
                                    <el-option label="Dead tank SF6 breaker" value="DeadTankSF6"> </el-option>
                                    <el-option label="Dead tank oil breaker (OCB)" value="DeadTankOCB"> </el-option>
                                    <el-option label="Vacuum breaker" value="Vacuum"> </el-option>
                                    <el-option label="Generator circuit breaker (GCB)" value="GenCirGCB"> </el-option>
                                    <el-option label="Gas insulated switchgear (GIS)" value="GasInsuGIS"> </el-option>
                                    <el-option label="Miscellaneous" value="Miscell"> </el-option>
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
                <section class="cb-card cb-comment-card">
                    <div class="cb-header">
                        <i class="fa-solid fa-align-left"></i>
                        <span>Comment</span>
                    </div>
                    <div class="cb-body">
                        <el-form :label-width="labelWidth" size="mini" label-position="left" class="cb-comment-form">
                            <el-input class="cb-comment-input" type="textarea" v-model="propertiesData.comment"></el-input>
                        </el-form>
                    </div>
                </section>
            </div>
        </div>
        <div class="cb-row property">
            <div class="col-content">
                <slot name="side-top"></slot>
            </div>
            <div class="col-content">
                <Attachment class="cb-media-card" :attachment_="this.attachmentData" title="circuit" height="230px"
                    @data-attachment="getDataAttachment"></Attachment>
            </div>
        </div>
    </div>
</template>

<script>
import { country } from '@/views/ConstantAsset/index'
import Attachment from '@/views/Common/Attachment.vue'
import MANUFACTURER_MAP from '@/views/ConstantAsset/manufacturer'
export default {
    name: 'circuitBreakProperty',
    components: {
        Attachment 
    },
    props: {
        properties: {
            type: Object,
            require: true,
        },
        attachment: {
            type: Array,
            default: () => []
        },
        title: {
            require: true
        },
    },
    data() {
        return {
            labelWidth: `120px`,
            countryData: country.default,
            manufacturerList: MANUFACTURER_MAP['CircuitBreakerDto'],
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
.cb-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 20px;
    margin-top: 14px;
}

.col-content {
    min-width: 0;
}

.cb-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.cb-header {
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

.cb-header i {
    color: #909399;
}

.cb-body {
    flex: 1;
    padding: 12px;
}

.cb-comment-card,
.cb-media-card,
::v-deep(.circuit-media-card) {
    height: 310px;
}

::v-deep(.el-select),
::v-deep(.el-input),
::v-deep(.el-textarea) {
    width: 100%;
}

.cb-comment-form,
.cb-comment-input,
.cb-comment-input ::v-deep(.el-textarea__inner) {
    height: 100%;
}

.cb-comment-input ::v-deep(.el-textarea__inner) {
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
    .cb-card,
    .cb-comment-card,
    .cb-media-card,
    ::v-deep(.circuit-media-card) {
        height: auto;
    }
}

@media (max-width: 767px) {
    .cb-row {
        gap: 10px;
        margin-top: 10px;
    }
    .cb-header {
        padding: 8px 10px;
    }
    .cb-body {
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
    .cb-comment-input ::v-deep(.el-textarea__inner) {
        min-height: 120px !important;
    }
}
</style>
