<template>
    <div class="mgt-20 property">
        <div class="col-content">
            <el-form :disabled="checkSide(this.signMode)" :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                <span class="bolder">Properties</span>
                <el-divider></el-divider>
                <el-form-item label="Asset">
                    <el-select :disabled="disabled" style="width: 100%" :default-first-option="true" v-model="propertiesData.asset" placeholder="Select asset type">
                        <el-option label="Transformer" value="Transformer"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Asset type">
                    <el-select style="width: 100%" v-model="propertiesData.asset_type" placeholder="Select asset type">
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
        </div>
        <div class="col-content">
            <el-form :disabled="checkSide(this.signMode)" :label-width="labelWidth" size="mini" label-position="left">
                <span class="bolder">Comment</span>
                <el-divider></el-divider>
                <el-input type="textarea" :rows="12" v-model="propertiesData.comment"></el-input>
            </el-form>
        </div>
    </div>
</template>

<script>
import {country} from '@/views/ConstantAsset/index' 

export default {
    name: 'Property',
    props: {
        data: {
            type: Object,
            required: true,
            default() {
                return {
                    id: '',
                    asset: '',
                    asset_type: '',
                    serial_no: '',
                    manufacturer: '',
                    manufacturer_type: '',
                    manufacturing_year: '',
                    asset_system_code: '',
                    apparatus_id: '',
                    feeder: '',
                    date_of_warehouse_receipt: '',
                    date_of_delivery: '',
                    date_of_production_order: '',
                    date_of_warehouse_delivery: '',
                    progress : '',
                    standard : '',
                    thermal_meter : '',
                    comment: '',
                    type_disable: ''
                }
            }
        },
        disabled : Boolean,
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
        },
        signMode : {
            required : true
        }
    },
    data() {
        return {
            labelWidth: `${200}px`,
            countryData : [],
            manufacturerCurrent : '',
            sign : '',
            manufacturerPast : '',
            manufacturerList : ['ABB', 'ABB Sécheron', 'ACEC', 'Mitsubishi Electric', 'Aditya Vidyut Appliances Ltd', 'AEG', 'Alstohm Savoisienne', 'Alstom',
        'ANSALDO', 'APEX', 'Areva', 'Areva Unido', 'Artrans - Los Conce', 'ASA Trafobau GmbH', 'ASEA', 'BBC', 'Bharat Bijilee Ltd.', 'Bharat Heavy Electricals, Ltd.',
        'BHEL', 'Crompton Greaves', 'DAIHEN', 'DELTA STAR', 'DIAMOND POWER INFRASTRUCTURE LIMITED', 'EBG', 'EFACEC', 'EEMC', 'electroputere', 'Elettromeccania colombo',
        'ELIN', 'ELTA', 'Emco Transformers Ltd.', 'Ferranti-Packard', 'Fuji Electric', 'FORTUNE ELECTRIC CO.,LTD.', 'FIRST PHILEC', 'FPE', 'Franco Transfo', 'GE PROLEC',
        'General Electric','Getra', 'HAMMOND', 'HAVEC', 'HAWKER SIDDELEY', 'HEM', 'Helmke', 'HICO', 'Hitachi Energy', 'HOWARD', 'HYOSUNG', 'Hyundai', 'IEM', 'Imefy', 'Italtrafo',
        'JAEPS', 'Jeumont-Schneider', 'JORDAN', 'JSHP', 'JSP', 'JST', 'KONČAR', 'Kuhlman', 'Leeper', 'Matelec', 'McGraw Edison', 'MF Trasformatori', 'MITSUBISHI', 'NGEF', 'OASA',
        'Ocrev', 'Oerlikon', 'OFFICINE TRANSFORMATORI ELECTRICI', 'Parsons Peebles', 'PAUWELS', 'Peebles', 'PENNSYLVANIA TRANSFORMER', 'SAVOISIENNE', 'Schneider Electric', 
        'Schorch', 'SGB', 'Siemens', 'SMIT', 'TAMINI', 'TBEA', 'TELK', 'TIRONI', 'TOSHIBA', 'TRAFO UNION', 'UNIDO', 'VEE', 'Waukesha', 'Westinghouse', 'Wilson transformer',
        'ZTR'],
            manufacturerListAll : [],
            checkpast : [],
            itemUpdate : '',
        }
    },
    computed: {
        propertiesData: function () {
            return this.data
        }
    },
    mounted() {
        this.manufacturerListAll = JSON.parse(JSON.stringify(this.manufact))
        this.countryData = country.default
    },
    /* eslint-disable */
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
        async editManu(item) {
            this.itemUpdate = item
            this.sign ='past'
            this.$emit('editManu', item)
        },
        checkSide(data) {
            if(data == 'server') {
                return true
            } else {
                return false
            }
        },
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
