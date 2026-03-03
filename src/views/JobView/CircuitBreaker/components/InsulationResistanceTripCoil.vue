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

        <table class="table-strip-input-data" style="width: 80% ; font-size: 12px;">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Trip coil no.</th>
                    <th>Test voltage (V)</th>
                    <th>R60s (M&#8486;)</th>
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
                            <el-input size="mini" type="text" v-model="item.tripCoilNo.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.testVoltage.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.r60s.value"></el-input>
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
        <el-dialog append-to-body class="dialog_assess" title="Assessment settings" :visible.sync="openAssessmentDialog" width="50%">
            <el-radio-group v-model="testData.limits">
                <el-radio label="Absolute" value="Absolute"></el-radio>
                <el-radio label="Relative" value="Relative"></el-radio>
            </el-radio-group>
            <br/><br/><br/>
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
    name: 'insulationResistanceTripCoil',
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            asset_ : {},
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
                if (typeof this.asset.assessmentLimits === 'string') {
                    return JSON.parse(this.asset.assessmentLimits)
                } else if (typeof this.asset.assessmentLimits === 'object') {
                    return this.asset.assessmentLimits
                }
                return {}
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
                // Sync limits to testData if asset_ has limits
                if (this.asset_ && this.asset_.limits && this.testData) {
                    this.$set(this.testData, 'limits', this.asset_.limits)
                }
            }
        },
        openAssessmentDialog: {
            handler: function(newVal) {
                // When opening dialog, sync limits from asset_ to testData if available
                if (newVal && this.asset_ && this.asset_.limits && this.testData) {
                    this.$set(this.testData, 'limits', this.asset_.limits)
                } else if (newVal && this.testData && !this.testData.limits) {
                    // Initialize limits if not set
                    this.$set(this.testData, 'limits', 'Absolute')
                }
            }
        }
    },
    methods: {
        async updateAssessment() {
            // Sync testData.limits to asset_ if testData.limits exists
            if (this.testData && this.testData.limits) {
                if (!this.asset_) {
                    this.asset_ = {}
                }
                this.asset_.limits = this.testData.limits
            }
            const asset = {
                id : this.asset.id,
                assessmentLimits : this.asset_
            }
            const data = await window.electronAPI.updateCircuitAssessmentLimits(asset)
            if(data.success) {
                this.$message.success('Update successfully')
                this.openAssessmentDialog = false
            } else {
                this.$message.error("Update cannot complete")
                this.openAssessmentDialog = false
            }
        },
        resetAssessment() {
            if (!this.asset || !this.asset.assessmentLimits) {
                this.asset_ = {}
                this.openAssessmentDialog = false
                return
            }
            try {
                if (typeof this.asset.assessmentLimits === 'string') {
                    this.asset_ = JSON.parse(this.asset.assessmentLimits)
                } else if (typeof this.asset.assessmentLimits === 'object') {
                    this.asset_ = JSON.parse(JSON.stringify(this.asset.assessmentLimits))
                } else {
                    this.asset_ = {}
                }
                // Sync limits back to testData after reset
                if (this.asset_ && this.asset_.limits && this.testData) {
                    this.$set(this.testData, 'limits', this.asset_.limits)
                }
            } catch (error) {
                console.error('Error parsing assessmentLimits in resetAssessment:', error)
                this.asset_ = {}
            }
            this.openAssessmentDialog = false
        },
        add() {
            this.testData.table.push({
                mrid: '',
                tripCoilNo: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                testVoltage : {
                    mrid: '',
                    value: '',
                    unit: 'V',
                    type: 'analog'
                },
                r60s: {
                    mrid: '',
                    value: '',
                    unit: 'MΩ',
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
                tripCoilNo: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                testVoltage : {
                    mrid: '',
                    value: '',
                    unit: 'V',
                    type: 'analog'
                },
                r60s: {
                    mrid: '',
                    value: '',
                    unit: 'MΩ',
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
