<template>
    <div id="dc-winding-resistance-prim">

        <!-- Cấu hình -->
        <div style="position: sticky; left: 0; display: inline-block; margin-top: 20px;">
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

        <table class="table-strip-input-data" style="width: 100%;">
            <thead>
                <tr>
                    <th>Phase</th>
                    <th :class="unitShow">Unit no.</th>
                    <th>V Test (kV)</th>
                    <th>I meas (mA)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table" :key="index">
                    <td>
                        <div style="display: flex;width: 100%; justify-content: flex-end;">   
                            <el-input v-if="index%(assetData.unit_count)==1" style="width: 50px;" size="mini" type="text" v-model="item.phase.value"></el-input>
                            <div :class="{colorTableRed : index%3==0, colorTableYellow : index%3==1, colorTableBlue : index%3==2}" style="min-height: 30px;"></div>
                        </div>
                    </td>
                    <td :class="unitShow">
                        <el-input size="mini" type="text" v-model="item.unit_no.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.test_voltage.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.i_meas.value"></el-input>
                    </td>
                    <td>
                        <el-select class="assessment" size="mini" v-model="item.assessment.value">
                            <el-option value="Pass" label="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail" label="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="item.assessment.value === 'Pass' " class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="item.assessment.value === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                    </td>
                    <td>
                        <el-input :class="nameColor(item.condition_indicator)" id="condition" type="text" size="mini" v-model="item.condition_indicator.value">
                        </el-input>
                    </td>
                    <td :rowspan="assetData.unit_count" v-if="index%(assetData.unit_count)==0">
                        <el-button size="mini" type="primary" class="w-100" @click="addTest(index)">
                            <i class="fa-solid fa-plus"></i>
                        </el-button>
                    </td>
                    <td :rowspan="assetData.unit_count" v-if="index%(assetData.unit_count)==0">
                        <el-button size="mini" type="danger" class="w-100" @click="deleteTest(index)">
                            <i class="fas fa-trash"></i>
                        </el-button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Assessment settings -->
        <el-dialog :modal="false" title="Assessment settings" :visible.sync="openAssessmentDialog" width="860px">
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog :modal="false" title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="860px">
        </el-dialog>
    </div>
</template>

<script>
import surgeArresterTestMap from '@/config/test-definitions/SurgeArrester'
import * as common from '../../Common/index'
export default {
    name :"LeakageCurrent",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            unitShow : ''
        }
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
    beforeMount() {
        let units = this.assetData.unit_count
        if(units == 1 || units == '' || units == undefined) {
            this.unitShow = 'hideUnit'
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
            return common.buildEmptyTestRow(surgeArresterTestMap['LeakageCurrent'].columns)
        }
    },
    methods: {
        add() {
            for(let i=1 ; i<= this.assetData.unit_count; i++) {
                this.testData.table.push(JSON.parse(JSON.stringify(this.rowData)))
            }
        },
        removeAll() {
            this.$confirm('This will delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                })
                .then( () => {
                    this.testData.table = []
                }
            )
        },
        deleteTest(index) {
            this.testData.table.splice(index, this.assetData.unit_count)
        },
        addTest(index) {
            let units = this.assetData.unit_count
            for(let i=0 ; i< units; i++) {
                const data = JSON.parse(JSON.stringify(this.rowData))
                this.testData.table.splice(index+i+units, 0, data)
            }
        },
        calculator() {
            this.$message.success('Calculating successfully')
        },

        clear() {
            this.testData.table.forEach(row => {
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
.hideUnit {
    display:none;
}

td, th {
    font-size: 12px;
}
</style>
