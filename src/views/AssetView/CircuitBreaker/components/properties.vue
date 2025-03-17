<template>
    <div id="properties">
        <el-row :gutter="20" class="content">
            <el-col :span="8" class="col-content">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Properties</span>
                    <el-divider></el-divider>
                    <el-form-item label="Asset">
                        <el-select
                            style="width: 100%"
                            v-model="propertiesData.asset"
                            placeholder="Select asset">
                            <el-option label="Circuit breaker" value="Circuit breaker"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Asset type">
                        <el-select
                            style="width: 100%"
                            v-model="propertiesData.asset_type"
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
                        <el-select @change="createNew(propertiesData.manufacturer)" style="width: 100%;" filterable v-model="propertiesData.manufacturer">
                            <el-option v-for="item in manufacturerList" :label="item" :key="item" :value=item> </el-option>
                            <el-option v-for="item in manufacturerListAll" :key="item" :value=item> {{ item }} <i @click="deleteManu(item)" style="float: right; cursor: pointer;" class="fa-solid fa-trash"></i> <i @click="editManu(item)" style="float: right; margin-right: 10px; cursor: pointer;" class="fa-solid fa-pen-to-square"></i> </el-option>
                            <el-option style="border-radius: 12px; background-color:#012596; margin: 10px; color: white;" value="Create new"><i class="fa-solid fa-square-plus" style="margin-right: 10px;"></i>&lt; Create new ></el-option>
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
            <el-col :span="8" class="col-content">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Comment</span>
                    <el-divider></el-divider>
                    <el-input type="textarea" :rows="14" v-model="propertiesData.comment"></el-input>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import {country} from '@/views/ConstantAsset/index'
export default {
    name: 'cirBreakProperty',
    props : {
        properties: {
            type : Object,
            require : true,
        },
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
            countryData : [],
            manufacturerCurrent : '',
            sign : '',
            manufacturerPast : '',
            manufacturerList : ['ABB', 'ALSTOM', 'General Electric', 'Mitsubishi Electric', 'Schneider Electric', 'Siemens', 'Toshiba', 'Westinghouse'],
            manufacturerListAll : [],
            itemUpdate : '',
        }
    },
    methods: {
        createNew(data) {
            if(data == 'Create new') {
                this.propertiesData.manufacturer = JSON.parse(JSON.stringify(this.manufacturerCurrent))
                this.$emit('createAdd', true)
            }
            if(this.sign == "past") {
                this.propertiesData.manufacturer = JSON.parse(JSON.stringify(this.manufacturerPast))
                this.sign = ''
            }
        },
        deleteManu(item) {
            this.sign ='past'
            this.$confirm('This will delete this manufacturer. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(async () => {
                let rs = await window.electronAPI.getManufacturerByName(item)
                if(rs.success && rs.data.length !=0) {
                    var dataType = rs.data[0].type.split(',')
                    if(dataType.includes(this.title)) {
                        if(dataType.length == 1) {
                            const rt = await window.electronAPI.deleteManufacturerByName(item)
                            if(rt.success) {
                                this.$message.success("Delete completed")
                                if(this.propertiesData.manufacturer == item) {
                                    this.propertiesData.manufacturer = ''
                                    this.sign = '' 
                                }
                            } else {
                                this.$message.error();("Delete cannot be done")  
                            }
                        } else {
                            var newType = dataType.filter(e => e != this.title).join(",")
                            const rt = await window.electronAPI.updateManufacturerByName(item, {type:newType})
                            if(rt.success) {
                                this.$message.success("Delete completed")
                                if(this.propertiesData.manufacturer == item) {
                                    this.propertiesData.manufacturer = ''
                                    this.sign = '' 
                                }
                            } else {
                                this.$message.error();("Delete cannot be done")  
                            } 
                        }
                    }
                }
                this.$emit('reloadManu')
                
            }).catch(() => {
                return
            })
        },
        editManu(item) {
            this.itemUpdate = item
            this.sign ='past'
            this.$emit('editManu', item)
        }
    },
    watch:{
        'propertiesData.manufacturer' : {
            handler(newVal, oldVal) {
                if(newVal == 'Create new') {
                    this.manufacturerCurrent = oldVal
                } else {
                    this.manufacturerCurrent = newVal
                }
                this.manufacturerPast = newVal
            },
        },
        manufact : {
            handler(newVal, oldVal) {
                if(JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
                    this.manufacturerListAll = newVal
                }
            },
            immediate : true,
            deep : true
        },
        update : {
            handler(newVal) {
                if(newVal == true) {
                    this.$emit('setUpdate', false)
                    if(this.itemUpdate == this.propertiesData.manufacturer) {
                        this.propertiesData.manufacturer = this.updateNew
                        this.sign = ''
                    }
                }
            },
            immediate : true,
            deep : true
        }
    },
    mounted() {
        this.manufacturerListAll = JSON.parse(JSON.stringify(this.manufact))
        this.countryData = country.default
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
