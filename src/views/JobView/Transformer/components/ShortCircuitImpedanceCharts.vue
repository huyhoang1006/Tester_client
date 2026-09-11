<template>
    <section v-if="showPlots" class="impedance-plots">
        <div class="plots-heading">
            <i class="fa-solid fa-chart-column"></i>
            <span>Plots</span>
            <span v-if="isImported" class="source-label">PTM data</span>
        </div>

        <div class="plot-grid">
            <article v-if="showManualChart" class="plot-panel full-panel">
                <div class="plot-toolbar">
                    <span>Per-phase impedance</span>
                    <label class="metric-control">
                        <span>Y-axis</span>
                        <el-select v-model="manualMetric" size="mini">
                            <el-option label="Zk" value="zk"></el-option>
                            <el-option label="Rk" value="rk"></el-option>
                            <el-option label="Xk" value="xk"></el-option>
                        </el-select>
                    </label>
                </div>
                <div class="plot-body">
                    <div ref="manual" class="plot-chart"></div>
                    <div v-if="!hasManualData" class="plot-empty">Enter per-phase values to draw the plot.</div>
                </div>
            </article>

            <template v-if="showImportedPerPhase">
                <article v-if="hasPrimaryData" class="plot-panel">
                    <div class="plot-toolbar">
                        <span>{{ primaryMetricLabel }}</span>
                        <label class="metric-control">
                            <span>Y-axis</span>
                            <el-select v-model="primaryMetric" size="mini">
                                <el-option label="Lk" value="lk"></el-option>
                                <el-option label="Rk" value="rk"></el-option>
                            </el-select>
                        </label>
                    </div>
                    <div class="plot-body">
                        <div ref="primary" class="plot-chart"></div>
                    </div>
                </article>

                <article v-if="hasPercentData" class="plot-panel">
                    <div class="plot-toolbar">
                        <span>{{ percentMetricLabel }}</span>
                        <label class="metric-control">
                            <span>Y-axis</span>
                            <el-select v-model="percentMetric" size="mini">
                                <el-option label="Xk" value="xk_percent"></el-option>
                                <el-option label="Zk" value="zk_percent"></el-option>
                            </el-select>
                        </label>
                    </div>
                    <div class="plot-body">
                        <div ref="percent" class="plot-chart"></div>
                    </div>
                </article>
            </template>

            <article v-if="hasFrslData" class="plot-panel full-panel frsl-panel">
                <div class="plot-toolbar centered-title">
                    <span>FRSL</span>
                </div>
                <div class="plot-body frsl-body">
                    <div ref="frsl" class="plot-chart frsl-chart"></div>
                </div>
            </article>
        </div>
    </section>
</template>

<script>
import * as echarts from 'echarts'

const PHASES = ['A', 'B', 'C']
const PHASE_COLORS = { A: '#e53935', B: '#c58a00', C: '#1558d6' }
const LINE_TYPES = ['solid', 'dashed', 'dotted']

const valueOf = (row, code) => {
    const cell = row && row[code]
    return cell && typeof cell === 'object' && Object.prototype.hasOwnProperty.call(cell, 'value')
        ? cell.value
        : cell
}

const numberOf = value => {
    if (value === '' || value === null || value === undefined) return null
    const number = Number(value)
    return Number.isFinite(number) ? number : null
}

const normalizePhase = row => String(valueOf(row, 'phase') || '').trim().toUpperCase()
const normalizeTap = row => String(valueOf(row, 'tap') === null || valueOf(row, 'tap') === undefined
    ? ''
    : valueOf(row, 'tap')).trim()

