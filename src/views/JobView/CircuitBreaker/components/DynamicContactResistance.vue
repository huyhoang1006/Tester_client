<template>
    <div class="test-ui dynamic-contact-resistance">
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
                <el-button size="mini" :type="compareOpen ? 'primary' : ''" @click="$emit('toggle-compare')">
                    <i class="fa-solid fa-scale-balanced"></i> Compare with previous results
                </el-button>
                <el-button size="mini" :loading="traceLoading" @click="openCurve">
                    <i class="fa-solid fa-chart-line"></i> Dynamic resistance curve
                </el-button>
            </div>
        </div>

        <div class="table-scroll">
            <table class="table-strip-input-data test-table dynamic-table">
                <thead>
                    <tr>
                        <th>Phase</th>
                        <th>Interrupter no.</th>
                        <th>I test (A)</th>
                        <th>{{ timeLabel }}</th>
                        <th>{{ phaseSyncLabel }}</th>
                        <th>{{ interrupterSyncLabel }}</th>
                        <th class="assessment-col">Assessment</th>
                        <th class="condition-indicator-col">Condition indicator</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in rows" :key="row.mrid || index">
                        <td>
                            <div class="phase-value-cell">
                                <el-input size="mini" :value="cellValue(row.phase)" disabled />
                                <span :class="phaseBarClass(cellValue(row.phase))"></span>
                            </div>
                        </td>
                        <td><el-input size="mini" :value="cellValue(row.interrupter)" disabled /></td>
                        <td>
                            <el-input size="mini" v-model="row.i_test.value">
                                <template slot="append">A</template>
                            </el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="row[timeField].value" @input="calculateTimingSynchronism">
                                <template slot="append">ms</template>
                            </el-input>
                        </td>
                        <td><el-input size="mini" :value="cellValue(row[phaseSyncField])" readonly /></td>
                        <td><el-input size="mini" :value="cellValue(row[interrupterSyncField])" readonly /></td>
                        <td>
                            <el-select size="mini" v-model="row.assessment.value" placeholder="Select">
                                <el-option label="Pass" value="Pass" />
                                <el-option label="Fail" value="Fail" />
                            </el-select>
                        </td>
                        <td>
                            <el-select size="mini" :class="conditionClass(row.condition_indicator.value)"
                                disabled v-model="row.condition_indicator.value" placeholder="Select">
                                <el-option label="Good" value="Good" />
                                <el-option label="Fair" value="Fair" />
                                <el-option label="Poor" value="Poor" />
                                <el-option label="Bad" value="Bad" />
                            </el-select>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <el-dialog :title="`${operation} Dynamic Contact Resistance curve`" :visible.sync="curveVisible"
            width="min(1240px, 96vw)" top="3vh" append-to-body destroy-on-close>
            <DynamicResistanceChart v-if="curveVisible" :traces="traces" :operation="operation" />
        </el-dialog>
    </div>
</template>

<script>
import CircuitBreakerTestMap from '@/config/test-definitions/CircuitBreaker'
import * as common from '../../Common/index.js'
import timingMixin from './timingMixin'
import DynamicResistanceChart from './DynamicResistanceChart.vue'

const valueOf = value => {
    if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')) return value.value
    return value === null || value === undefined ? '' : value
}

const getPath = (source, path) => path.reduce((value, key) => value && value[key], source)

