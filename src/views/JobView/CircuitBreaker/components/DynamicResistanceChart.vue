<template>
    <div class="dynamic-resistance-view">
        <div class="curve-header">
            <div class="curve-selector">
                <span>Measurement</span>
                <el-select v-model="activeKey" size="small" placeholder="Select measurement">
                    <el-option v-for="group in groups" :key="group.key"
                        :label="group.label" :value="group.key" />
                </el-select>
            </div>
            <span v-if="activeGroup">{{ derivedPoints.length.toLocaleString() }} point(s)</span>
        </div>

        <div ref="chart" class="dynamic-resistance-chart"></div>

        <div class="point-title">Measured and calculated points</div>
        <el-table :data="pagedPoints" border stripe height="min(38vh, 380px)" empty-text="No dynamic resistance data">
            <el-table-column type="index" label="No." width="72" align="center" :index="pointNumber" />
            <el-table-column label="Time (s)" min-width="180">
                <template slot-scope="scope">{{ formatValue(scope.row.time, 7) }}</template>
            </el-table-column>
            <el-table-column label="Current (A)" min-width="180">
                <template slot-scope="scope">{{ formatValue(scope.row.current, 7) }}</template>
            </el-table-column>
            <el-table-column label="Voltage (V)" min-width="180">
                <template slot-scope="scope">{{ formatValue(scope.row.voltage, 7) }}</template>
            </el-table-column>
            <el-table-column label="Dynamic resistance (µΩ)" min-width="220">
                <template slot-scope="scope">{{ formatValue(scope.row.resistance, 4) }}</template>
            </el-table-column>
        </el-table>

        <div class="curve-pagination">
            <el-pagination background layout="total, sizes, prev, pager, next"
                :current-page.sync="currentPage" :page-size.sync="pageSize"
                :page-sizes="[100, 200, 500]" :total="derivedPoints.length"
                @size-change="currentPage = 1" />
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts'

const PHASE_COLORS = { A: '#e53935', B: '#d4a900', C: '#1558d6' }

const normalizedSignal = trace => String(trace && (trace.signal_type || trace.signalType) || '').toLowerCase()
const traceValue = (trace, snake, camel) => trace && (trace[snake] !== undefined ? trace[snake] : trace[camel])

