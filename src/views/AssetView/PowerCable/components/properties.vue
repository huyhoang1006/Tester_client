<template>
    <div id="properties">
        <el-row :gutter="20" class="content">
            <el-col :span="12" class="col-content">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Properties</span>
                    <el-divider></el-divider>
                    <el-form-item label="Asset">
                        <el-select style="width: 100%" v-model="propertiesData.kind" placeholder="Select asset">
                            <el-option label="Power cable" value="Power cable"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Asset type">
                        <el-select style="width: 100%" v-model="propertiesData.type" placeholder="Select asset type">
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Serial no.">
                        <el-input v-model="propertiesData.serial_no"></el-input>
                    </el-form-item>
                    <el-form-item label="Manufacturer">
                        <el-select @change="createNew(propertiesData.manufacturer)" style="width: 100%;" filterable
                            v-model="propertiesData.manufacturer">
                            <el-option v-for="item in manufacturerList" :label="item" :key="item" :value=item>
                            </el-option>
                            <el-option v-for="item in manufacturerListAll" :key="item" :value=item> {{ item }} <i
                                    @click="deleteManu(item)" style="float: right; cursor: pointer;"
                                    class="fa-solid fa-trash"></i> <i @click="editManu(item)"
                                    style="float: right; margin-right: 10px; cursor: pointer;"
                                    class="fa-solid fa-pen-to-square"></i> </el-option>
                            <el-option
                                style="border-radius: 12px; background-color:#012596; margin: 10px; color: white;"
                                value="Create new"><i class="fa-solid fa-square-plus"
                                    style="margin-right: 10px;"></i>&lt; Create new ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Manufacturer type">
                        <el-input v-model="propertiesData.manufacturer_type"></el-input>
                    </el-form-item>
                    <el-form-item label="Manufacturing year">
                        <el-input v-model="propertiesData.manufacturing_year"></el-input>
                    </el-form-item>
                    <el-form-item label="Country of origin">
                        <el-select style="width: 100%;" filterable v-model="propertiesData.asset_system_code">
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
            <el-col :span="12" class="col-content">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Comment</span>
                    <el-divider></el-divider>
                    <el-input type="textarea" :rows="5" v-model="propertiesData.comment"></el-input>
                    <Attachment :attachment_="this.attachmentData" title="powerCable" height="120px"
                        @data-attachment="getDataAttachment"></Attachment>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { country } from '@/views/ConstantAsset/index'
import Attachment from '@/views/Common/Attachment.vue'
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
        manufact: {
            require: true,
        },
        title: {
            require: true
        },
        updateNew: {
            require: true
        },
        update: {
            require: true
        }
    },
    data() {
        return {
            labelWidth: `200px`,
            countryData: [],
            manufacturerCurrent: '',
            sign: '',
            manufacturerPast: '',
            manufacturerList: ['ABB', 'ALSTOM', 'General Electric', 'Mitsubishi Electric', 'Schneider Electric', 'Siemens', 'Toshiba', 'Westinghouse'],
            manufacturerListAll: [],
            itemUpdate: '',
            attachmentData: []
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
