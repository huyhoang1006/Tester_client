<template>
    <div id="dc-winding-resistance-prim">

        <!-- Cấu hình -->
        <div style="position: sticky; left: 0; display: inline-block;">
        <el-row class="mgb-10">
            <el-col>
                <el-button class="btn-action" size="mini" type="success" @click="openAssessmentDialog = true">
                    <i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings
                </el-button>
                <el-button class="btn-action" size="mini" type="success" @click="openConditionIndicatorDialog = true">
                    <i class="fa-solid fa-hammer"></i> Condition indicatior settings
                </el-button>
            </el-col>
        </el-row>

        <!-- Tương tác với bảng -->
        <el-row class="mgb-10">
            <el-col>
                <el-button size="mini" type="primary" class="btn-action" @click="calculator" > <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all</el-button>
            </el-col>
        </el-row>
        </div>

        <table class="table-strip-input-data" style="width: 100% ; font-size: 12px;">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Upr (A)</th>
                    <th>Usr (A)</th>
                    <th>Ratio meas</th>
                    <th>Ratio dev</th>
                    <th>Polarity</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                        <td>
                            <el-input size="mini" type="text" v-model="item.name.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.upr.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.usr.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.ratio_meas.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.ratio_dev.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.polarity.value"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment.value">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                                <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                            </el-select>
                            <span v-if="item.assessment.value === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                            <span v-else-if="item.assessment.value === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                        </td>
                        <td>
                            <el-select :class="nameColor(item.condition_indicator.value)" id="condition" type="text"
                                size="mini" v-model="item.condition_indicator.value">
                                <el-option value="Good">Good</el-option>
                                <el-option value="Fair">Fair</el-option>
                                <el-option value="Poor">Poor</el-option>
                                <el-option value="Bad">Bad</el-option>
                            </el-select>
                        </td>
                        <td>
                            <el-button size="mini" type="primary" class="w-100" @click="addTest(index)">
                                <i class="fa-solid fa-plus"></i>
                            </el-button>
                        </td>
                        <td>
                            <el-button size="mini" type="danger" class="w-100" @click="deleteTest(index)">
                                <i class="fas fa-trash"></i>
                            </el-button>
                        </td>
                </tr>
            </tbody>
        </table>

        <!-- Assessment settings -->
        <el-dialog title="Assessment settings" :visible.sync="openAssessmentDialog" width="860px">
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="860px">
        </el-dialog>
    </div>
</template>

<script>
import voltageTransformerTestMap from '@/config/test-definitions/VoltageTransformer'
import * as common from '@/views/JobView/Common/index'

