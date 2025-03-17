<template>
    <div id="asset">
        <div style="position: fixed; width: 100%; top: 38px; z-index: 1">
            <el-row id="top-bar">
                <el-col :span="24">
                    <el-button @click="backToManage" style="box-sizing: border-box; border-right: 1px solid #aeb6bf">
                        <i class="fa-solid fa-circle-arrow-left display-block fa-2x"></i>
                        <div class="mgt-10">Manage</div>
                    </el-button>
                    <el-button disabled>
                        <i class="fa-solid fa-floppy-disk display-block fa-2x"></i>
                        <div class="mgt-10">Save Asset</div>
                    </el-button>
                    <el-button @click="onCancel" style="box-sizing: border-box">
                        <i class="fa-solid fa-ban display-block fa-2x"></i>
                        <div class="mgt-10">Cancel</div>
                    </el-button>
                    <el-button style="float: right; text-align: right; width: fit-content; cursor: default">
                        <img src="@/assets/images/logo.png" style="max-height: 40px" />
                    </el-button>
                </el-col>
            </el-row>
        </div>
        <div style="margin-top: 100px;">
            <el-row :gutter="20" id="main-content" style=" padding: 0">
                <el-tabs type="card" class="w-100 h-100">
                    <el-tab-pane :label="propertiesData.asset">
                        <div id="properties">
                            <el-row :gutter="20" class="content">
                                <el-col :span="8" class="col-content">
                                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                                        <span class="bolder">Properties</span>
                                        <el-divider></el-divider>
                                        <el-form-item label="Asset">
                                            <el-select
                                                style="width: 100%"
                                                @change="changeAsset()"
                                                v-model="propertiesData.asset"
                                                placeholder="Select asset">
                                                <el-option label="<Select asset>" value="<Select asset>"> </el-option>
                                                <el-option label="Transformer" value="Transformer"> </el-option>
                                                <el-option label="Circuit breaker" value="Circuit breaker"> </el-option>
                                                <el-option label="Current transformer" value="Current transformer"> </el-option>
                                                <el-option label="Voltage transformer" value="Voltage transformer"> </el-option>
                                                <el-option label="Rotating machine" value="Rotating machine"> </el-option>
                                                <el-option label="Disconnector" value="Disconnector"> </el-option>
                                                <el-option label="Surge arrester" value="Surge arrester"> </el-option>
                                                <el-option label="Capacitor" value="Capacitor"> </el-option>
                                                <el-option label="Reactor" value="Reactor"> </el-option>
                                                <el-option label="Power cable" value="Power cable"></el-option>
                                            </el-select>
                                        </el-form-item>
                                        <el-form-item label="Asset type">
                                            <el-select
                                                disabled
                                                style="width: 100%"
                                                v-model="propertiesData.asset_type"
                                                placeholder="Select asset type">
                                            </el-select>
                                        </el-form-item>
                                        <el-form-item label="Serial no.">
                                            <el-input v-model="propertiesData.serial_no"></el-input>
                                        </el-form-item>
                                        <el-form-item label="Manufacturer">
                                            <el-input disabled v-model="propertiesData.manufacturer"></el-input>
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
                                <el-col :span="8" class="col-content">
                                    <el-form :label-width="labelWidth" size="mini" label-position="left">
                                        <span class="bolder">Comment</span>
                                        <el-divider></el-divider>
                                        <el-input type="textarea" :rows="14" v-model="propertiesData.comment"></el-input>
                                    </el-form>
                                </el-col>
                            </el-row>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-row>
        </div>
    </div>
</template>

<script>
import {country} from '../../ConstantAsset/index'

export default {
    name: 'AssetChoosen',
    data() {
        return {
            propertiesData: {
                asset : "<Select asset>",
                asset_type : "",
                serial_no : "",
                manufacturer : "",
                manufacturer_type : "",
                manufacturing_year : "",
                asset_system_code : "",
                apparatus_id : "",
                feeder : ""
            },
            labelWidth : `200px`,
            countryData : []
        }
    },

    mounted() {
        this.countryData = country.default
    },
    methods: {
        onCancel() {
            this.$router.go(-1)
        },
        backToManage() {
            this.$router.push({name: 'manage'})
        },
        changeAsset() {
            if(this.propertiesData.asset === "Transformer") {
                this.$router.push({name : "asset", query: {mode: 'add', dataProperty : this.propertiesData}})
            } else if(this.propertiesData.asset === "Circuit breaker") {
                this.$router.push({name: "circuit", query : {mode: 'add', dataProperty : this.propertiesData}})
            } else if(this.propertiesData.asset === "Current transformer") {
                this.$router.push({name: "currentTrans", query : {mode: 'add', dataProperty : this.propertiesData}})
            } else if(this.propertiesData.asset === "Voltage transformer") {
                this.$router.push({name: "voltageTrans", query : {mode: 'add', dataProperty : this.propertiesData}})
            } else if(this.propertiesData.asset === "Disconnector") {
                this.$router.push({name: "disconnector", query : {mode: 'add', dataProperty : this.propertiesData}})
            } else if(this.propertiesData.asset === "Surge arrester") {
                this.$router.push({name: "surgeArrester", query : {mode: 'add', dataProperty : this.propertiesData}})
            } else if(this.propertiesData.asset === "Power cable") {
                this.$router.push({name: "powerCable", query : {mode: 'add', dataProperty : this.propertiesData}})
            } 
        }
    }
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
