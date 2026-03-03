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

        <table class="table-strip-input-data" style="width: 100%; font-size: 12px;">
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
                            <el-input size="mini" type="text" v-model="item.inrushCurrent.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.charging.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.chargingCurrent.value"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.miniVoltage.value"></el-input>
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
        <el-dialog class="dialog_assess" title="Assessment settings" :visible.sync="openAssessmentDialog" width="600px" append-to-body>

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
            asset_ : {
                motorChar: {
                    abs: Array(4).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(4).fill(null).map(() => ({ ref: '', dev: '', mrid: '' }))
                },
                limits: 'Absolute'
            },
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
        // Store backup for reset - will be updated by watcher
        const dataTemp = JSON.parse(JSON.stringify(this.asset_ || {}))
        this.back_asset = dataTemp
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
            
            // If it's already an object, return it directly
            if (typeof this.asset.assessmentLimits === 'object') {
                return this.asset.assessmentLimits
            }
            
            // If it's a string, try to parse it
            if (typeof this.asset.assessmentLimits === 'string') {
                try {
                    return JSON.parse(this.asset.assessmentLimits)
                } catch (error) {
                    console.warn('Error parsing assessmentLimits:', error)
                    return {}
                }
            }
            
            return {}
        }
    },
    methods: {
        async updateAssessment() {
            // Sync testData.limits to asset_.limits before saving
            if (this.testData.limits) {
                this.asset_.limits = this.testData.limits
            }
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
            this.asset_ = JSON.parse(JSON.stringify(this.back_asset))
            // Sync limits back to testData after reset
            if (this.asset_.limits && this.testData) {
                this.$set(this.testData, 'limits', this.asset_.limits)
            }
            this.openAssessmentDialog = false
        },
        add() {
            this.testData.table.push({
                mrid: '',
                inrushCurrent: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                charging: {
                    mrid: '',
                    value: '',
                    unit: 's',
                    type: 'analog'
                },
                chargingCurrent: {
                    mrid: '',
                    value: '',
                    unit: 'A',
                    type: 'analog'
                },
                miniVoltage: {
                    mrid: '',
                    value: '',
                    unit: 'V',
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
                inrushCurrent: {
                    mrid: '',
                    value: '',
                    unit: '',
                    type: 'string'
                },
                charging: {
                    mrid: '',
                    value: '',
                    unit: 's',
                    type: 'analog'
                },
                chargingCurrent: {
                    mrid: '',
                    value: '',
                    unit: 'A',
                    type: 'analog'
                },
                miniVoltage: {
                    mrid: '',
                    value: '',
                    unit: 'V',
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
                if (element.inrushCurrent) element.inrushCurrent.value = ''
                if (element.charging) element.charging.value = ''
                if (element.chargingCurrent) element.chargingCurrent.value = ''
                if (element.miniVoltage) element.miniVoltage.value = ''
                if (element.assessment) element.assessment.value = ''
                if (element.condition_indicator) element.condition_indicator.value = ''
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
        },
        normalizeMotorAssessmentLimits(data) {
            if (!data || typeof data !== 'object') {
                data = {}
            }
            
            let normalized = {}
            try {
                normalized = JSON.parse(JSON.stringify(data))
            } catch (e) {
                normalized = {}
            }
            
            // Always initialize motorChar structure
            if (!normalized.motorChar) {
                normalized.motorChar = {
                    abs: Array(4).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(4).fill(null).map(() => ({ ref: '', dev: '', mrid: '' }))
                }
            }
            
            // Normalize from motor_characteristics structure if exists
            if (data.motor_characteristics) {
                const motorChar = data.motor_characteristics
                const motorMapping = [
                    'inrush_current',
                    'charging_time',
                    'charging_current',
                    'minimum_voltage'
                ]
                
                // Helper function to extract value safely
                const getValue = (obj) => {
                    if (!obj) return ''
                    if (typeof obj === 'string' || typeof obj === 'number') return String(obj)
                    if (typeof obj === 'object' && obj.value !== undefined) return String(obj.value || '')
                    return ''
                }
                
                // Normalize abs
                if (motorChar.abs) {
                    motorMapping.forEach((key, index) => {
                        const item = motorChar.abs[key]
                        if (item) {
                            normalized.motorChar.abs[index] = {
                                min: getValue(item.min) || '',
                                max: getValue(item.max) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }
                
                // Normalize rel
                if (motorChar.rel) {
                    motorMapping.forEach((key, index) => {
                        const item = motorChar.rel[key]
                        if (item) {
                            normalized.motorChar.rel[index] = {
                                ref: getValue(item.ref) || '',
                                dev: getValue(item.dev) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }
            }
            
            // Ensure motorChar has proper structure
            if (!normalized.motorChar.abs || normalized.motorChar.abs.length < 4) {
                normalized.motorChar.abs = Array(4).fill(null).map((_, index) => 
                    normalized.motorChar.abs && normalized.motorChar.abs[index] 
                        ? normalized.motorChar.abs[index] 
                        : { min: '', max: '', mrid: '' }
                )
            }
            
            if (!normalized.motorChar.rel || normalized.motorChar.rel.length < 4) {
                normalized.motorChar.rel = Array(4).fill(null).map((_, index) => 
                    normalized.motorChar.rel && normalized.motorChar.rel[index] 
                        ? normalized.motorChar.rel[index] 
                        : { ref: '', dev: '', mrid: '' }
                )
            }
            
            // Ensure limits property exists
            if (!normalized.limits) {
                normalized.limits = data.limits || 'Absolute'
            }
            
            // Final pass: ensure all values are strings/numbers, not objects
            const ensureStringValue = (obj, key) => {
                if (obj && obj[key] !== undefined) {
                    const val = obj[key]
                    if (typeof val === 'object' && val !== null && val.value !== undefined) {
                        obj[key] = String(val.value || '')
                    } else if (typeof val !== 'string' && typeof val !== 'number') {
                        obj[key] = String(val || '')
                    }
                }
            }
            
            // Normalize motorChar values
            if (normalized.motorChar) {
                normalized.motorChar.abs.forEach(item => {
                    if (item) {
                        ensureStringValue(item, 'min')
                        ensureStringValue(item, 'max')
                    }
                })
                normalized.motorChar.rel.forEach(item => {
                    if (item) {
                        ensureStringValue(item, 'ref')
                        ensureStringValue(item, 'dev')
                    }
                })
            }
            
            return normalized
        }
    },
    watch : {
        assetData : {
            deep : true,
            immediate : true,
            handler : function(newVal) {
                if (newVal && Object.keys(newVal).length > 0) {
                    this.asset_ = this.normalizeMotorAssessmentLimits(newVal)
                    // Update backup for reset
                    const dataTemp = JSON.parse(JSON.stringify(this.asset_ || {}))
                    this.back_asset = dataTemp
                    // Sync limits to testData
                    if (this.asset_.limits && this.testData) {
                        this.$set(this.testData, 'limits', this.asset_.limits)
                    }
                }
            }
        },
        'asset_.limits': {
            immediate: true,
            handler: function(newVal) {
                // Sync asset_.limits to testData.limits
                if (newVal && this.testData) {
                    this.$set(this.testData, 'limits', newVal)
                }
            }
        },
        openAssessmentDialog: {
            handler: function(newVal) {
                // When opening dialog, sync limits from asset_ to testData
                if (newVal && this.asset_ && this.asset_.limits && this.testData) {
                    this.$set(this.testData, 'limits', this.asset_.limits)
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>

table, th, tr, td {
    white-space: nowrap;
}
.table-strip-input-data {
    th, td {
        border-right: 1px solid #fff;
        &:last-child {
            border-right: none;
        }
    }
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
