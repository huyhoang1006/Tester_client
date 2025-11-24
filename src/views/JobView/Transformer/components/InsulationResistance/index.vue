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

        <table class="mgt-10 table-strip-input-data" style=" width: 100%; table-layout: fixed ; font-size: 12px; text-align: center;">
            <thead>
                <tr>
                    <th class="no-col">No</th>
                    <th style="width: 160px;" @click="displayType">Measurement</th>
                    <th :style="{display: isdisplay}" @click="displayType">Type</th>
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
                        <el-input size="mini" v-model="item.measured_position" placeholder="Measured Position"> </el-input>
                        <div :class="{colorTableRed : index%3==0, colorTableYellow : index%3==1, colorTableBlue : index%3==2}"></div>
                    </td>
                    <td :style="{display: isdisplay}">
                        <el-select :style="{display: isdisplay}" size="mini" v-model="item.type">
                            <el-option label="HV-E" value="HV-E"></el-option>
                            <el-option label="LV-E" value="LV-E"></el-option>
                        </el-select>
                    </td>
                    <td>
                        <el-input size="mini" v-model="item.r15s"> </el-input>
                    </td>
                    <td><el-input size="mini" v-model="item.r60s"> </el-input></td>
                    <td><el-input size="mini" v-model="item.r10min"> </el-input></td>
                    <td><el-input size="mini" v-model="item.kht"> </el-input></td>
                    <td><el-input size="mini" v-model="item.pi"> </el-input></td>
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
                    <el-select class="w-100" placeholder="please select" v-model="assessmentSetting.option">
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
                <tbody v-if="assessmentSetting.option === 'cigre'">
                    <tr>
                        <td>If V<sub>Prim</sub> > {{ assessmentSetting.data.cigre.pass_1.prim }}kV and R<sub>60s</sub> > {{ assessmentSetting.data.cigre.pass_1.r60s }}MΩ</td>
                        <td class="bolder"><i class="fas fa-check-square pass"></i> Pass</td>
                    </tr>
                    <tr>
                        <td>If V<sub>Prim</sub> > {{ assessmentSetting.data.cigre.pass_1.prim }}kV and R<sub>60s</sub> &#8804; {{ assessmentSetting.data.cigre.pass_1.r60s }}MΩ</td>
                        <td class="bolder"><i class="fa-solid fa-xmark fail"></i> Fail</td>
                    </tr>
                    <tr>
                        <td>If Prim ≤ {{ assessmentSetting.data.cigre.pass_2.prim }}kV and R60s > {{ assessmentSetting.data.cigre.pass_2.r60s }}MΩ</td>
                        <td class="bolder"><i class="fas fa-check-square pass"></i> Pass</td>
                    </tr>
                    <tr>
                        <td>If Prim ≤ {{ assessmentSetting.data.cigre.pass_2.prim }}kV and R60s ≤ {{ assessmentSetting.data.cigre.pass_2.r60s }}MΩ</td>
                        <td class="bolder"><i class="fa-solid fa-xmark fail"></i> Fail</td>
                    </tr>
                </tbody>
                <tbody v-if="assessmentSetting.option === 'custom'">
                    <tr>
                        <td> If V<sub>Prim</sub> > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_1.prim"></el-input> kV and R<sub>60s</sub> > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_1.r60s"></el-input> MΩ</td>
                        <td class="bolder"><i class="fas fa-check-square pass"></i> Pass</td>
                    </tr>
                    <tr>
                        <td> If V<sub>Prim</sub> > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_1.prim"></el-input> kV and R<sub>60s</sub> ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_1.r60s"></el-input> MΩ</td>
                        <td class="bolder"><i class="fa-solid fa-xmark fail"></i> Fail</td>
                    </tr>
                    <tr>
                        <td>If V<sub>Prim</sub> ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_2.prim"></el-input> kV and R<sub>60s</sub> > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_2.r60s"></el-input> MΩ</td>
                        <td class="bolder"><i class="fas fa-check-square pass"></i> Pass</td>
                    </tr>
                    <tr>
                        <td>If V<sub>Prim</sub> ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_2.prim"></el-input> kV and R<sub>60s</sub> ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass_2.r60s"></el-input> MΩ</td>
                        <td class="bolder"><i class="fa-solid fa-xmark fail"></i> Fail</td>
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
                        <td>
                            <div class="flex-container">
                                <div>Kht ≥ {{ conditionIndicatorSetting.good.kht[1] }}</div>
                                <div>R60s_HV-E ≥ {{ conditionIndicatorSetting.good.r60s_hve[1] }} MΩ</div>
                                <div>R60s_LV-E ≥ {{ conditionIndicatorSetting.good.r60s_lve[1] }} MΩ</div>
                            </div>
                        </td>
                        <td class="good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.good.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>{{ conditionIndicatorSetting.fair.kht[1] }} > Kht ≥ {{ conditionIndicatorSetting.fair.kht[0] }}</div>
                                <div>{{ conditionIndicatorSetting.fair.r60s_hve[1] }} MΩ > R60s_HV-E ≥ {{ conditionIndicatorSetting.fair.r60s_hve[0] }} MΩ</div>
                                <div>{{ conditionIndicatorSetting.fair.r60s_lve[1] }} MΩ > R60s_LV-E ≥ {{ conditionIndicatorSetting.fair.r60s_lve[0] }} MΩ</div>
                            </div>
                        </td>
                        <td class="fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.fair.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>{{ conditionIndicatorSetting.poor.kht[1] }} > Kht ≥ {{ conditionIndicatorSetting.poor.kht[0] }}</div>
                                <div>{{ conditionIndicatorSetting.poor.r60s_hve[1] }} MΩ > R60s_HV-E ≥ {{ conditionIndicatorSetting.poor.r60s_hve[0] }} MΩ</div>
                                <div>{{ conditionIndicatorSetting.poor.r60s_lve[1] }} MΩ > R60s_LV-E ≥ {{ conditionIndicatorSetting.poor.r60s_lve[0] }} MΩ</div>
                            </div>
                        </td>
                        <td class="poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.poor.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>Kht &lt; {{ conditionIndicatorSetting.bad.kht[0] }}</div>
                                <div>R60s_HV-E &lt; {{ conditionIndicatorSetting.bad.r60s_hve[0] }} MΩ</div>
                                <div>R60s_LV-E &lt; {{ conditionIndicatorSetting.bad.r60s_lve[0] }} MΩ</div>
                            </div>
                        </td>
                        <td class="bad">Bad</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.bad.score"></el-input></td>
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
                measured_position: '',
                type: '',
                r15s: '',
                r60s: '',
                r10min : "",
                kht: '',
                pi : "",
                assessment: '',
                condition_indicator: ''
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
                easured_position: '',
                type: '',
                r15s: '',
                r60s: '',
                r10min : "",
                kht: '',
                pi : "",
                assessment: '',
                condition_indicator: ''
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
                element.type = ''
                element.r15s = ''
                element.r60s = ''
                element.r10min = ''
                element.kht = ''
                element.pi = ''
                element.assessment = ''
                element.condition_indicator = ''
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
