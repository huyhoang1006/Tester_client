<template>
    <div class="mgt-20 property">
        <div class="col-content">
            <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                <span class="bolder">Properties</span>
                <el-divider></el-divider>
                <el-form-item label="Asset">
                    <el-input style="width: 100%" disabled v-model="propertiesData.kind"></el-input>
                </el-form-item>
                <el-form-item label="Asset type">
                    <el-select @change="onChangeType" style="width: 100%" v-model="propertiesData.type" placeholder="Select asset type">
                        <el-option label="Two-winding" value="Two-winding"> </el-option>
                        <el-option label="Three-winding" value="Three-winding"> </el-option>
                        <el-option label="Auto w/ tert" value="Auto w/ tert"> </el-option>
                        <el-option label="Auto w/o tert" value="Auto w/o tert"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Serial no.">
                    <el-input v-model="propertiesData.serial_no"></el-input>
                </el-form-item>
                <el-form-item label="Manufacturer">
                    <el-select style="width: 100%;" filterable v-model="propertiesData.manufacturer">
                        <el-option v-for="item in manufacturerList" :label="item" :key="item" :value=item> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Manufacturer type">
                    <el-input v-model="propertiesData.manufacturer_type"></el-input>
                </el-form-item>
                <el-form-item label="Manufacturing year">
                    <el-input v-model="propertiesData.manufacturer_year"></el-input>
                </el-form-item>
                <el-form-item label="Country of origin">
                    <el-select style="width: 100%;" filterable v-model="propertiesData.country_of_origin" placeholder="Select country of origin">
                        <el-option v-for="item in countryData" :key="item" :label="item" :value="item"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Apparatus ID">
                    <el-input v-model="propertiesData.apparatus_id"></el-input>
                </el-form-item>
            </el-form>
        </div>
        <div class="col-content">
            <el-form :label-width="labelWidth" size="mini" label-position="left">
                <span class="bolder">Comment</span>
                <el-divider></el-divider>
                <el-input type="textarea" :rows="5" v-model="propertiesData.comment"></el-input>
            </el-form>
            <Attachment :attachment_="this.attachmentData" title="substation" height="120px" @data-attachment = "getDataAttachment"></Attachment>
        </div>
    </div>
</template>

<script>
import {country} from '@/views/ConstantAsset/index'
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
            countryData : country.default,
            manufacturerList : ['ABB', 'ABB Sécheron', 'ACEC', 'Mitsubishi Electric', 'Aditya Vidyut Appliances Ltd', 'AEG', 'Alstohm Savoisienne', 'Alstom',
        'ANSALDO', 'APEX', 'Areva', 'Areva Unido', 'Artrans - Los Conce', 'ASA Trafobau GmbH', 'ASEA', 'BBC', 'Bharat Bijilee Ltd.', 'Bharat Heavy Electricals, Ltd.',
        'BHEL', 'Crompton Greaves', 'DAIHEN', 'DELTA STAR', 'DIAMOND POWER INFRASTRUCTURE LIMITED', 'EBG', 'EFACEC', 'EEMC', 'electroputere', 'Elettromeccania colombo',
        'ELIN', 'ELTA', 'Emco Transformers Ltd.', 'Ferranti-Packard', 'Fuji Electric', 'FORTUNE ELECTRIC CO.,LTD.', 'FIRST PHILEC', 'FPE', 'Franco Transfo', 'GE PROLEC',
        'General Electric','Getra', 'HAMMOND', 'HAVEC', 'HAWKER SIDDELEY', 'HEM', 'Helmke', 'HICO', 'Hitachi Energy', 'HOWARD', 'HYOSUNG', 'Hyundai', 'IEM', 'Imefy', 'Italtrafo',
        'JAEPS', 'Jeumont-Schneider', 'JORDAN', 'JSHP', 'JSP', 'JST', 'KONČAR', 'Kuhlman', 'Leeper', 'Matelec', 'McGraw Edison', 'MF Trasformatori', 'MITSUBISHI', 'NGEF', 'OASA',
        'Ocrev', 'Oerlikon', 'OFFICINE TRANSFORMATORI ELECTRICI', 'Parsons Peebles', 'PAUWELS', 'Peebles', 'PENNSYLVANIA TRANSFORMER', 'SAVOISIENNE', 'Schneider Electric', 
        'Schorch', 'SGB', 'Siemens', 'SMIT', 'TAMINI', 'TBEA', 'TELK', 'TIRONI', 'TOSHIBA', 'TRAFO UNION', 'UNIDO', 'VEE', 'Waukesha', 'Westinghouse', 'Wilson transformer',
        'ZTR'],
            attachmentData : [],
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
        onChangeType(value) {
            this.$emit('change-type', value)
        }
    }
}
</script>

<style lang="scss" scoped>
.col-content {
    width: 50%;
    box-sizing: border-box;
}
.property {
    width: 100%;
    display: flex;
    gap: 20px
}
</style>
