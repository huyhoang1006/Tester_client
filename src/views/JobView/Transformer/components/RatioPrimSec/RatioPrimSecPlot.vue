<template>
    <div class="ratio-plot-layout">
        <section class="tap-summary">
            <div class="panel-title">
                <i class="fa-solid fa-sliders"></i>
                <span>Tap changer</span>
            </div>
            <dl class="tap-details">
                <div>
                    <dt>Type</dt>
                    <dd>{{ tapChangerType }}</dd>
                </div>
                <div>
                    <dt>Winding</dt>
                    <dd>{{ tapChanger.winding || '-' }}</dd>
                </div>
                <div>
                    <dt>Number of taps</dt>
                    <dd>{{ numberOfTaps }}</dd>
                </div>
            </dl>
        </section>

        <section class="plot-panel">
            <div class="plot-toolbar">
                <el-radio-group v-model="activeMetric" size="mini">
                    <el-radio-button label="ratio">V ratio</el-radio-button>
                    <el-radio-button label="current">I out</el-radio-button>
                </el-radio-group>
            </div>
            <div class="plot-body">
                <div ref="chart" class="ratio-chart"></div>
                <div v-if="!hasPlotData" class="plot-empty">Enter measurement values to draw the plot.</div>
            </div>
        </section>
    </div>
</template>

<script>
import * as echarts from 'echarts'

const PHASES = ['A', 'B', 'C']
const PHASE_COLORS = { A: '#e53935', B: '#d4a900', C: '#1558d6' }

export default {
    name: 'RatioPrimSecPlot',
    props: {
        rows: { type: Array, default: () => [] },
        asset: { type: Object, default: () => ({}) }
    },
    data() {
        return { activeMetric: 'ratio' }
    },
    computed: {
        tapChanger() {
            return (this.asset && this.asset.tap_changers) || {}
        },
        tapChangerType() {
            const mode = String(this.tapChanger.mode || '').trim()
            return mode ? mode.toUpperCase() : 'None'
        },
        numberOfTaps() {
            const configured = Number(this.tapChanger.no_of_taps)
            if (Number.isFinite(configured) && configured > 0) return configured
            const voltageTable = Array.isArray(this.tapChanger.voltage_table)
                ? this.tapChanger.voltage_table
                : []
            return voltageTable.length || '-'
        },
        taps() {
            const result = []
            this.rows.forEach(row => {
                const tap = row && row.tap ? row.tap.value : ''
                const key = String(tap === null || tap === undefined ? '' : tap)
                if (key !== '' && !result.includes(key)) result.push(key)
            })
            return result
        },
        chartSeries() {
            const valueKey = this.activeMetric === 'ratio' ? 'ratio_meas' : 'i_out'
            return PHASES.map(phase => ({
                name: phase,
                type: 'line',
                connectNulls: false,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2, color: PHASE_COLORS[phase] },
                itemStyle: { color: PHASE_COLORS[phase] },
                data: this.taps.map(tap => {
                    const row = this.rows.find(item => {
                        const itemTap = item && item.tap ? item.tap.value : ''
                        const itemPhase = item && item.phase ? item.phase.value : ''
                        return String(itemTap) === tap && itemPhase === phase
                    })
                    const value = Number(row && row[valueKey] ? row[valueKey].value : NaN)
                    return Number.isFinite(value) ? value : null
                })
            }))
        },
        hasPlotData() {
            return this.chartSeries.some(series => series.data.some(value => value !== null))
        }
    },
    watch: {
        chartSeries: {
            deep: true,
            handler() { this.$nextTick(this.renderChart) }
        }
    },
    mounted() {
        this.$nextTick(this.renderChart)
        window.addEventListener('resize', this.resizeChart)
        if (window.ResizeObserver) {
            this._resizeObserver = new window.ResizeObserver(this.resizeChart)
            this._resizeObserver.observe(this.$el)
        }
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeChart)
        if (this._resizeObserver) this._resizeObserver.disconnect()
        if (this._chart) this._chart.dispose()
        this._chart = null
    },
    methods: {
        resizeChart() {
            if (this._chart) this._chart.resize()
        },
        renderChart() {
            const element = this.$refs.chart
            if (!element) return
            if (!this._chart) this._chart = echarts.init(element)

            const isRatio = this.activeMetric === 'ratio'
            this._chart.setOption({
                animation: false,
                color: PHASES.map(phase => PHASE_COLORS[phase]),
                tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
                legend: { top: 8, left: 12, data: PHASES },
                toolbox: {
                    top: 2,
                    right: 8,
                    feature: {
                        dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset zoom' } },
                        restore: { title: 'Restore' },
                        saveAsImage: {
                            title: 'Save image',
                            name: isRatio ? 'transformer-voltage-ratio' : 'transformer-output-current'
                        }
                    }
                },
                grid: { left: 64, right: 28, top: 52, bottom: 58 },
                dataZoom: [{ type: 'inside', xAxisIndex: 0, filterMode: 'none' }],
                xAxis: {
                    type: 'category',
                    name: 'Tap',
                    nameLocation: 'middle',
                    nameGap: 34,
                    boundaryGap: false,
                    data: this.taps,
                    splitLine: { show: true, lineStyle: { color: '#edf0f5' } }
                },
                yAxis: {
                    type: 'value',
                    name: isRatio ? 'Ratio' : 'mA',
                    scale: true,
                    splitLine: { show: true, lineStyle: { color: '#edf0f5' } }
                },
                series: this.chartSeries
            }, true)
            this._chart.resize()
        }
    }
}
</script>

<style scoped>
.ratio-plot-layout {
    display: grid;
    grid-template-columns: minmax(190px, 230px) minmax(0, 1fr);
    gap: 10px;
    margin: 10px 0;
}
.tap-summary,
.plot-panel {
    border: 1px solid #dfe4ec;
    border-radius: 4px;
    background: #fff;
    overflow: hidden;
}
.panel-title,
.plot-toolbar {
    display: flex;
    align-items: center;
    min-height: 38px;
    padding: 0 10px;
    border-bottom: 1px solid #dfe4ec;
    background: #f5f7fa;
}
.panel-title { gap: 7px; color: #303133; font-size: 12px; font-weight: 600; }
.panel-title i { color: #606266; }
.tap-details { margin: 0; padding: 4px 10px; }
.tap-details > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 34px;
    border-bottom: 1px solid #ebeef5;
    font-size: 12px;
}
.tap-details > div:last-child { border-bottom: 0; }
.tap-details dt { color: #606266; }
.tap-details dd { margin: 0; color: #303133; font-weight: 600; text-align: right; }
.plot-toolbar { justify-content: flex-start; }
.plot-body { position: relative; min-height: 310px; }
.ratio-chart { width: 100%; height: 310px; }
.plot-empty {
    position: absolute;
    inset: 50px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 12px;
    pointer-events: none;
}
@media (max-width: 760px) {
    .ratio-plot-layout { grid-template-columns: minmax(0, 1fr); }
    .ratio-chart { height: 290px; }
}
</style>
