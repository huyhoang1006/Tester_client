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

        <div style="font-weight: bold; margin-top: 5%;"> Decomposition of SF<sub>6</sub> (ppm)</div>
        <br />
        <table class="table-strip-input-data" style="width: 50%">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Decomposition of SF6 (ppm)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add('decomSf6Table')" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll('decomSf6Table')" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table.decomSf6Table">
                    <tr :key="index">
                        <td>
                            {{index + 1}}
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.decomSf6.value"></el-input>
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
                            <el-input :class="nameColor(item.condition_indicator.value)" id="condition" type="text" size="mini" v-model="item.condition_indicator.value">
                            </el-input>
                        </td>
                        <td>
                            <el-button size="mini" type="primary" class="w-100" @click="addTest(index, 'decomSf6Table')">
                                <i class="fa-solid fa-plus"></i>
                            </el-button>
                        </td>
                        <td>
                            <el-button size="mini" type="danger" class="w-100" @click="deleteTest(index, 'decomSf6Table')">
                                <i class="fas fa-trash"></i>
                            </el-button>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
        <div style="font-weight: bold; margin-top: 5%;"> SO<sub>2</sub> + SOF<sub>2</sub> (ppm)</div>
        <br />
        <table class="table-strip-input-data" style="width: 50%">
            <thead>
                <tr>
                    <th>No</th>
                    <th>SO<sub>2</sub> + SOF<sub>2</sub> (ppm)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add('so2Sof2Table')" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll('so2Sof2Table')" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table.so2Sof2Table">
                    <tr :key="index">
                        <td>
                            {{index + 1}}
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.so2Sof2.value"></el-input>
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
                            <el-input :class="nameColor(item.condition_indicator.value)" id="condition" type="text" size="mini" v-model="item.condition_indicator.value">
                            </el-input>
                        </td>
                        <td>
                            <el-button size="mini" type="primary" class="w-100" @click="addTest(index, 'so2Sof2Table')">
                                <i class="fa-solid fa-plus"></i>
                            </el-button>
                        </td>
                        <td>
                            <el-button size="mini" type="danger" class="w-100" @click="deleteTest(index, 'so2Sof2Table')">
                                <i class="fas fa-trash"></i>
                            </el-button>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
        <div style="font-weight: bold; margin-top: 5%;"> HF (ppm)</div>
        <br />
        <table class="table-strip-input-data" style="width: 50%">
            <thead>
                <tr>
                    <th>No</th>
                    <th>HF (ppm)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add('hfTable')" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll('hfTable')" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table.hfTable">
                    <tr :key="index">
                        <td>
                            {{index + 1}}
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.hf.value"></el-input>
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
                            <el-input :class="nameColor(item.condition_indicator.value)" id="condition" type="text" size="mini" v-model="item.condition_indicator.value">
                            </el-input>
                        </td>
                        <td>
                            <el-button size="mini" type="primary" class="w-100" @click="addTest(index, 'hfTable')">
                                <i class="fa-solid fa-plus"></i>
                            </el-button>
                        </td>
                        <td>
                            <el-button size="mini" type="danger" class="w-100" @click="deleteTest(index, 'hfTable')">
                                <i class="fas fa-trash"></i>
                            </el-button>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
        <!-- Assessment settings -->
        <el-dialog title="Assessment settings" :visible.sync="openAssessmentDialog" width="600px">
        </el-dialog>
    </div>
</template>

<script>
export default {
    name :"sf6GasAnalysis",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            asset_ : {}
        }
    },
    props: {
        data: {
            type: Object,
            require: true
        },
        asset : {
            type: Object,
            require: true
        }
    },
    computed: {
        testData() {
            return this.data
        },
        assetData() {
            if (!this.asset || !this.asset.assessmentLimits) {
                return {}
            }
            try {
                return JSON.parse(this.asset.assessmentLimits)
            } catch (error) {
                console.error('Error parsing assessmentLimits:', error)
                return {}
            }
        }
    },
    watch : {
        assetData : {
            deep : true,
            immediate : true,
            handler : function(newVal) {
                this.asset_ = newVal
            }
        }
    },
    methods: {
        add(label) {
            if(label === 'decomSf6Table') {
                let data = {
                    mrid: '',   
                    decomSf6 : {
                        mrid: '',
                        value: '',
                        unit: 'ppm',
                        type: 'analog'
                    },
                    assessment : {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator : {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                }
                this.testData.table[label].push(data)
           }
           else if(label === 'so2Sof2Table') {
                let data = {
                    mrid: '',
                    so2Sof2 : {
                        mrid: '',
                        value: '',
                        unit: 'ppm',
                        type: 'analog'
                    },
                    assessment : {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator : {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                }
                this.testData.table[label].push(data)
           } else {
                let data = {
                    mrid: '',
                    hf : {
                        mrid: '',
                        value: '',
                        unit: 'ppm',
                        type: 'analog'
                    },
                    assessment : {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator : {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                }
                this.testData.table[label].push(data)
           }
        },
        removeAll(label) {
            this.$confirm('This will delete the content. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                })
                .then( () => {
                    this.testData.table[label] = []
                })
                .catch( () => {
                    // User cancelled, do nothing
                })
        },
        deleteTest(index, label) {
            this.testData.table[label].splice(index, 1)
        },
        addTest(index, label) {
           if(label === 'decomSf6Table') {
                let data = {
                    mrid: '',
                    decomSf6 : {
                        mrid: '',
                        value: '',
                        unit: 'ppm',
                        type: 'analog'
                    },
                    assessment : {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator : {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                }
                this.testData.table[label].splice(index+1, 0, data)
           }
           else if(label === 'so2Sof2Table') {
                let data = {
                    mrid: '',
                    so2Sof2 : {
                        mrid: '',
                        value: '',
                        unit: 'ppm',
                        type: 'analog'
                    },
                    assessment : {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator : {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                }
                this.testData.table[label].splice(index+1, 0, data)
           } else {
            let data = {
                    mrid: '',
                    hf : {
                        mrid: '',
                        value: '',
                        unit: 'ppm',
                        type: 'analog'
                    },
                    assessment : {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator : {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                }
                this.testData.table[label].splice(index+1, 0, data)
           }
        },
        calculator() {
            this.$message.success('Calculating successfully')
        },

        clear() {
            this.testData.table.forEach((element) => {
                Object.keys(element).forEach((key) => {
                    element[key] = ''
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
table, th, tr, td {
    white-space: nowrap;
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
