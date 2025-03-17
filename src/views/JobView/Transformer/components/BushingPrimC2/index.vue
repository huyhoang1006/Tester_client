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
                <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i class="fas fa-circle-play"></i> Assess results</el-button>
                <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all </el-button>
            </el-col>
        </el-row>
        </div>

        <table class="table-strip-input-data">
            <thead>
                <tr>
                    <th class="no-col fix_width">No</th>
                    <th>Measurement</th>
                    <th>Test mode</th>
                    <th>V test (kV)</th>
                    <th>DF ref (%)</th>
                    <th>C ref (pF)</th>
                    <th>DF meas (%)</th>
                    <th>C meas (pF)</th>
                    <th>DF change</th>
                    <th>ΔC cal (%)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col fix_width">DF Condition indicator</th>
                    <th class="condition-indicator-col fix_width">C Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table">
                    <tr :key="index">
                        <td style="text-align: center;">{{ index + 1 }}</td>
                        <td style="display: flex;">
                            <el-input size="mini" type="text" v-model="item.measurement"></el-input>
                            <div :class="{colorTableRed : index%3==0, colorTableYellow : index%3==1, colorTableBlue : index%3==2}"></div>
                        </td>
                        <td>
                            <el-select size="mini" v-model="item.test_mode">
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
                            <el-input size="mini" type="text" v-model="item.test_voltage"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.df_ref"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.c_ref"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.df_meas"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.c_meas"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.df_change"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.tri_c_meas"></el-input>
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
                            <el-input :class="nameColor(item.condition_indicator_df)" id="condition" type="text" size="mini" v-model="item.condition_indicator_df">
                            </el-input>
                        </td>
                        <td>
                            <el-input :class="nameColor(item.condition_indicator_c)" id="condition" type="text" size="mini" v-model="item.condition_indicator_c">
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

        <!-- Assessment settings -->
        <el-dialog title="Assessment settings" :visible.sync="openAssessmentDialog" width="860px">
            <el-form size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select class="w-100" placeholder="please select" v-model="assessmentSetting.option">
                        <el-option label="IEC 60137 (2017)" value="IEC"></el-option>
                        <el-option label="IEEE C57.19.01 (2017)" value="IEEE"></el-option>
                        <el-option label="Customized limit" value="Custom"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>

            <table v-if="assessmentSetting.option === 'IEC'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="4">Limit</th>
                        <th rowspan="2">Assessment</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>OIP</th>
                        <th>RIP</th>
                        <th>RBP</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th style="width: 100px;">DF meas (%)</th>
                        <td style="width: 100px;"> ≤ {{ assessmentSetting.data.iec.oip.df_meas }}</td>
                        <td style="width: 100px;"> ≤ {{ assessmentSetting.data.iec.rip.df_meas }}</td>
                        <td style="width: 100px;"> ≤ {{ assessmentSetting.data.iec.rbp.df_meas }}</td>
                        <th style="width: 100px;"><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th style="width: 100px;">ΔC cal (%)</th>
                        <td style="width: 100px;"> ≤ {{ assessmentSetting.data.iec.oip.tri_c_meas }}</td>
                        <td style="width: 100px;"> ≤ {{ assessmentSetting.data.iec.rip.tri_c_meas }}</td>
                        <td style="width: 100px;"> ≤ {{ assessmentSetting.data.iec.rbp.tri_c_meas }}</td>
                        <th style="width: 100px;"><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th style="width: 100px;">DF meas (%)</th>
                        <td style="width: 100px;"> > {{ assessmentSetting.data.iec.oip.df_meas }}</td>
                        <td style="width: 100px;"> > {{ assessmentSetting.data.iec.rip.df_meas }}</td>
                        <td style="width: 100px;"> > {{ assessmentSetting.data.iec.rbp.df_meas }}</td>
                        <th style="width: 100px;"><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                    <tr>
                        <th style="width: 100px;">ΔC cal (%)</th>
                        <td style="width: 100px;"> > {{ assessmentSetting.data.iec.oip.tri_c_meas }}</td>
                        <td style="width: 100px;"> > {{ assessmentSetting.data.iec.rip.tri_c_meas }}</td>
                        <td style="width: 100px;"> > {{ assessmentSetting.data.iec.rbp.tri_c_meas }}</td>
                        <th style="width: 100px;"><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>

            <table v-else-if="assessmentSetting.option === 'IEEE'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="4">Limit</th>
                        <th rowspan="2">Assessment</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>OIP</th>
                        <th>RIP</th>
                        <th>RBP</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th style="width: 100px;">DF meas (%)</th>
                        <td style="width: 100px;"> ≤ {{ assessmentSetting.data.ieee.oip.df_meas }}</td>
                        <td style="width: 100px;"> ≤ {{ assessmentSetting.data.ieee.rip.df_meas }}</td>
                        <td style="width: 100px;"> ≤ {{ assessmentSetting.data.ieee.rbp.df_meas }}</td>
                        <th style="width: 100px;"><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th style="width: 100px;">ΔC cal (%)</th>
                        <td style="width: 100px;"> ≤ {{ assessmentSetting.data.ieee.oip.tri_c_meas }}</td>
                        <td style="width: 100px;"> ≤ {{ assessmentSetting.data.ieee.rip.tri_c_meas }}</td>
                        <td style="width: 100px;"> ≤ {{ assessmentSetting.data.ieee.rbp.tri_c_meas }}</td>
                        <th style="width: 100px;"><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th style="width: 100px;">DF meas (%)</th>
                        <td style="width: 100px;"> > {{ assessmentSetting.data.ieee.oip.df_meas }}</td>
                        <td style="width: 100px;"> > {{ assessmentSetting.data.ieee.rip.df_meas }}</td>
                        <td style="width: 100px;"> > {{ assessmentSetting.data.ieee.rbp.df_meas }}</td>
                        <th style="width: 100px;"><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                    <tr>
                        <th style="width: 100px;">ΔC cal (%)</th>
                        <td style="width: 100px;"> > {{ assessmentSetting.data.ieee.oip.tri_c_meas }}</td>
                        <td style="width: 100px;"> > {{ assessmentSetting.data.ieee.rip.tri_c_meas }}</td>
                        <td style="width: 100px;"> > {{ assessmentSetting.data.ieee.rbp.tri_c_meas }}</td>
                        <th style="width: 100px;"><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>

            <table v-else-if="assessmentSetting.option === 'Custom'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="4">Limit</th>
                        <th rowspan="2">Assessment</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>OIP</th>
                        <th>RIP</th>
                        <th>RBP</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>DF meas (%)</th>
                        <td>≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.oip.df_meas"></el-input></td>
                        <td>≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.rip.df_meas"></el-input></td>
                        <td>≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.rbp.df_meas"></el-input></td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>ΔC cal (%)</th>
                        <td>≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.oip.tri_c_meas"></el-input></td>
                        <td>≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.rip.tri_c_meas"></el-input></td>
                        <td>≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.rbp.tri_c_meas"></el-input></td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>DF meas (%)</th>
                        <td>> <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.oip.df_meas"></el-input></td>
                        <td>> <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.rip.df_meas"></el-input></td>
                        <td>> <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.rbp.df_meas"></el-input></td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                    <tr>
                        <th>ΔC cal (%)</th>
                        <td>> <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.oip.tri_c_meas"></el-input></td>
                        <td>> <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.rip.tri_c_meas"></el-input></td>
                        <td>> <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.rbp.tri_c_meas"></el-input></td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="860px">
            <table class="table-strip-input-data mgb-10">
                <thead>
                    <tr>
                        <th>Result</th>
                        <th class="condition-indicator-col">Condition Indicator DF</th>
                        <th class="score-col">Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>DF meas ≤ <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.good.df_meas[0]"></el-input> or</div>
                                <div>
                                    DF change ≤ <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.good.df_change[0]"></el-input> time
                                    previous, new values
                                </div>
                            </div>
                        </td>
                        <td class="good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorDf.good.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>
                                    <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.fair.df_meas[0]"></el-input> &lt; DF meas ≤
                                    <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.fair.df_meas[1]"></el-input> or
                                </div>
                                <div>
                                    <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.fair.df_change[0]"></el-input> &lt; DF change ≤
                                    <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.fair.df_change[1]"></el-input> time previous, new values
                                </div>
                            </div>
                        </td>
                        <td class="fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorDf.fair.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>
                                    <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.poor.df_meas[0]"></el-input> &lt; DF meas ≤
                                    <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.poor.df_meas[1]"></el-input> or
                                </div>
                                <div>
                                    <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.poor.df_change[0]"></el-input> &lt; DF change ≤
                                    <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.poor.df_change[1]"></el-input> time previous, new values
                                </div>
                            </div>
                        </td>
                        <td class="poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorDf.poor.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>DF meas > <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.bad.df_meas[1]"></el-input> or</div>
                                <div>
                                    DF change > <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.bad.df_change[1]"></el-input> time previous,
                                    new values
                                </div>
                            </div>
                        </td>
                        <td class="bad">Bad</td>
                        <td><el-input size="mini" v-model="conditionIndicatorDf.bad.score"></el-input></td>
                    </tr>
                </tbody>
            </table>

            <table class="table-strip-input-data mgb-10">
                <thead>
                    <tr>
                        <th>Result</th>
                        <th class="condition-indicator-col">Condition Indicator C</th>
                        <th class="score-col">Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>ΔC cal ≤ <el-input size="mini" class="w-100px" v-model="conditionIndicatorC.good.tri_c_meas[0]"></el-input></td>
                        <td class="good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorC.good.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorC.fair.tri_c_meas[0]"></el-input> &lt; ΔC cal ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorC.fair.tri_c_meas[1]"></el-input>
                        </td>
                        <td class="fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorC.fair.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorC.poor.tri_c_meas[0]"></el-input> &lt; ΔC cal ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorC.poor.tri_c_meas[1]"></el-input>
                        </td>
                        <td class="poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorC.poor.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>ΔC cal > <el-input size="mini" class="w-100px" v-model="conditionIndicatorC.bad.tri_c_meas[1]"></el-input></td>
                        <td class="bad">Bad</td>
                        <td><el-input size="mini" v-model="conditionIndicatorC.bad.score"></el-input></td>
                    </tr>
                </tbody>
            </table>
        </el-dialog>
    </div>
