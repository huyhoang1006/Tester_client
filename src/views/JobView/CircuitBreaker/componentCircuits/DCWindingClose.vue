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

        <table class="table-strip-input-data" style="width: 80%">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Close coil no.</th>
                    <th>Rmeas (&#8486;)</th>
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
                            {{ index + 1 }}
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.closeCoilNo.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.rmeas.value"></el-input>
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
        <el-dialog class="dialog_assess" title="Assessment settings" :visible.sync="openAssessmentDialog" width="50%">
            <el-radio-group v-model="testData.limits">
                <el-radio label="Absolute" value="Absolute"></el-radio>
                <el-radio label="Relative" value="Relative"></el-radio>
            </el-radio-group>

            <transition>
                <table class="table-strip-input-data" v-if="testData.limits === 'Absolute'">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Minimum</th>
                            <th>Maximum</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in coilCharacteristics" :key="index">
                            <td>{{ item }}</td>
                            <td>
                                <el-input size="mini" v-model="asset_.coilCharacter.abs[index].min">
                                    <template v-if="index <= 3" slot="append">A</template>
                                    <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                    <template v-else slot="append">&#8486;</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="asset_.coilCharacter.abs[index].max">
                                    <template v-if="index <= 3" slot="append">A</template>
                                    <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                    <template v-else slot="append">&#8486;</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table class="table-strip-input-data" v-if="testData.limits === 'Relative'">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Reference</th>
                            <th>- Deviation</th>
                            <th>+ Deviation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in coilCharacteristics" :key="index">
                            <td>{{ item }}</td>
                            <el-input size="mini" v-model="asset_.coilCharacter.rel[index].ref">
                                <template v-if="index <= 3" slot="append">A</template>
                                <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                <template v-else slot="append">&#8486;</template>
                            </el-input>
                            <td>
                                <el-input size="mini" v-model="asset_.coilCharacter.rel[index].devZ">
                                    <template v-if="index <= 3" slot="append">A</template>
                                    <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                    <template v-else slot="append">&#8486;</template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="asset_.coilCharacter.rel[index].devN">
                                    <template v-if="index <= 3" slot="append">A</template>
                                    <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                    <template v-else slot="append">&#8486;</template>
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
    name: 'dcWindingTripCoil',
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            asset_ : {},
            back_asset: {},
            coilCharacteristics : [
                "Peak close coil current",
                "Peak trip coil current",
                "Average close coil current",
                "Average trip coil current",
                "Average close coil voltage",
                "Average trip coil voltage",
                "Close coil resistance",
                "Trip coil resistance",
            ],
        }
    },
    beforeMount() {
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
            if (!this.asset || !this.asset.assessmentLimits) {
                return {
                    coilCharacter: {
                        abs: Array(8).fill(null).map(() => ({ min: '', max: '' })),
                        rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '' }))
                    }
                }
            }
            try {
                const parsed = JSON.parse(this.asset.assessmentLimits)
                // Ensure coilCharacter structure exists
                if (!parsed.coilCharacter) {
                    parsed.coilCharacter = {
                        abs: Array(8).fill(null).map(() => ({ min: '', max: '' })),
                        rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '' }))
                    }
                }
                // Ensure abs and rel arrays have 8 items
                if (!parsed.coilCharacter.abs || parsed.coilCharacter.abs.length !== 8) {
                    parsed.coilCharacter.abs = Array(8).fill(null).map(() => ({ min: '', max: '' }))
                }
                if (!parsed.coilCharacter.rel || parsed.coilCharacter.rel.length !== 8) {
                    parsed.coilCharacter.rel = Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '' }))
                }
                return parsed
            } catch (error) {
                console.error('Error parsing assessmentLimits:', error)
                return {
                    coilCharacter: {
                        abs: Array(8).fill(null).map(() => ({ min: '', max: '' })),
                        rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '' }))
                    }
                }
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
                mrid: '',
                closeCoilNo: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                rmeas: {
                    mrid: '',
                    value: '',
                    unit: 'Ω',
                    type: 'analog'
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
            }).then(() => {
                this.testData.table = []
            })
        },
        deleteTest(index) {
            this.testData.table.splice(index, 1)
        },
        addTest(index) {
            const data = {
                mrid: '',
                closeCoilNo: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                rmeas: {
                    mrid: '',
                    value: '',
                    unit: 'Ω',
                    type: 'analog'
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
            this.testData.table.splice(index + 1, 0, data)
        },
        calculator() {
                this.testData.table.forEach((item) => {
                console.log(this.testData.limits)
                //console.log(item.rmeas);
                //console.log(this.asset_.coilCharacter.abs)
                //console.log(this.asset_.coilCharacter.abs[6].max)
                if (this.testData.limits === 'Absolute'){
                    if ((parseFloat(item.rmeas) >= parseFloat(this.asset_.coilCharacter.abs[6].min)) && (parseFloat(item.rmeas) <= parseFloat(this.asset_.coilCharacter.abs[6].max)))
                    {
                        item.assessment = 'Pass';
                        console.log('Pass 1')
                    }
                    else {
                        item.assessment = 'Fail';
                        console.log('Fail 1')
                    }
                    
                }
                if (this.testData.limits === 'Relative'){
                        if (parseFloat(item.rmeas) <= parseFloat(this.asset_.coilCharacter.rel[6].ref)){
                            if (parseFloat(item.rmeas) >= (parseFloat(this.asset_.coilCharacter.rel[6].ref) - parseFloat(this.asset_.coilCharacter.rel[6].devZ)))
                            {
                                item.assessment = 'Pass';
                                console.log('Pass 2');
                            }
                            else {
                                 item.assessment = 'Fail';
                                 console.log('Fail 2')
                                }
                            
                        }
                        else if (parseFloat(item.rmeas) > parseFloat(this.asset_.coilCharacter.rel[6].ref)){
                            if (parseFloat(item.rmeas) <= (parseFloat(this.asset_.coilCharacter.rel[6].ref) + parseFloat(this.asset_.coilCharacter.rel[6].devN))){
                                item.assessment = 'Pass';
                                console.log('Pass 3')
                            }
                            else {
                                item.assessment = 'Fail';
                                console.log('Fail 3')
                            }
                        }
                }
            })
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
    background: #00cc00;
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
