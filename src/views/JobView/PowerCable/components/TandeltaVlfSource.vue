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

        <el-row class="mgb-10">
            <el-col :span="15">
                <span class="bolder">VLF settings</span>
                <el-divider></el-divider>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Frequency">
                                <el-input v-model="testData.vlfSetting.frequency">
                                    <template slot="append">Hz</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Waveform">
                                <el-select
                                style="width: 100%"
                                v-model="testData.vlfSetting.waveForm"
                                placeholder="Select">
                                    <el-option label="Sinusoidal" value="Sinusoidal"> </el-option>
                                    <el-option label="Cosine-Rectangular" value="Cosine-Rectangular"> </el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </el-col>
                    <el-col :span="12">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Test duration">
                                <el-input v-model="testData.vlfSetting.testDuration">
                                    <template slot="append">min</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Voltage display">
                                <el-select
                                style="width: 100%"
                                v-model="testData.vlfSetting.voltageDisplay"
                                placeholder="Select">
                                    <el-option label="rms" value="rms"> </el-option>
                                    <el-option label="peak" value="peak"> </el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>


        <table class="table-strip-input-data" style="width: 100% ; font-size: 12px;">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Measurement</th>
                    <th colspan="2">Test voltage (kV)</th>
                    <th>Capacitance (μF)</th>
                    <th>MTD [10<sup>-3</sup>]</th>
                    <th>ΔTD [10<sup>-3</sup>] (each step)</th>
                    <th>DTD [10<sup>-3</sup>] (0.5 U<sub>0</sub> & 1.5 U<sub>0</sub>)</th>
                    <th>TDTS [10<sup>-3</sup>]</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td v-if="index%3 == 0" rowspan="3">
                       {{ index/3 + 1 }}
                    </td>
                    <td v-if="index%3 == 0" rowspan="3">
                        <el-input size="mini" type="text" v-model="item.measurement.value"></el-input>
                    </td>
                    <td>
                        {{ item.test_voltage_label && item.test_voltage_label.value }} U<sub>0</sub>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.test_voltage.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.capacitance.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.mtd.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.delta_td_each_step.value"></el-input>
                    </td>
                    <td v-if="index%3 == 0" rowspan="3">
                        <el-input size="mini" type="text" v-model="item.tan_delta_dtd.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.tan_delta_tdts.value"></el-input>
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

                        <td v-if="index%3 == 0" rowspan="3">
                            <el-button size="mini" type="primary" class="w-100" @click="addTest(index)">
                                <i class="fa-solid fa-plus"></i>
                            </el-button>
                        </td>
                        <td v-if="index%3 == 0" rowspan="3">
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
import powerCableTestMap from '@/config/test-definitions/PowerCable'
import * as common from '../../Common/index'

export default {
    name :"TandeltaVlfSource",
    data() {
        return {
            labelWidth : "200px",
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
        rowData() {
            return common.buildEmptyTestRow(powerCableTestMap['TandeltaVlfSource'].columns)
        }
    },
    watch: {
        testData: {
            handler(newVal) {
                if (newVal && !newVal.vlfSetting) {
                    this.$set(newVal, 'vlfSetting', {
                        frequency: '',
                        waveForm: '',
                        testDuration: '',
                        voltageDisplay: ''
                    });
                }
            },
            immediate: true
        }
    },
    methods: {
        add() {
            if (!this.testData.table) {
                this.$set(this.testData, 'table', {});
            }
            if (!this.testData.table.table1) {
                this.$set(this.testData.table, 'table1', []);
            }
            
            // TandeltaVlfSource adds 3 rows at a time (0.5, 1.0, 1.5 voltage levels)
            for(let i=0; i<3; i++) {
                const rowData = JSON.parse(JSON.stringify(this.rowData))
                // Add voltage level label (not in config, but needed for display)
                rowData.test_voltage_label = {
                    mrid: "",
                    value: (0.5 * (i+1)).toFixed(1),
                    unit: "",
                    type: "string"
                }
                this.testData.table.table1.push(rowData)
            }
        },
        removeAll() {
            this.$confirm('This will delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                })
                .then( () => {
                    if (this.testData.table) {
                        this.testData.table.table1 = []
                    }
                }
            )
        },

        /* eslint-disable */ 
        deleteTest(index) {
            if (this.testData.table && this.testData.table.table1) {
                // Delete 3 rows at a time
                for(let i=0; i<3; i++) {
                    this.testData.table.table1.splice(index, 1)
                }
            }
        },
        addTest(index) {
            if (this.testData.table && this.testData.table.table1) {
                // Add 3 rows at a time
                for(let i=0; i<3; i++) {
                    const rowData = JSON.parse(JSON.stringify(this.rowData))
                    // Add voltage level label
                    rowData.test_voltage_label = {
                        mrid: "",
                        value: (0.5 * (i+1)).toFixed(1),
                        unit: "",
                        type: "string"
                    }
                    this.testData.table.table1.splice(index+3 + i, 0, rowData)
                }
            }
        },
        calculator() {
            this.$message.success('Calculating successfully')
        },

        clear() {
            if (this.testData.table && this.testData.table.table1) {
                this.testData.table.table1.forEach(row => {
                    Object.keys(row).forEach(key => {
                        if (key === "mrid") return;
                        if (row[key] && typeof row[key] === "object" && "value" in row[key]) {
                            row[key].value = ""
                        }
                    })
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
