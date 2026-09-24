<template>
    <section class="sfra-view" v-loading="loadingComparisons">
        <header class="sfra-toolbar">
            <div class="sfra-title">
                <i class="fa-solid fa-chart-line"></i>
                <div>
                    <strong>SFRA traces</strong>
                    <span>{{ currentTraces.length }} trace(s)</span>
                </div>
            </div>
            <div class="sfra-controls">
                <el-radio-group v-model="viewMode" size="small" class="view-mode" aria-label="SFRA view mode">
                    <el-radio-button label="charts">
                        <i class="fa-solid fa-chart-line"></i>
                        Charts
                    </el-radio-button>
                    <el-radio-button label="data">
                        <i class="fa-solid fa-table-list"></i>
                        Data
                    </el-radio-button>
                </el-radio-group>
                <el-select
                    v-model="selectedComparisonIds"
                    size="small"
                    multiple
                    collapse-tags
                    clearable
                    class="compare-select"
                    placeholder="Compare measurements"
                    @change="loadComparisons">
                    <el-option
                        v-for="option in comparisonOptions"
                        :key="option.workTaskMrid"
                        :label="option.label"
                        :value="option.workTaskMrid" />
                </el-select>
                <el-checkbox v-model="showPhase">Show phase chart</el-checkbox>
                <el-button size="small" title="Zoom charts to fit" @click="zoomToFit">
                    <i class="fa-solid fa-expand"></i>
                    Zoom to fit
                </el-button>
            </div>
        </header>

        <div class="sfra-layout">
            <aside class="trace-panel">
                <div class="trace-panel-heading">Current measurement</div>
                <el-checkbox-group v-model="selectedTraceKeys" class="trace-list">
                    <label
                        v-for="trace in currentTraces"
                        :key="trace.key"
                        class="trace-row"
                        :class="{ active: activeTraceKey === trace.key }"
                        @click="activeTraceKey = trace.key">
                        <el-checkbox :label="trace.key"><span></span></el-checkbox>
                        <span class="trace-swatch" :style="{ backgroundColor: trace.color }"></span>
                        <span class="trace-copy">
                            <strong>{{ trace.name || 'Unnamed trace' }}</strong>
                            <small>{{ terminalLabel(trace) }}</small>
                        </span>
                    </label>
                </el-checkbox-group>

                <template v-if="comparisonRuns.length">
                    <div class="trace-panel-heading reference-heading">Reference measurements</div>
                    <div v-for="run in comparisonRuns" :key="run.workTaskMrid" class="reference-run">
                        <i class="fa-solid fa-minus"></i>
                        <span>{{ run.label }}</span>
                        <b>{{ run.traces.length }}</b>
                    </div>
                </template>

                <div v-if="activeTrace" class="trace-meta">
                    <div><span>Standard</span><b>{{ activeTrace.standard || '—' }}</b></div>
                    <div><span>Measured</span><b>{{ activeTrace.measuredDate || '—' }}</b></div>
                    <div><span>Tap position</span><b>{{ activeTrace.tapPosition || '—' }}</b></div>
                    <div><span>Points</span><b>{{ activeTrace.points.length }}</b></div>
                </div>
            </aside>

            <div class="sfra-workspace">
                <div v-show="viewMode === 'charts'" class="chart-workspace">
                    <article class="chart-panel magnitude-panel">
                        <div class="chart-heading">
                            <span>Magnitude</span>
                            <small>Frequency response (dB)</small>
                        </div>
                        <div ref="magnitudeChart" class="sfra-chart"></div>
                    </article>
                    <article v-show="showPhase" class="chart-panel phase-panel">
                        <div class="chart-heading">
                            <span>Phase</span>
                            <small>Phase angle (degree)</small>
                        </div>
                        <div ref="phaseChart" class="sfra-chart phase-chart"></div>
                    </article>
                </div>

                <div v-show="viewMode === 'data'" class="data-workspace">
                    <div class="data-heading">
                        <div>
                            <strong>{{ activeTrace ? (activeTrace.name || 'Unnamed trace') : 'No trace selected' }}</strong>
                            <span v-if="activeTrace">{{ terminalLabel(activeTrace) }}</span>
                        </div>
                        <span>{{ activeTracePoints.length }} point(s)</span>
                    </div>
                    <el-table
                        :data="pagedTracePoints"
                        :row-key="row => row.index"
                        border
                        stripe
                        size="mini"
                        height="510"
                        empty-text="No SFRA point data">
                        <el-table-column prop="index" label="No." width="76" align="right" />
                        <el-table-column label="Frequency (Hz)" min-width="190" align="right">
                            <template slot-scope="scope">{{ formatFrequency(scope.row.frequency) }}</template>
                        </el-table-column>
                        <el-table-column label="Magnitude (dB)" min-width="190" align="right">
                            <template slot-scope="scope">{{ formatMeasurement(scope.row.magnitude) }}</template>
                        </el-table-column>
                        <el-table-column label="Phase (°)" min-width="190" align="right">
                            <template slot-scope="scope">{{ formatMeasurement(scope.row.phase) }}</template>
                        </el-table-column>
                    </el-table>
                    <div class="data-pagination">
                        <el-pagination
                            :current-page.sync="dataPage"
                            :page-size.sync="dataPageSize"
                            :page-sizes="[100, 250, 500]"
                            :total="activeTracePoints.length"
                            background
                            layout="total, sizes, prev, pager, next"
                            @size-change="handleDataPageSize" />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import * as echarts from 'echarts'
