<template>
    <div id="energy-efficiency">
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
                    <th>H<sub>2</sub></th>
                    <th>CH<sub>4</sub></th>
                    <th>C<sub>2</sub>H<sub>2</sub></th>
                    <th>C<sub>2</sub>H<sub>4</sub></th>
                    <th>C<sub>2</sub>H<sub>6</sub></th>
                    <th>CO</th>
                    <th>CO<sub>2</sub></th>
                    <th>TDCG</th>
                    <th>Status</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <el-input type="number" size="mini" v-model="testData.h2">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="number" size="mini" v-model="testData.ch4">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="number" size="mini" v-model="testData.c2h2">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="number" size="mini" v-model="testData.c2h4">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="number" size="mini" v-model="testData.c2h6">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="number" size="mini" v-model="testData.co">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="number" size="mini" v-model="testData.co2">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-input type="number" size="mini" v-model="testData.tdcg">
                            <template slot="append">ppm</template>
                        </el-input>
                    </td>
                    <td>
                        <el-select style="width: 120px" size="mini" v-model="testData.status">
                            <el-option label="Condition 1" value="Condition 1"></el-option>
                            <el-option label="Condition 2" value="Condition 2"></el-option>
                            <el-option label="Condition 3" value="Condition 3"></el-option>
                            <el-option label="Condition 4" value="Condition 4"></el-option>
                        </el-select>
                    </td>
                    <td>
                        <el-input :class="nameColor()" id="condition" type="text" size="mini" v-model="testData.condition_indicator">
                        </el-input>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Condition indicator settings -->
        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="1120px">
            <table class="table-strip-input-data mgb-10">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>H2</th>
                        <th>C2H2</th>
                        <th>C2H4</th>
                        <th>C2H6</th>
                        <th>CH4</th>
                        <th>CO</th>
                        <th>TDCG</th>
                        <th>Condition Indicator</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Condition 1</td>
                        <td>≤ {{ conditionIndicatorSetting.good.h2[0] }}</td>
                        <td>≤ {{ conditionIndicatorSetting.good.c2h2[0] }}</td>
                        <td>≤ {{ conditionIndicatorSetting.good.c2h4[0] }}</td>
                        <td>≤ {{ conditionIndicatorSetting.good.c2h6[0] }}</td>
                        <td>≤ {{ conditionIndicatorSetting.good.ch4[0] }}</td>
                        <td>≤ {{ conditionIndicatorSetting.good.co[0] }}</td>
                        <td>≤ {{ conditionIndicatorSetting.good.tdcg[0] }}</td>
                        <td class="good">Good</td>
                        <td>{{ conditionIndicatorSetting.good.score }}</td>
                    </tr>
                    <tr>
                        <td>Condition 2</td>
                        <td>{{ `${conditionIndicatorSetting.fair.h2[0]} - ${conditionIndicatorSetting.fair.h2[1]}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.fair.c2h2[0]} - ${conditionIndicatorSetting.fair.c2h2[1]}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.fair.c2h4[0]} - ${conditionIndicatorSetting.fair.c2h4[1]}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.fair.c2h6[0]} - ${conditionIndicatorSetting.fair.c2h6[1]}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.fair.ch4[0]} - ${conditionIndicatorSetting.fair.ch4[1]}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.fair.co[0]} - ${conditionIndicatorSetting.fair.co[1]}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.fair.tdcg[0]} - ${conditionIndicatorSetting.fair.tdcg[1]}` }}</td>
                        <td class="fair">Fair</td>
                        <td>{{ conditionIndicatorSetting.fair.score }}</td>
                    </tr>
                    <tr>
                        <td>Condition 3</td>
                        <td>{{ `${conditionIndicatorSetting.poor.h2[0]} - ${conditionIndicatorSetting.poor.h2[1]}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.poor.c2h2[0]} - ${conditionIndicatorSetting.poor.c2h2[1]}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.poor.c2h4[0]} - ${conditionIndicatorSetting.poor.c2h4[1]}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.poor.c2h6[0]} - ${conditionIndicatorSetting.poor.c2h6[1]}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.poor.ch4[0]} - ${conditionIndicatorSetting.poor.ch4[1]}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.poor.co[0]} - ${conditionIndicatorSetting.poor.co[1]}` }}</td>
                        <td>{{ `${conditionIndicatorSetting.poor.tdcg[0]} - ${conditionIndicatorSetting.poor.tdcg[1]}` }}</td>
                        <td class="poor">Poor</td>
                        <td>{{ conditionIndicatorSetting.poor.score }}</td>
                    </tr>
                    <tr>
                        <td>Condition 4</td>
                        <td>> {{ conditionIndicatorSetting.bad.h2[1] }}</td>
                        <td>> {{ conditionIndicatorSetting.bad.c2h2[1] }}</td>
                        <td>> {{ conditionIndicatorSetting.bad.c2h4[1] }}</td>
                        <td>> {{ conditionIndicatorSetting.bad.c2h6[1] }}</td>
                        <td>> {{ conditionIndicatorSetting.bad.ch4[1] }}</td>
                        <td>> {{ conditionIndicatorSetting.bad.co[1] }}</td>
                        <td>> {{ conditionIndicatorSetting.bad.tdcg[1] }}</td>
                        <td class="bad">Bad</td>
                        <td>{{ conditionIndicatorSetting.bad.score }}</td>
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
        testData: function () {
            return this.data
        },
        conditionIndicatorSetting() {
            return this.data.condition_indicator_setting
        }
    },
    methods: {
        calculator() {
            this.$message.success('Calculating successfully')
        },
        clear() {
            this.testData.h2 = ''
            this.testData.ch4 = ''
            this.testData.c2h2 = ''
            this.testData.c2h4 = ''
            this.testData.c2h6 = ''
            this.testData.co = ''
            this.testData.co2 = ''
            this.testData.tdcg = ''
            this.testData.status = ''
            this.testData.condition_indicator = ''
        },
        nameColor() {
            if(this.testData.condition_indicator === this.$constant.GOOD) {
                return 'Good'
            }
            else if(this.testData.condition_indicator === this.$constant.FAIR) {
                return 'Fair'
            }
            else if(this.testData.condition_indicator === this.$constant.POOR) {
                return 'Poor'
            }
            else if(this.testData.condition_indicator === this.$constant.BAD) {
                return 'Bad'
            }
            else {
                return;
            }
        }
    },
    watch: {
        testData: {
            handler: function () {
                if (
                    this.testData.h2 !== '' &&
                    this.testData.ch4 !== '' &&
                    this.testData.c2h2 !== '' &&
                    this.testData.c2h4 !== '' &&
                    this.testData.c2h6 !== '' &&
                    this.testData.co !== '' &&
                    this.testData.co2 !== ''
                ) {
                    this.testData.tdcg =
                        +this.testData.h2 +
                        +this.testData.ch4 +
                        +this.testData.c2h2 +
                        +this.testData.c2h4 +
                        +this.testData.c2h6 +
                        +this.testData.co +
                        +this.testData.co2
                }
            },
            deep: true,
            immediate: true
        }
    }
}

</script>

<style>

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

