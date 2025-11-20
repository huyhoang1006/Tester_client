<template>
    <div id="dc-winding-resistance-prim">

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

        <!-- Tương tác với bảng -->
        <el-row class="mgb-10">
            <el-col>
                <el-button size="mini" type="primary" class="btn-action" @click="calculator" > <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all</el-button>
            </el-col>
        </el-row>
        </div>

        <table class="table-strip-input-data" style="width: 100% ; font-size: 12px;">
            <thead>
                <tr>
                    <th class="no-col fix_width">No</th>
                    <th>Measurement</th>
                    <th>R<sub>60s ref</sub> (M&ohm;)</th>
                    <th>R<sub>60s</sub> (M&ohm;)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col fix_width">Condition indicator</th>
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
                            <el-input size="mini" type="text" v-model="item.r60sRef"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.r60s"></el-input>
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

        <!-- assessment settings -->
        <el-dialog title="Assessment settings" :visible.sync="openAssessmentDialog" width="800px">
            <el-form size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select class="w-100" placeholder="please select" v-model="assessmentSetting.option">
                        <el-option label="IEEE C57.152 (2013) - New transformer" value="IEEEnewTrans"></el-option>
                        <el-option label="IEEE C57.152 (2013) - Service aged transformer" value="IEEEserviceTrans"></el-option>
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
                <tbody v-if="assessmentSetting.option === 'IEEEnewTrans'">
                    <tr>
                        <td>R<sub>60s</sub> > {{ assessmentSetting.data.IEEEnewTrans.pass }} MΩ</td>
                        <td class="bolder"><i class="fas fa-check-square pass"></i> Pass</td>
                    </tr>
                    <tr>
                        <td>R<sub>60s</sub> &#8804; {{ assessmentSetting.data.IEEEnewTrans.pass }}MΩ</td>
                        <td class="bolder"><i class="fa-solid fa-xmark fail"></i> Fail - Manufacturer to be consulted for values less than 500 MΩ for proper course of action</td>
                    </tr>
                </tbody>
                <tbody v-if="assessmentSetting.option === 'IEEEserviceTrans'">
                    <tr>
                        <td>R<sub>60s</sub> > {{ assessmentSetting.data.IEEEserviceTrans.pass }} MΩ</td>
                        <td class="bolder"><i class="fas fa-check-square pass"></i> Pass</td>
                    </tr>
                    <tr>
                        <td>{{ assessmentSetting.data.IEEEserviceTrans.fail }} MΩ ≤ R<sub>60s</sub> ≤ {{ assessmentSetting.data.IEEEserviceTrans.pass }}MΩ</td>
                        <td class="bolder"><i class="fa-solid fa-xmark fail"></i> Fail - Indicative of insulation deterioration</td>
                    </tr>
                    <tr>
                        <td>R<sub>60s</sub> &lt; {{ assessmentSetting.data.IEEEserviceTrans.pass }} MΩ</td>
                        <td class="bolder"><i class="fa-solid fa-xmark fail"></i> Fail - Needs to be investigated</td>
                    </tr>
                </tbody>
                <tbody v-if="assessmentSetting.option === 'custom'">
                    <tr>
                        <td>R<sub>60s</sub> > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass"></el-input> MΩ</td>
                        <td class="bolder"><i class="fas fa-check-square pass"></i> Pass</td>
                    </tr>
                    <tr>
                        <td>R<sub>60s</sub> ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.pass"></el-input> MΩ</td>
                        <td class="bolder"><i class="fa-solid fa-xmark fail"></i> Fail</td>
                    </tr>
                </tbody>
            </table>
        </el-dialog>

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
                                <div>R<sub>60s</sub> ≥ {{ conditionIndicatorSetting.good.r60s[1] }} MΩ</div>
                            </div>
                        </td>
                        <td class="good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.good.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>{{ conditionIndicatorSetting.fair.r60s[0] }} MΩ ≤ R<sub>60s</sub> &lt; {{ conditionIndicatorSetting.fair.r60s[1] }} MΩ , R<sub>60s</sub> ≥ {{ conditionIndicatorSetting.fair.r60sref[0] }}% R<sub>60s ref</sub> </div>
                            </div>
                        </td>
                        <td class="fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.fair.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>{{ conditionIndicatorSetting.poor.r60s[0] }} MΩ ≤ R<sub>60s</sub> &lt; {{ conditionIndicatorSetting.poor.r60s[1] }} MΩ , R<sub>60s</sub> ≥ {{ conditionIndicatorSetting.poor.r60sref[0] }}% R<sub>60s ref</sub> </div>
                            </div>
                        </td>
                        <td class="poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorSetting.poor.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <div class="flex-container">
                                <div>R<sub>60s</sub> ≥ {{ conditionIndicatorSetting.bad.r60s[0] }} MΩ</div>
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
    name : "InsulationResistanceYokeCore",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
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
            return this.data.condition_indicator
        },
    },
    watch : {
        'assessmentSetting.option' : {
            handler : function() {
                this.testData.table.forEach((element) => {
                    element.assessment= ''
                })
            }
        }
    },
    methods: {
        add() {
            this.testData.table.push({
                measurement: '',
                r60sRef: '',
                r60s: '',
                assessment: '',
                condition_indicator: ''
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
                r60sRef: '',
                r60s: '',
                assessment: '',
                condition_indicator: ''
            }
            this.testData.table.splice(index+1, 0, data)
        },
        calculator() {
            if(this.assessmentSetting.option === "IEEEnewTrans") {
                this.testData.table.forEach(element => {
                    if(!isNaN(parseFloat(element.r60s))) {
                        if(parseFloat(element.r60s) > parseFloat(this.assessmentSetting.data.IEEEnewTrans.pass)) {
                            element.assessment = 'Pass'
                        } else {
                            element.assessment = "Fail"
                        }
                    }
                })
            } else if(this.assessmentSetting.option === "IEEEserviceTrans") {
                this.testData.table.forEach(element => {
                    if(!isNaN(parseFloat(element.r60s))) {
                        if(element.r60s > parseFloat(this.assessmentSetting.data.IEEEserviceTrans.pass)) {
                            element.assessment = "Pass"
                        } else {
                            element.assessment = "Fail"
                        }
                    }
                })
            } else {
                this.testData.table.forEach(element => {
                    if(!isNaN(parseFloat(element.r60s))) {
                        if(element.r60s > parseFloat(this.assessmentSetting.data.custom.pass)) {
                            element.assessment = "Pass"
                        }
                        if(element.r60s <= parseFloat(this.assessmentSetting.data.custom.pass)) {
                            element.assessment = "Fail"
                        }
                    }
                })
            }
            this.$message.success('Calculating successfully')
        },

        clear() {
            this.testData.table.forEach((element) => {
                element.measurement= '',
                element.r60sRef= '',
                element.r60s= '',
                element.assessment= '',
                element.condition_indicator= ''
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
    background: #ffff00;
}

.Poor input {
    background: #ff9900;
}

.Bad input {
    background: #ff3300;
}
</style>
