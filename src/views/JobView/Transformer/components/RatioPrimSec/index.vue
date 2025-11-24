<template>
    <div id="ratio-prim-sec">
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
                    <th class="no-col">Tap</th>
                    <th class="phase-col">Phase</th>
                    <th>V prim (kV)</th>
                    <th>V sec (kV)</th>
                    <th>Nominal ratio</th>
                    <th>Ratio meas</th>
                    <th>Ratio dev</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table" :key="index">
                    <td>{{ item.tap }}</td>
                    <td>
                        <div class="col-phase">
                            <div class="phase">
                                <el-input size="mini" type="text" v-model="item.phase"></el-input>
                            </div>
                            <div class="rectangle" :class="{red: item._phase == 'A', yellow: item._phase == 'B', blue: item._phase == 'C'}"></div>
                        </div>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.hv1"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.lv"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.nominal_ratio"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.v_ratio"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.ratio_dev"><template slot="append">%</template></el-input>
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
                        <el-input :class="nameColor(item.condition_indicator)" id="condition" type="text" size="mini" v-model="item.condition_indicator">
                        </el-input>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Assessment settings -->
        <el-dialog append-to-body title="Assessment settings" :visible.sync="openAssessmentDialog" width="600px">
            <el-form size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select class="w-100" placeholder="please select" v-model="assessmentSetting.option">
                        <el-option label="IEC 60076-1 (2011)" value="IEC"></el-option>
                        <el-option label=" IEEE C57.152 (2013)" value="IEEE"></el-option>
                        <el-option label="Customized limit" value="Custom"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>

            <table v-if="assessmentSetting.option === 'IEC' || assessmentSetting.option === 'IEEE'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="2">Limit</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Ratio dev (%)</th>
                        <td> ≤ {{ assessmentSetting.data.iec.ratio_dev }}</td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>Ratio dev (%)</th>
                        <td> > {{ assessmentSetting.data.iec.ratio_dev }}</td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>

            <table v-else-if="assessmentSetting.option === 'Custom'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="2">Limit</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Ratio dev (%)</th>
                        <td>
                            ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.ratio_dev"></el-input>
                        </td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>Ratio dev (%)</th>
                        <td>
                            > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.ratio_dev"></el-input>
                        </td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="670px">
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
                        <td>Ratio dev (%) ≤ <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.good.ratio_dev[0]"></el-input></td>
                        <td class="good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.good.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.fair.ratio_dev[0]"></el-input> &lt; Ratio dev (%) ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.fair.ratio_dev[1]"></el-input>
                        </td>
                        <td class="fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.fair.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.poor.ratio_dev[0]"></el-input> &lt; Ratio dev (%) ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.poor.ratio_dev[1]"></el-input>
                        </td>
                        <td class="poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.poor.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>Ratio dev (%) > <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.bad.ratio_dev[1]"></el-input></td>
                        <td class="bad">Bad</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.bad.score"></el-input></td>
                    </tr>
                </tbody>
            </table>
        </el-dialog>
    </div>
</template>

<script>
import measuredTurnRatio from './constant'
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
        asset: {
            type: Object,
            require: true
        },
        tapChangers: {
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
        conditionIndicatorSetting() {
            return this.data.condition_indicator_setting
        },
        sec() {
            let result = 0
            const voltage_ratings = JSON.parse(this.asset.voltage_ratings)

            for (let index = 0; index < voltage_ratings.length; index++) {
                const element = voltage_ratings[index]
                if (element.winding === 'Sec') {
                    const voltage_ll = element.voltage_ll

                    result = voltage_ll.value
                    if (voltage_ll.unit === 'kV') {
                        result = result * 1000
                    }

                    break
                }
            }

            return result
        },
        vectorGroup() {
            const vg = JSON.parse(this.asset.vector_group)
            return '' + vg.prim + ('' + vg.sec.I + vg.sec.Value + vg.tert.I + vg.tert.Value + vg.tert.accessibility).toLowerCase()
        }
    },
    methods: {
        calculator() {
            if (String(this.sec) === '0') {
                this.$message.warning('sec voltage rating is missing or equal to 0')
            }
            this.testData.table.forEach((item, index) => {
                if (String(this.sec) === '0') {
                    void 0
                } else {
                    item.nominal_ratio = this.computeNominalRatio(item._voltage, this.sec, index)
                    if(item.nominal_ratio != '')
                        item.nominal_ratio = item.nominal_ratio.toFixed(this.$config.RoundConfig)
                }

                if (!isNaN(item.v_ratio) && item.nominal_ratio !== '' && String(item.nominal_ratio) !== '0') {
                    item.ratio_dev = 100 * ((item.v_ratio - item.nominal_ratio) / item.nominal_ratio)
                    item.ratio_dev = item.ratio_dev.toFixed(this.$config.RoundConfig)
                }

                if (item.ratio_dev !== '') {
                    item.assessment = 'Fail'
                    switch (this.assessmentSetting.option) {
                        case 'IEC':
                        case 'IEEE':
                            if (Math.abs(item.ratio_dev) <= this.assessmentSetting.data.ieee.ratio_dev) {
                                item.assessment = 'Pass'
                            }
                            break

                        case 'Custom':
                            if (Math.abs(item.ratio_dev) <= this.assessmentSetting.data.custom.ratio_dev) {
                                item.assessment = 'Pass'
                            }
                            break
                    }
                }
            })
        },
        computeNominalRatio(voltage, sec, index) {
            if(!isNaN(voltage)) {
                const m = measuredTurnRatio[this.vectorGroup] || 1
                const result = (m * voltage) / sec
                return result
            } else {
                voltage = this.tapChangers.voltage_table[(index - index%3)/3].voltage
                if(!isNaN(voltage)) {
                    const m = measuredTurnRatio[this.vectorGroup] || 1
                    const result = (m * voltage) / sec
                    return result
                } else {
                    return ''
                }
            }
        },
        clear() {
            this.testData.table.forEach((element) => {
                element.hv1 = ''
                element.lv = ''
                element.nominal_ratio = ''
                element.v_ratio = ''
                element.ratio_dev = ''
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
        }
    }
}
</script>

<style lang="scss" scoped></style>
