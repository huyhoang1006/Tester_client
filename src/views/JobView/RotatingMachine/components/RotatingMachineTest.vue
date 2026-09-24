<template>
    <div class="rm-test">
        <div class="test-toolbar">
            <div class="test-toolbar-group">
                <el-button size="mini" type="primary" @click="calculator">
                    <i class="fas fa-circle-play"></i> Assess results
                </el-button>
                <el-button size="mini" @click="clear">
                    <i class="fas fa-xmark"></i> Clear all
                </el-button>
            </div>
            <div class="test-toolbar-group">
                <el-button size="mini" @click="openAssessmentDialog = true">
                    <i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings
                </el-button>
                <el-button size="mini" @click="openConditionIndicatorDialog = true">
                    <i class="fa-solid fa-hammer"></i> Condition indicator settings
                </el-button>
                <el-button size="mini" :type="compareOpen ? 'primary' : ''" @click="$emit('toggle-compare')">
                    <i class="fa-solid fa-scale-balanced"></i> Compare with previous results
                </el-button>
            </div>
        </div>

        <div class="test-settings">
            <div class="setting-field setting-checkbox">
                <el-checkbox :value="temperatureCorrectionEnabled" @change="setTemperatureCorrection">
                    Temperature correction
                </el-checkbox>
            </div>
            <label v-if="conditions.correction_factor" class="setting-field">
                <span>Correction factor</span>
                <el-input size="mini" number="positive" :disabled="!temperatureCorrectionEnabled"
                    v-model="conditions.correction_factor.value" @input="computeDerived"></el-input>
            </label>
            <template v-if="isDfCap && conditions.maximum_test_voltage && conditions.frequency && conditions.step">
                <label class="setting-field">
                    <span>Maximum test voltage</span>
                    <el-input size="mini" number="positive" v-model="conditions.maximum_test_voltage.value"
                        @change="generateVoltageSteps"><template slot="append">kV</template></el-input>
                </label>
                <label class="setting-field">
                    <span>Frequency</span>
                    <el-input size="mini" number="positive" v-model="conditions.frequency.value">
                        <template slot="append">Hz</template>
                    </el-input>
                </label>
                <label class="setting-field">
                    <span>Step</span>
                    <el-input size="mini" number="positive" v-model="conditions.step.value"
                        @change="generateVoltageSteps"></el-input>
                </label>
                <el-button size="mini" class="generate-button" @click="generateVoltageSteps">
                    <i class="fa-solid fa-arrows-rotate"></i> Generate voltage steps
                </el-button>
            </template>
        </div>

        <div class="table-scroll">
            <table class="table-strip-input-data test-table">
                <thead>
                    <tr>
                        <th class="no-col">No.</th>
                        <th v-for="column in dataColumns" :key="column.code">
                            {{ column.name }}<span v-if="unitLabel(column.unit)"> ({{ unitLabel(column.unit) }})</span>
                        </th>
                        <th class="assessment-col">Assessment</th>
                        <th class="condition-indicator-col">Condition indicator</th>
                        <th class="action-col th-btn" title="Add row" @click="add()"><i class="fa-solid fa-plus"></i></th>
                        <th class="action-col th-btn th-btn-danger" title="Remove all" @click="removeAll()"><i class="fa-solid fa-trash"></i></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in rows" :key="row.mrid || index">
                        <td>{{ index + 1 }}</td>
                        <td v-for="column in dataColumns" :key="column.code">
                            <el-input size="mini" :type="column.type === 'analog' ? 'text' : 'text'"
                                :number="column.type === 'analog' ? 'positive' : undefined"
                                :readonly="isReadOnly(column.code)"
                                v-model="row[column.code].value"
                                @input="handleFieldInput(column.code)"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="row.assessment.value"
                                @change="syncConditionIndicator(row)">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                                <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                            </el-select>
                            <span v-if="row.assessment.value === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                            <span v-else-if="row.assessment.value === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                        </td>
                        <td>
                            <el-select :class="nameColor(row.condition_indicator.value)" size="mini"
                                disabled v-model="row.condition_indicator.value">
                                <el-option value="Good">Good</el-option>
                                <el-option value="Fair">Fair</el-option>
                                <el-option value="Poor">Poor</el-option>
                                <el-option value="Bad">Bad</el-option>
                            </el-select>
                        </td>
                        <td>
                            <el-button size="mini" type="primary" class="row-btn" title="Insert row below" @click="add(index)">
                                <i class="fa-solid fa-plus"></i>
                            </el-button>
                        </td>
                        <td>
                            <el-button size="mini" type="danger" class="row-btn" title="Delete row" @click="deleteRow(index)">
                                <i class="fa-solid fa-trash"></i>
                            </el-button>
                        </td>
                    </tr>
                    <tr v-if="rows.length === 0">
                        <td :colspan="dataColumns.length + 5" class="empty-row">No measurement rows.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <el-dialog title="Assessment settings" :visible.sync="openAssessmentDialog" width="min(860px, 92vw)" append-to-body>
            <el-form size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select v-model="option" size="mini" placeholder="Please select" class="standard-select">
                        <el-option v-for="item in assessmentList" :key="item.mrid" :label="item.name" :value="item.code"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div v-for="element in filteredAssessmentData" :key="element.mrid" class="assessment-container">
                <div class="assessment-header">
                    <div class="limit-col">Limit</div>
                    <div class="result-col">Assessment</div>
                </div>
                <div class="assessment-body">
                    <template v-for="(node, index) in element.tree">
                        <div v-if="!node.is_default" :key="'node-' + index" class="tree-row">
                            <div class="limit-col"><GroupNode :node="node" mode="limit" /></div>
                            <div class="result-col"><assessment-result-label :result="node.result" /></div>
                        </div>
                        <div v-else :key="'default-' + index" class="tree-row tree-row-default">
                            <div class="limit-col default-label">All other cases</div>
                            <div class="result-col"><assessment-result-label :result="node.result" /></div>
                        </div>
                    </template>
                </div>
            </div>
        </el-dialog>

        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog"
            width="min(650px, 92vw)" append-to-body>
        </el-dialog>
    </div>
