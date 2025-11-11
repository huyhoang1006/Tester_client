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

        <table class="table-strip-input-data" style="width: 80%">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Operation</th>
                    <th>Trip coil no.</th>
                    <th>Close coil no.</th>
                    <th>V pickup (V)</th>
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
                            <el-select size="mini" v-model="item.operation.value">
                                <el-option value="Trip">Trip</el-option>
                                <el-option value="Close">Close</el-option>
                            </el-select>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.tripCoilNo.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.closeCoilNo.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.vPickup.value"></el-input>
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
                                <th>V min</th>
                                <th>V max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in pickupVoltage" :key="index">
                                <td>{{item}}</td>
                                <td>
                                    <el-input size="mini" v-model="asset_.pickupVol.abs[index].vmin">
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="asset_.pickupVol.abs[index].vmax" >
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table v-if="testData.limits === 'Relative'" class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>V ref</th>
                                <th>V dev</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in pickupVoltage" :key="index">
                                <td>{{item}}</td>
                                    <el-input size="mini" v-model="asset_.pickupVol.rel[index].vref">
                                        <template slot="append">V</template>
                                    </el-input>
                                <td>
                                    <el-input size="mini" v-model="asset_.pickupVol.rel[index].vdev">
                                        <template slot="append">V</template>
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
    name :"minimumPickup",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            asset_ : {
                pickupVol: {
                    abs: [
                        { vmin: '', vmax: '' },
                        { vmin: '', vmax: '' }
                    ],
                    rel: [
                        { vref: '', vdev: '' },
                        { vref: '', vdev: '' }
                    ]
                }
            },
            back_asset: {},
            pickupVoltage : [
                "Minimum pickup voltage (close)",
                "Minimum pickup voltage (trip)"
            ],
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
            return this.asset
        },
        assessLimitsData() {
            if (!this.asset || !this.asset.assessmentLimits) {
                return {
                    pickupVol: {
                        abs: [
                            { vmin: '', vmax: '' },
                            { vmin: '', vmax: '' }
                        ],
                        rel: [
                            { vref: '', vdev: '' },
                            { vref: '', vdev: '' }
                        ]
                    }
                }
            }
            try {
                return JSON.parse(this.asset.assessmentLimits)
            } catch (error) {
                console.error('Error parsing assessmentLimits:', error)
                return {
                    pickupVol: {
                        abs: [
                            { vmin: '', vmax: '' },
                            { vmin: '', vmax: '' }
                        ],
                        rel: [
                            { vref: '', vdev: '' },
                            { vref: '', vdev: '' }
                        ]
                    }
                }
            }
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
                operation: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                tripCoilNo: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                closeCoilNo: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                vPickup: {
                    mrid: '',
                    value: '',
                    unit: 'V',
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
                })
                .catch( () => {
                    // User cancelled, do nothing
                })
        },
        deleteTest(index) {
            this.testData.table.splice(index, 1)
        },
        addTest(index) {
            const data = {
                mrid: '',
                operation: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                tripCoilNo: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                closeCoilNo: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                vPickup: {
                    mrid: '',
                    value: '',
                    unit: 'V',
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
            if (!this.asset_ || !this.asset_.pickupVol) {
                this.$message.error('Assessment limits not configured')
                return
            }
            this.$message.success('Calculating successfully')
            this.testData.table.forEach(item => {
                console.log(this.testData.limits)
                console.log(item.operation)
                console.log(item.vPickup)
                if (this.testData.limits === 'Absolute'){
                    if (item.operation === 'Trip'){
                        if (this.asset_.pickupVol.abs && this.asset_.pickupVol.abs[1] && 
                            parseFloat(item.vPickup) >= parseFloat(this.asset_.pickupVol.abs[1].vmin) && 
                            parseFloat(item.vPickup) <= parseFloat(this.asset_.pickupVol.abs[1].vmax)){
                            item.assessment = 'Pass';
                        }
                        else item.assessment = 'Fail';
                    }
                    if (item.operation === 'Close'){
                        if (this.asset_.pickupVol.abs && this.asset_.pickupVol.abs[0] &&
                            parseFloat(item.vPickup) >= parseFloat(this.asset_.pickupVol.abs[0].vmin) && 
                            parseFloat(item.vPickup) <= parseFloat(this.asset_.pickupVol.abs[0].vmax)){
                            item.assessment = 'Pass';
                        }
                        else item.assessment = 'Fail';
                    }
                }
                if(this.testData.limits === 'Relative'){
                    if (item.operation === 'Trip'){
                        if (this.asset_.pickupVol.rel && this.asset_.pickupVol.rel[1] &&
                            Math.abs(parseFloat(this.asset_.pickupVol.rel[1].vref) - parseFloat(item.vPickup)) <= parseFloat(this.asset_.pickupVol.rel[1].vdev)){
                            item.assessment = 'Pass';
                        }
                        else item.assessment = 'Fail';
                    }
                    if (item.operation === 'Close'){
                        if (this.asset_.pickupVol.rel && this.asset_.pickupVol.rel[0] &&
                            Math.abs(parseFloat(this.asset_.pickupVol.rel[0].vref) - parseFloat(item.vPickup)) <= parseFloat(this.asset_.pickupVol.rel[0].vdev)){
                            item.assessment = 'Pass';
                        }
                        else item.assessment = 'Fail';
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
        assessLimitsData : {
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
