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

        <table class="table-strip-input-data" style="width: 100%; font-size: 12px;">
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
        <el-dialog append-to-body class="dialog_assess" title="Assessment settings" :visible.sync="openAssessmentDialog" width="50%">
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
            asset_ : {
                coilCharacter: {
                    abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                },
                limits: 'Absolute'
            },
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
                        abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                        rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                    }
                }
            }
            
            // If it's already an object, return it directly
            if (typeof this.asset.assessmentLimits === 'object') {
                return this.asset.assessmentLimits
            }
            
            // If it's a string, try to parse it
            if (typeof this.asset.assessmentLimits === 'string') {
                try {
                    const parsed = JSON.parse(this.asset.assessmentLimits)
                    // Ensure coilCharacter structure exists
                    if (!parsed.coilCharacter) {
                        parsed.coilCharacter = {
                            abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                            rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                        }
                    }
                    // Ensure abs and rel arrays have 8 items
                    if (!parsed.coilCharacter.abs || parsed.coilCharacter.abs.length !== 8) {
                        parsed.coilCharacter.abs = Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' }))
                    }
                    if (!parsed.coilCharacter.rel || parsed.coilCharacter.rel.length !== 8) {
                        parsed.coilCharacter.rel = Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                    }
                    return parsed
                } catch (error) {
                    console.warn('Error parsing assessmentLimits:', error)
                    return {
                        coilCharacter: {
                            abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                            rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                        }
                    }
                }
            }
            
            return {
                coilCharacter: {
                    abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                }
            }
        }
    },
    watch : {
        assetData : {
            deep : true,
            immediate : true,
            handler : function(newVal) {
                if (newVal && Object.keys(newVal).length > 0) {
                    this.asset_ = this.normalizeAssessmentLimits(newVal)
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
    },
    methods: {
        normalizeAssessmentLimits(data) {
            if (!data || typeof data !== 'object') {
                data = {}
            }
            
            let normalized = {}
            try {
                normalized = JSON.parse(JSON.stringify(data))
            } catch (e) {
                normalized = {}
            }
            
            // Helper function to extract value safely
            const getValue = (obj) => {
                if (!obj) return ''
                if (typeof obj === 'string' || typeof obj === 'number') return String(obj)
                if (typeof obj === 'object' && obj.value !== undefined) return String(obj.value || '')
                return ''
            }
            
            // Normalize coilCharacter from coil_characteristics structure if exists
            if (data.coil_characteristics) {
                const coilChar = data.coil_characteristics
                const coilMapping = [
                    'peak_close_coil_current', 'peak_trip_coil_current', 'average_close_coil_current',
                    'average_trip_coil_current', 'average_close_coil_voltage', 'average_trip_coil_voltage',
                    'close_coil_resistance', 'trip_coil_resistance'
                ]
                normalized.coilCharacter = {
                    abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                }
                
                if (coilChar.abs) {
                    coilMapping.forEach((key, index) => {
                        const item = coilChar.abs[key]
                        if (item) {
                            normalized.coilCharacter.abs[index] = {
                                min: getValue(item.min) || '',
                                max: getValue(item.max) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }
                
                if (coilChar.rel) {
                    coilMapping.forEach((key, index) => {
                        const item = coilChar.rel[key]
                        if (item) {
                            normalized.coilCharacter.rel[index] = {
                                ref: getValue(item.ref) || '',
                                devZ: getValue(item.minus_dev) || getValue(item.devZ) || '',
                                devN: getValue(item.plus_dev) || getValue(item.devN) || '',
                                mrid: item.mrid || ''
                            }
                        }
                    })
                }
            } else if (data.coilCharacter) {
                // Keep coilCharacter structure but ensure values are normalized
                normalized.coilCharacter = {
                    abs: Array(8).fill(null).map((_, index) => ({
                        min: getValue(data.coilCharacter.abs?.[index]?.min) || '',
                        max: getValue(data.coilCharacter.abs?.[index]?.max) || '',
                        mrid: data.coilCharacter.abs?.[index]?.mrid || ''
                    })),
                    rel: Array(8).fill(null).map((_, index) => ({
                        ref: getValue(data.coilCharacter.rel?.[index]?.ref) || '',
                        devZ: getValue(data.coilCharacter.rel?.[index]?.devZ) || '',
                        devN: getValue(data.coilCharacter.rel?.[index]?.devN) || '',
                        mrid: data.coilCharacter.rel?.[index]?.mrid || ''
                    }))
                }
            } else {
                // Initialize default coilCharacter structure
                normalized.coilCharacter = {
                    abs: Array(8).fill(null).map(() => ({ min: '', max: '', mrid: '' })),
                    rel: Array(8).fill(null).map(() => ({ ref: '', devZ: '', devN: '', mrid: '' }))
                }
            }
            
            // Ensure abs and rel arrays have 8 items
            if (!normalized.coilCharacter.abs || normalized.coilCharacter.abs.length !== 8) {
                normalized.coilCharacter.abs = Array(8).fill(null).map((_, index) => 
                    normalized.coilCharacter.abs && normalized.coilCharacter.abs[index] 
                        ? normalized.coilCharacter.abs[index] 
                        : { min: '', max: '', mrid: '' }
                )
            }
            if (!normalized.coilCharacter.rel || normalized.coilCharacter.rel.length !== 8) {
                normalized.coilCharacter.rel = Array(8).fill(null).map((_, index) => 
                    normalized.coilCharacter.rel && normalized.coilCharacter.rel[index] 
                        ? normalized.coilCharacter.rel[index] 
                        : { ref: '', devZ: '', devN: '', mrid: '' }
                )
            }
            
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
            
            // Normalize coilCharacter values
            if (normalized.coilCharacter) {
                normalized.coilCharacter.abs.forEach(item => {
                    if (item) {
                        ensureStringValue(item, 'min')
                        ensureStringValue(item, 'max')
                    }
                })
                normalized.coilCharacter.rel.forEach(item => {
                    if (item) {
                        ensureStringValue(item, 'ref')
                        ensureStringValue(item, 'devZ')
                        ensureStringValue(item, 'devN')
                    }
                })
            }
            
            return normalized
        },
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
