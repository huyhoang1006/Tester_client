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

        <table class="table-strip-input-data" style="width: 150% ; font-size: 12px;">
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
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td>
                           {{ index + 1 }}
                    </td>
                    <td>
                            <div style="display: flex;width: 100%;">   
                                <el-input style="width: 80px;" size="mini" type="text" v-model="item.measurement.value"></el-input>
                                <div :class="{colorTableRed : index%3==0, colorTableYellow : index%3==1, colorTableBlue : index%3==2}"></div>
                            </div>
                    </td>
                    <td>
                            <el-select size="mini" v-model="item.test_mode.value">
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
                            <el-input size="mini" type="text" v-model="item.test_voltage.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.df_ref.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.c_ref.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.df_meas.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.c_meas.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.delta_c_percent.value"></el-input>
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
export default {
    name :"CTDfcap",
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
            return this.data
        },
        assetData() {
            return this.asset
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.initializeTable()
        })
    },
    watch: {
        'testData.table': {
            immediate: true,
            handler: function (newVal) {
                // Auto-convert old array structure to new object structure
                if (newVal && Array.isArray(newVal)) {
                    this.$set(this.testData, 'table', { table1: newVal })
                }
                // Initialize if empty
                if (!newVal || (typeof newVal === 'object' && !newVal.table1)) {
                    this.$nextTick(() => {
                        this.initializeTable()
                    })
                }
            }
        }
    },
    methods: {
        initializeTable() {
            if (!this.testData.table || (typeof this.testData.table === 'object' && !this.testData.table.table1)) {
                this.$set(this.testData, 'table', { table1: [] })
            }
        },
        add() {
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
                delta_c_percent : {
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
                    this.testData.table.table1 = []
                }
            )
        },
        deleteTest(index) {
            this.testData.table.table1.splice(index, 1)
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
                delta_c_percent : {
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
            this.testData.table.table1.splice(index+1, 0, data)
        },
        calculator() {
            this.calcDeltaC()
            this.$message.success('Calculating successfully')
        },
        calcDeltaC() {
            this.testData.table.table1.forEach(item => {
                if(!isNaN(parseFloat(item.c_ref.value)) && !isNaN(parseFloat(item.c_meas.value)) && item.c_ref.value != 0) {
                    item.delta_c_percent.value = (100 * (parseFloat(item.c_meas.value) - parseFloat(item.c_ref.value)) / parseFloat(item.c_ref.value)).toFixed(4)
                }
            })
        },
        clear() {
            this.testData.table.table1.forEach((element) => {
                element.measurement.value = "",
                element.test_mode.value = '',
                element.test_voltage.value = '',
                element.df_ref.value = '',
                element.c_ref.value = '',
                element.df_meas.value = '',
                element.c_meas.value = '',
                element.delta_c_percent.value = '',
                element.assessment.value = '',
                element.condition_indicator.value = ''
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
