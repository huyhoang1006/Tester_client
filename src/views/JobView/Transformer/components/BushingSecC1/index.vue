<template>
    <div id="bushing-sec-c1" style="width: 100%; font-size: 12px;">
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

        <table class="table-strip-input-data" style="width: 180%; font-size: 12px;">
            <thead>
                <tr>
                    <th class="no-col">No</th>
                    <th>Measurement</th>
                    <th>Test mode</th>
                    <th>V test (kV)</th>
                    <th>DF ref (%)</th>
                    <th>C ref (pF)</th>
                    <th>DF meas (%)</th>
                    <th>C meas (pF)</th>
                    <th>DF change</th>
                    <th>Δ C meas (%)</th>
                    <th class="assessment-col">Assessment</th>
                    <th>Condition indicator DF</th>
                    <th>Condition indicator C</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table" >
                    <tr :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.measurement.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.test_mode.value"></el-input>
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
                            <el-input size="mini" type="text" v-model="item.df_change.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.tri_c_meas.value"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment.value">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                                <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                            </el-select>
                            <span v-if="item.assessment.value==='Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                            <span v-else-if="item.assessment.value==='Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                        </td>
                        <td>
                            <el-input :class="nameColor(item.condition_indicator_df.value)" size="mini" type="text" v-model="item.condition_indicator_df.value"></el-input>
                        </td>
                        <td>
                            <el-input :class="nameColor(item.condition_indicator_c.value)" size="mini" type="text" v-model="item.condition_indicator_c.value"></el-input>
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
        <el-dialog append-to-body title="Assessment settings" :visible.sync="openAssessmentDialog" width="860px">
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog append-to-body title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="860px">
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'BushingSecC1',
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
        }
    },
    props: {
        data: {
            type: Object,
            required: true
        },
        asset: {
            type: Object,
            required: false,
            default: () => ({})
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
    methods: {
        add() {
            this.testData.table.push({
                measurement: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                test_mode: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'discrete'
                },
                test_voltage: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                df_ref: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                c_ref: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                df_meas: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                c_meas: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                df_change: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                tri_c_meas: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                assessment: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'discrete'
                },
                condition_indicator_df: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'discrete'
                },
                condition_indicator_c: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'discrete'
                }
            })
        },
        removeAll() {
            this.$confirm('This will delete all items. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                })
                .then( () => {
                    this.testData.table = []
                })
                .catch( () => {
                    // User cancelled, do nothing
                })
        },
        deleteTest(index) {
            this.testData.table.splice(index, 1)
        },
        addTest(index) {
            const data = {
                measurement: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                test_mode: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'discrete'
                },
                test_voltage: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                df_ref: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                c_ref: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                df_meas: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                c_meas: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                df_change: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                tri_c_meas: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'analog'
                },
                assessment: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'discrete'
                },
                condition_indicator_df: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'discrete'
                },
                condition_indicator_c: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'discrete'
                }
            }
            this.testData.table.splice(index+1, 0, data)
        },
        calculator() {
            this.$message.success('Calculating successfully')
        },
        clear() {
            this.testData.table.forEach((element) => {
                element.measurement = ''
                element.test_mode = ''
                element.test_voltage = ''
                element.df_ref = ''
                element.c_ref = ''
                element.df_meas = ''
                element.c_meas = ''
                element.df_change = ''
                element.tri_c_meas = ''
                element.assessment = ''
                element.condition_indicator_df = ''
                element.condition_indicator_c = ''
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

td, th {
    font-size: 12px;
}
</style>