export default {
    name: 'ShortCircuitImpedanceCharts',
    props: {
        table: { type: Object, default: () => ({}) },
        mode: { type: String, default: 'threePhase' }
    },
    data() {
        return {
            manualMetric: 'zk',
            primaryMetric: 'lk',
            percentMetric: 'xk_percent'
        }
    },
    created() {
        this._charts = Object.create(null)
    },
    computed: {
        threePhaseSweepRows() { return Array.isArray(this.table.table3) ? this.table.table3 : [] },
        perPhaseSweepRows() { return Array.isArray(this.table.table4) ? this.table.table4 : [] },
        perPhaseRows() { return Array.isArray(this.table.table2) ? this.table.table2 : [] },
        isImported() {
            return this.threePhaseSweepRows.length > 0 || this.perPhaseSweepRows.length > 0
        },
        showManualChart() { return this.mode === 'perPhase' && !this.isImported },
        showImportedPerPhase() { return this.mode === 'perPhase' && this.isImported },
        activeSweepRows() {
            return this.mode === 'threePhase' ? this.threePhaseSweepRows : this.perPhaseSweepRows
        },
        hasFrslData() {
            return this.activeSweepRows.some(row => {
                return numberOf(valueOf(row, 'frequency')) !== null && numberOf(valueOf(row, 'rk')) !== null
            })
        },
        showPlots() {
            return this.showManualChart || this.showImportedPerPhase || (this.isImported && this.hasFrslData)
        },
        hasManualData() {
            return this.perPhaseRows.some(row => numberOf(valueOf(row, this.manualMetric)) !== null)
        },
        hasPrimaryData() {
            return this.perPhaseRows.some(row => {
                return numberOf(valueOf(row, 'lk')) !== null || numberOf(valueOf(row, 'rk')) !== null
            })
        },
        hasPercentData() {
            return this.perPhaseRows.some(row => {
                return numberOf(valueOf(row, 'xk_percent')) !== null ||
                    numberOf(valueOf(row, 'zk_percent')) !== null
            })
        },
        primaryMetricLabel() { return this.primaryMetric === 'lk' ? 'Lk' : 'Rk' },
        percentMetricLabel() { return this.percentMetric === 'xk_percent' ? 'Xk' : 'Zk' },
        renderState() {
            return {
                table: this.table,
                mode: this.mode,
                manualMetric: this.manualMetric,
                primaryMetric: this.primaryMetric,
                percentMetric: this.percentMetric
            }
        }
    },
    watch: {
        renderState: {
            deep: true,
            handler() { this.$nextTick(this.renderAll) }
        }
    },
    mounted() {
        this.$nextTick(this.renderAll)
        window.addEventListener('resize', this.resizeAll)
        if (window.ResizeObserver) {
            this._resizeObserver = new window.ResizeObserver(this.resizeAll)
            this._resizeObserver.observe(this.$el)
        }
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeAll)
        if (this._resizeObserver) this._resizeObserver.disconnect()
        Object.values(this._charts).forEach(chart => chart.dispose())
        this._charts = Object.create(null)
    },
    methods: {
        phaseRows() {
            return this.perPhaseRows.filter(row => PHASES.includes(normalizePhase(row)))
        },
        barCategories() {
            const rows = this.phaseRows()
            const taps = []
            rows.forEach(row => {
                const tap = normalizeTap(row)
                if (tap && !taps.includes(tap)) taps.push(tap)
            })
            const multipleTaps = taps.length > 1
            return rows.map(row => ({
                label: multipleTaps ? `${normalizeTap(row) || '-'} / ${normalizePhase(row)}` : normalizePhase(row),
                row
            }))
        },
        barOption(metric, unit, imageName) {
            const categories = this.barCategories()
            return {
                animation: false,
                color: ['#1558d6'],
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: { top: 8, left: 12, data: ['Measured values'] },
                toolbox: {
                    top: 2,
                    right: 8,
                    feature: {
                        dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset zoom' } },
                        restore: { title: 'Restore' },
                        saveAsImage: { title: 'Save image', name: imageName }
                    }
                },
                grid: { left: 64, right: 24, top: 52, bottom: 58 },
                dataZoom: [{ type: 'inside', xAxisIndex: 0, filterMode: 'none' }],
                xAxis: {
                    type: 'category',
                    name: this.barAxisName(),
                    nameLocation: 'middle',
                    nameGap: 34,
                    data: categories.map(item => item.label),
                    axisLabel: { interval: 0, hideOverlap: true }
                },
                yAxis: {
                    type: 'value',
                    name: unit,
                    scale: true,
                    splitLine: { lineStyle: { color: '#e6eaf0' } }
                },
                series: [{
                    name: 'Measured values',
                    type: 'bar',
                    barMaxWidth: 54,
                    itemStyle: { color: '#1558d6' },
                    data: categories.map(item => numberOf(valueOf(item.row, metric)))
                }]
            }
        },
        barAxisName() {
            const taps = []
            this.phaseRows().forEach(row => {
                const tap = normalizeTap(row)
                if (tap && !taps.includes(tap)) taps.push(tap)
            })
            return taps.length > 1 ? 'Tap / phase' : 'Phase'
        },
        frslSeries() {
            const groups = new Map()
            this.activeSweepRows.forEach(row => {
                const phase = normalizePhase(row)
                const tap = normalizeTap(row)
                const frequency = numberOf(valueOf(row, 'frequency'))
                const resistance = numberOf(valueOf(row, 'rk'))
                if (!PHASES.includes(phase) || frequency === null || resistance === null) return
                const key = `${tap}|${phase}`
                if (!groups.has(key)) groups.set(key, { phase, tap, points: [] })
                groups.get(key).points.push([frequency, resistance])
            })
            const taps = []
            Array.from(groups.values()).forEach(group => {
                if (group.tap && !taps.includes(group.tap)) taps.push(group.tap)
            })
            const multipleTaps = taps.length > 1
            return Array.from(groups.values()).map(group => {
                group.points.sort((left, right) => left[0] - right[0])
                const tapIndex = Math.max(0, taps.indexOf(group.tap))
                return {
                    name: multipleTaps ? `Tap ${group.tap || '-'} / ${group.phase}` : group.phase,
                    type: 'line',
                    showSymbol: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    data: group.points,
                    lineStyle: {
                        width: 2,
                        type: LINE_TYPES[tapIndex % LINE_TYPES.length],
                        color: PHASE_COLORS[group.phase]
                    },
                    itemStyle: { color: PHASE_COLORS[group.phase] },
                    emphasis: { focus: 'series' }
                }
            })
        },
        frslOption() {
            const series = this.frslSeries()
            return {
                animation: false,
                tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
                legend: { type: 'scroll', top: 8, left: 12, right: 88 },
                toolbox: {
                    top: 2,
                    right: 8,
                    feature: {
                        dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset zoom' } },
                        restore: { title: 'Restore' },
                        saveAsImage: { title: 'Save image', name: 'transformer-short-circuit-frsl' }
                    }
                },
                grid: { left: 64, right: 28, top: 52, bottom: 58 },
                dataZoom: [{ type: 'inside', xAxisIndex: 0, filterMode: 'none' }],
                xAxis: {
                    type: 'value',
                    name: 'Hz',
                    nameLocation: 'middle',
                    nameGap: 34,
                    scale: true,
                    splitLine: { show: true, lineStyle: { color: '#eef1f5' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Ω',
                    scale: true,
                    splitLine: { lineStyle: { color: '#e6eaf0' } }
                },
                series
            }
        },
        chartFor(name) {
            const element = this.$refs[name]
            if (!element) return null
            if (!this._charts[name]) this._charts[name] = echarts.init(element)
            return this._charts[name]
        },
        disposeHiddenCharts() {
            const visible = new Set()
            if (this.showManualChart) visible.add('manual')
            if (this.showImportedPerPhase && this.hasPrimaryData) visible.add('primary')
            if (this.showImportedPerPhase && this.hasPercentData) visible.add('percent')
            if (this.hasFrslData) visible.add('frsl')
            Object.keys(this._charts).forEach(name => {
                if (visible.has(name)) return
                this._charts[name].dispose()
                delete this._charts[name]
            })
        },
        renderAll() {
            this.disposeHiddenCharts()
            const manual = this.chartFor('manual')
            const primary = this.chartFor('primary')
            const percent = this.chartFor('percent')
            const frsl = this.chartFor('frsl')

            if (manual) {
                manual.setOption(this.barOption(
                    this.manualMetric,
                    'Ω',
                    `transformer-short-circuit-${this.manualMetric}`
                ), true)
            }
            if (primary) {
                primary.setOption(this.barOption(
                    this.primaryMetric,
                    this.primaryMetric === 'lk' ? 'mH' : 'Ω',
                    `transformer-short-circuit-${this.primaryMetric}`
                ), true)
            }
            if (percent) {
                percent.setOption(this.barOption(
                    this.percentMetric,
                    '%',
                    `transformer-short-circuit-${this.percentMetric}`
                ), true)
            }
            if (frsl) frsl.setOption(this.frslOption(), true)
            this.resizeAll()
        },
        resizeAll() {
            Object.values(this._charts).forEach(chart => chart.resize())
        }
    }
}
</script>

<style scoped>
.impedance-plots {
    margin: 10px 0;
    border: 1px solid #dfe4ec;
    border-radius: 4px;
    background: #fff;
    overflow: hidden;
}
.plots-heading,
.plot-toolbar {
    display: flex;
    align-items: center;
    min-height: 38px;
    padding: 0 10px;
    border-bottom: 1px solid #dfe4ec;
    background: #f5f7fa;
    color: #303133;
    font-size: 12px;
    font-weight: 600;
}
.plots-heading { gap: 7px; }
.plots-heading i { color: #606266; }
.source-label {
    margin-left: auto;
    color: #606266;
    font-weight: 400;
}
.plot-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
}
.plot-panel {
    min-width: 0;
    border-right: 1px solid #e4e7ed;
    border-bottom: 1px solid #e4e7ed;
}
.plot-panel:nth-child(2) { border-right: 0; }
.full-panel {
    grid-column: 1 / -1;
    border-right: 0;
}
.plot-panel:last-child { border-bottom: 0; }
.plot-toolbar {
    justify-content: space-between;
    gap: 12px;
}
.centered-title { justify-content: center; }
.metric-control {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #606266;
    font-weight: 400;
}
.metric-control .el-select { width: 105px; }
.plot-body {
    position: relative;
    min-height: 300px;
}
.plot-chart {
    width: 100%;
    height: 300px;
}
.frsl-body { min-height: 330px; }
.frsl-chart { height: 330px; }
.plot-empty {
    position: absolute;
    inset: 52px 0 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 12px;
    pointer-events: none;
}
@media (max-width: 900px) {
    .plot-grid { grid-template-columns: minmax(0, 1fr); }
    .plot-panel,
    .plot-panel:nth-child(2) {
        grid-column: auto;
        border-right: 0;
        border-bottom: 1px solid #e4e7ed;
    }
    .plot-panel:last-child { border-bottom: 0; }
}
</style>