import sfraDefinition from '@/config/test-definitions/Transformer/SFRA.json'
import { attachAliasFromColumns } from '@/utils/compareTestResults'

const PALETTE = ['#df2f2f', '#17823b', '#1f5fd1', '#e08a00', '#6f42c1', '#008c95', '#bf4a00', '#20252b']
const NAMED_COLORS = {
    red: '#df2f2f', green: '#17823b', blue: '#1f5fd1', black: '#20252b',
    gold: '#d7a400', darkorange: '#e87500', mediumspringgreen: '#00a96b',
    blueviolet: '#7548c8', royalblue: '#4169e1'
}

const cellValue = (row, code) => {
    const value = row && row[code]
    return value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')
        ? value.value
        : value
}

const parsePoints = value => {
    if (Array.isArray(value)) return value
    try {
        const parsed = JSON.parse(String(value || '[]'))
        return Array.isArray(parsed) ? parsed : []
    } catch (error) {
        return []
    }
}

const snapshotRowToPlain = row => {
    const plain = {}
    Object.values((row && row.cells) || {}).forEach(cell => {
        if (cell && cell.aliasName) plain[cell.aliasName] = cell.value
    })
    plain.mrid = row && row.datasetMrid
    return plain
}

const traceFromRow = (row, index, prefix = 'current') => {
    const points = parsePoints(cellValue(row, 'points_json'))
        .map(point => [Number(point.frequency), Number(point.magnitude), Number(point.phase)])
        .filter(point => point.every(Number.isFinite) && point[0] > 0)
        .sort((left, right) => left[0] - right[0])
    const colorName = String(cellValue(row, 'trace_color') || '').trim().toLowerCase()
    return {
        key: `${prefix}:${row.mrid || index}`,
        name: String(cellValue(row, 'trace_name') || ''),
        group: String(cellValue(row, 'group_name') || ''),
        standard: String(cellValue(row, 'source_standard') || ''),
        referenceTerminal: String(cellValue(row, 'reference_terminal') || ''),
        responseTerminal: String(cellValue(row, 'response_terminal') || ''),
        measuredDate: String(cellValue(row, 'measured_date') || ''),
        tapPosition: String(cellValue(row, 'tap_position') || ''),
        points,
        color: NAMED_COLORS[colorName] || PALETTE[index % PALETTE.length],
    }
}

const rowsFromSnapshot = snapshot => {
    const rows = []
    const tables = (snapshot && snapshot.tables) || []
    tables.forEach(table => {
        (table.rows || []).forEach(row => rows.push(snapshotRowToPlain(row)))
    })
    return rows
}

