<template>
    <div id="dc-winding-resistance-prim" class="test-ui" style="width: 100%; font-size: 12px;">
        <!-- Cấu hình -->
        <div class="test-toolbar">
            <div class="test-toolbar-group">
                <el-button size="mini" type="primary" @click="calculator"><i class="fas fa-circle-play"></i> Assess results</el-button>
                <el-button size="mini" @click="clear"><i class="fas fa-xmark"></i> Clear all</el-button>
            </div>
            <div class="test-toolbar-group">
                <el-button size="mini" @click="openAssessmentSettings()"><i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings</el-button>
                <el-button size="mini" @click="openConditionIndicatorDialog = true"><i class="fa-solid fa-hammer"></i> Condition indicator settings</el-button>
            </div>
        </div>

        <div class="table-scroll"><table class="table-strip-input-data test-table" style="width: 100%; font-size: 12px;">
            <thead>
                <tr>
                    <th>Inrush current (A)</th>
                    <th>Charging time (s)</th>
                    <th>Charging current (A)</th>
                    <th>Minimum voltage (V)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">Condition indicator</th>
                    <th @click="add()" class="action-col th-btn" title="Add row"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col th-btn th-btn-danger" title="Remove all"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testData.table.table1" :key="index">
                    <td>
                        <el-input size="mini" type="text" number="positive"
                            v-model="item.inrush_current.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive" v-model="item.charging.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive"
                            v-model="item.charging_current.value"></el-input>
                    </td>
                    <td>
                        <el-input size="mini" type="text" number="positive"
                            v-model="item.mini_voltage.value"></el-input>
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
                        <el-button size="mini" type="primary" class="row-btn" title="Insert row below" @click="addTest(index)">
                            <i class="fa-solid fa-plus"></i>
                        </el-button>
                    </td>
                    <td>
                        <el-button size="mini" type="danger" class="row-btn" title="Delete row" @click="deleteTest(index)">
                            <i class="fas fa-trash"></i>
                        </el-button>
                    </td>
                </tr>
            </tbody>
        </table></div>

        <el-dialog class="cb-assessment-dialog motor-current-assessment-dialog" append-to-body title="Assessment settings" :visible.sync="openAssessmentDialog" width="min(1080px, 92vw)">
            <el-radio-group v-model="assetData.assessmentLimits.limits">
                <el-radio label="Absolute">Absolute limits</el-radio>
                <el-radio label="Relative">Relative limits</el-radio>
            </el-radio-group>
            <div class="motor-characteristics-card">
                <div class="motor-characteristics-header">
                    <i class="fa-solid fa-caret-up"></i>
                    Motor Characteristics
                </div>
                <div class="motor-characteristics-body">
                    <table v-if="assetData.assessmentLimits.limits === 'Absolute'" class="table-strip-input-data motor-characteristics-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Minimum</th>
                                <th>Maximum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in motorCharacteristics" :key="item.key">
                                <td>{{ item.label }}</td>
                                <td><el-input size="mini" type="text"
                                        number="positive"
                                        v-model="assetData.assessmentLimits.motor_characteristics.abs[item.key].min.value">
                                        <template slot="append">{{ item.unit }}</template>
                                    </el-input>
                                </td>
                                <td><el-input size="mini" type="text"
                                        number="positive"
                                        v-model="assetData.assessmentLimits.motor_characteristics.abs[item.key].max.value">
                                        <template slot="append">{{ item.unit }}</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table v-else class="table-strip-input-data motor-characteristics-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Reference</th>
                                <th>Deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in motorCharacteristics" :key="item.key">
                                <td>{{ item.label }}</td>
                                <td><el-input size="mini" type="text"
                                        number="positive"
                                        v-model="assetData.assessmentLimits.motor_characteristics.rel[item.key].ref.value">
                                        <template slot="append">{{ item.unit }}</template>
                                    </el-input>
                                </td>
                                <td><el-input size="mini" type="text"
                                        number="positive"
                                        v-model="assetData.assessmentLimits.motor_characteristics.rel[item.key].dev.value">
                                        <template slot="append">{{ item.unit }}</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <template v-slot:footer>
                <span class="dialog-footer-actions">
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
            var mc = limits.motor_characteristics
            var mode = limits.limits
            var fieldMap = [
                { field: 'inrush_current', key: 'inrush_current' },
                { field: 'charging', key: 'charging_time' },
                { field: 'charging_current', key: 'charging_current' },
                { field: 'mini_voltage', key: 'minimum_voltage' },
            ]
            this.testData.table.table1.forEach(function (item) {
                var results = fieldMap.map(function (f) {
                    var value = item[f.field] ? item[f.field].value : ''
                    if (mode === 'Absolute') {
                        return this.assessAbsolute(value, mc.abs[f.key].min, mc.abs[f.key].max)
                    } else {
                        return this.assessRelative(value, mc.rel[f.key].ref, mc.rel[f.key].dev)
                    }
                }.bind(this))
                item.assessment.value = this.assessRow(results)
            }.bind(this))
            this.notifyAssessmentCalculated()
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
@import "~@/views/JobView/Common/testUi.scss";
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

