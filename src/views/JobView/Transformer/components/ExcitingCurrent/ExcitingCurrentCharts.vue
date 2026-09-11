<template>
    <section class="exciting-current-plots">
        <div class="plots-heading">
            <i class="fa-solid fa-chart-column"></i>
            <span>Plots</span>
        </div>

        <div class="plot-grid">
            <article class="plot-panel">
                <div class="plot-title">Exciting current</div>
                <div class="plot-body">
                    <div ref="current" class="plot-chart"></div>
                    <div v-if="!hasData.iOut" class="plot-empty">No exciting current values</div>
                </div>
            </article>

            <article class="plot-panel">
                <div class="plot-title">Watt losses</div>
                <div class="plot-body">
                    <div ref="wattLosses" class="plot-chart"></div>
                    <div v-if="!hasData.wattLosses" class="plot-empty">No watt loss values</div>
                </div>
            </article>

            <article class="plot-panel deviation-panel">
                <div class="plot-title">I deviation by phase and tap</div>
                <div class="plot-body deviation-body">
                    <div ref="deviation" class="plot-chart deviation-chart"></div>
                    <div v-if="!hasData.iDev" class="plot-empty">No current deviation values</div>
                </div>
            </article>
        </div>
    </section>
</template>

<script>
import * as echarts from 'echarts'

const PHASES = ['A', 'B', 'C']
const PHASE_COLORS = { A: '#e53935', B: '#c58a00', C: '#1558d6' }

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

export default {
    name: 'ExcitingCurrentCharts',
    props: {
        rows: { type: Array, default: () => [] }
    },
    created() {
        this._charts = Object.create(null)
    },
    computed: {
        taps() {
            const taps = []
            this.rows.forEach(row => {
                const value = valueOf(row, 'tap')
                const tap = String(value === null || value === undefined ? '' : value).trim()
                if (tap && !taps.includes(tap)) taps.push(tap)
            })
            return taps
        },
        chartRows() {
            return this.rows.map(row => ({
                tap: String(valueOf(row, 'tap') === null || valueOf(row, 'tap') === undefined
                    ? ''
                    : valueOf(row, 'tap')).trim(),
                phase: String(valueOf(row, 'phase') || '').trim().toUpperCase(),
                iOut: numberOf(valueOf(row, 'i_out')),
                wattLosses: numberOf(valueOf(row, 'watt_losses')),
                iDev: numberOf(valueOf(row, 'i_dev'))
            }))
        },
        hasData() {
            return {
                iOut: this.chartRows.some(row => row.iOut !== null),
                wattLosses: this.chartRows.some(row => row.wattLosses !== null),
                iDev: this.chartRows.some(row => row.iDev !== null)
            }
        }
    },
    watch: {
        chartRows: {
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
        phaseSeries(metric, type) {
            return PHASES.map(phase => ({
                name: phase,
                type,
                connectNulls: false,
                symbol: 'circle',
                symbolSize: 6,
                barMaxWidth: 34,
                lineStyle: { width: 2, color: PHASE_COLORS[phase] },
                itemStyle: { color: PHASE_COLORS[phase] },
                emphasis: { focus: 'series' },
                data: this.taps.map(tap => {
                    const row = this.chartRows.find(item => item.tap === tap && item.phase === phase)
                    return row ? row[metric] : null
                })
            }))
        },
        chartOption(metric, unit, type, imageName) {
            const isBar = type === 'bar'
            return {
                animation: false,
                color: PHASES.map(phase => PHASE_COLORS[phase]),
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: isBar ? 'shadow' : 'cross' }
                },
                legend: { top: 8, left: 12, data: PHASES },
                toolbox: {
                    top: 2,
                    right: 8,
                    feature: {
                        dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset zoom' } },
                        restore: { title: 'Restore' },
                        saveAsImage: { title: 'Save image', name: imageName }
                    }
                },
                grid: { left: 62, right: 24, top: 52, bottom: 58 },
                dataZoom: [{ type: 'inside', xAxisIndex: 0, filterMode: 'none' }],
                xAxis: {
                    type: 'category',
                    name: 'Tap',
                    nameLocation: 'middle',
                    nameGap: 34,
                    boundaryGap: isBar,
                    data: this.taps,
                    splitLine: { show: !isBar, lineStyle: { color: '#eef1f5' } }
                },
                yAxis: {
                    type: 'value',
                    name: unit,
                    scale: true,
                    splitLine: { show: true, lineStyle: { color: '#e6eaf0' } }
                },
                series: this.phaseSeries(metric, type)
            }
        },
        chartFor(name) {
            const element = this.$refs[name]
            if (!element) return null
            if (!this._charts[name]) this._charts[name] = echarts.init(element)
            return this._charts[name]
        },
        renderAll() {
            const current = this.chartFor('current')
            const wattLosses = this.chartFor('wattLosses')
            const deviation = this.chartFor('deviation')

            if (current) {
                current.setOption(this.chartOption(
                    'iOut',
                    'mA',
                    'line',
                    'transformer-exciting-current'
                ), true)
            }
            if (wattLosses) {
                wattLosses.setOption(this.chartOption(
                    'wattLosses',
                    'W',
                    'line',
                    'transformer-exciting-current-watt-losses'
                ), true)
            }
            if (deviation) {
                deviation.setOption(this.chartOption(
                    'iDev',
                    '%',
                    'bar',
                    'transformer-exciting-current-deviation'
                ), true)
            }
            this.resizeAll()
        },
        resizeAll() {
            Object.values(this._charts).forEach(chart => chart.resize())
        }
    }
}
</script>

<style scoped>
.exciting-current-plots {
    margin: 10px 0;
    border: 1px solid #dfe4ec;
    border-radius: 4px;
    background: #fff;
    overflow: hidden;
}
.plots-heading {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 38px;
    padding: 0 10px;
    border-bottom: 1px solid #dfe4ec;
    background: #f5f7fa;
    color: #303133;
    font-size: 12px;
    font-weight: 600;
}
.plots-heading i { color: #606266; }
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
.deviation-panel {
    grid-column: 1 / -1;
    border-right: 0;
    border-bottom: 0;
}
.plot-title {
    min-height: 34px;
    padding: 10px 12px 0;
    color: #303133;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
}
.plot-body {
    position: relative;
    min-height: 300px;
}
.plot-chart {
    width: 100%;
    height: 300px;
}
.deviation-body { min-height: 320px; }
.deviation-chart { height: 320px; }
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
        border-right: 0;
        border-bottom: 1px solid #e4e7ed;
    }
    .deviation-panel { grid-column: auto; border-bottom: 0; }
}
</style>