export default {
    name: 'DynamicContactResistance',
    components: { DynamicResistanceChart },
    mixins: [timingMixin],
    props: {
        data: { type: Object, required: true },
        asset: { type: Object, required: true },
        compareOpen: { type: Boolean, default: false },
        workTaskId: { type: String, default: '' },
        testCode: { type: String, default: '' }
    },
    data() {
        return {
            curveVisible: false,
            traceLoading: false,
            traces: []
        }
    },
    computed: {
        testData() { return this.data },
        assetData() { return this.asset },
        operation() { return this.testCode === 'CDynamicContactResistance' ? 'C' : 'O' },
        timeField() { return this.operation === 'C' ? 'closing_time' : 'opening_time' },
        phaseSyncField() { return this.operation === 'C' ? 'closing_sync_between_phase' : 'opening_sync_between_phase' },
        interrupterSyncField() { return this.operation === 'C' ? 'closing_sync_between_interrupter' : 'opening_sync_between_interrupter' },
        timeLabel() { return this.operation === 'C' ? 'Closing time (ms)' : 'Opening time (ms)' },
        phaseSyncLabel() { return `${this.operation === 'C' ? 'Closing' : 'Opening'} sync. between phases (ms)` },
        interrupterSyncLabel() { return `${this.operation === 'C' ? 'Closing' : 'Opening'} sync. between interrupters (ms)` },
        rows() {
            const table = this.testData && this.testData.table
            return table && Array.isArray(table.table1) ? table.table1 : []
        },
        rowData() {
            const definition = CircuitBreakerTestMap[this.testCode] || { columns: [] }
            return common.buildEmptyTestRow(definition.columns)
        },
        asset_() {
            const limits = (this.assetData && this.assetData.assessmentLimits) || {}
            const operating = limits.operating_time || {}
            const keys = [
                'opening_time', 'opening_sync_within_phase', 'opening_sync_breaker_phase',
                'closing_time', 'closing_sync_within_phase', 'closing_sync_breaker_phase',
                'reclosing_time', 'open_close_time', 'close_open_time'
            ]
            return {
                limits: limits.limits || 'Absolute',
                openTime: {
                    abs: keys.map(key => ({
                        tmin: valueOf(getPath(operating, ['abs', key, 't_min'])),
                        tmax: valueOf(getPath(operating, ['abs', key, 't_max']))
                    })),
                    rel: keys.map(key => ({
                        rref: valueOf(getPath(operating, ['rel', key, 't_ref'])),
                        tdevZ: valueOf(getPath(operating, ['rel', key, 'minus_t_dev'])),
                        tdevN: valueOf(getPath(operating, ['rel', key, 'plus_t_dev']))
                    }))
                }
            }
        }
    },
    mounted() {
        this.normalizeRows()
        if (!this.testData.limits) this.$set(this.testData, 'limits', this.asset_.limits)
        this.calculateTimingSynchronism()
    },
    watch: {
        rows: {
            deep: false,
            handler() {
                this.normalizeRows()
                this.calculateTimingSynchronism()
            }
        }
    },
    methods: {
        normalizeRows() {
            this.rows.forEach(row => {
                Object.keys(this.rowData).forEach(code => {
                    if (code === 'mrid' || row[code]) return
                    this.$set(row, code, JSON.parse(JSON.stringify(this.rowData[code])))
                })
            })
        },
        cellValue(cell) { return valueOf(cell) },
        phaseBarClass(phase) {
            return { A: 'phase-bar phase-a', B: 'phase-bar phase-b', C: 'phase-bar phase-c' }[phase] || 'phase-bar'
        },
        conditionClass(value) {
            return value ? `condition-${String(value).toLowerCase()}` : ''
        },
        getInterruptersPerPhase() {
            const breaker = (this.assetData && this.assetData.circuitBreaker) || {}
            const value = parseInt(breaker.interruptersPerPhase || breaker.numberOfInterruptPhase || breaker.number_of_interrupt_phase, 10)
            return Number.isFinite(value) && value > 0 ? value : 1
        },
        getNumberOfPhases() {
            const breaker = (this.assetData && this.assetData.circuitBreaker) || {}
            const value = parseInt(breaker.numberOfPhases || breaker.numberOfPhase || breaker.number_of_phases, 10)
            return Number.isFinite(value) && value > 0 ? value : 3
        },
        calculator() {
            this.calculateTimingSynchronism()
            const timeIndex = this.operation === 'C' ? 3 : 0
            const interrupterSyncIndex = this.operation === 'C' ? 4 : 1
            const phaseSyncIndex = this.operation === 'C' ? 5 : 2
            this.rows.forEach((row, index) => {
                const results = [this.assessTiming(valueOf(row[this.timeField]), timeIndex)]
                if (index % this.getInterruptersPerPhase() === 0) {
                    results.push(this.assessTiming(valueOf(row[this.interrupterSyncField]), interrupterSyncIndex))
                }
                if (index === 0) results.push(this.assessTiming(valueOf(row[this.phaseSyncField]), phaseSyncIndex))
                row.assessment.value = this.assessTimingRow(results)
            })
            this.notifyAssessmentCalculated()
        },
        clear() {
            common.clearEditableTestValues(this.testData && this.testData.table)
            this.calculateTimingSynchronism()
        },
        async openCurve() {
            if (this.traceLoading) return
            if (!this.workTaskId || !window.electronAPI.getCbTimingTracesByWorkTaskId) {
                this.$message.warning('Dynamic resistance curve is only available for results imported from PTM (OMICRON)')
                return
            }
            this.traceLoading = true
            try {
                const response = await window.electronAPI.getCbTimingTracesByWorkTaskId(this.workTaskId)
                const traces = response && response.success && Array.isArray(response.data) ? response.data : []
                if (!traces.length) {
                    this.$message.warning('Dynamic resistance curve is only available for results imported from PTM (OMICRON)')
                    return
                }
                this.traces = traces
                this.curveVisible = true
            } catch (error) {
                this.$message.error('Could not load dynamic contact resistance data')
            } finally {
                this.traceLoading = false
            }
        }
    }
}
</script>

<style lang="scss" scoped>
@import "~@/views/JobView/Common/testUi.scss";
.dynamic-contact-resistance { width: 100%; }
.dynamic-table { width: 100%; min-width: 1120px; table-layout: fixed; }
.dynamic-table th, .dynamic-table td { vertical-align: middle; }
.dynamic-table th:nth-child(1) { width: 120px; }
.dynamic-table th:nth-child(2) { width: 112px; }
.dynamic-table th:nth-child(3) { width: 150px; }
.dynamic-table th:nth-child(4) { width: 165px; }
.dynamic-table th:nth-child(5), .dynamic-table th:nth-child(6) { width: 180px; }
.dynamic-table th:nth-child(7), .dynamic-table th:nth-child(8) { width: 155px; }
.dynamic-table .el-input, .dynamic-table .el-select { width: 100%; }
.phase-value-cell { position: relative; padding-right: 6px; }
.phase-bar { position: absolute; top: 0; right: 0; bottom: 0; width: 4px; border-radius: 2px; }
.phase-a { background: #e53935; }
.phase-b { background: #d4a900; }
.phase-c { background: #1558d6; }
::v-deep(.condition-good .el-input__inner) { background: #ecf9f0; color: #168a42; }
::v-deep(.condition-fair .el-input__inner) { background: #fff9e6; color: #a37600; }
::v-deep(.condition-poor .el-input__inner) { background: #fff1df; color: #b85d00; }
::v-deep(.condition-bad .el-input__inner) { background: #fdecec; color: #c62828; }
@media (max-width: 900px) {
    .test-toolbar { align-items: flex-start; }
    .test-toolbar-group { flex-wrap: wrap; }
}
</style>