</template>

<script>
/* eslint-disable */
import rotatingMachineTestMap from '@/config/test-definitions/RotatingMachine'
import * as common from '../../Common/index.js'
import GroupNode from '../../Common/GroupNode.vue'
import { changeTestStandard } from '../../Common'

const STATUS_CODES = ['assessment', 'condition_indicator']
const STRUCTURAL_CODES = ['measurement', 'name']
const DERIVED_CODES = ['pi', 'r_dev', 'unbalanced', 'delta_tan_delta', 'tan_delta_0_6_minus_0_2']

export default {
    name: 'RotatingMachineTest',
    components: { GroupNode },
    props: {
        data: { type: Object, required: true },
        asset: { type: Object, default: () => ({}) },
        testCondition: { type: Object, default: () => ({ condition: {} }) },
        testAssessment: { type: Object, default: () => ({ assessment: [] }) },
        testTypeCode: { type: String, required: true },
        compareOpen: { type: Boolean, default: false }
    },
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            option: null
        }
    },
    computed: {
        definition() {
            return rotatingMachineTestMap[this.testTypeCode] || { columns: [] }
        },
        dataColumns() {
            return (this.definition.columns || []).filter(column => !STATUS_CODES.includes(column.code))
        },
        rows() {
            return Array.isArray(this.data.table) ? this.data.table : []
        },
        rowTemplate() {
            return common.buildEmptyTestRow(this.definition.columns || [])
        },
        conditions() {
            return (this.testCondition && this.testCondition.condition) || {}
        },
        isDfCap() {
            return this.testTypeCode === 'StatorWindingDfCap'
        },
        isInsulationResistance() {
            return this.testTypeCode === 'InsulationResistanceStator' || this.testTypeCode === 'InsulationResistanceRotor'
        },
        isWindingResistance() {
            return this.testTypeCode === 'DCWindingResistanceStator' || this.testTypeCode === 'DCWindingResistanceRotor'
        },
        temperatureCorrectionEnabled() {
            const value = this.conditionValue('temperature_correction').value
            return value === true || value === 1 || value === '1' || value === 'true'
        },
        assessmentData() {
            return (this.testAssessment && this.testAssessment.assessment) || []
        },
        assessmentList() {
            return this.assessmentData.map(item => ({ code: item.code, name: item.name, type: item.type, mrid: item.mrid }))
        },
        filteredAssessmentData() {
            return this.assessmentData.filter(item => item.code === this.option)
        },
        testStandardData() {
            return this.testAssessment && this.testAssessment.testStandard
        }
    },
    watch: {
        testTypeCode: {
            immediate: true,
            handler() {
                this.$nextTick(() => {
                    this.ensureRows()
                    this.computeDerived()
                })
            }
        },
        option: {
            immediate: true,
            async handler(value) {
                const standard = this.filteredAssessmentData.find(item => item.code === value)
                if (standard && this.testStandardData) {
                    await changeTestStandard(standard.mrid, standard.type, this.testStandardData)
                }
            }
        },
        testStandardData: {
            immediate: true,
            handler(value) {
                const selected = common.testStandardDataToOption(value)
                if (!selected || !selected.mrid) return
                const standard = this.assessmentData.find(item => item.mrid === selected.mrid)
                if (standard) this.option = standard.code
            }
        }
    },
    methods: {
        conditionValue(code) {
            if (!this.conditions[code]) {
                this.$set(this.conditions, code, { mrid: '', value: '', unit: '', type: code === 'temperature_correction' ? 'string' : 'analog', measurement_id: '' })
            }
            return this.conditions[code]
        },
        ensureRows() {
            if (!Array.isArray(this.data.table)) this.$set(this.data, 'table', [])
            this.data.table.forEach(row => {
                this.definition.columns.forEach(column => {
                    if (!row[column.code]) this.$set(row, column.code, JSON.parse(JSON.stringify(this.rowTemplate[column.code])))
                })
            })
        },
        unitLabel(unit) {
            return (unit || '').replace('|', '')
        },
        isReadOnly(code) {
            return DERIVED_CODES.includes(code) || (this.isDfCap && code === 'test_voltage')
        },
        setTemperatureCorrection(value) {
            this.conditionValue('temperature_correction').value = value ? 'true' : 'false'
            this.computeDerived()
        },
        add(index) {
            const row = JSON.parse(JSON.stringify(this.rowTemplate))
            if (typeof index === 'number') this.data.table.splice(index + 1, 0, row)
            else this.data.table.push(row)
        },
        deleteRow(index) {
            this.data.table.splice(index, 1)
            this.computeDerived()
        },
        removeAll() {
            this.$confirm('Delete all measurement rows?', 'Warning', {
                confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning'
            }).then(() => { this.data.table = [] }).catch(() => {})
        },
        clear() {
            this.rows.forEach(row => {
                Object.keys(row).forEach(code => {
                    const cell = row[code]
                    if (!cell || typeof cell !== 'object' || !Object.prototype.hasOwnProperty.call(cell, 'value')) return
                    if (STRUCTURAL_CODES.includes(code) || (this.isDfCap && code === 'test_voltage')) return
                    cell.value = ''
                })
            })
            this.computeDerived()
        },
        handleFieldInput() {
            this.computeDerived()
        },
        round(value, digits = 4) {
            if (!Number.isFinite(value)) return ''
            return String(Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits))
        },
        numberValue(value) {
            if (value === null || value === undefined || String(value).trim() === '') return NaN
            const parsed = Number(value)
            return Number.isFinite(parsed) ? parsed : NaN
        },
        computeDerived() {
            this.ensureRows()
            if (this.isInsulationResistance) this.computePi()
            else if (this.isWindingResistance) this.computeWindingResistance()
            else if (this.isDfCap) this.computeDfCap()
        },
        computePi() {
            this.rows.forEach(row => {
                const r60 = this.numberValue(row.r60s.value)
                const r10 = this.numberValue(row.r10min.value)
                row.pi.value = Number.isFinite(r60) && r60 > 0 && Number.isFinite(r10) ? this.round(r10 / r60) : ''
            })
        },
        computeWindingResistance() {
            const correctionFactor = this.numberValue(this.conditionValue('correction_factor').value)
            this.rows.forEach(row => {
                const measured = this.numberValue(row.r_meas.value)
                if (this.temperatureCorrectionEnabled && Number.isFinite(measured) && Number.isFinite(correctionFactor) && correctionFactor > 0) {
                    row.r_corr.value = this.round(measured * correctionFactor)
                } else if (!this.temperatureCorrectionEnabled && Number.isFinite(measured) && row.r_corr.value === '') {
                    row.r_corr.value = this.round(measured)
                }
                const corrected = this.numberValue(row.r_corr.value)
                const reference = this.numberValue(row.r_ref.value)
                row.r_dev.value = Number.isFinite(corrected) && Number.isFinite(reference) && reference !== 0
                    ? this.round(100 * (corrected - reference) / reference)
                    : ''
            })

            const correctedValues = this.rows.map(row => this.numberValue(row.r_corr.value)).filter(Number.isFinite)
            let unbalanced = ''
            if (correctedValues.length >= 3) {
                const average = correctedValues.reduce((sum, value) => sum + value, 0) / correctedValues.length
                if (average !== 0) {
                    const maximumDeviation = Math.max(...correctedValues.map(value => Math.abs(value - average)))
                    unbalanced = this.round(100 * maximumDeviation / Math.abs(average))
                }
            }
            this.rows.forEach(row => { row.unbalanced.value = unbalanced })
        },
        generateVoltageSteps() {
            const maximum = this.numberValue(this.conditionValue('maximum_test_voltage').value)
            const step = this.numberValue(this.conditionValue('step').value)
            if (!Number.isFinite(maximum) || maximum <= 0 || !Number.isFinite(step) || step <= 0 || step >= 1) {
                this.$message.warning('Maximum test voltage must be positive and Step must be between 0 and 1')
                return
            }

            const count = Math.round(1 / step)
            if (Math.abs(count * step - 1) > 0.000001) {
                this.$message.warning('Step must divide 1.0 into equal voltage levels')
                return
            }

            const factors = []
            for (let index = 1; index <= count; index++) factors.push(index * step)
            for (let index = count - 1; index >= 1; index--) factors.push(index * step)

            this.data.table = factors.map(factor => {
                const row = JSON.parse(JSON.stringify(this.rowTemplate))
                row.measurement.value = 'UVW - GND'
                row.test_voltage.value = this.round(maximum * factor, 2)
                return row
            })
            this.computeDfCap()
        },
        computeDfCap() {
            this.rows.forEach((row, index) => {
                if (index === 0) row.delta_tan_delta.value = ''
                else {
                    const current = this.numberValue(row.tan_delta_meas.value)
                    const previous = this.numberValue(this.rows[index - 1].tan_delta_meas.value)
                    row.delta_tan_delta.value = Number.isFinite(current) && Number.isFinite(previous)
                        ? this.round(current - previous)
                        : ''
                }
                row.tan_delta_0_6_minus_0_2.value = ''
            })

            const step = this.numberValue(this.conditionValue('step').value)
            const maximum = this.numberValue(this.conditionValue('maximum_test_voltage').value)
            if (Math.abs(step - 0.2) > 0.000001 || !Number.isFinite(maximum) || this.rows.length === 0) return

            const row02 = this.rows.find(row => Math.abs(this.numberValue(row.test_voltage.value) - maximum * 0.2) < 0.011)
            const row06 = this.rows.find(row => Math.abs(this.numberValue(row.test_voltage.value) - maximum * 0.6) < 0.011)
            const tan02 = row02 && this.numberValue(row02.tan_delta_meas.value)
            const tan06 = row06 && this.numberValue(row06.tan_delta_meas.value)
            if (row02 && Number.isFinite(tan02) && Number.isFinite(tan06)) {
                row02.tan_delta_0_6_minus_0_2.value = this.round(tan06 - tan02)
            }
        },
        async calculator() {
            this.computeDerived()
            const standard = this.filteredAssessmentData.find(item => item.code === this.option)
            if (!standard) {
                this.$message.warning('Please select an assessment standard')
                return
            }

            this.rows.forEach(row => {
                const measurementMap = {}
                Object.keys(row).forEach(key => {
                    const cell = row[key]
                    if (cell && cell.measurement_id) measurementMap[cell.measurement_id] = cell.value
                })
                row.assessment.value = common.resolveAssessmentResult(standard, measurementMap, {
                    absolute: this.isWindingResistance
                })
                this.syncConditionIndicator(row)
            })
            this.$message.success('Calculating successfully')
        },
        syncConditionIndicator(row) {
            if (row.assessment.value === 'Pass') row.condition_indicator.value = 'Good'
            else if (row.assessment.value === 'Fail') row.condition_indicator.value = 'Bad'
        },
        nameColor(value) {
            if (value === this.$constant.GOOD) return 'Good'
            if (value === this.$constant.FAIR) return 'Fair'
            if (value === this.$constant.POOR) return 'Poor'
            if (value === this.$constant.BAD) return 'Bad'
            return ''
        }
    }
}
</script>

