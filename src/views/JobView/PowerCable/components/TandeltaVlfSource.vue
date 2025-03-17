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
            <el-col :span="12">
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


        <table class="table-strip-input-data" style="width: 125%">
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
                <template v-for="(item, index) in testData.table">
                    <tr :key="index">
                        <td v-if="index%3 == 0" rowspan="3">
                           {{ index/3 + 1 }}
                        </td>
                        <td v-if="index%3 == 0" rowspan="3">
                            <el-input size="mini" type="text" v-model="item.measurement"></el-input>
                        </td>
                        <td>
                            {{ item.test_voltage_label }} U<sub>0</sub>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.test_voltage"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.capacitance"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.mtd"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.dtd_eachstep"></el-input>
                        </td>
                        <td v-if="index%3 == 0" rowspan="3">
                            <el-input size="mini" type="text" v-model="item.dtdu"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.tdts"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                                <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                            </el-select>
                            <span v-if="item.assessment === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                            <span v-else-if="item.assessment === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                        </td>
                        <td>
                            <el-input :class="nameColor(item.condition_indicator)" type="text" size="mini" v-model="item.condition_indicator">
                            </el-input>
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
    },
    watch: {
    },
    methods: {
        add() {
            for(let i=0; i<3; i++) {
                this.testData.table.push({
                    measurement : "",
                    test_voltage_label : (0.5 * (i+1)).toFixed(1),
                    test_voltage : '',
                    capacitance : '',
                    mtd : '',
                    dtd_eachstep : '',
                    dtdu : '',
                    tdts : '',
                    assessment : '',
                    condition_indicator : ''
                })
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

        /* eslint-disable */ 
        deleteTest(index) {
            for(let i=0; i<3; i++) {
                this.testData.table.splice(index, 1)
            }
        },
        addTest(index) {
            for(let i=0; i<3; i++) {
                let data = {
                    measurement : "",
                    test_voltage_label : (0.5 * (i+1)).toFixed(1),
                    test_voltage : '',
                    capacitance : '',
                    mtd : '',
                    dtd_eachstep : '',
                    dtdu : '',
                    tdts : '',
                    assessment : '',
                    condition_indicator : ''
                }
                this.testData.table.splice(index+3 + i, 0, data)
            }
        },
        calculator() {
            this.$message.success('Calculating successfully')
        },

        clear() {
            this.testData.table.forEach((element) => {
                element.measurement = "",
                element.test_voltage_label = "",
                element.test_voltage = '',
                element.capacitance = '',
                element.mtd = '',
                element.dtd_eachstep = '',
                element.dtdu = '',
                element.tdts = '',
                element.assessment = '',
                element.condition_indicator = ''
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
