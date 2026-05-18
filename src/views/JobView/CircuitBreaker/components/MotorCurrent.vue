<template>
    <div id="dc-winding-resistance-prim">
        <!-- Cấu hình -->
        <div style="position: sticky; left: 0; display: inline-block;">
            <el-row class="mgb-10">
                <el-col>
                    <el-button class="btn-action" size="mini" type="success" @click="openAssessmentSettings()">
                        <i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings
                    </el-button>
                    <el-button class="btn-action" size="mini" type="success"
                        @click="openConditionIndicatorDialog = true">
                        <i class="fa-solid fa-hammer"></i> Condition indicator settings
                    </el-button>
                </el-col>
            </el-row>

            <!-- Tương tác với bảng -->
            <el-row class="mgb-10">
                <el-col>
                    <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i
                            class="fas fa-circle-play"></i> Assess results </el-button>
                    <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i
                            class="fas fa-xmark"></i> Clear all</el-button>
                </el-col>
            </el-row>
        </div>

        <table class="table-strip-input-data" style="width: 100%; font-size: 12px;">
            <thead>
                <tr>
                    <th>Inrush current (A)</th>
                    <th>Charging time (s)</th>
                    <th>Charging current (A)</th>
                    <th>Minimum voltage (V)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.inrush_current.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.charging.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.charging_current.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.mini_voltage.value"></el-input>
                    </td>
                    <td>
                        <el-select class="assessment" size="mini" v-model="item.assessment.value">
                            <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="item.assessment.value === 'Pass'"
                            class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="item.assessment.value === 'Fail'"
                            class="fa-solid fa-xmark fail icon-status"></span>
                    </td>
                    <td>
                        <el-select :class="nameColor(item.condition_indicator.value)" size="mini"
                            v-model="item.condition_indicator.value">
                            <el-option value="Good">Good</el-option>
                            <el-option value="Fair">Fair</el-option>
                            <el-option value="Poor">Poor</el-option>
                            <el-option value="Bad">Bad</el-option>
                        </el-select>
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

        <el-dialog append-to-body title="Assessment settings" :visible.sync="openAssessmentDialog" width="700px">
            <el-radio-group v-model="assetData.assessmentLimits.limits" style="margin-bottom:16px;">
                <el-radio label="Absolute">Absolute limits</el-radio>
                <el-radio label="Relative">Relative limits</el-radio>
            </el-radio-group>
            <table class="table-strip-input-data" style="width:100%;font-size:12px;">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th v-if="assetData.assessmentLimits.limits === 'Absolute'">Minimum</th>
                        <th v-if="assetData.assessmentLimits.limits === 'Absolute'">Maximum</th>
                        <th v-if="assetData.assessmentLimits.limits !== 'Absolute'">Reference</th>
                        <th v-if="assetData.assessmentLimits.limits !== 'Absolute'">Deviation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Inrush current</td>
                        <td v-if="assetData.assessmentLimits.limits === 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.abs.inrush_current.min.value"/></td>
                        <td v-if="assetData.assessmentLimits.limits === 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.abs.inrush_current.max.value"/></td>
                        <td v-if="assetData.assessmentLimits.limits !== 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.rel.inrush_current.ref.value"/></td>
                        <td v-if="assetData.assessmentLimits.limits !== 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.rel.inrush_current.dev.value"/></td>
                    </tr>
                    <tr>
                        <td>Charging time</td>
                        <td v-if="assetData.assessmentLimits.limits === 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.abs.charging_time.min.value"/></td>
                        <td v-if="assetData.assessmentLimits.limits === 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.abs.charging_time.max.value"/></td>
                        <td v-if="assetData.assessmentLimits.limits !== 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.rel.charging_time.ref.value"/></td>
                        <td v-if="assetData.assessmentLimits.limits !== 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.rel.charging_time.dev.value"/></td>
                    </tr>
                    <tr>
                        <td>Charging current</td>
                        <td v-if="assetData.assessmentLimits.limits === 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.abs.charging_current.min.value"/></td>
                        <td v-if="assetData.assessmentLimits.limits === 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.abs.charging_current.max.value"/></td>
                        <td v-if="assetData.assessmentLimits.limits !== 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.rel.charging_current.ref.value"/></td>
                        <td v-if="assetData.assessmentLimits.limits !== 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.rel.charging_current.dev.value"/></td>
                    </tr>
                    <tr>
                        <td>Minimum voltage</td>
                        <td v-if="assetData.assessmentLimits.limits === 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.abs.minimum_voltage.min.value"/></td>
                        <td v-if="assetData.assessmentLimits.limits === 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.abs.minimum_voltage.max.value"/></td>
                        <td v-if="assetData.assessmentLimits.limits !== 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.rel.minimum_voltage.ref.value"/></td>
                        <td v-if="assetData.assessmentLimits.limits !== 'Absolute'"><el-input size="mini" v-model="assetData.assessmentLimits.motor_characteristics.rel.minimum_voltage.dev.value"/></td>
                    </tr>
                </tbody>
            </table>
            <template v-slot:footer>
                <span style="position:absolute;right:10px;bottom:10px;">
                    <el-button @click="resetAssessment">Cancel</el-button>
                    <el-button type="primary" @click="updateAssessment">Confirm</el-button>
                </span>
            </template>
        </el-dialog>

        <el-dialog class="dialog_assess" title="Condition indicator settings"
            :visible.sync="openConditionIndicatorDialog" width="600px" append-to-body>
        </el-dialog>
    </div>
