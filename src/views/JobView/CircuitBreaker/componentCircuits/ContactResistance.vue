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

        <!-- Tương tác với bảng -->
        <el-row class="mgb-10">
            <el-col>
                <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all</el-button>
            </el-col>
        </el-row>
        </div>

        <div v-if="assetData.circuitBreaker.numberOfInterruptPhase === 1">
            <br />
            <table class="table-strip-input-data" style="width: 80%">
                <thead>
                    <th>Phase</th>
                    <th>I test (A)</th>
                    <th>Contact resistance (&#181;&#8486;)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in testData.table" :key="index">
                        <td>
                            <div style="display: flex; width: 100%;">
                                    <el-input size="mini" v-model="item.phase"></el-input>
                                    <div :class="{colorTableRed : item.phase=='A', colorTableYellow : item.phase=='B', colorTableBlue : item.phase=='C'}"></div>
                                </div>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.iTest"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.contactResistance"></el-input>
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
                            <el-input size="mini" v-model="item.condition_indicator"></el-input>
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
                </tbody>
            </table>
        </div>

        <div v-if="assetData.circuitBreaker.numberOfInterruptPhase > 1">
            <br />
            <table class="table-strip-input-data" style="width: 80%">
                <thead class="test">
                    <th>Phase</th>
                    <th>Interrupter no.</th>
                    <th>I test (A)</th>
                    <th>Contact resistance (&#181;&#8486;)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">condition indicator</th>
                    <th class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th class="action-col"><i class="fa-solid fa-trash pointer "></i></th>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in testData.table" :key="index">
                        <td v-if="index % assetData.circuitBreaker.numberOfInterruptPhase === 0" :rowspan="assetData.circuitBreaker.numberOfInterruptPhase">
                            <div style="display: flex; width: 100%;">
                                   <el-input size="mini" v-model="item.phase"></el-input>  
                                   <div :class="{colorTableRed : item.phase=='A', colorTableYellow : item.phase=='B', colorTableBlue : item.phase=='C'}"></div>
                                </div>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.interruptNo"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.iTest"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.contactResistance"></el-input>
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
                            <el-input size="mini" v-model="item.condition_indicator"></el-input>
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
                </tbody>
            </table>
        </div>

       
        <!-- Assessment settings -->
        <el-dialog class="dialog_assess" title="Assessment settings" :visible.sync="openAssessmentDialog" width="75%">
            <el-radio-group v-model="testData.limits" style="margin-bottom: 20px">
                <el-radio label="Absolute" value="Absolute"></el-radio>
                <el-radio label="Relative" value="Relative"></el-radio>
            </el-radio-group>
            <transition>
            <table class="table-strip-input-data" v-if="testData.limits === 'Absolute'">
                <thead>
                    <tr>
                        <th></th>
                        <th>R min</th>
                        <th>R max</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Contact resistance</td>
                        <td>
                            <el-input size="mini" v-model="asset_.contactSys.abs.rmin">
                                <template slot="append">&#181;&#8486;</template>
                            </el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="asset_.contactSys.abs.rmax" >
                                <template slot="append">&#181;&#8486;</template>
                            </el-input>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table class="table-strip-input-data" v-if="testData.limits === 'Relative'">
                <thead>
                    <tr>
                        <th></th>
                        <th>R ref</th>
                        <th>R dev</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Contact resistance</td>
                        <td>
                            <el-input size="mini" v-model="asset_.contactSys.rel.rref">
                                <template slot="append">&#181;&#8486;</template>
                            </el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="asset_.contactSys.rel.rdev" >
                                <template slot="append">&#181;&#8486;</template>
                            </el-input>
                        </td>
                    </tr>
                </tbody>
            </table>
            </transition>
            <br />
            <template #footer>
                <span style="margin-top: 20px; width: 100%; position: absolute; right: 10px; bottom: 10px" class="dialog-footer">
                    <el-button @click="resetAssessment">Cancel</el-button>
                    <el-button type="primary" @click="updateAssessment"> Confirm </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name :"contactResistance",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            asset_: {},
            back_asset : {},
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
    beforeMount(){
        const asset = {
            id : this.asset.id,
            assessmentLimits : this.asset_
        }
        const dataTemp = JSON.parse(JSON.stringify(asset))
        this.back_asset = dataTemp.assessmentLimits
    },
    computed: {
        testData() {
            return this.data
        },
        assetData() {
            return {
                circuitBreaker: JSON.parse(this.asset.circuitBreaker),
                operating: JSON.parse(this.asset.operating)
            }
        },
        assessLimitsData() {
            return JSON.parse(this.asset.assessmentLimits)
        }
    },
    watch: {
        assessLimitsData: {
            deep: true,
            immediate: true,
            handler: function (newVal) {
                this.asset_ = newVal
            }
        }
    },
    methods: {
        resetAssessment() {
            this.asset_ = this.back_asset
            this.openAssessmentDialog = false
        },
        async updateAssessment() {
            const asset = {
                id: this.asset.id,
                assessmentLimits: this.asset_
            }
            const data = await window.electronAPI.updateCircuitAssessmentLimits(asset)
            const dataTemp = JSON.parse(JSON.stringify(asset))
            this.back_asset = dataTemp.assessmentLimits
            if (data.success) {
                this.$message.success('Update successfully')
                this.openAssessmentDialog = false
            } else {
                this.$message.error('Update cannot complete')
                this.openAssessmentDialog = false
            }
        },
        calculator() {
            this.$message.success('Calculating successfully')
            this.testData.table.forEach(item => {
                if (this.testData.limits === 'Absolute'){
                    if (parseFloat(item.contactResistance) >= parseFloat(this.asset_.contactSys.abs.rmin) && 
                    parseFloat(item.contactResistance) <= parseFloat(this.asset_.contactSys.abs.rmax)){
                        item.assessment = 'Pass'
                    }
                    else {
                        item.assessment = 'Fail'
                    }
                }
                if(this.testData.limits === 'Relative'){
                    if (parseFloat(item.contactResistance) >= parseFloat(this.asset_.contactSys.rel.rref) - parseFloat(this.asset_.contactSys.rel.rdev) &&
                    parseFloat(item.contactResistance) <= parseFloat(this.asset_.contactSys.rel.rref) + parseFloat(this.asset_.contactSys.rel.rdev)){
                        item.assessment = 'Pass'
                    }
                    else {
                        item.assessment = 'Fail'
                    }
                }
            })
        },

        clear() {
            this.testData.table.forEach((element) => {
                    Object.keys(element).forEach((key) => {
                        element[key] = ''
                })
            })
        },
        nameColor(data) {
            if (data === this.$constant.GOOD) {
                return 'Good'
            } else if (data === this.$constant.FAIR) {
                return 'Fair'
            } else if (data === this.$constant.POOR) {
                return 'Poor'
            } else if (data === this.$constant.BAD) {
                return 'Bad'
            } else {
                return
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.test {
    th:not(:nth-child(1)) {
        white-space: nowrap;
    }
    th:nth-child(1) {
        min-width: 50px;
    }
} 
th {
    text-align: center;
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
