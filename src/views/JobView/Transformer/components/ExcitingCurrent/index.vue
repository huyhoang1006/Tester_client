<template>
    <div id="exciting-current">
        <!-- Cấu hình -->
        <el-row class="mgb-10">
            <el-col>
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

        <table class="table-strip-input-data" style="width: 100% ; font-size: 12px;">
            <thead>
                <tr>
                    <th class="no-col">Tap</th>
                    <th class="phase-col">Phase</th>
                    <th>I out</th>
                    <th>Watt losses</th>
                    <th>I ref</th>
                    <th>I dev (%)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition Indicator</th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table">
                    <tr :key="index">
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
                            <el-input size="mini" type="text" v-model="item.i_out"><template slot="append">mA</template> </el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.watt_losses"><template slot="append">W</template> </el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.i_ref"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.dev_per"></el-input>
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
                </template>
            </tbody>
        </table>

        <!-- Condition indicator settings -->
        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="640px">
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
                        <td>Dev (%) ≤ <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.good.dev_per[0]"></el-input></td>
                        <td class="good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.good.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.fair.dev_per[0]"></el-input> &lt; Dev (%) ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.fair.dev_per[1]"></el-input>
                        </td>
                        <td class="fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.fair.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.poor.dev_per[0]"></el-input> &lt; Dev (%) ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.poor.dev_per[1]"></el-input>
                        </td>
                        <td class="poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.poor.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>Dev (%) > <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.bad.dev_per[1]"></el-input></td>
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
    props: {
        data: {
            type: Object,
            require: true
        }
    },
    data() {
        return {
            openConditionIndicatorDialog: false,
        }
    },
    computed: {
        testData() {
            return this.data
        },
        conditionIndicatorSetting() {
            return this.data.condition_indicator_setting
        }
    },
    methods: {
        calculator() {
            this.testData.table.forEach((item) => {
                if (item.i_out !== '' && item.i_ref !== '') {
                    item.dev_per = 100 * ((item.i_out - item.i_ref) / item.i_ref)
                }

                if (item.dev_per !== '') {
                    item.dev_per = item.dev_per.toFixed(this.$config.RoundConfig)
                }
            })

            this.$message.success('Calculating successfully')
        },
        clear() {
            this.testData.table.forEach((element) => {
                element.i_out = ''
                element.i_ref = ''
                element.watt_losses = ''
                element.dev_per = ''
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

<style lang="scss" scoped>
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
