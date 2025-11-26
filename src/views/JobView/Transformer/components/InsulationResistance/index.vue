<template>
    <div id="insulation-resistance">
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

        <el-row :gutter="20" class="mgt-10">
            <el-col :span="24">
                <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all </el-button>
            </el-col>
        </el-row>
        </div>

        <table class="mgt-10 table-strip-input-data" style=" width: 130%; font-size: 12px; text-align: center;">
            <thead>
                <tr>
                    <th class="no-col">No</th>
                    <th style="width: 160px;" @click="displayType">Measurement</th>
                    <th @click="displayType">Type</th>
                    <th>R<sub>15s</sub> (MΩ)</th>
                    <th>R<sub>60s</sub> (MΩ)</th>
                    <th style="width: 90px;">R<sub>10min</sub> (MΩ)</th>
                    <th>DAR</th>
                    <th>PI</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="assessment-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td style="display: flex;">
                        <el-input size="mini" v-model="item.measured_position.value" placeholder="Measured Position"> </el-input>
                        <div :class="{colorTableRed : index%3==0, colorTableYellow : index%3==1, colorTableBlue : index%3==2}"></div>
                    </td>
                    <td>
                        <el-select size="mini" v-model="item.type.value">
                            <el-option label="HV-E" value="HV-E"></el-option>
                            <el-option label="LV-E" value="LV-E"></el-option>
                        </el-select>
                    </td>
                    <td>
                        <el-input size="mini" v-model="item.r15s.value"> </el-input>
                    </td>
                    <td><el-input size="mini" v-model="item.r60s.value"> </el-input></td>
                    <td><el-input size="mini" v-model="item.r10min.value"> </el-input></td>
                    <td><el-input size="mini" v-model="item.kht.value"> </el-input></td>
                    <td><el-input size="mini" v-model="item.pi.value"> </el-input></td>
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
                        <el-button size="mini" type="danger" class="w-100" @click="deleteRow(index)">
                            <i class="fas fa-trash"></i>
                        </el-button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Assessment settings -->
        <el-dialog append-to-body title="Assessment settings" :visible.sync="openAssessmentDialog" width="600px">
            <el-form size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select class="w-100" placeholder="please select" v-model="assessmentSetting.option.value">
                        <el-option label="CIGRE 445 " value="cigre"></el-option>
                        <el-option label="Customized limit" value="custom"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>

            <table class="table-strip-input-data">
                <thead>
                    <tr>
                        <th>Result</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody v-if="assessmentSetting.option.value === 'cigre'">
                    <tr>
                        <td>If V<sub>Prim</sub> > {{ assessmentSetting.data.cigre.pass_1.prim.value }}kV and R<sub>60s</sub> > {{ assessmentSetting.data.cigre.pass_1.r60s.value }}MΩ</td>
                        <td class="bolder"><i class="fas fa-check-square pass"></i> Pass</td>
                    </tr>
                    <tr>
                        <td>If V<sub>Prim</sub> > {{ assessmentSetting.data.cigre.pass_1.prim.value }}kV and R<sub>60s</sub> &#8804; {{ assessmentSetting.data.cigre.pass_1.r60s.value }}MΩ</td>
                        <td class="bolder"><i class="fa-solid fa-xmark fail"></i> Fail</td>
                    </tr>
                    <tr>
                        <td>If Prim ≤ {{ assessmentSetting.data.cigre.pass_2.prim.value }}kV and R60s > {{ assessmentSetting.data.cigre.pass_2.r60s.value }}MΩ</td>
                        <td class="bolder"><i class="fas fa-check-square pass"></i> Pass</td>
                    </tr>
                    <tr>
                        <td>If Prim ≤ {{ assessmentSetting.data.cigre.pass_2.prim.value }}kV and R60s ≤ {{ assessmentSetting.data.cigre.pass_2.r60s.value }}MΩ</td>
                        <td class="bolder"><i class="fa-solid fa-xmark fail"></i> Fail</td>
                    </tr>
                </tbody>
                <tbody v-if="assessmentSetting.option.value === 'custom'">
                    <tr>
                        <td> If V<sub>Prim</sub> > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_1.prim.value"></el-input> kV and R<sub>60s</sub> > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_1.r60s.value"></el-input> MΩ</td>
                        <td class="bolder"><i class="fas fa-check-square pass"></i> Pass</td>
                    </tr>
                    <tr>
                        <td> If V<sub>Prim</sub> > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_1.prim.value"></el-input> kV and R<sub>60s</sub> ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_1.r60s.value"></el-input> MΩ</td>
                        <td class="bolder"><i class="fa-solid fa-xmark fail"></i> Fail</td>
                    </tr>
                    <tr>
                        <td>If V<sub>Prim</sub> ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_2.prim.value"></el-input> kV and R<sub>60s</sub> > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_2.r60s.value"></el-input> MΩ</td>
                        <td class="bolder"><i class="fas fa-check-square pass"></i> Pass</td>
                    </tr>
                    <tr>
                        <td>If V<sub>Prim</sub> ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_2.prim.value"></el-input> kV and R<sub>60s</sub> ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_2.r60s.value"></el-input> MΩ</td>
                        <td class="bolder"><i class="fa-solid fa-xmark fail"></i> Fail</td>
                    </tr>
                </tbody>
            </table>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog :modal="false" title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="670px">
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
                            <div class="flex-container">
                                <div>Kht ≥ {{ conditionIndicatorSetting.good.kht[1].value }}</div>
                                <div>R60s_HV-E ≥ {{ conditionIndicatorSetting.good.r60s_hve[1].value }} MΩ</div>
                                <div>R60s_LV-E ≥ {{ conditionIndicatorSetting.good.r60s_lve[1].value }} MΩ</div>
                            </div>
                        </td>
                        <td class="good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.good.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>{{ conditionIndicatorSetting.fair.kht[1].value }} > Kht ≥ {{ conditionIndicatorSetting.fair.kht[0].value }}</div>
                                <div>{{ conditionIndicatorSetting.fair.r60s_hve[1].value }} MΩ > R60s_HV-E ≥ {{ conditionIndicatorSetting.fair.r60s_hve[0].value }} MΩ</div>
                                <div>{{ conditionIndicatorSetting.fair.r60s_lve[1].value }} MΩ > R60s_LV-E ≥ {{ conditionIndicatorSetting.fair.r60s_lve[0].value }} MΩ</div>
                            </div>
                        </td>
                        <td class="fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.fair.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>{{ conditionIndicatorSetting.poor.kht[1].value }} > Kht ≥ {{ conditionIndicatorSetting.poor.kht[0].value }}</div>
                                <div>{{ conditionIndicatorSetting.poor.r60s_hve[1].value }} MΩ > R60s_HV-E ≥ {{ conditionIndicatorSetting.poor.r60s_hve[0].value }} MΩ</div>
                                <div>{{ conditionIndicatorSetting.poor.r60s_lve[1].value }} MΩ > R60s_LV-E ≥ {{ conditionIndicatorSetting.poor.r60s_lve[0].value }} MΩ</div>
                            </div>
                        </td>
                        <td class="poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.poor.score.value"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>Kht &lt; {{ conditionIndicatorSetting.bad.kht[0].value }}</div>
                                <div>R60s_HV-E &lt; {{ conditionIndicatorSetting.bad.r60s_hve[0].value }} MΩ</div>
                                <div>R60s_LV-E &lt; {{ conditionIndicatorSetting.bad.r60s_lve[0].value }} MΩ</div>
                            </div>
                        </td>
                        <td class="bad">Bad</td>
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
            openConditionIndicatorDialog: false,
            isdisplay: 'none'
        }
    },
    props: {
        data: {
            type: Object,
            require: true,
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
        conditionIndicatorSetting() {
            return this.data.condition_indicator_setting
        },
        assessmentSetting() {
            return this.data.assessment_setting
        },
        voltageRatings() {
            return JSON.parse(this.asset.voltage_ratings)
        },
        asset_type() {
            return this.asset.asset_type
        }
    },
    methods: {
        add() {
            this.testData.table.push({
                measured_position: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                type: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                r15s: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                r60s: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                r10min : {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                kht: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                pi : {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                assessment: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                condition_indicator: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                }
            })
        },
        removeAll() {
            this.testData.table = []
        },
        deleteRow(index) {
            this.testData.table.splice(index, 1)
        },
        addTest(index) {
            const data = {
                measured_position: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                type: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                r15s: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                r60s: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                r10min : {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                kht: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                pi : {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                assessment: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                condition_indicator: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                }
            }
            this.testData.table.splice(index+1, 0, data)
        },
        calculator() {
            let voltage_ll = null

            for (let index = 0; index < this.voltageRatings.length; index++) {
                const element = this.voltageRatings[index]
                if ((element.winding === 'Prim') & (element.voltage_ll.unit === 'kV')) {
                    voltage_ll = element.voltage_ll.value
                    break
                }
            }

            this.testData.table.forEach((item) => {
                if (!isNaN(parseFloat(item.r60s)) && (!isNaN(parseFloat(item.r15s))) && parseFloat(item.r15s) != '0') {
                    item.kht = (item.r60s / item.r15s).toFixed(4)
                }
                if (!isNaN(parseFloat(item.r10min)) && (!isNaN(parseFloat(item.r60s))) && parseFloat(item.r60s) != '0') {
                    item.pi = (item.r10min / item.r60s).toFixed(4)
                }

                if (this.assessmentSetting.option === 'cigre') {
                    if (!isNaN(parseFloat(item.r60s)) && voltage_ll !== null) {
                        item.assessment = 'Fail'
                        if (
                            (voltage_ll > parseInt(this.assessmentSetting.data.cigre.pass_1.prim) &&
                                item.r60s > parseInt(this.assessmentSetting.data.cigre.pass_1.r60s)) ||
                            (voltage_ll <= parseInt(this.assessmentSetting.data.cigre.pass_2.prim) &&
                                item.r60s > parseInt(this.assessmentSetting.data.cigre.pass_2.r60s))
                        ) {
                            item.assessment = 'Pass'
                        }
                    }
                } else if (this.assessmentSetting.option === 'custom') {
                    if (!isNaN(parseFloat(item.r60s)) && voltage_ll !== null) {
                        item.assessment = 'Fail'
                        if (
                            (voltage_ll > parseInt(this.assessmentSetting.data.custom.pass_1.prim) &&
                                item.r60s > parseInt(this.assessmentSetting.data.custom.pass_1.r60s)) ||
                            (voltage_ll <= parseInt(this.assessmentSetting.data.custom.pass_2.prim) &&
                                item.r60s > parseInt(this.assessmentSetting.data.custom.pass_2.r60s))
                        ) {
                            item.assessment = 'Pass'
                        }
                    }
                }
            })
        },
        clear() {
            this.testData.table.forEach((element) => {
                element.type.value = ''
                element.r15s.value = ''
                element.r60s.value = ''
                element.r10min.value = ''
                element.kht.value = ''
                element.pi.value = ''
                element.assessment.value = ''
                element.condition_indicator.value = ''
            })
        },
        displayType() {
            if (this.isdisplay === 'none') {
                this.isdisplay = ''
            } else {
                this.isdisplay = 'none'
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
div.el-divider.el-divider--horizontal {
    width: 500px !important;
}

.flex-container {
    display: flex;
    flex-direction: column;

    div {
        padding: 1px;
        height: 30px;
        line-height: 30px;
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
