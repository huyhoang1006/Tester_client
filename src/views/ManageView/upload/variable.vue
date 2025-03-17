<template>
<div style="width: 50%; overflow: visible;">
    <el-dialog
    :visible.sync="showVar_"
    title="Initialize variable"
    align-center
    :before-close="handleClose"
    class="ele"
    >
        <el-button size="mini" type="primary" plain @click="addRowTem"> <i class="fas fa-setting"></i>ADD ROW </el-button>
        <el-button size="mini" type="primary" plain @click="clearAll"> <i class="fas fa-setting"></i> CLEAR </el-button>
        <br>
        <br>
        <table class="table-strip-input-data" style="width: 100%; margin:auto">
            <thead>
                <tr>
                    <th style="width: 25%;">Name</th>
                    <th style="width: 25%">Categories</th>
                    <th style="width: 30%;">Feature</th>
                    <th style="width: 10%;"></th>
                    <th style="width: 10%;"></th>
                </tr>
            </thead>
            <tbody v-for="(item, index) in this.varible" :key="index">
                <tr>
                    <td><el-input size="mini" v-model="item.name"></el-input></td>
                    <td>
                        <el-select filterable @change="changeCategories(item.categories, index)" style="width: 100%;" size="mini" v-model="item.categories" class="m-2" placeholder="Select">
                            <el-option
                                v-for="value in list_categories"  
                                :key="value.value"
                                :label="value.label"
                                :value="value.value">
                            </el-option>
                        </el-select>
                    </td>
                    <td>
                        <el-select @change="changeFeature(index)" filterable style="width: 100%;" size="mini" v-model="item.feature" class="m-2" placeholder="Select">
                            <el-option
                                v-for="value in listFeature[index]"  
                                :key="value.value"
                                :label="value.label"
                                :value="value.value">
                            </el-option>
                        </el-select>
                    </td>
                    <td>
                        <el-button size="mini" type="danger" class="w-100" @click="deleteListTem(varible, index)">
                            <i class="fas fa-trash"></i>
                        </el-button>
                    </td>
                    <td>
                        <el-button size="mini" type="primary" class="w-100" @click="addRowTable(varible, index)">
                            <i class="fa-solid fa-plus"></i>
                        </el-button>
                    </td>
                </tr>
                <tr v-if="item.feature != '' && Object.keys(listColumn[index]).includes(item.feature)">
                    <td></td>
                    <td></td>
                    <td>
                        <el-select @change="changeColumnAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.columnAddr" class="m-2" placeholder="Select">
                            <el-option
                                v-for="value in listColumn[index][item.feature].columnAddr"  
                                :key="value.value"
                                :label="value.label"
                                :value="value.value">
                            </el-option>
                        </el-select>
                    </td>
                </tr>
                <tr v-if="item.columnAddr !== '' && !Object.keys(list_rowData).includes(item.columnAddr) && item.columnAddr !== 'comment'">
                    <td></td>
                    <td></td>
                    <td>
                        <el-input size="mini" v-model="item.rowAddr" >
                        </el-input>
                    </td>
                </tr>
                <tr v-if="item.columnAddr !== '' && Object.keys(list_rowData).includes(item.columnAddr) && item.columnAddr !== 'comment'">
                    <td></td>
                    <td></td>
                    <td>
                        <el-select filterable style="width: 100%;" size="mini" v-model="item.rowAddr" class="m-2" placeholder="Select">
                            <el-option
                                v-for="value in list_rowData[item.columnAddr].columnAddr"  
                                :key="value.value"
                                :label="value.label"
                                :value="value.value">
                            </el-option>
                        </el-select>
                    </td>
                </tr>
            </tbody>
        </table>
        <template #footer>
            <span class="dialog-footer footer">
                <el-button @click="handleClose()">Cancel</el-button>
                <el-button type="primary" @click="confirm()">
                Confirm
                </el-button>
            </span>
        </template>
    </el-dialog>
</div>
</template>

<script>