</template>

<script>
import CircuitBreakerTestMap from '@/config/test-definitions/CircuitBreaker'
import * as common from '../../Common/index'
import assessmentMixin from './assessmentMixin'
export default {
    mixins: [assessmentMixin],
    name: "MotorCurrent",
    data() {
        return {
            openAssessmentDialog: false,
            backupLimits: null,
            assessmentIpcChannel: 'updateMotorCharacteristicsLimits',
            openConditionIndicatorDialog: false,
            motorCharacteristics: [
                { label: "Inrush current", key: "inrush_current", unit: "A" },
                { label: "Charging time", key: "charging_time", unit: "s" },
                { label: "Charging current", key: "charging_current", unit: "A" },
                { label: "Minimum voltage", key: "minimum_voltage", unit: "V" }
            ]
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
    computed: {
        testData() {
            return this.data
        },
        assetData() {
            return this.asset
        },
        rowData() {
            return common.buildEmptyTestRow(CircuitBreakerTestMap['MotorCurrent'].columns)
        }
    },
    methods: {


        add() {
            this.testData.table.table1.push(JSON.parse(JSON.stringify(this.rowData)))
        },
        removeAll() {
            this.$confirm('This will delete the file. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                this.testData.table.table1 = []
            }).catch(() => { })
        },
        deleteTest(index) {
            this.testData.table.table1.splice(index, 1)
        },
        addTest(index) {
            const data = JSON.parse(JSON.stringify(this.rowData))
            this.testData.table.table1.splice(index + 1, 0, data)
        },
        calculator() {
            var limits = this.assetData && this.assetData.assessmentLimits ? this.assetData.assessmentLimits : null
            if (!limits) { this.$message.error('Assessment limits not configured'); return }
            var mc   = limits.motor_characteristics
            var mode = limits.limits
            var fieldMap = [
                { field: 'inrush_current',   key: 'inrush_current'  },
                { field: 'charging',         key: 'charging_time'   },
                { field: 'charging_current', key: 'charging_current' },
                { field: 'mini_voltage',     key: 'minimum_voltage' },
            ]
            this.testData.table.table1.forEach(function(item) {
                var results = fieldMap.map(function(f) {
                    var value = item[f.field] ? item[f.field].value : ''
                    if (mode === 'Absolute') {
                        return this.assessAbsolute(value, mc.abs[f.key].min, mc.abs[f.key].max)
                    } else {
                        return this.assessRelative(value, mc.rel[f.key].ref, mc.rel[f.key].dev)
                    }
                }.bind(this))
                item.assessment.value = this.assessRow(results)
            }.bind(this))
            this.$message.success('Calculating successfully')
        },
        clear() {
            this.testData.table.forEach((element) => {
                if (element.inrush_current) element.inrush_current.value = ''
                if (element.charging) element.charging.value = ''
                if (element.charging_current) element.charging_current.value = ''
                if (element.mini_voltage) element.mini_voltage.value = ''
                if (element.assessment) element.assessment.value = ''
                if (element.condition_indicator) element.condition_indicator.value = ''
            })
        },
        nameColor(data) {
            if (data === this.$constant.GOOD) {
                return 'Good'
            }
            else if (data === this.$constant.FAIR) {
                return 'Fair'
            }
            else if (data === this.$constant.POOR) {
                return 'Poor'
            }
            else if (data === this.$constant.BAD) {
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
    watch: {
        assetData: {
            deep: true,
            immediate: true,
            handler: function (newVal) {
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
            handler: function (newVal) {
                // Sync asset_.limits to testData.limits
                if (newVal && this.testData) {
                    this.$set(this.testData, 'limits', newVal)
                }
            }
        },
        openAssessmentDialog: {
            handler: function (newVal) {
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
table,
th,
tr,
td {
    white-space: nowrap;
}

.table-strip-input-data {

    th,
    td {
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
</style>
