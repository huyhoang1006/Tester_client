<template>
    <div id="dc-winding-resistance-prim">

        <div style="position: sticky; left: 0; display: inline-block;">
        <!-- Cấu hình -->
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

        <div class="table-static">
        <table class="table-strip-input-data" style="width: 80%">
            <thead>
                <tr>
                    <th>No</th>
                    <th>SF<sub>6</sub> pressure (MPa)</th>
                    <th>Alarm (MPa)</th>
                    <th>Lockout (MPa)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table.pressureGaugeTable">
                    <tr :key="index">
                        <td>
                           {{ index + 1 }}
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.sf6Pressure.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.alarm.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.lockout.value"></el-input>
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
                            <el-input :class="nameColor(item.condition_indicator.value)" id="condition" type="text" size="mini" v-model="item.condition_indicator.value">
                            </el-input>
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
                </template>
            </tbody>
        </table>
        </div>

        <!-- Assessment settings -->
        <el-dialog title="Assessment settings" :visible.sync="openAssessmentDialog" width="600px">
        </el-dialog>
    </div>
</template>

<script>
export default {
    name :"pressureGauge",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            asset_ : {}
        }
    },
    props: {
        data: {
            type: Object,
            require: true
        },
        asset : {
            type: Object,
            require: true
        }
    },
    computed: {
        testData() {
            return this.data
        },
        assetData() {
            if (!this.asset || !this.asset.assessmentLimits) {
                return {}
            }
            try {
                return JSON.parse(this.asset.assessmentLimits)
            } catch (error) {
                console.error('Error parsing assessmentLimits:', error)
                return {}
            }
        }
    },
    watch : {
        assetData : {
            deep : true,
            immediate : true,
            handler : function(newVal) {
                this.asset_ = newVal
            }
        }
    },
    methods: {
        add() {
            this.testData.table.pressureGaugeTable.push({
                mrid: '',
                sf6Pressure: {
                    mrid: '',
                    value: '',
                    unit: 'MPa',
                    type: 'analog'
                },
                alarm: {
                    mrid: '',
                    value: '',
                    unit: 'MPa',
                    type: 'analog'
                },
                lockout: {
                    mrid: '',
                    value: '',
                    unit: 'MPa',
                    type: 'analog'
                },
                assessment: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'discrete'
                },
                condition_indicator: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'discrete'
                }
            })
        },
        removeAll() {
            this.$confirm('This will delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                })
                .then( () => {
                    this.testData.table.pressureGaugeTable = []
                })
                .catch( () => {
                    // User cancelled, do nothing
                })
        },
        deleteTest(index) {
            this.testData.table.pressureGaugeTable.splice(index, 1)
        },
        addTest(index) {
            const data = {
                mrid: '',
                sf6Pressure: {
                    mrid: '',
                    value: '',
                    unit: 'MPa',
                    type: 'analog'
                },
                alarm: {
                    mrid: '',
                    value: '',
                    unit: 'MPa',
                    type: 'analog'
                },
                lockout: {
                    mrid: '',
                    value: '',
                    unit: 'MPa',
                    type: 'analog'
                },
                assessment: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'discrete'
                },
                condition_indicator: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'discrete'
                }
            }
            this.testData.table.pressureGaugeTable.splice(index+1, 0, data)
        },
        calculator() {          
            this.$message.success('Calculating successfully')
        },

        clear() {
            this.testData.table.pressureGaugeTable.forEach((element) => {
                element.sf6Pressure= '',
                element.alarm= '',
                element.lockout= '',
                element.assessment= '',
                element.condition_indicator= ''
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
