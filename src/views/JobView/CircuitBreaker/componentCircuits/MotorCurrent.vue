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
                    <el-button size="mini" type="primary" class="btn-action" @click="calculator" > <i class="fas fa-circle-play"></i> Assess results </el-button>
                    <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all</el-button>
                </el-col>
            </el-row>
        </div>

        <table class="table-strip-input-data" style="width: 70%">
            <thead>
                <tr>
                    <th>Inrush current (A)</th>
                    <th>Charging (s)</th>
                    <th>Charging current (A)</th>
                    <th>Minimum voltage (V)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table">
                    <tr :key="index">
                        <td>
                            <el-input size="mini" type="text" v-model="item.inrushCurrent"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.charging"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.chargingCurrent"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.miniVoltage"></el-input>
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

        <!-- Assessment settings -->
        <el-dialog class="dialog_assess" title="Assessment settings" :visible.sync="openAssessmentDialog" width="600px">

                <el-radio-group v-model="testData.limits">
                    <el-radio label="Absolute" value="Absolute"></el-radio>
                    <el-radio label="Relative" value="Relative"></el-radio>
                </el-radio-group>

                <transition>
                    <table v-if="testData.limits === 'Absolute'" class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Minimum</th>
                                <th>Maximum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in motorCharacteristics" :key="index">
                                <td>{{item}}</td>
                                <td>
                                    <el-input size="mini" v-model="asset_.motorChar.abs[index].min">
                                        <template v-if="index === 1" slot="append">s</template>
                                        <template v-else-if="index === 3" slot="append">V</template>
                                        <template v-else slot="append">A</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="asset_.motorChar.abs[index].max" >
                                        <template v-if="index === 1" slot="append">s</template>
                                        <template v-else-if="index === 3" slot="append">V</template>
                                        <template v-else slot="append">A</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table v-if="testData.limits === 'Relative'" class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Reference</th>
                                <th>Deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in motorCharacteristics" :key="index">
                                <td>{{item}}</td>
                                    <el-input size="mini" v-model="asset_.motorChar.rel[index].ref">
                                        <template v-if="index === 1" slot="append">s</template>
                                        <template v-else-if="index === 3" slot="append">V</template>
                                        <template v-else slot="append">A</template>
                                    </el-input>
                                <td>
                                    <el-input size="mini" v-model="asset_.motorChar.rel[index].dev">
                                        <template v-if="index === 1" slot="append">s</template>
                                        <template v-else-if="index === 3" slot="append">V</template>
                                        <template v-else slot="append">A</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </transition>

                <br>
                <template #footer>
                <span style=" margin-top: 20px; width:100%; position: absolute; right: 10px; bottom: 10px;" class="dialog-footer">
                    <el-button @click="resetAssessment">Cancel</el-button>
                    <el-button type="primary" @click="updateAssessment">
                    Confirm
                    </el-button>
                </span>
                </template>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name :"motorCurrent",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            asset_ : {},
            back_asset : {},
            motorCharacteristics : [
                "Inrush current",
                "Charging time",
                "Charging current",
                "Minimum voltage"
            ]
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
            return JSON.parse(this.asset.assessmentLimits)
        }
    },
    methods: {
        async updateAssessment() {
            const asset = {
                id : this.asset.id,
                assessmentLimits : this.asset_
            }
            const data = await window.electronAPI.updateCircuitAssessmentLimits(asset)
            const dataTemp = JSON.parse(JSON.stringify(asset))
            this.back_asset = dataTemp.assessmentLimits
            if(data.success) {
                this.$message.success('Update successfully')
                this.openAssessmentDialog = false
            } else {
                this.$message.error("Update cannot complete")
                this.openAssessmentDialog = false
            }
        },
        resetAssessment() {
            this.asset_ = this.back_asset
            this.openAssessmentDialog = false
        },
        add() {
            this.testData.table.push({
                inrushCurrent: '',
                charging: '',
                chargingCurrent: '',
                miniVoltage: '',
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
                inrushCurrent: '',
                charging: '',
                chargingCurrent: '',
                miniVoltage: '',
                assessment: '',
                condition_indicator: ''
            }
            this.testData.table.splice(index+1, 0, data)
        },
        calculator() {
            this.testData.table.forEach(item => {
                if(this.testData.limits === 'Absolute'){
                    if(
                        //first item
                        parseFloat(item.inrushCurrent) >= parseFloat(this.asset_.motorChar.abs[0].min)
                        && parseFloat(item.inrushCurrent) <= parseFloat(this.asset_.motorChar.abs[0].max)
                        //second item
                        && parseFloat(item.charging) >= parseFloat(this.asset_.motorChar.abs[1].min)
                        && parseFloat(item.charging) <= parseFloat(this.asset_.motorChar.abs[1].max)
                        //third item
                        && parseFloat(item.chargingCurrent) >= parseFloat(this.asset_.motorChar.abs[2].min)
                        && parseFloat(item.chargingCurrent) <= parseFloat(this.asset_.motorChar.abs[2].max)
                        //Fourth item
                        && parseFloat(item.miniVoltage) >= parseFloat(this.asset_.motorChar.abs[3].min)
                        && parseFloat(item.miniVoltage) <= parseFloat(this.asset_.motorChar.abs[3].max)
                    )
                    {
                        item.assessment = 'Pass';
                    }
                    else {item.assessment = 'Fail';}
                }
                if(this.testData.limits === 'Relative'){
                    if(
                        //first item
                        Math.abs(parseFloat(item.inrushCurrent) - parseFloat(this.asset_.motorChar.rel[0].ref)) <= parseFloat(this.asset_.motorChar.rel[0].dev) 
                        //second item
                        && Math.abs(parseFloat(item.charging) - parseFloat(this.asset_.motorChar.rel[1].ref)) <= parseFloat(this.asset_.motorChar.rel[1].dev) 
                        //third item
                        && Math.abs(parseFloat(item.chargingCurrent) - parseFloat(this.asset_.motorChar.rel[2].ref)) <= parseFloat(this.asset_.motorChar.rel[2].dev) 
                        //Fourth item
                        && Math.abs(parseFloat(item.miniVoltage) - parseFloat(this.asset_.motorChar.rel[3].ref)) <= parseFloat(this.asset_.motorChar.rel[3].dev) 
                    )
                    {
                        item.assessment = 'Pass';
                    }
                    else {item.assessment = 'Fail';}
                }
            })
        },

        clear() {
            this.testData.table.forEach((element) => {
                element.inrushCurrent= '',
                element.charging= '',
                element.chargingCurrent= '',
                element.miniVoltage= '',
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
    },
    watch : {
        assetData : {
            deep : true,
            immediate : true,
            handler : function(newVal) {
                this.asset_ = newVal
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
table, th, tr, td {
    white-space: nowrap;
}
</style>
