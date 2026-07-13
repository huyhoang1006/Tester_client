<template>
    <div id="properties" class="cap-property-wrap">
        <div class="cap-row property">
            <div class="col-content">
                <section class="cap-card">
                    <div class="cap-header">
                        <i class="fa-solid fa-box"></i>
                        <span>Properties</span>
                    </div>
                    <div class="cap-body">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Asset">
                                <el-select v-model="propertiesData.kind" placeholder="Select asset">
                                    <el-option label="Capacitor" value="Capacitor"> </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Asset type">
                                <el-input v-model="propertiesData.type"></el-input>
                            </el-form-item>
                            <el-form-item label="Serial no.">
                                <el-input v-model="propertiesData.serial_no"></el-input>
                            </el-form-item>
                            <el-form-item label="Manufacturer">
                                <el-select filterable v-model="propertiesData.manufacturer">
                                    <el-option v-for="item in manufacturerList" :label="item" :key="item" :value=item>
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
                        </el-form>
                    </div>
                </section>
            </div>
            <div class="col-content">
                <section class="cap-card cap-comment-card">
                    <div class="cap-header">
                        <i class="fa-solid fa-align-left"></i>
                        <span>Comment</span>
                    </div>
                    <div class="cap-body">
                        <el-form :label-width="labelWidth" size="mini" label-position="left" class="cap-comment-form">
                            <el-input class="cap-comment-input" type="textarea" v-model="propertiesData.comment"></el-input>
                        </el-form>
                    </div>
                </section>
            </div>
        </div>
        <div class="cap-row property">
            <div class="col-content">
                <slot name="side-top"></slot>
            </div>
            <div class="col-content">
                <Attachment class="cap-attach-card" :attachment_="this.attachmentData" title="capacitor" height="230px"
                    @data-attachment="getDataAttachment"></Attachment>
            </div>
        </div>
    </div>
</template>

<script>
import { country } from '@/views/ConstantAsset/index'
import Attachment from '@/views/Common/Attachment.vue'
export default {
    name: 'capacitorProperty',
    components: {
        Attachment,
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
            labelWidth: `120px`,
            countryData: [],
            manufacturerList: ['ABB', 'ABB Sécheron', 'ACEC', 'Mitsubishi Electric', 'Aditya Vidyut Appliances Ltd', 'AEG', 'Alstohm Savoisienne', 'Alstom',
                'ANSALDO', 'APEX', 'Areva', 'Areva Unido', 'Artrans - Los Conce', 'ASA Trafobau GmbH', 'ASEA', 'BBC', 'Bharat Bijilee Ltd.', 'Bharat Heavy Electricals, Ltd.',
                'BHEL', 'Crompton Greaves', 'DAIHEN', 'DELTA STAR', 'DIAMOND POWER INFRASTRUCTURE LIMITED', 'EBG', 'EFACEC', 'EEMC', 'electroputere', 'Elettromeccania colombo',
                'ELIN', 'ELTA', 'Emco Transformers Ltd.', 'Ferranti-Packard', 'Fuji Electric', 'FORTUNE ELECTRIC CO.,LTD.', 'FIRST PHILEC', 'FPE', 'Franco Transfo', 'GE PROLEC',
                'General Electric', 'Getra', 'HAMMOND', 'HAVEC', 'HAWKER SIDDELEY', 'HEM', 'Helmke', 'HICO', 'Hitachi Energy', 'HOWARD', 'HYOSUNG', 'Hyundai', 'IEM', 'Imefy', 'Italtrafo',
                'JAEPS', 'Jeumont-Schneider', 'JORDAN', 'JSHP', 'JSP', 'JST', 'KONČAR', 'Kuhlman', 'Leeper', 'Matelec', 'McGraw Edison', 'MF Trasformatori', 'MITSUBISHI', 'NGEF', 'OASA',
                'Ocrev', 'Oerlikon', 'OFFICINE TRANSFORMATORI ELECTRICI', 'Parsons Peebles', 'PAUWELS', 'Peebles', 'PENNSYLVANIA TRANSFORMER', 'SAVOISIENNE', 'Schneider Electric',
                'Schorch', 'SGB', 'Siemens', 'SMIT', 'TAMINI', 'TBEA', 'TELK', 'TIRONI', 'TOSHIBA', 'TRAFO UNION', 'UNIDO', 'VEE', 'Waukesha', 'Westinghouse', 'Wilson transformer',
                'ZTR'],
            attachmentData: [],
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
    },
    mounted() {
        this.countryData = country.default
    },
    computed: {
        propertiesData: function () {
            return this.data
        }
    },
}
</script>

<style lang="scss" scoped>
.cap-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 20px;
    margin-top: 14px;
}

.col-content {
    min-width: 0;
}

.cap-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.cap-header {
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

.cap-header i {
    color: #909399;
}

.cap-body {
    flex: 1;
    padding: 12px;
}

.cap-comment-card,
.cap-attach-card,
::v-deep(.cap-media-card) {
    height: 310px;
}

::v-deep(.el-select),
::v-deep(.el-input),
::v-deep(.el-textarea) {
    width: 100%;
}

.cap-comment-form,
.cap-comment-input,
.cap-comment-input ::v-deep(.el-textarea__inner) {
    height: 100%;
}

.cap-comment-input ::v-deep(.el-textarea__inner) {
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
    .cap-card,
    .cap-comment-card,
    .cap-attach-card,
    ::v-deep(.cap-media-card) {
        height: auto;
    }
}

@media (max-width: 767px) {
    .cap-row {
        gap: 10px;
        margin-top: 10px;
    }

    .cap-header {
        padding: 8px 10px;
    }

    .cap-body {
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

    .cap-comment-input ::v-deep(.el-textarea__inner) {
        min-height: 120px !important;
    }
}
</style>
