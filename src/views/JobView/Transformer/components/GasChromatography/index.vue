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

        <el-row style="margin-top: 20px; margin-bottom: 10px;">
            <el-col style="width: 30%;">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Sampling point">
                        <el-input v-model="option.samplingPoint"></el-input>
                    </el-form-item>
                    <el-form-item label="Sampling date">
                        <el-date-picker
                            v-model="option.samplingDate"
                            size="mini"
                            style="width: 100%"
                            format="MM/dd/yyyy"
                            value-format="MM/dd/yyyy"
                            type="date"
                            placeholder="Pick a day">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="Product name">
                        <el-input v-model="option.productName"></el-input>
                    </el-form-item>
                    <el-form-item label="DP parameter">
                        <el-input v-model="option.dp"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <table style="width: 80%; font-size: 12px;" class="table-strip-input-data">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Method</th>
                    <th>Result (ppm)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col fix_width">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table">
                    <tr :key="index">
                        <td>
                            <el-input size="mini" type="text" v-model="item.name.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.method.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.result.value"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment.value">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                                <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                            </el-select>
                            <span v-if="item.assessment.value === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                            <span v-else-if="item.assessment.value === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                        </td>
                        <td>
                            <el-input id="condition" type="text" size="mini" v-model="item.condition_indicator.value">
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

    </div>
</template>

<script>
/* eslint-disable */
export default {
    name : "GasChromatography",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            labelWidth : '150px'
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
        option() {
            return this.data.option
        }
    },
    watch : {
    },
    methods: {
        add() {
            console.log(this.testData)
            this.testData.table.push({
                 name: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'string'
                        },
                        method: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'string'
                        },
                        result: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'string'
                        },
                        assessment: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        condition_indicator: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        }
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
                 name: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'string'
                        },
                        method: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'string'
                        },
                        result: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'string'
                        },
                        assessment: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        },
                        condition_indicator: {
                            mrid: '',
                            value: '',
                            unit: '',
                            type: 'discrete'
                        }
            }
            this.testData.table.splice(index+1, 0, data)
        },
        calculator() {
            this.$message.success('Calculating successfully')
        },

        clear() {
            this.testData.table.forEach((element) => {
                element.name= '',
                element.method= '',
                element.result= '',
                element.assessment= '',
                element.condition_indicator= ''
            })
        },
    }
}
</script>

<style lang="scss" scoped>

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