export default {
    name :"VTRatio",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
        }
    },
    mounted() {
        // Initialize table if needed
        this.$nextTick(() => {
            this.initializeTable()
        })
    },
    props: {
        data: {
            type: Object,
            require: true
        },
        asset: {
            type: Object,
            require: true
        }
    },
    computed: {
        testData() {
            return this.data
        },
        assetData() {
            return this.asset
        },
        rowData() {
            return common.buildEmptyTestRow(voltageTransformerTestMap['VTRatio'].columns)
        }
    },
    watch: {
        'testData.table': {
            immediate: true,
            handler: function (newVal) {
                // Convert array to object if needed (for backward compatibility)
                if (newVal && Array.isArray(newVal)) {
                    const tableObject = { table1: newVal }
                    this.$set(this.testData, 'table', tableObject)
                    return
                }
                
                // Initialize table if empty
                if (!newVal || (typeof newVal === 'object' && Object.keys(newVal).length === 0)) {
                    this.$nextTick(() => {
                        this.initializeTable()
                    })
                }
            }
        }
    },
    methods: {
        initializeTable() {
            if (!this.testData.table) {
                this.$set(this.testData, 'table', {})
            }
            
            if (Object.keys(this.testData.table).length === 0) {
                this.$set(this.testData.table, 'table1', [])
            }
            
            // Ensure table1 exists
            if (!this.testData.table.table1) {
                this.$set(this.testData.table, 'table1', [])
            }
        },
        add() {
            if (!this.testData.table.table1) {
                this.initializeTable()
            }
            this.testData.table.table1.push(
                JSON.parse(JSON.stringify(this.rowData))
            )
        },
        removeAll() {
            this.$confirm('This will delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                })
                .then( () => {
                    this.testData.table.table1 = []
                }
            )
        },
        deleteTest(index) {
            this.testData.table.table1.splice(index, 1)
        },
        addTest(index) {
            const data = JSON.parse(JSON.stringify(this.rowData))
            this.testData.table.table1.splice(index+1, 0, data)
        },

        autoCalculate(index) {
            // Auto calculate when ratio_meas, upr, or usr changes
            this.$nextTick(() => {
                if (this.testData.table.table1 && this.testData.table.table1[index]) {
                    const item = this.testData.table.table1[index]
                    
                    // Calculate ratio_dev
                    if(!isNaN(parseFloat(item.ratio_meas.value)) && item.ratio_meas.value != 0) {
                        if( !isNaN(item.upr.value) && !isNaN(item.usr.value) && item.usr.value != 0) {
                            item.ratio_dev.value = (100 * (parseFloat(item.ratio_meas.value) - (parseFloat(item.upr.value)/parseFloat(item.usr.value)))/(parseFloat(item.upr.value)/parseFloat(item.usr.value))).toFixed(4) 
                        } else if(!isNaN(parseFloat(item.upr.value)) && !isNaN(parseFloat(item.usr.value)) && item.usr.value != 0) {
                            item.ratio_dev.value = (100 * (parseFloat(item.ratio_meas.value) - (parseFloat(item.upr.value)/parseFloat(item.usr.value)))/(parseFloat(item.upr.value)/parseFloat(item.usr.value))).toFixed(4)
                        }
                    }
                }
            })
        },

        calculator() {
            this.calcRdev()
            this.$message.success('Calculating successfully')
        },

        calcRdev() {
            if (!this.testData.table.table1) {
                this.initializeTable()
                return
            }
            this.testData.table.table1.forEach(element => {
                if(!isNaN(parseFloat(element.ratio_meas.value)) && element.ratio_meas.value != 0) {
                    if( !isNaN(element.upr.value) && !isNaN(element.usr.value) && element.usr.value != 0) {
                        element.ratio_dev.value = (100 * (parseFloat(element.ratio_meas.value) - (parseFloat(element.upr.value)/parseFloat(element.usr.value)))/(parseFloat(element.upr.value)/parseFloat(element.usr.value))).toFixed(4) 
                    } else if(!isNaN(parseFloat(element.upr.value)) && !isNaN(parseFloat(element.usr.value)) && element.usr.value != 0) {
                        element.ratio_dev.value = (100 * (parseFloat(element.ratio_meas.value) - (parseFloat(element.upr.value)/parseFloat(element.usr.value)))/(parseFloat(element.upr.value)/parseFloat(element.usr.value))).toFixed(4)
                    }
                }
            })
        },

        clear() {
            if (!this.testData.table.table1) {
                this.initializeTable()
                return
            }
            this.testData.table.table1.forEach(row => {
                Object.keys(row).forEach(key => {
                    if (key === "mrid") return;
                    if (row[key] && typeof row[key] === "object" && "value" in row[key]) {
                        row[key].value = ""
                    }
                })
            })
        },
        nameColor(data) {
            if(data === this.$constant.GOOD) {
                return 'Good'
            }
            else if(data === this.$constant.FAIR) {
                return 'Fair'
            }
            else if(data === this.$constant.POOR) {
                return 'Poor'
            }
            else if(data === this.$constant.BAD) {
                return 'Bad'
            }
            else {
                return;
            }
        }
    }
}
</script>

<style lang="scss" scoped>
table, th, td, tr {
    white-space: nowrap;
}
.flex-container {
    display: flex;
    flex-direction: column;

    div {
        padding: 1px;
    }
}
.Good input {
    background: #00CC00;
}

.Fair input {
    background: #ffff00;
}

.Poor input {
    background: #ff9900;
}

.Bad input {
    background: #ff3300;
}
</style>