export default {
    name: 'DynamicResistanceChart',
    props: {
        traces: { type: Array, default: () => [] },
        operation: { type: String, default: 'O' }
    },
    data() {
        return {
            activeKey: '',
            currentPage: 1,
            pageSize: 100
        }
    },
    computed: {
        groups() {
            const grouped = {}
            this.traces.forEach(trace => {
                const signal = normalizedSignal(trace)
                if (signal !== 'current' && signal !== 'voltage') return
                const sourceType = String(traceValue(trace, 'source_type', 'sourceType') || '').toLowerCase()
                if (sourceType && sourceType.indexOf('cbmc2') === -1) return
                const measurement = Number(traceValue(trace, 'measurement_index', 'measurementIndex')) || 0
                const phase = String(trace.phase || '')
                const serial = String(traceValue(trace, 'source_serial', 'sourceSerial') || '')
                const channel = String(traceValue(trace, 'source_channel_index', 'sourceChannelIndex') || '')
                const key = [measurement, phase, serial, channel].join('|')
                if (!grouped[key]) {
                    grouped[key] = { key, measurement, phase, serial, channel, current: null, voltage: null }
                }
                grouped[key][signal] = trace
            })
            return Object.values(grouped)
                .filter(group => group.current && group.voltage)
                .sort((left, right) => {
                    if (left.measurement !== right.measurement) return left.measurement - right.measurement
                    return String(left.phase).localeCompare(String(right.phase))
                })
                .map((group, index) => ({
                    ...group,
                    label: [
                        group.phase ? `Phase ${group.phase}` : `Measurement ${index + 1}`,
                        group.channel ? `Channel ${group.channel}` : ''
                    ].filter(Boolean).join(' - ')
                }))
        },
        activeGroup() {
            return this.groups.find(group => group.key === this.activeKey) || null
        },
        derivedPoints() {
            if (!this.activeGroup) return []
            const currentPoints = this.activeGroup.current.points || []
            const voltagePoints = this.activeGroup.voltage.points || []
            const count = Math.min(currentPoints.length, voltagePoints.length)
            const currents = currentPoints.slice(0, count).map(point => Math.abs(Number(point.value)))
            const maximumCurrent = currents.reduce((maximum, value) => Number.isFinite(value) ? Math.max(maximum, value) : maximum, 0)
            const threshold = maximumCurrent * 0.1
            const points = new Array(count)

            for (let index = 0; index < count; index += 1) {
                const current = Number(currentPoints[index].value)
                const voltage = Number(voltagePoints[index].value)
                const time = Number(currentPoints[index].time)
                const resistance = Number.isFinite(current) && Number.isFinite(voltage) && Math.abs(current) >= threshold && threshold > 0
                    ? Math.abs(voltage / current) * 1000000
                    : null
                points[index] = { time, current, voltage, resistance }
            }
            return points
        },
        pagedPoints() {
            const start = (this.currentPage - 1) * this.pageSize
            return this.derivedPoints.slice(start, start + this.pageSize)
        }
    },
    watch: {
        groups: {
            immediate: true,
            handler(groups) {
                if (!groups.some(group => group.key === this.activeKey)) {
                    this.activeKey = groups.length ? groups[0].key : ''
                }
            }
        },
        activeKey() {
            this.currentPage = 1
            this.$nextTick(this.renderChart)
        },
        derivedPoints() {
            this.$nextTick(this.renderChart)
        }
    },
    mounted() {
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
        pointNumber(index) {
            return (this.currentPage - 1) * this.pageSize + index + 1
        },
        formatValue(value, digits) {
            if (value === null || value === undefined || !Number.isFinite(Number(value))) return '-'
            return Number(value).toFixed(digits).replace(/\.?0+$/, '')
        },
        renderChart() {
            const element = this.$refs.chart
            if (!element) return
            if (!this._chart) this._chart = echarts.init(element)

            const color = PHASE_COLORS[(this.activeGroup && this.activeGroup.phase) || ''] || '#012596'
            const validResistance = this.derivedPoints
                .filter(point => point.resistance !== null)
                .map(point => [point.time, point.resistance])

            this._chart.setOption({
                animation: false,
                title: {
                    text: `${this.operation} Dynamic Contact Resistance`,
                    left: 'center', top: 4,
                    textStyle: { color: '#303133', fontSize: 13, fontWeight: 500 }
                },
                tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
                legend: { top: 30, data: ['Current', 'Voltage', 'Dynamic resistance'] },
                toolbox: {
                    right: 12, top: 2,
                    feature: {
                        dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset zoom' } },
                        restore: { title: 'Restore' },
                        saveAsImage: { title: 'Save image', name: `${this.operation.toLowerCase()}-dynamic-contact-resistance` }
                    }
                },
                grid: { left: 74, right: 126, top: 78, bottom: 66 },
                dataZoom: [
                    { type: 'inside', xAxisIndex: 0, filterMode: 'none' },
                    { type: 'slider', xAxisIndex: 0, bottom: 10, height: 20, filterMode: 'none' }
                ],
                xAxis: {
                    type: 'value', name: 'Time (s)', nameLocation: 'middle', nameGap: 40,
                    splitLine: { show: true, lineStyle: { color: '#edf0f5' } }
                },
                yAxis: [
                    { type: 'value', name: 'A', position: 'left', scale: true },
                    { type: 'value', name: 'V', position: 'right', scale: true },
                    { type: 'value', name: 'µΩ', position: 'right', offset: 58, scale: true }
                ],
                series: [
                    {
                        name: 'Current', type: 'line', yAxisIndex: 0, showSymbol: false,
                        connectNulls: true, sampling: 'lttb', lineStyle: { width: 1.3, color: color },
                        data: this.derivedPoints.map(point => [point.time, point.current])
                    },
                    {
                        name: 'Voltage', type: 'line', yAxisIndex: 1, showSymbol: false,
                        connectNulls: true, sampling: 'lttb', lineStyle: { width: 1.2, color: '#7f8c8d' },
                        data: this.derivedPoints.map(point => [point.time, point.voltage])
                    },
                    {
                        name: 'Dynamic resistance', type: 'line', yAxisIndex: 2, showSymbol: false,
                        connectNulls: true, sampling: 'lttb', lineStyle: { width: 2, color: '#16a085' },
                        data: validResistance
                    }
                ]
            }, true)
            this._chart.resize()
        }
    }
}
</script>

<style lang="scss" scoped>
.dynamic-resistance-view { width: 100%; }
.curve-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 8px; color: #606266; }
.curve-selector { display: flex; align-items: center; gap: 10px; }
.curve-selector .el-select { width: 260px; }
.dynamic-resistance-chart { width: 100%; height: min(52vh, 520px); min-height: 360px; }
.point-title { margin: 18px 0 8px; color: #303133; font-weight: 600; }
.curve-pagination { display: flex; justify-content: flex-end; margin-top: 12px; }
@media (max-width: 760px) {
    .curve-header { align-items: flex-start; flex-direction: column; }
    .curve-selector { width: 100%; }
    .curve-selector .el-select { flex: 1; min-width: 0; }
    .dynamic-resistance-chart { min-height: 320px; }
    .curve-pagination { overflow-x: auto; justify-content: flex-start; }
}
</style>