<style lang="scss" scoped>
.rm-test {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.test-toolbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    padding: 8px 10px;
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.test-toolbar-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.test-toolbar-group .el-button { margin-left: 0; }
.test-toolbar i, .generate-button i { margin-right: 4px; }

.test-settings {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 12px;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #e4e7ed;
    background: #fff;
}

.setting-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 170px;
    color: #606266;
    font-size: 12px;
}

.setting-checkbox { min-width: 190px; padding-bottom: 7px; }
.generate-button { margin-bottom: 1px; }
.standard-select { width: 100%; max-width: 420px; }

.table-scroll {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
}

.test-table {
    width: max-content;
    min-width: 100%;
    border: 1px solid #e4e7ed !important;
    border-radius: 4px;
    background: #fff;
    color: #303133;
    font-size: 12px !important;
}

.test-table th,
.test-table td {
    height: 34px;
    padding: 4px 8px;
    border: 1px solid #e4e7ed !important;
    vertical-align: middle;
    white-space: nowrap;
    font-size: 12px;
}

.test-table th { background: #f5f7fa; color: #606266; font-weight: 600; }
.no-col { width: 48px; }
.action-col { width: 44px; }
.assessment-col { min-width: 140px; }
.condition-indicator-col { min-width: 150px; }
.th-btn { cursor: pointer; text-align: center; color: #012596; }
.th-btn:hover { background: #eef1f8; }
.th-btn-danger { color: #cc0514; }
.th-btn-danger:hover { background: #fdeaec; }

.row-btn {
    padding: 5px 7px;
    background: transparent;
    border-color: transparent;
}

.row-btn.el-button--primary { color: #012596; }
.row-btn.el-button--danger { color: #cc0514; }
.empty-row { padding: 18px !important; text-align: center; color: #909399; font-style: italic; }

::v-deep(.test-table .el-input),
::v-deep(.test-table .el-select) { width: 100%; min-width: 105px; }
::v-deep(.test-table .el-input__inner) { font-size: 12px !important; }

@media (max-width: 767px) {
    .setting-field { flex: 1 1 150px; }
    .test-toolbar { align-items: stretch; }
    .test-toolbar-group { width: 100%; }
}
</style>
