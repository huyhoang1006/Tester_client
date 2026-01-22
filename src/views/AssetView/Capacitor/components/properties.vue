<template>
    <div id="properties">
        <el-row :gutter="20" class="content">
            <el-col :xs="24" :md="12" class="col-content">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Properties</span>
                    <el-divider></el-divider>
                    <el-form-item label="Asset">
                        <el-select style="width: 100%" v-model="propertiesData.kind" placeholder="Select asset">
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
                        <el-select style="width: 100%;" filterable v-model="propertiesData.manufacturer">
                            <el-option v-for="item in manufacturerList" :label="item" :key="item" :value=item>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Manufacturer type">
                        <el-input v-model="propertiesData.manufacturer_type"></el-input>
                    </el-form-item>
                    <el-form-item label="Manufacturing year">
                        <el-input v-model="propertiesData.manufacturing_year"></el-input>
                    </el-form-item>
                    <el-form-item label="Country of origin">
                        <el-select style="width: 100%;" filterable v-model="propertiesData.country_of_origin">
                            <el-option v-for="item in countryData" :key="item" :label="item" :value="item"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Apparatus ID">
                        <el-input v-model="propertiesData.apparatus_id"></el-input>
                    </el-form-item>
                    <el-form-item label="Feeder">
                        <el-input v-model="propertiesData.feeder"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :xs="24" :md="12" class="col-content">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Comment</span>
                    <el-divider></el-divider>
                    <el-input type="textarea" :rows="5" v-model="propertiesData.comment"></el-input>
                    <Attachment height="120px"></Attachment>
                </el-form>
            </el-col>
        </el-row>
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
#asset {
    width: 100%;
    height: 100%;
}

table,
td,
th {
    border: 1px solid;
}

table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
}

th,
td {
    padding: 0px 10px;
    height: 30px;
}

.bolder {
    font-size: 12px;
}

@media (max-width: 991px) {
    ::v-deep(.col-content) {
        margin-bottom: 10px;
    }
}

@media (max-width: 767px) {
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
}
</style>