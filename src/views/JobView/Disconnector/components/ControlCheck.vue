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

        <table class="table-strip-input-data" style="width: 100%">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Measurement</th>
                    <th>Test mode</th>
                    <th>Test voltage (kV)</th>
                    <th>DF ref (%)</th>
                    <th>C ref (pF)</th>
                    <th>DF meas (%)</th>
                    <th>C meas (pF)</th>
                    <th>△C cal (%)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <template v-if="testData.table && testData.table.table1">
                    <tr v-for="(item, index) in testData.table.table1" :key="index">
                        <td>
                           {{ index + 1 }}
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.measurement.value" v-if="item.measurement"></el-input>
                        </td>
                        <td>
                            <el-select size="mini" v-model="item.test_mode.value" v-if="item.test_mode">
                                <el-option label="GST" value="GST"></el-option>
                                <el-option label="GSTg-A" value="GSTg-A"></el-option>
                                <el-option label="GSTg-B" value="GSTg-B"></el-option>
                                <el-option label="GSTg-A+B" value="GSTg-A+B"></el-option>
                                <el-option label="UST-A" value="UST-A"></el-option>
                                <el-option label="UST-B" value="UST-B"></el-option>
                                <el-option label="UST-A+B" value="UST-A+B"></el-option>
                            </el-select>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.test_voltage.value" v-if="item.test_voltage"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.df_ref.value" v-if="item.df_ref"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.c_ref.value" v-if="item.c_ref"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.df_meas.value" v-if="item.df_meas"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.c_meas.value" v-if="item.c_meas"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.c_cal.value" v-if="item.c_cal"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment.value" v-if="item.assessment">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                                <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                            </el-select>
                            <span v-if="item.assessment && item.assessment.value === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                            <span v-else-if="item.assessment && item.assessment.value === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                        </td>
                        <td>
                            <el-select :class="nameColor(item.condition_indicator && item.condition_indicator.value)" id="condition" type="text"
                                size="mini" v-model="item.condition_indicator.value" v-if="item.condition_indicator">
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
                </template>
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
export default {
    name :"ControlCheck",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
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
    computed: {
        testData() {
            return this.data || { table: { table1: [] } }
        },
        assetData() {
            return this.asset
        },
    },
    watch: {
    },
    methods: {
        add() {
            if (!this.testData.table) {
                this.testData.table = { table1: [] }
            }
            if (!this.testData.table.table1) {
                this.testData.table.table1 = []
            }
            this.testData.table.table1.push({
                mrid : "",
                measurement : {
                    mrid : "",
                    value : "C H-G",
                    unit : "",
                    type : "string"
                },
                test_mode : {
                    mrid : "",
                    value : "",
                    unit : "",
                    type : "string"
                },
                test_voltage : {
                    mrid : "",
                    value : "",
                    unit : "kV",
                    type : "analog"
                },
                df_ref : {
                    mrid : "",
                    value : "",
                    unit : "%",
                    type : "analog"
                },
                c_ref : {
                    mrid : "",
                    value : "",
                    unit : "pF",
                    type : "analog"
                },
                df_meas : {
                    mrid : "",
                    value : "",
                    unit : "%",
                    type : "analog"
                },
                c_meas : {
                    mrid : "",
                    value : "",
                    unit : "pF",
                    type : "analog"
                },
                c_cal : {
                    mrid : "",
                    value : "",
                    unit : "%",
                    type : "analog"
                },
                assessment : {
                    mrid : "",
                    value : "",
                    unit : "",
                    type : "discrete"
                },
                condition_indicator : {
                    mrid : "",
                    value : "",
                    unit : "",
                    type : "discrete"
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
                    if (this.testData.table && this.testData.table.table1) {
                        this.testData.table.table1 = []
                    }
                }
            )
        },
        deleteTest(index) {
            this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
            .then(async () => {
                if (this.testData.table && this.testData.table.table1) {
                    this.testData.table.table1.splice(index, 1)
                }
            })
            .catch(() => {})
        },
        addTest(index) {
            const data = {
                mrid : "",  
                measurement : {
                    mrid : "",
                    value : "C H-G",
                    unit : "",
                    type : "string"
                },
                test_mode : {
                    mrid : "",
                    value : "",
                    unit : "",
                    type : "string"
                },
                test_voltage : {
                    mrid : "",
                    value : "",
                    unit : "kV",
                    type : "analog"
                },
                df_ref : {
                    mrid : "",
                    value : "",
                    unit : "%",
                    type : "analog"
                },
                c_ref : {
                    mrid : "",
                    value : "",
                    unit : "pF",
                    type : "analog"
                },
                df_meas : {
                    mrid : "",
                    value : "",
                    unit : "%",
                    type : "analog"
                },
                c_meas : {
                    mrid : "",
                    value : "",
                    unit : "pF",
                    type : "analog"
                },
                c_cal : {
                    mrid : "",
                    value : "",
                    unit : "%",
                    type : "analog"
                },
                assessment : {
                    mrid : "",
                    value : "",
                    unit : "",
                    type : "discrete"
                },
                condition_indicator : {
                    mrid : "",
                    value : "",
                    unit : "",
                    type : "discrete"
                }
            }
            if (this.testData.table && this.testData.table.table1) {
                this.testData.table.table1.splice(index+1, 0, data)
            }
        },
        calculator() {
            this.$message.success('Calculating successfully')
        },

        clear() {
            if (this.testData.table && this.testData.table.table1) {
                this.testData.table.table1.forEach((element) => {
                    if (element.measurement) element.measurement.value = ""
                    if (element.test_mode) element.test_mode.value = ""
                    if (element.test_voltage) element.test_voltage.value = ""
                    if (element.df_ref) element.df_ref.value = ""
                    if (element.c_ref) element.c_ref.value = ""
                    if (element.df_meas) element.df_meas.value = ""
                    if (element.c_meas) element.c_meas.value = ""
                    if (element.c_cal) element.c_cal.value = ""
                    if (element.assessment) element.assessment.value = ""
                    if (element.condition_indicator) element.condition_indicator.value = ""
                })
            }
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
