<template>
    <div class="timing-trace-view">
        <div class="trace-summary">
            <div class="trace-selector">
                <span>Recording</span>
                <el-select v-model="activeMeasurement" size="small">
                    <el-option v-for="option in measurementOptions" :key="option.value"
                        :label="option.label" :value="option.value" />
                </el-select>
            </div>
            <span>{{ activeTraces.length }} channel(s)</span>
        </div>

        <div ref="chart" class="timing-trace-chart"></div>

        <el-table :data="activeTraces" border stripe max-height="260" empty-text="No timing trace">
            <el-table-column prop="name" label="Channel" min-width="190" />
            <el-table-column prop="signal_type" label="Signal" width="120" />
            <el-table-column prop="phase" label="Phase" width="82" align="center">
                <template slot-scope="scope">{{ scope.row.phase || '-' }}</template>
            </el-table-column>
            <el-table-column prop="source_type" label="Source" min-width="160" />
            <el-table-column prop="source_serial" label="Serial number" min-width="140" />
            <el-table-column prop="unit" label="Unit" width="78" align="center">
                <template slot-scope="scope">{{ scope.row.unit || '-' }}</template>
            </el-table-column>
            <el-table-column label="Points" width="100" align="right">
                <template slot-scope="scope">{{ (scope.row.points || []).length.toLocaleString() }}</template>
            </el-table-column>
        </el-table>

        <div class="trace-points-header">
            <span class="trace-points-title">Measured points</span>
            <el-select v-model="activeTraceId" size="small" placeholder="Select channel">
                <el-option v-for="trace in activeTraces" :key="trace.mrid"
                    :label="trace.name || 'Channel'" :value="trace.mrid" />
            </el-select>
        </div>

        <el-table :data="pagedPoints" border stripe height="min(36vh, 360px)" empty-text="No measured points">
            <el-table-column type="index" label="No." width="72" align="center" :index="pointNumber" />
            <el-table-column prop="time" label="Time (s)" min-width="220">
                <template slot-scope="scope">{{ displayValue(scope.row.time) }}</template>
            </el-table-column>
            <el-table-column prop="value" :label="pointValueLabel" min-width="260">
                <template slot-scope="scope">{{ displayValue(scope.row.value) }}</template>
            </el-table-column>
        </el-table>

        <div class="trace-pagination">
            <el-pagination background layout="total, sizes, prev, pager, next"
                :current-page.sync="currentPage" :page-size.sync="pageSize"
                :page-sizes="[100, 200, 500]" :total="activePoints.length"
                @size-change="handlePageSizeChange" />
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts'

const PHASE_COLORS = { A: '#e53935', B: '#d4a900', C: '#1558d6' }
const EXTRA_COLORS = ['#16a085', '#8e44ad', '#e67e22', '#34495e', '#00a8a8', '#7f8c8d']