<style lang="scss">
.motor-current-assessment-dialog {
    .el-dialog {
        max-width: calc(100vw - 32px);
        border-radius: 6px;
        overflow: hidden;
    }

    .el-dialog__header {
        padding: 12px 16px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;
    }

    .el-dialog__title {
        color: #606266;
        font-size: 14px;
        font-weight: 600;
    }

    .el-dialog__body {
        padding: 14px 16px;
    }

    .el-dialog__footer {
        padding: 10px 16px 14px;
        border-top: 1px solid #e4e7ed;
    }

    .dialog-footer-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .motor-characteristics-card {
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        overflow: hidden;
        background: #fff;
    }

    .motor-characteristics-header {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 48px;
        padding: 14px 16px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;
        color: #606266;
        font-size: 14px;
        font-weight: 600;
    }

    .motor-characteristics-body {
        width: 100%;
        overflow-x: auto;
        padding: 38px 18px 34px;
    }

    .motor-characteristics-table {
        width: auto !important;
        min-width: 740px;
        margin: 0 !important;
        border: 0 !important;
        border-collapse: collapse;
        color: #303133;
        font-size: 12px !important;
    }

    .motor-characteristics-table th,
    .motor-characteristics-table td {
        height: 52px;
        padding: 5px 10px;
        border: 1px solid #e4e7ed !important;
        background: #fff !important;
        vertical-align: middle;
        white-space: nowrap;
    }

    .motor-characteristics-table th {
        background: #f5f7fa !important;
        color: #606266;
        font-weight: 600;
        text-align: center;
    }

    .motor-characteristics-table th:first-child,
    .motor-characteristics-table td:first-child {
        width: 140px;
        color: #303133;
        text-align: left;
        white-space: normal;
    }

    .motor-characteristics-table th:not(:first-child),
    .motor-characteristics-table td:not(:first-child) {
        width: 300px;
    }

    .motor-characteristics-table .el-input {
        width: 280px !important;
    }

    .motor-characteristics-table .el-input__inner {
        height: 34px;
        line-height: 34px;
        font-size: 12px;
    }

    .motor-characteristics-table .el-input-group__append {
        min-width: 38px;
        padding: 0 10px;
        color: #606266;
        text-align: center;
    }
}

@media (max-width: 640px) {
    .motor-current-assessment-dialog {
        .el-dialog {
            width: calc(100vw - 24px) !important;
            max-width: calc(100vw - 24px);
        }

        .el-dialog__body {
            padding: 12px;
        }

        .motor-characteristics-body {
            padding: 10px;
        }

        .motor-characteristics-table {
            min-width: 680px;
        }

        .motor-characteristics-table .el-input {
            width: 240px !important;
        }
    }
}
</style>
