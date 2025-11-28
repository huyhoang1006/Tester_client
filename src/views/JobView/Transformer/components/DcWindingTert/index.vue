<template>
    <div id="dc-winding-resistance-tert">
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
        <!-- Tính toán đánh giá -->
        <el-row class="mgb-10">
            <el-col>
                <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all </el-button>
            </el-col>
        </el-row>
        </div>

        <table class="table-strip-input-data" style="width: 100% ; font-size: 12px;">
            <thead>
                <tr>
                    <th class="no-col" v-if="tapChangers.winding === $constant.TERT">Tap</th>
                    <th class="phase-col">Name</th>
                    <th>R meas</th>
                    <th>R ref</th>
                    <th>R corr</th>
                    <th>Dev with R ref (%)</th>
                    <th>Dev within phases (%)</th>
                    <!-- <th>Mean value</th> -->
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table">
                    <tr :key="index">
                        <td v-if="tapChangers.winding === $constant.TERT">{{ item.tap.value }}</td>
                        <td style="width: 100px">
                            <div class="col-phase">
                                <div class="phase">
                                    <el-input size="mini" type="text" v-model="item.phase.value"></el-input>
                                </div>
                                <div class="rectangle" :class="{red: item._phase.value == 'A', yellow: item._phase.value == 'B', blue: item._phase.value == 'C'}"></div>
                            </div>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.r_meas.value"><template slot="append">Ω</template></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.r_ref.value"><template slot="append">Ω</template></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.r_corr.value"><template slot="append">Ω</template></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.error_r_ref.value"></el-input>
                        </td>
                        <template v-if="index % 3 == 0 && tapChangers.winding === $constant.TERT">
                            <td rowspan="3">
                                <el-input size="mini" type="text" v-model="item.error_between_phase.value"></el-input>
                            </td>

                            <!-- <td rowspan="3">
                                <el-input size="mini" type="text" v-model="item.mean_value.value"><template slot="append">Ω</template></el-input>
                            </td> -->
                        </template>
                        <template v-else-if="index % 3 == 0 && tapChangers.winding !== $constant.TERT">
                            <td rowspan="3">
                                <el-input size="mini" type="text" v-model="item.error_between_phase.value"></el-input>
                            </td>

                            <!-- <td rowspan="3">
                                <el-input size="mini" type="text" v-model="item.mean_value.value"><template slot="append">Ω</template></el-input>
                            </td> -->
                        </template>
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
                    </tr>
                </template>
            </tbody>
        </table>

        <!-- Assessment settings -->
        <el-dialog append-to-body title="Assessment settings" :visible.sync="openAssessmentDialog" width="600px">
            <el-form size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select class="w-100" placeholder="please select" v-model="assessmentSetting.option.value">
                        <!-- <el-option label="Based on IEC" value="IEC"></el-option> -->
                        <el-option label="Based on IEEE" value="IEEE"></el-option>
                        <el-option label="Based on CIGRE" value="CIGRE"></el-option>
                        <el-option label="Customized limit" value="Custom"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>

            <table v-if="assessmentSetting.option === 'IEC'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th>Limit</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Error between phase (%)</th>
                        <td>{{ assessmentSetting.data.iec.error_between_phase.value }}</td>
                    </tr>
                </tbody>
            </table>

            <table v-else-if="assessmentSetting.option.value === 'IEEE'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="2">Limit</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Error between phase (%)</th>
                        <td> ≤ {{ assessmentSetting.data.ieee.error_between_phase.value }}</td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>Error between phase (%)</th>
                        <td> > {{ assessmentSetting.data.ieee.error_between_phase.value }}</td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>

            <table v-else-if="assessmentSetting.option.value === 'CIGRE'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="2">Limit</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Error with R ref %</th>
                        <td> ≤ {{ assessmentSetting.data.cigre.error_r_ref.value }}</td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>Error with R ref %</th>
                        <td> > {{ assessmentSetting.data.cigre.error_r_ref.value }}</td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>

            <table v-else-if="assessmentSetting.option.value === 'Custom'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="2">Limit</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Error between phase (%)</th>
                        <td>
                            ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.error_between_phase.value"></el-input>
                        </td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>Error between phase (%)</th>
                        <td>
                            > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.error_between_phase.value"></el-input>
                        </td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                    <tr>
                        <th>Error with R ref %</th>
                        <td>
                            ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.error_r_ref.value"></el-input>
                        </td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>Error with R ref %</th>
                        <td>
                            > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.error_r_ref.value"></el-input>
                        </td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog append-to-body title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="870px">
            <table class="table-strip-input-data">
                <thead>
                    <tr>
                        <th>Result</th>
                        <th class="condition-indicator-col">Condition Indicator</th>
                        <th class="score-col">Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            % Error between phase or Error with R ref % ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.good.error_between_phase[0].value"></el-input>
                        </td>
                        <td class="Good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.good.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.fair.error_between_phase[0].value"></el-input> &lt; % Error
                            between phase or Error with R ref % ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.fair.error_between_phase[1].value"></el-input>
                        </td>
                        <td class="Fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.fair.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.poor.error_between_phase[0].value"></el-input> &lt; % Error
                            between phase or Error with R ref % ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.poor.error_between_phase[1].value"></el-input>
                        </td>
                        <td class="Poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.poor.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            % Error between phase or Error with R ref % >
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.bad.error_between_phase[1].value"></el-input>
                        </td>
                        <td class="Bad">Bad</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.bad.score.value"></el-input></td>
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
        },
        tapChangers: {
            type: Object,
            required: true
        },
        testCondition : {
            type: Object,
            required: true
        }
    },
    computed: {
        testData() {
            return this.data
        },
        assessmentSetting() {
            return this.data.assessment_setting
        },
        conditionIndicatorSetting() {
            return this.data.condition_indicator_setting
        }
    },
    methods: {
        async calculator() {
            let data = this.testCondition.condition
            if(!isNaN(parseFloat(data.winding_temperature)) && !isNaN(parseFloat(data.reference_temperature))) {
                await this.CalRcorr()
            } else {
                await this.CalRcorrWithoutTem()
            }
            await this.CalDevWithRref()
            await this.CalDevWithPhase()
            await this.CalAssessment()

        },
        async CalRcorr() {
            let data = this.testCondition.condition
            const winding = JSON.parse(this.$store.state.selectedAsset[0].winding)
            if(winding.sec === "Copper") {
                this.testData.table.forEach((element) => {
                    if(!isNaN(parseFloat(element.r_meas))) {
                        if(!isNaN(parseFloat(data.winding_temperature))) {
                            if(!isNaN(parseFloat(data.reference_temperature))) {
                                element.r_corr = parseFloat(parseFloat(element.r_meas) * (235 + parseFloat(data.reference_temperature)) /(235 + parseFloat(data.winding_temperature)))
                                if(element.r_corr != null) {
                                    element.r_corr = element.r_corr.toFixed(4)
                                }
                            } 
                        }
                    }
                })
            } else {
                this.testData.table.forEach((element) => {
                    if(!isNaN(element.r_meas)) {
                        if(!isNaN(data.winding_temperature)) {
                            if(!isNaN(data.reference_temperature)) {
                                element.r_corr = parseFloat(parseFloat(element.r_meas) * (225 + parseFloat(data.reference_temperature)) /(225 + parseFloat(data.winding_temperature))).toFixed(4)
                            } 
                        }
                    }
                })
            }
        },
        async CalRcorrWithoutTem() {
            this.testData.table.forEach((element) => {
                if(!isNaN(parseFloat(element.r_meas))) {
                    element.r_corr = element.r_meas
                }
            })
        },
        async CalDevWithRref() {
            this.testData.table.forEach((element) => {
                if(!isNaN(parseFloat(element.r_ref))) {
                    if(parseFloat(element.r_ref) != 0) {
                        if(!isNaN(parseFloat(element.r_corr))) {
                            element.error_r_ref = ((parseFloat(element.r_corr) - parseFloat(element.r_ref)) / parseFloat(element.r_ref)) * 100
                            element.error_r_ref = element.error_r_ref.toFixed(4)
                        }
                    }
                }
            })
        },
        async CalDevWithPhase() {
            this.testData.table.forEach((element, index) => {
                if(index%3==0) {
                    if(!isNaN(parseFloat(this.testData.table[index].r_corr)) && !isNaN(parseFloat(this.testData.table[index+1].r_corr)) && !isNaN(parseFloat(this.testData.table[index + 2].r_corr))) {
                        let arr = [this.testData.table[index].r_corr, this.testData.table[index + 1].r_corr, this.testData.table[index + 2].r_corr]
                        let max_r_max = Math.max(...arr)
                        let min_r_min = Math.min(...arr)
                        if(parseFloat(min_r_min) != 0) {
                            this.testData.table[index].error_between_phase = 100 * (parseFloat(max_r_max) - parseFloat(min_r_min))/parseFloat(min_r_min)
                            this.testData.table[index+1].error_between_phase = 100 * (parseFloat(max_r_max) - parseFloat(min_r_min))/parseFloat(min_r_min)
                            this.testData.table[index+2].error_between_phase = 100 * (parseFloat(max_r_max) - parseFloat(min_r_min))/parseFloat(min_r_min)
                        }
                    }
                }
            })
        },
        async CalAssessment() {
            if(this.assessmentSetting.option === "IEEE") {
                this.testData.table.forEach((element) => {
                    if(!isNaN(parseFloat(element.error_between_phase))) {
                        if(Math.abs(element.error_between_phase) <= this.assessmentSetting.data.ieee.error_between_phase) {
                            element.assessment = "Pass"
                        } else {
                            element.assessment = "Fail"
                        }
                    }
                })
            } else if(this.assessmentSetting.option === "CIGRE") {
                this.testData.table.forEach((element) => {
                    if(!isNaN(parseFloat(element.error_r_ref))) {
                        if(Math.abs(element.error_r_ref) <= this.assessmentSetting.data.cigre.error_r_ref) {
                            element.assessment = "Pass"
                        } else {
                            element.assessment = "Fail"
                        }
                    }
                })
            } else {
                this.testData.table.forEach((element) => {
                    if(!isNaN(parseFloat(element.error_r_ref))) {
                        if( Math.abs(element.error_r_ref) <= this.assessmentSetting.data.custom.error_r_ref) {
                            element.assessment = "Pass"
                        } else {
                            element.assessment = "Fail"
                        }
                    } else {
                        if(!isNaN(parseFloat(element.error_between_phase))) {
                            if( Math.abs(element.error_between_phase) <= this.assessmentSetting.data.custom.error_between_phase) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    }
                })
            }
        },
        clear() {
            this.testData.table.forEach((element) => {
                element.r_meas = ''
                element.r_ref = ''
                element.r_corr = ''
                element.error_between_phase = ''
                element.error_r_ref = ''
                element.mean_value = ''
                element.assessment = ''
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
        },
    }
}
</script>

<style lang="scss" scoped>
.w-100px {
    width: 100px;
}
.Good {
    background: #00CC00;
}

.Fair {
    background: #FFFF00;
}

.Poor {
    background: #FFC000;
}

.Bad {
    background: #FF0000;
}
</style>