export default {
    name: 'TimingTraceChart',
    props: {
        traces: { type: Array, default: () => [] }
    },
    data() {
        return {
            activeMeasurement: 0,
            activeTraceId: '',
            currentPage: 1,
            pageSize: 200
        }
    },
    computed: {
        measurementOptions() {
            const values = [...new Set(this.traces.map(trace => Number(trace.measurement_index) || 0))]
            return values.sort((a, b) => a - b).map(value => ({
                value,
                label: `Recording ${value + 1}`
            }))
        },
        activeTraces() {
            return this.traces.filter(trace => (Number(trace.measurement_index) || 0) === this.activeMeasurement)
        },
        activeTrace() {
            return this.activeTraces.find(trace => trace.mrid === this.activeTraceId) || null
        },
        activePoints() {
            return this.activeTrace && Array.isArray(this.activeTrace.points) ? this.activeTrace.points : []
        },
        pagedPoints() {
            const start = (this.currentPage - 1) * this.pageSize
            return this.activePoints.slice(start, start + this.pageSize)
        },
        pointValueLabel() {
            const unit = this.activeTrace && this.activeTrace.unit
            return unit ? `Value (${unit})` : 'Value'
        }
    },
    watch: {
        measurementOptions: {
            immediate: true,
            handler(options) {
                if (!options.some(option => option.value === this.activeMeasurement)) {
                    this.activeMeasurement = options.length ? options[0].value : 0
                }
            }
        },
        activeTraces() {
            if (!this.activeTraces.some(trace => trace.mrid === this.activeTraceId)) {
                this.activeTraceId = this.activeTraces.length ? this.activeTraces[0].mrid : ''
            }
            this.currentPage = 1
            this.$nextTick(this.renderChart)
        },
        activeTraceId() {
            this.currentPage = 1
        }
    },
    mounted() {
        this.activeTraceId = this.activeTraces.length ? this.activeTraces[0].mrid : ''
        window.addEventListener('resize', this.resizeChart)
        this.$nextTick(this.renderChart)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeChart)
        if (this._chart) this._chart.dispose()
        this._chart = null
    },
    methods: {
        resizeChart() {
            if (this._chart) this._chart.resize()
        },
        traceColor(trace, index) {
            return PHASE_COLORS[trace.phase] || EXTRA_COLORS[index % EXTRA_COLORS.length]
        },
        displayValue(value) {
            return value === null || value === undefined || value === '' ? '-' : String(value)
        },
        pointNumber(index) {
            return (this.currentPage - 1) * this.pageSize + index + 1
        },
        handlePageSizeChange() {
            this.currentPage = 1
        },
        renderChart() {
            const element = this.$refs.chart
            if (!element) return
            if (!this._chart) this._chart = echarts.init(element)

            const units = [...new Set(this.activeTraces.map(trace => trace.unit || 'Digital'))]
            const yAxis = units.map((unit, index) => ({
                type: 'value',
                name: unit,
                position: index % 2 === 0 ? 'left' : 'right',
                offset: index < 2 ? 0 : 54 * Math.floor(index / 2),
                nameLocation: 'middle',
                nameGap: 42,
                scale: true,
                splitLine: { show: index === 0, lineStyle: { color: '#edf0f5' } }
            }))
            const series = this.activeTraces.map((trace, index) => ({
                name: trace.name || `Channel ${index + 1}`,
                type: 'line',
                yAxisIndex: Math.max(0, units.indexOf(trace.unit || 'Digital')),
                data: (trace.points || []).reduce((points, point) => {
                    const time = Number(point.time)
                    const value = Number(point.value)
                    if (Number.isFinite(time) && Number.isFinite(value)) points.push([time, value])
                    return points
                }, []),
                showSymbol: false,
                connectNulls: true,
                smooth: false,
                sampling: 'lttb',
                lineStyle: { width: 1.4, color: this.traceColor(trace, index) },
                itemStyle: { color: this.traceColor(trace, index) }
            }))

            this._chart.setOption({
                animation: false,
                title: {
                    text: `O Timing - Recording ${this.activeMeasurement + 1}`,
                    left: 'center',
                    top: 4,
                    textStyle: { color: '#303133', fontSize: 13, fontWeight: 500 }
                },
                legend: { type: 'scroll', top: 30, left: 24, right: 130 },
                tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
                toolbox: {
                    right: 12,
                    top: 2,
                    feature: {
                        dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset zoom' } },
                        restore: { title: 'Restore' },
                        saveAsImage: { title: 'Save image', name: 'o-timing-traces' }
                    }
                },
                grid: { left: units.length > 2 ? 124 : 72, right: units.length > 2 ? 124 : 76, top: 82, bottom: 66 },
                dataZoom: [
                    { type: 'inside', xAxisIndex: 0, filterMode: 'none' },
                    { type: 'slider', xAxisIndex: 0, bottom: 10, height: 20, filterMode: 'none' }
                ],
                xAxis: {
                    type: 'value', name: 'Time (s)', nameLocation: 'middle', nameGap: 40,
                    splitLine: { show: true, lineStyle: { color: '#edf0f5' } }
                },
                yAxis: yAxis.length ? yAxis : [{ type: 'value' }],
                series
            }, true)
            this._chart.resize()
        }
    }
}
</script>

<style lang="scss" scoped>
.timing-trace-view { width: 100%; }
.trace-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 8px;
    color: #606266;
}
.trace-selector { display: flex; align-items: center; gap: 10px; }
.trace-selector .el-select { width: 220px; }
.timing-trace-chart { width: 100%; height: min(52vh, 520px); min-height: 360px; }
.trace-points-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin: 18px 0 8px;
}
.trace-points-title { color: #303133; font-weight: 600; }
.trace-points-header .el-select { width: min(420px, 55%); }
.trace-pagination { display: flex; justify-content: flex-end; margin-top: 12px; }

@media (max-width: 760px) {
    .trace-summary { align-items: flex-start; flex-direction: column; }
    .trace-selector { width: 100%; }
    .trace-selector .el-select { flex: 1; min-width: 0; }
    .timing-trace-chart { min-height: 320px; }
    .trace-points-header { align-items: flex-start; flex-direction: column; }
    .trace-points-header .el-select { width: 100%; }
    .trace-pagination { overflow-x: auto; justify-content: flex-start; }
}
</style>
