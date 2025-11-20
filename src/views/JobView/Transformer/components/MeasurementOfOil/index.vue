<template>
    <div>
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
        <!-- Tính toán đánh giá -->
        <el-row class="mgb-10">
            <el-col>
                <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all </el-button>
            </el-col>
        </el-row>

        <table style="width: 100% ; font-size: 12px;" class="mgb-10 table-strip-input-data">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Electrode gap spacing (mm)</th>
                    <th>Result (kV)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <el-select
                            size="mini"
                            allow-create
                            filterable
                            :reserve-keyword="false"
                            v-model="testData.type_oil"
                            placeholder="Select insulation type"
                            class="w-100">
                            <el-option label="Askarel" value="Askarel"></el-option>
                            <el-option label="Dry type" value="Dry type"></el-option>
                            <el-option label="Gas" value="Gas"></el-option>
                            <el-option label="Natural ester" value="Natural ester"></el-option>
                            <el-option label="Mineral oil" value="Mineral oil"></el-option>
                            <el-option label="Silicon" value="Silicon"></el-option>
                            <el-option label="Other" value="Other"></el-option>
                        </el-select>
                    </td>
                    <td>
                        <el-input size="mini" v-model="testData.election_gap"> </el-input>
                    </td>
                    <td>
                        <el-input size="mini" v-model="testData.result"> </el-input>
                    </td>
                    <td>
                        <el-select class="assessment" size="mini" v-model="testData.assessment">
                            <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="testData.assessment === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="testData.assessment === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                    </td>
                    <td>
                        <el-input :class="nameColor(testData.condition_indicator)" id="condition" type="text" size="mini" v-model="testData.condition_indicator">
                        </el-input>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Assessment settings -->
        <el-dialog title="Assessment settings" :visible.sync="openAssessmentDialog" width="600px">
            <el-form size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select class="w-100" placeholder="please select" v-model="assessmentSetting.option">
                        <el-option label="Based on IEC" value="IEC"></el-option>
                        <el-option label="Based on IEEE" value="IEEE"></el-option>
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
                        <th>Breakdown voltage (kV)</th>
                        <td><el-input size="mini" type="number" :min="0" v-model="assessmentSetting.data.iec.voltage"></el-input></td>
                    </tr>
                </tbody>
            </table>

            <table v-if="assessmentSetting.option === 'IEEE'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th>Limit</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Breakdown voltage (kV)</th>
                        <td><el-input size="mini" type="number" :min="0" v-model="assessmentSetting.data.ieee.voltage"></el-input></td>
                    </tr>
                </tbody>
            </table>

            <table v-else-if="assessmentSetting.option === 'Custom'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th>Limit</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Breakdown voltage (kV)</th>
                        <td>
                            <el-input size="mini" type="number" :min="0" v-model="assessmentSetting.data.custom.voltage"> </el-input>
                        </td>
                    </tr>
                </tbody>
            </table>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="600px">
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
                        <td>≥ <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.good.breakdown_voltage[1]"></el-input></td>
                        <td class="good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.good.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.fair.breakdown_voltage[0]"></el-input> to
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.fair.breakdown_voltage[1]"></el-input>
                        </td>
                        <td class="fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.fair.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.poor.breakdown_voltage[0]"></el-input> to
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.poor.breakdown_voltage[1]"></el-input>
                        </td>
                        <td class="poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.poor.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>&lt; <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.bad.breakdown_voltage[0]"></el-input></td>
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
        conditionIndicatorSetting() {
            return this.data.condition_indicator_setting
        }
    },
    methods: {
        calculator() {
            if (this.assessmentSetting.option === 'IEC' && this.assessmentSetting.data.iec.voltage === '') {
                this.$message.warning('IEC standard has no value')
            } else if (this.assessmentSetting.option === 'IEEE' && this.assessmentSetting.data.ieee.voltage === '') {
                this.$message.warning('IEC standard has no value')
            } else if (this.assessmentSetting.option === 'Custom' && this.assessmentSetting.data.custom.voltage === '') {
                this.$message.warning('IEC standard has no value')
            } else if (this.testData.result !== '') {
                this.testData.assessment = 'Fail'
                switch (this.assessmentSetting.option) {
                    case 'IEC':
                        if (parseFloat(this.testData.result) >= parseFloat(this.assessmentSetting.data.iec.voltage)) {
                            this.testData.assessment = 'Pass'
                        }
                        break
                    case 'IEEE':
                        if (parseFloat(this.testData.result) >= parseFloat(this.assessmentSetting.data.ieee.voltage)) {
                            this.testData.assessment = 'Pass'
                        }
                        break

                    case 'Custom':
                        if (parseFloat(this.testData.result) >= parseFloat(this.assessmentSetting.data.custom.voltage)) {
                            this.testData.assessment = 'Pass'
                        }
                        break
                }
            }

            this.$message.success('Calculating successfully')
        },
        clear() {
            this.testData.type_oil = ''
            this.testData.election_gap = ''
            this.testData.result = ''
            this.testData.assessment = ''
            this.testData.condition_indicator = ''
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