export default {
    name: 'SFRA',
    props: {
        data: { type: Object, default: () => ({ table: { table1: [] } }) },
        assetMrid: { type: String, default: '' },
        workMrid: { type: String, default: '' },
        workTaskMrid: { type: String, default: '' }
    },
    data() {
        return {
            selectedTraceKeys: [],
            activeTraceKey: '',
            viewMode: 'charts',
            showPhase: true,
            dataPage: 1,
            dataPageSize: 250,
            comparisonOptions: [],
            selectedComparisonIds: [],
            comparisonRuns: [],
            loadingComparisons: false,
            magnitudeChart: null,
            phaseChart: null,
            resizeObserver: null
        }
    },
    computed: {
        sourceRows() {
            const table = this.data && this.data.table
            return table && Array.isArray(table.table1) ? table.table1 : []
        },
        currentTraces() {
            return this.sourceRows.map((row, index) => traceFromRow(row, index))
        },
        activeTrace() {
            return this.currentTraces.find(trace => trace.key === this.activeTraceKey) || this.currentTraces[0] || null
        },
        activeTracePoints() {
            if (!this.activeTrace) return []
            return this.activeTrace.points.map((point, index) => ({
                index: index + 1,
                frequency: point[0],
                magnitude: point[1],
                phase: point[2],
            }))
        },
        pagedTracePoints() {
            const start = (this.dataPage - 1) * this.dataPageSize
            return this.activeTracePoints.slice(start, start + this.dataPageSize)
        },
        visibleCurrentTraces() {
            const selected = new Set(this.selectedTraceKeys)
            return this.currentTraces.filter(trace => selected.has(trace.key))
        }
    },
    watch: {
        currentTraces: {
            immediate: true,
            handler(traces) {
                const available = new Set(traces.map(trace => trace.key))
                const kept = this.selectedTraceKeys.filter(key => available.has(key))
                this.selectedTraceKeys = kept.length ? kept : traces.map(trace => trace.key)
                if (!available.has(this.activeTraceKey)) this.activeTraceKey = traces[0] ? traces[0].key : ''
                this.$nextTick(this.renderCharts)
            }
        },
        selectedTraceKeys() { this.renderCharts() },
        comparisonRuns: { deep: true, handler() { this.renderCharts() } },
        showPhase() { this.$nextTick(this.renderCharts) },
        viewMode(mode) {
            if (mode === 'charts') this.$nextTick(this.renderCharts)
        },
        activeTraceKey() {
            this.dataPage = 1
        },
        assetMrid() { this.loadComparisonOptions() }
    },
    mounted() {
        this.loadComparisonOptions()
        this.$nextTick(() => {
            this.renderCharts()
            if (window.ResizeObserver) {
                this.resizeObserver = new window.ResizeObserver(() => this.resizeCharts())
                this.resizeObserver.observe(this.$el)
            }
        })
        window.addEventListener('resize', this.resizeCharts)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeCharts)
        if (this.resizeObserver) this.resizeObserver.disconnect()
        if (this.magnitudeChart) this.magnitudeChart.dispose()
        if (this.phaseChart) this.phaseChart.dispose()
    },
    methods: {
        terminalLabel(trace) {
            return [trace.referenceTerminal, trace.responseTerminal].filter(Boolean).join(' → ') || trace.group || 'SFRA'
        },
        formatFrequency(value) {
            const number = Number(value)
            if (!Number.isFinite(number)) return '—'
            if (number !== 0 && (Math.abs(number) >= 1000000 || Math.abs(number) < 0.001)) {
                return number.toExponential(6)
            }
            return number.toLocaleString('en-US', { maximumFractionDigits: 6 })
        },
        formatMeasurement(value) {
            const number = Number(value)
            return Number.isFinite(number) ? number.toFixed(6) : '—'
        },
        handleDataPageSize() {
            this.dataPage = 1
        },
        async loadComparisonOptions() {
            this.comparisonOptions = []
            this.selectedComparisonIds = []
            this.comparisonRuns = []
            if (!this.assetMrid || !window.electronAPI || !window.electronAPI.getComparableTests) return
            const response = await window.electronAPI.getComparableTests(this.assetMrid, 'SFRA', this.workMrid)
            if (!response || !response.success) return
            this.comparisonOptions = (response.data || [])
                .filter(item => item.workTaskMrid !== this.workTaskMrid)
                .map(item => ({
                    ...item,
                    label: [item.testName, item.workName, item.executionDate].filter(Boolean).join(' · ') || 'SFRA reference'
                }))
        },
        async loadComparisons() {
            if (!window.electronAPI || !window.electronAPI.getTestSnapshot) return
            this.loadingComparisons = true
            try {
                const selected = new Set(this.selectedComparisonIds)
                const options = this.comparisonOptions.filter(option => selected.has(option.workTaskMrid))
                this.comparisonRuns = await Promise.all(options.map(async (option, runIndex) => {
                    const response = await window.electronAPI.getTestSnapshot(option.workTaskMrid)
                    const snapshot = attachAliasFromColumns(
                        response && response.success ? response.data : { tables: [] },
                        sfraDefinition.columns
                    )
                    return {
                        ...option,
                        traces: rowsFromSnapshot(snapshot).map((row, index) => {
                            const trace = traceFromRow(row, index, `reference-${runIndex}`)
                            trace.color = this.referenceColor(trace, index)
                            return trace
                        })
                    }
                }))
            } finally {
                this.loadingComparisons = false
            }
        },
        referenceColor(trace, index) {
            const name = trace.name.trim().toLowerCase()
            const current = this.currentTraces.find(item => item.name.trim().toLowerCase() === name)
            return current ? current.color : PALETTE[index % PALETTE.length]
        },
        buildSeries(metricIndex) {
            const current = this.visibleCurrentTraces.map(trace => ({
                name: trace.name,
                type: 'line',
                data: trace.points.map(point => [point[0], point[metricIndex]]),
                showSymbol: false,
                sampling: 'lttb',
                animation: false,
                lineStyle: { width: 1.5, color: trace.color },
                itemStyle: { color: trace.color }
            }))
            const references = []
            this.comparisonRuns.forEach(run => {
                run.traces.forEach(trace => {
                    references.push({
                        name: `${run.label} · ${trace.name}`,
                        type: 'line',
                        data: trace.points.map(point => [point[0], point[metricIndex]]),
                        showSymbol: false,
                        sampling: 'lttb',
                        animation: false,
                        lineStyle: { width: 1.2, type: 'dashed', opacity: 0.72, color: trace.color },
                        itemStyle: { color: trace.color }
                    })
                })
            })
            return current.concat(references)
        },
        chartOption(metricIndex, unit) {
            const series = this.buildSeries(metricIndex)
            return {
                animation: false,
                color: PALETTE,
                grid: { left: 64, right: 24, top: 18, bottom: 46 },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'cross' },
                    valueFormatter: value => `${Number(value).toFixed(3)} ${unit}`
                },
                xAxis: {
                    type: 'log',
                    name: 'Frequency (Hz)',
                    nameLocation: 'middle',
                    nameGap: 30,
                    minorTick: { show: true },
                    minorSplitLine: { show: true, lineStyle: { color: '#eef1f5' } },
                    splitLine: { show: true, lineStyle: { color: '#d8dee8' } }
                },
                yAxis: {
                    type: 'value',
                    name: unit,
                    splitLine: { lineStyle: { color: '#d8dee8' } }
                },
                dataZoom: [{ type: 'inside', xAxisIndex: 0, filterMode: 'none' }],
                series,
                graphic: series.length ? [] : [{
                    type: 'text', left: 'center', top: 'middle',
                    style: { text: 'No SFRA trace data', fill: '#8b95a5', fontSize: 14 }
                }]
            }
        },
        renderCharts() {
            if (!this.$refs.magnitudeChart) return
            if (!this.magnitudeChart) this.magnitudeChart = echarts.init(this.$refs.magnitudeChart)
            this.magnitudeChart.setOption(this.chartOption(1, 'dB'), true)
            if (this.showPhase && this.$refs.phaseChart) {
                if (!this.phaseChart) this.phaseChart = echarts.init(this.$refs.phaseChart)
                this.phaseChart.setOption(this.chartOption(2, '°'), true)
            }
            this.resizeCharts()
        },
        resizeCharts() {
            if (this.magnitudeChart) this.magnitudeChart.resize()
            if (this.phaseChart && this.showPhase) this.phaseChart.resize()
        },
        zoomToFit() {
            const charts = [this.magnitudeChart, this.phaseChart].filter(Boolean)
            charts.forEach(chart => {
                chart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
            })
        }
    }
}
</script>

