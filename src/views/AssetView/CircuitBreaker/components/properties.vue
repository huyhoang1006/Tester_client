<template>
    <div style="font-size: 12px;" id="properties">
        <el-row :gutter="20">
            <el-col :span="12" class="col-content">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Properties</span>
                    <el-divider></el-divider>
                    <el-form-item label="Asset">
                        <el-select
                            style="width: 100%"
                            v-model="propertiesData.kind"
                            placeholder="Select asset">
                            <el-option label="Circuit breaker" value="Circuit breaker"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Asset type">
                        <el-select
                            style="width: 100%"
                            v-model="propertiesData.type"
                            placeholder="Select asset type">
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
                        <el-select style="width: 100%;" filterable v-model="propertiesData.country_of_origin">
                            <el-option v-for="item in countryData" :key="item" :label="item" :value="item"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Apparatus ID">
                        <el-input v-model="propertiesData.apparatus_id"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="12" class="col-content">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Comment</span>
                    <el-divider></el-divider>
                    <el-input type="textarea" :rows="5" v-model="propertiesData.comment"></el-input>
                    <Attachment :attachment_="this.attachmentData" title="circuit" height="120px" @data-attachment = "getDataAttachment"></Attachment>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import {country} from '@/views/ConstantAsset/index'
import Attachment from '@/views/Common/Attachment.vue'
export default {
    name: 'circuitBreakProperty',
    components : {
        Attachment
    },
    props : {
        properties: {
            type : Object,
            require : true,
        },
        title : {
            require : true
        },
    },
    data() {
        return {
            labelWidth : `150px`,
            countryData : country.default,
            manufacturerList : ['ABB', 'ALSTOM', 'General Electric', 'Mitsubishi Electric', 'Schneider Electric', 'Siemens', 'Toshiba', 'Westinghouse'],
            attachmentData : []
        }
    },
    methods: {
        getDataAttachment(rowData) {
            this.attachmentData = rowData
            this.$emit('update-attachment', this.attachmentData)
        },
    },        
    computed : {
        propertiesData() {
            return this.properties
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
</style>