</template>

<script>

export default {
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false
        }
    },
    props: {
        data: {
            type: Object,
            require: true
        }
    },
    computed: {
        testData() {
            return this.data
        },
        assessmentSetting() {
            return this.data.assessment_setting
        },
        conditionIndicatorDf() {
            return this.data.condition_indicator_df
        },
        conditionIndicatorC() {
            return this.data.condition_indicator_c
        }
    },
    watch: {
        'assessmentSetting.option' : {
            handler : function() {
                this.testData.table.forEach(element => {
                    element.assessment = ''
                })
            }
        }
    },
    methods: {
        add() {
            this.testData.table.push({
                measurement: '',
                test_mode: '',
                test_voltage: '',
                df_ref: '',
                c_ref: '',
                df_meas: '',
                c_meas: '',
                df_change: '',
                tri_c_meas: '',
                assessment: '',
                condition_indicator_df: '',
                condition_indicator_c: ''
            })
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
            this.testData.table.splice(index, 1)
        },
        addTest(index) {
            const data = {
                measurement: '',
                test_mode: '',
                test_voltage: '',
                df_ref: '',
                c_ref: '',
                df_meas: '',
                c_meas: '',
                df_change: '',
                tri_c_meas: '',
                assessment: '',
                condition_indicator_df: '',
                condition_indicator_c: ''
            }
            this.testData.table.splice(index+1, 0, data)
        },
        async calculator() {
            await this.dfChangeCal()
            await this.deltaCcalCal()
            await this.dfmeasAssessment()
            await this.deltaCAssessment()
            this.$message.success('Calculating successfully')
        },
        async dfChangeCal() {
            this.testData.table.forEach(element => {
                if(!isNaN(parseFloat(element.df_meas))) {
                    if(!isNaN(parseFloat(element.df_ref)) && element.df_ref != 0) {
                        element.df_change = element.df_meas / element.df_ref
                    }
                }
            })
        },
        async deltaCcalCal() {
            this.testData.table.forEach(element => {
                if(!isNaN(parseFloat(element.c_meas))) {
                    if(!isNaN(parseFloat(element.c_ref)) && element.c_ref != 0) {
                        element.tri_c_meas = 100*(element.c_meas - element.c_ref)/element.c_ref
                    }
                }
            })
        },
        async dfmeasAssessment() {
            this.testData.table.forEach((element) => {
                if(this.assessmentSetting.option === "IEC") {
                    if(!isNaN(parseFloat(element.df_meas))) {
                        if(element.insulation === "Resin-bonded paper") {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.iec.rbp.df_meas ) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        } else if(element.insulation === "Resin-impregnated paper") {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.iec.rip.df_meas ) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        } else {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.iec.oip.df_meas ) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    }
                } else if(this.assessmentSetting.option === "IEEE") {
                    if(!isNaN(parseFloat(element.df_meas))) {
                        if(element.insulation === "Resin-bonded paper") {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.ieee.rbp.df_meas ) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        } else if(element.insulation === "Resin-impregnated paper") {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.ieee.rip.df_meas ) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        } else {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.ieee.oip.df_meas ) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    }
                } else {
                    if(!isNaN(parseFloat(element.df_meas))) {
                        if(element.insulation === "Resin-bonded paper") {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.custom.rbp.df_meas ) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        } else if(element.insulation === "Resin-impregnated paper") {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.custom.rip.df_meas ) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        } else {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.custom.oip.df_meas ) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    }  
                }
            })
        },
        async deltaCAssessment() {
            this.testData.table.forEach((element) => {
                if(element.assessment === "Pass") {
                    if(this.assessmentSetting.option === "IEC") {
                        if(!isNaN(parseFloat(element.tri_c_meas))) {
                            if(element.insulation === "Resin-bonded paper") {
                                if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.iec.rbp.tri_c_meas ) {
                                    element.assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                }
                            } else if(element.insulation === "Resin-impregnated paper") {
                                if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.iec.rip.tri_c_meas ) {
                                    element.assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                }
                            } else {
                                if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.iec.oip.tri_c_meas ) {
                                    element.assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                }
                            }
                        }
                    } else if(this.assessmentSetting.option === "IEEE") {
                        if(!isNaN(parseFloat(element.tri_c_meas))) {
                            if(element.insulation === "Resin-bonded paper") {
                                if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.ieee.rbp.tri_c_meas ) {
                                    element.assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                }
                            } else if(element.insulation === "Resin-impregnated paper") {
                                if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.ieee.rip.tri_c_meas ) {
                                    element.assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                }
                            } else {
                                if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.ieee.oip.tri_c_meas ) {
                                    element.assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                }
                            }
                        }
                    } else {
                        if(!isNaN(parseFloat(element.tri_c_meas))) {
                            if(element.insulation === "Resin-bonded paper") {
                                if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.custom.rbp.tri_c_meas ) {
                                    element.assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                }
                            } else if(element.insulation === "Resin-impregnated paper") {
                                if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.custom.rip.tri_c_meas ) {
                                    element.assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                }
                            } else {
                                if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.custom.oip.tri_c_meas ) {
                                    element.assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                }
                            }
                        }  
                    }
                }
            })
        },
        clear() {
            this.testData.table.forEach((element) => {
                element.measurement = ''
                element.test_voltage = ''
                element.df_ref = ''
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

th:not(:nth-child(1)):not(:nth-last-child(1)):not(:nth-last-child(2)) {
    min-width: 106px;
}

th:nth-child(1) {
    min-width: 30px;
    text-align: center;
}
th.fix_width {
    white-space: nowrap;
}

th.no-col {
    width: 30px !important;
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
    background: #FFFF00;
}

.Poor input {
    background: #FFC000;
}

.Bad input {
    background: #FF0000;
}

</style>