<style scoped>
.sfra-view {
    width: 100%;
    min-height: 620px;
    border: 1px solid #d9e0e9;
    background: #fff;
}

.sfra-toolbar {
    min-height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 12px;
    box-sizing: border-box;
    border-bottom: 1px solid #d9e0e9;
    background: #f5f7fa;
}

.sfra-title,
.sfra-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.sfra-title > i {
    color: #0b43a9;
    font-size: 18px;
}

.sfra-title div {
    display: flex;
    flex-direction: column;
}

.sfra-title strong { font-size: 14px; color: #202733; }
.sfra-title span { margin-top: 2px; font-size: 11px; color: #7a8492; }
.compare-select { width: 360px; }
.view-mode i { margin-right: 5px; }

.sfra-layout {
    display: grid;
    grid-template-columns: 270px minmax(0, 1fr);
    min-height: 565px;
}

.trace-panel {
    min-width: 0;
    padding: 10px;
    border-right: 1px solid #d9e0e9;
    background: #f8f9fb;
    overflow: auto;
}

.trace-panel-heading {
    padding: 3px 4px 8px;
    color: #596474;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
}

.reference-heading {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #dfe4eb;
}

.trace-list { display: block; }
.trace-row {
    display: grid;
    grid-template-columns: 22px 10px minmax(0, 1fr);
    align-items: center;
    gap: 7px;
    min-height: 42px;
    padding: 5px 7px;
    box-sizing: border-box;
    border: 1px solid transparent;
    cursor: pointer;
}

.trace-row:hover { background: #eef3f9; }
.trace-row.active { border-color: #9cb6dc; background: #e7effa; }
.trace-swatch { width: 10px; height: 10px; }
.trace-copy { min-width: 0; display: flex; flex-direction: column; }
.trace-copy strong { overflow: hidden; color: #26313e; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.trace-copy small { margin-top: 2px; overflow: hidden; color: #7b8592; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }

.reference-run {
    display: grid;
    grid-template-columns: 16px minmax(0, 1fr) 24px;
    gap: 6px;
    align-items: center;
    padding: 6px 4px;
    color: #596474;
    font-size: 11px;
}

.reference-run i { border-top: 2px dashed #64748b; color: transparent; }
.reference-run span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.reference-run b { text-align: right; }

.trace-meta {
    margin-top: 16px;
    padding-top: 8px;
    border-top: 1px solid #dfe4eb;
}

.trace-meta div {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 4px;
    font-size: 11px;
}

.trace-meta span { color: #7b8592; }
.trace-meta b { color: #344052; text-align: right; font-weight: 600; }

.sfra-workspace { min-width: 0; background: #fff; }
.chart-workspace { min-width: 0; padding: 10px 14px 16px; }
.chart-panel + .chart-panel { margin-top: 12px; }
.chart-heading { display: flex; align-items: baseline; gap: 8px; height: 28px; }
.chart-heading span { color: #202733; font-size: 13px; font-weight: 700; }
.chart-heading small { color: #7b8592; font-size: 11px; }
.sfra-chart { width: 100%; height: 330px; }
.phase-chart { height: 240px; }

.data-workspace { min-width: 0; padding: 10px 14px 14px; }
.data-heading {
    min-height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}
.data-heading div { min-width: 0; display: flex; flex-direction: column; }
.data-heading strong { overflow: hidden; color: #202733; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.data-heading span { margin-top: 2px; color: #7b8592; font-size: 11px; }
.data-heading > span { flex: 0 0 auto; margin: 0; }
.data-pagination { display: flex; justify-content: flex-end; padding-top: 12px; }

@media (max-width: 1100px) {
    .sfra-toolbar { align-items: flex-start; flex-direction: column; }
    .sfra-controls { width: 100%; flex-wrap: wrap; }
    .compare-select { width: min(100%, 420px); }
    .sfra-layout { grid-template-columns: 230px minmax(0, 1fr); }
}
</style>
