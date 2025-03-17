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
        <!-- Tính toán đánh giá -->
        <el-row class="mgb-10">
            <el-col>
                <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all </el-button>
            </el-col>
        </el-row>
        </div>
        <div style="margin-top: 20px;margin-bottom: 10px;">
            <el-button size="mini" type="info" class="btn-action" @click="testData.option='threePhase'"> Three phase </el-button>
            <el-button size="mini" type="info" class="btn-action" @click="testData.option='perPhase'"> Per phase </el-button>
        </div>
        <table class="table-strip-input-data" style="width: 100%">
            <thead>
                <tr>
                    <th style="width: 100px;">Tap position</th>
                    <th class="phase-col">Phase</th>
                    <th>Rk (Ω)</th>
                    <th>Xk (Ω)</th>
                    <th>Zk (Ω)</th>
                    <th>uk cal (%)</th>
                    <th>uk dev (%)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                </tr>
            </thead>
            <tbody v-if="testData.option === 'threePhase'">
                <template v-for="(item, index) in testData.table">
                    <tr :key="index">
                        <td><el-input size="mini" type="number" v-model="item.tap"></el-input></td>
                        <td style="width: 10%">
                            <div class="col-phase">
                                <div class="phase">
                                    <el-input size="mini" type="text" v-model="item.phase"></el-input>
                                </div>
                                <div class="rectangle" :class="{red: item.phase == 'A', yellow: item.phase == 'B', blue: item.phase == 'C'}"></div>
                            </div>
                        </td>
                        <td>
                            <el-input size="mini" type="number" v-model="item.rk"><template slot="append">Ω</template></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="number" v-model="item.xk"><template slot="append">Ω</template></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="number" v-model="item.zk"><template slot="append">Ω</template></el-input>
                        </td>
                        <template v-if="index % 3 == 0">
                            <td rowspan="3">
                                <el-input size="mini" type="number" v-model="item.ukCal"></el-input>
                            </td>
                        </template>
                        <template v-if="index % 3 == 0" >
                            <td rowspan="3">
                                <el-input size="mini" type="number" v-model="item.ukDev"></el-input>
                            </td>
                        </template>
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
            <tbody v-else>
                <template v-for="(item, index) in testData.table">
                    <tr :key="index">
                        <td><el-input size="mini" type="number" v-model="item.tap"></el-input></td>
                        <td style="width: 10%">
                            <div class="col-phase">
                                <div class="phase">
                                    <el-input size="mini" type="text" v-model="item.phase"></el-input>
                                </div>
                                <div class="rectangle" :class="{red: item.phase == 'A', yellow: item.phase == 'B', blue: item.phase == 'C'}"></div>
                            </div>
                        </td>
                        <td>
                            <el-input size="mini" type="number" v-model="item.rk"><template slot="append">Ω</template></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="number" v-model="item.xk"><template slot="append">Ω</template></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="number" v-model="item.zk"><template slot="append">Ω</template></el-input>
                        </td>
                        <td >
                            <el-input size="mini" type="number" v-model="item.ukCal"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="number" v-model="item.ukDev"></el-input>
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

        <!-- assessment_setting -->
        <el-dialog title="Assessment settings" :visible.sync="openAssessmentDialog" width="600px">
            <el-form size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select class="w-100" placeholder="please select" v-model="assessmentSetting.option">
                        <el-option label="IEEE C57.152 (2013)" value="IEEE"></el-option>
                        <el-option label="CIGRE 445" value="CIGRE"></el-option>
                        <el-option label="Customized limit" value="Custom"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>

            <table v-if="assessmentSetting.option === 'Custom'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="2">Limit</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Three-phase test</th>
                    </tr>
                    <tr>
                        <th>uk dev (%)</th>
                        <td>
                            ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.threePhase.ukDev"></el-input>
                        </td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>uk dev (%)</th>
                        <td>
                            > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.threePhase.ukDev"></el-input>
                        </td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                    <tr>
                        <th>Per-phase test</th>
                    </tr>
                    <tr>
                        <th>uk dev (%)</th>
                        <td>
                            ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.perPhase.ukDev"></el-input>
                        </td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>uk dev (%)</th>
                        <td>
                            > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.perPhase.ukDev"></el-input>
                        </td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>
            <table v-else-if="assessmentSetting.option === 'IEEE'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="2">Limit</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Three-phase test</th>
                    </tr>
                    <tr>
                        <th>uk dev (%)</th>
                        <td>
                            ≤ {{ assessmentSetting.data.ieee.threePhase.ukDev }}
                        </td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>uk dev (%)</th>
                        <td>
                            > {{ assessmentSetting.data.ieee.threePhase.ukDev }}
                        </td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                    <tr>
                        <th>Per-phase test</th>
                    </tr>
                    <tr>
                        <th>uk dev (%)</th>
                        <td>
                            ≤ {{assessmentSetting.data.ieee.perPhase.ukDev}}
                        </td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>uk dev (%)</th>
                        <td>
                            > {{assessmentSetting.data.ieee.perPhase.ukDev}}
                        </td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>
            <table v-else-if="assessmentSetting.option === 'CIGRE'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="2">Limit</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Three-phase test</th>
                    </tr>
                    <tr>
                        <th>uk dev (%)</th>
                        <td>
                            ≤ {{ assessmentSetting.data.cigre.threePhase.ukDev }}
                        </td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>uk dev (%)</th>
                        <td>
                            > {{ assessmentSetting.data.cigre.threePhase.ukDev }}
                        </td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                    <tr>
                        <th>Per-phase test</th>
                    </tr>
                    <tr>
                        <th>uk dev (%)</th>
                        <td>
                            ≤ {{assessmentSetting.data.cigre.perPhase.ukDev}}
                        </td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>uk dev (%)</th>
                        <td>
                            > {{assessmentSetting.data.cigre.perPhase.ukDev}}
                        </td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="600px">
            <table class="table-strip-input-data">
                <thead>
                    <tr>
                        <th>Breakdown voltage (kV)</th>
                        <th class="condition-indicator-col">Condition Indicator</th>
                        <th class="score-col">Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            ≥ <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.good.breakdown_voltage[0]"></el-input>
                        </td>
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
                        <td>
                            &lt; <el-input size="mini" class="w-100px" v-model="conditionIndicatorSetting.bad.breakdown_voltage[1]"></el-input>
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
        },
    },
    computed: {
        testData() {
            return this.data
        },
        assessmentSetting() {
            return this.data.assessment_setting
        },
        conditionIndicatorSetting() {
            return this.data.condition_indicator
        },
        
    },
    watch: {
        'assessmentSetting.option': {
            handler : function() {
                this.testData.table.forEach(element => {
                    element.assessment = ''
                })
            }
        }
    },
    methods: {
        async calculator() {
            await this.CalUkCal()
            await this.CalUkDev()
            await this.ukassessment()
        },
        async ukassessment() {
            if(this.assessmentSetting.option === "CIGRE") {
                if(this.testData.option === 'threePhase') {
                    this.testData.table.forEach((element,index) => {
                        if(!isNaN(parseFloat(element.ukDev))) {
                            if(index%3==0) {
                                if(Math.abs(element.ukDev) <= this.assessmentSetting.data.cigre[this.testData.option].ukDev) {
                                    element.assessment = "Pass"
                                    this.testData.table[index + 1].assessment = "Pass"
                                    this.testData.table[index + 2].assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                    this.testData.table[index + 1].assessment = "Fail"
                                    this.testData.table[index + 2].assessment = "Fail"
                                }
                            }
                        }
                    })
                } else {
                    this.testData.table.forEach((element) => {
                        if(!isNaN(parseFloat(element.ukDev))) {
                            if(element.ukDev <= this.assessmentSetting.data.cigre[this.testData.option].ukDev) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    })
                }
            } else if(this.assessmentSetting.option === "IEEE") {
                if(this.testData.option === 'threePhase') {
                    this.testData.table.forEach((element,index) => {
                        if(!isNaN(parseFloat(element.ukDev))) {
                            if(index%3==0) {
                                if(Math.abs(element.ukDev) <= this.assessmentSetting.data.ieee[this.testData.option].ukDev) {
                                    element.assessment = "Pass"
                                    this.testData.table[index + 1].assessment = "Pass"
                                    this.testData.table[index + 2].assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                    this.testData.table[index + 1].assessment = "Fail"
                                    this.testData.table[index + 2].assessment = "Fail"
                                }
                            }
                        }
                    })
                } else {
                    this.testData.table.forEach((element) => {
                        if(!isNaN(parseFloat(element.ukDev))) {
                            if(element.ukDev <= this.assessmentSetting.data.ieee[this.testData.option].ukDev) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    })
                }
            } else {
                if(this.testData.option === 'threePhase') {
                    this.testData.table.forEach((element,index) => {
                        if(!isNaN(parseFloat(element.ukDev))) {
                            if(index%3==0) {
                                if(Math.abs(element.ukDev) <= this.assessmentSetting.data.custom[this.testData.option].ukDev) {
                                    element.assessment = "Pass"
                                    this.testData.table[index + 1].assessment = "Pass"
                                    this.testData.table[index + 2].assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                    this.testData.table[index + 1].assessment = "Fail"
                                    this.testData.table[index + 2].assessment = "Fail"
                                }
                            }
                        }
                    })
                } else {
                    this.testData.table.forEach((element) => {
                        if(!isNaN(parseFloat(element.ukDev))) {
                            if(element.ukDev <= this.assessmentSetting.data.custom[this.testData.option].ukDev) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    })
                }
            }
        },
        async CalUkCal() {
            if(this.testData.option == "threePhase") {
                const data = JSON.parse(this.$store.state.selectedAsset[0].sec_tert)
                data.forEach(element => {
                    if(!isNaN(parseFloat(element.base_power.value))) {
                        if(!isNaN(parseFloat(element.base_voltage.value))) {
                            if(element.base_voltage.value != 0) {
                                this.testData.table.forEach((cell, index) => {
                                    if(!isNaN(parseFloat(cell.zk)) && cell.tap == element[this.testData.mode]) {
                                        if(index%3==0) {
                                            let temp = parseFloat(this.testData.table[index].zk) + parseFloat(this.testData.table[index+1].zk) + parseFloat(this.testData.table[index+2].zk)
                                            if(!isNaN(temp)) {
                                                cell.ukCal = temp/3 * (parseFloat(element.base_power.value) / (Math.pow(parseFloat(element.base_voltage.value), 2)))
                                                cell.ukCal = cell.ukCal * 100
                                                cell.ukCal = cell.ukCal.toFixed(4)
                                            }
                                            
                                        }
                                    }
                                })
                            }
                        }
                    }
                })
            } else {
                const data = JSON.parse(this.$store.state.selectedAsset[0].sec_tert)
                data.forEach(element => {
                    if(!isNaN(parseFloat(element.base_power.value))) {
                        if(!isNaN(parseFloat(element.base_voltage.value))) {
                            if(element.base_voltage.value != 0) {
                                this.testData.table.forEach(cell => {
                                    if(!isNaN(parseFloat(cell.zk)) && cell.tap == element[this.testData.mode]) {
                                        cell.ukCal = cell.zk * (parseFloat(element.base_power.value) / (Math.pow(parseFloat(element.base_voltage.value), 2)))
                                        cell.ukCal = cell.ukCal * 100
                                        cell.ukCal = cell.ukCal.toFixed(4)
                                    }
                                })
                            }
                        }
                    }
                })
            }
        },
        async CalUkDev() {
            if(this.testData.option == "threePhase") {
                const data = JSON.parse(this.$store.state.selectedAsset[0].sec_tert)
                data.forEach(element => {
                    if(!isNaN(parseFloat(element.short_circuit_impedances_uk))) {
                        if(element.short_circuit_impedances_uk != 0) {
                            this.testData.table.forEach((cell, index) => {
                                if(!isNaN(parseFloat(cell.ukCal)) && cell.tap == element[this.testData.mode]) {
                                    if(index%3==0) {
                                        cell.ukDev = 100 * (cell.ukCal - element.short_circuit_impedances_uk)/element.short_circuit_impedances_uk
                                    }
                                }
                            })
                        }
                    }
                })
            } else {
                const data = JSON.parse(this.$store.state.selectedAsset[0].sec_tert)
                data.forEach(element => {
                    if(!isNaN(parseFloat(element.short_circuit_impedances_uk))) {
                        if(element.short_circuit_impedances_uk != 0) {
                            let temp = 0
                            this.testData.table.forEach((cell, index) => {
                                if(!isNaN(parseFloat(cell.ukCal)) && cell.tap == element[this.testData.mode]) {
                                    if(index%3==0) {
                                        temp = parseFloat(this.testData.table[index].ukCal) + parseFloat(this.testData.table[index+1].ukCal) + parseFloat(this.testData.table[index+2].ukCal)
                                    }
                                    if(!isNaN(temp) && temp != 0) {
                                    cell.ukDev = 100 * (cell.ukCal - (temp/3)) / (temp/3) 
                                }
                                }
                            })
                        }
                    }
                })
            }
        },
        clear() {
            this.testData.table.forEach((element) => {
                Object.keys(element).forEach(e => {
                    if(!["tap", "phase"].includes(e))
                        element[e] = ''
                })
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
