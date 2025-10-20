<template>
    <div id="properties">
        <el-row :gutter="20" class="content">
            <el-col :span="12" class="col-content">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Properties</span>
                    <el-divider></el-divider>
                    <el-form-item label="Asset">
                        <el-select
                            style="width: 100%"
                            v-model="propertiesData.kind"
                            placeholder="Select asset">
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
                            <el-option v-for="item in manufacturerList" :label="item" :key="item" :value=item> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Manufacturer type">
                        <el-input v-model="propertiesData.manufacturer_type"></el-input>
                    </el-form-item>
                    <el-form-item label="Manufacturing year">
                        <el-input v-model="propertiesData.manufacturing_year"></el-input>
                    </el-form-item>
                    <el-form-item label="Asset system code">
                        <el-input v-model="propertiesData.country_of_origin"></el-input>
                    </el-form-item>
                    <el-form-item label="Apparatus ID">
                        <el-input v-model="propertiesData.apparatus_id"></el-input>
                    </el-form-item>
                    <el-form-item label="Feeder">
                        <el-input v-model="propertiesData.feeder"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="12" class="col-content">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Comment</span>
                    <el-divider></el-divider>
                    <el-input type="textarea" :rows="5" v-model="propertiesData.comment"></el-input>
                     <Attachment  height="120px" ></Attachment>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import {country} from '@/views/ConstantAsset/index'
import Attachment from '@/views/Common/Attachment.vue'
export default {
    name: 'capacitorProperty',
    components : {
        Attachment,
    },
    props : {
        manufact : {
            require : true,
        },
        title : {
            require : true
        },
        updateNew : {
            require : true
        },
        update : {
            require : true
        }
    },
    data() {
        return {
            labelWidth : `200px`,
            countryData : country.default,
            manufacturerList : ['ABB', 'ALSTOM', 'General Electric', 'Mitsubishi Electric', 'Schneider Electric', 'Siemens', 'Toshiba', 'Westinghouse'],
        }
    },
    methods: {
        getDataAttachment(rowData) {
            this.$parent.attachmentData = rowData
        },
    },
    computed : {
        propertiesData() {
            return this.$parent.capacitor?.properties || {}
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
</style>