/* eslint-disable */
import list_categories from "./constant/listcategories"
import location from "./constant/location"
import transformer from "./constant/transformer"
import circuitBreaker from "./constant/circuitBreaker/circuitBreaker"
import operatingMechanism from "./constant/circuitBreaker/operatingMechanism"
import assessmentLimits from "./constant/circuitBreaker/AssessmentLimits"
import currentTrans from "./constant/currentTrans/currentTrans"
import transformerTable from "./constant/transformer/table"
import transformerJob from "./constant/transformer/transformerJob"
import transformerTest from "./constant/transformer/transformerTest"
import conditionData from "./constant/condition/conditon"
import tableTest from "./constant/transformer/tableTest"
import bushingData from "./constant/transformer/bushing"
import bushingTable from "./constant/transformer/bushingTable"
import tapChangerData from "./constant/transformer/tapChanger"
import tapChangerTable from "./constant/transformer/tapchangerTable"
import circuitBreakerData from "./constant/circuitBreaker/circuitBreakers"
import operatingMechanismTable from './constant/circuitBreaker/operatingMechanismTable'

export default {
    data() {
        return {
            listFeature : [],
            listColumn : [],
            transformerTable : transformerTable,
            varible : [],
            list_categories : list_categories,
            list_feature : [],
            list_columnData : [],
            list_rowData : conditionData,
            assets_list : [],
            jobs_list : [],
            tests_list : [],
            bushings_list : [],
            tap_changers_list : [],
        }
    },
    async beforeMount() {
    },
    props : {
        showVar : Boolean,
    },
    computed : {
        showVar_() {
            return this.showVar
        },
        getName() {
            return this.name
        }
    },
    methods : {
        handleClose() {
            this.$emit('variable-show', false)
        },
        addRowTem() {
            const row = {
                name: '',
                categories: '',
                feature: '',
                columnAddr: '',
                rowAddr: '',
                feature: '',
                address : [],
            }
            this.varible.push(row)
            this.listFeature.push([])
            this.listColumn.push([])
        },
        clearAll() {
            this.varible = []
        },
        deleteListTem( data ,index) {
            data.splice(index, 1)
            this.listFeature.splice(index,1)
            this.listColumn.splice(index,1)
        },
        addRowTable(data, index) {
            const row = {
                name: '',
                categories: '',
                feature: '',
                columnAddr: '',
                rowAddr: '',
                address : []
            }
            data.splice(index+1, 0, row)
            this.listFeature.splice(index+1, 0, [])
            this.listColumn.splice(index+1, 0, [])
        },
        changeFeature(index) {
            this.varible[index].columnAddr = ''
            this.varible[index].rowAddr = ''
        },
        changeColumnAddr(index) {
            this.varible[index].rowAddr = ''
        },
        changeCategories(data, index) {
           if(data === 'locations') {
                this.listFeature[index] = location
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
           }
           else if(data === 'Transformer') {
                this.listFeature[index] = transformer
                this.listColumn[index] = transformerTable
           }
           else if(data === 'Transformer job') {
                this.listFeature[index] = transformerJob
           }
           else if(data === 'Transformer test') {
                this.listFeature[index] = transformerTest
                this.listColumn[index] = tableTest
           }
           else if(data === 'Circuit breaker') {
                this.listFeature[index] = circuitBreaker
                this.listColumn[index] = circuitBreakerData
           }
           else if(data === 'Circuit breaker operating mechanism') {
                this.listFeature[index] = operatingMechanism
                this.listColumn[index] = operatingMechanismTable
           }
           else if(data === 'Circuit breaker assessment limits') {
                this.listFeature[index] = assessmentLimits
           }
           else if(data === 'Current transformer') {
                this.listFeature[index] = currentTrans
           }
           else if(data === 'tap_changers') {
                this.listFeature[index] = tapChangerData
                this.listColumn[index] = tapChangerTable
            }
            else if(data === 'bushings') {
                this.listFeature[index] = bushingData
                this.listColumn[index] = bushingTable
            }
        },
        confirm() {
            this.$emit("variable-data",this.varible)
            this.$emit('variable-show', false)
        }
    }
}
</script>
<style>
.ele .el-dialog {
    height: auto;
    min-height: 50%;
}
.footer {
    position: absolute;
    right: 10px;
    bottom: 10px;
}
</style>