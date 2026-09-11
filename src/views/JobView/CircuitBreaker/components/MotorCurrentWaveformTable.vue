<template>
    <div class="motor-current-waveform-table">
        <div class="waveform-summary">
            <div class="waveform-selector">
                <span class="waveform-label">Measurement</span>
                <el-select v-model="activeDatasetId" size="small" placeholder="Select measurement">
                    <el-option v-for="series in seriesOptions" :key="series.datasetId"
                        :label="series.label" :value="series.datasetId" />
                </el-select>
            </div>
            <span class="waveform-count">{{ activePoints.length.toLocaleString() }} points</span>
        </div>

        <div ref="waveformChart" class="waveform-chart"></div>

        <div class="waveform-table-title">Measured points</div>

        <el-table :data="pagedPoints" border stripe height="min(44vh, 420px)" empty-text="No time series data">
            <el-table-column type="index" label="No." width="72" align="center" :index="pointNumber" />
            <el-table-column prop="time" label="Time (s)" min-width="210">
                <template slot-scope="scope">{{ displayValue(scope.row.time) }}</template>
            </el-table-column>
            <el-table-column prop="current" label="Current (A)" min-width="260">
                <template slot-scope="scope">{{ displayValue(scope.row.current) }}</template>
            </el-table-column>
            <el-table-column prop="voltage" label="Voltage (V)" min-width="260">
                <template slot-scope="scope">{{ displayValue(scope.row.voltage) }}</template>
            </el-table-column>
        </el-table>

        <div class="waveform-pagination">
            <el-pagination background layout="total, sizes, prev, pager, next"
                :current-page.sync="currentPage" :page-size.sync="pageSize"
                :page-sizes="[100, 200, 500]" :total="activePoints.length"
                @size-change="handlePageSizeChange" />
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
    name: 'MotorCurrentWaveformTable',
    props: {
        rows: {
            type: Array,
            default: () => []
        },
        pointsByDataset: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            activeDatasetId: '',
            currentPage: 1,
            pageSize: 200
        }
    },
    mounted() {
        window.addEventListener('resize', this.resizeChart)
        this.$nextTick(this.renderChart)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeChart)
        if (this._chart) {
            this._chart.dispose()
            this._chart = null
        }
    },
    computed: {
        seriesOptions() {
            return this.rows.reduce((options, row, index) => {
                const datasetId = row && row.mrid
                const points = datasetId ? this.pointsByDataset[datasetId] : null
                if (Array.isArray(points) && points.length > 0) {
                    options.push({
                        datasetId,
                        label: this.measurementLabel(row, index)
                    })
                }
                return options
            }, [])
        },
        activePoints() {
            const points = this.pointsByDataset[this.activeDatasetId]
            return Array.isArray(points) ? points : []
        },
        pagedPoints() {
            const start = (this.currentPage - 1) * this.pageSize
            return this.activePoints.slice(start, start + this.pageSize)
        }
    },
    watch: {
        seriesOptions: {
            immediate: true,
            handler(options) {
                if (!options.some(option => option.datasetId === this.activeDatasetId)) {
                    this.activeDatasetId = options.length > 0 ? options[0].datasetId : ''
                }
            }
        },
        activeDatasetId() {
            this.currentPage = 1
            this.$nextTick(this.renderChart)
        }
    },
    methods: {
        measurementLabel(row, index) {
            const inrush = row && row.inrush_current && row.inrush_current.value
            return inrush !== '' && inrush !== null && inrush !== undefined
                ? `Measurement ${index + 1} - Inrush ${inrush} A`
                : `Measurement ${index + 1}`
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
            const element = this.$refs.waveformChart
            if (!element) return

            if (!this._chart) this._chart = echarts.init(element)

            const currentData = []
            const voltageData = []
            this.activePoints.forEach(point => {
                const time = Number(point.time)
                const current = Number(point.current)
                const voltage = Number(point.voltage)
                if (Number.isFinite(time) && Number.isFinite(current)) currentData.push([time, current])
                if (Number.isFinite(time) && Number.isFinite(voltage)) voltageData.push([time, voltage])
            })

            const formatValue = value => {
                const number = Number(value)
                if (!Number.isFinite(number)) return '-'
                if (number !== 0 && Math.abs(number) < 0.001) return number.toExponential(4)
                return String(Number(number.toPrecision(8)))
            }

            this._chart.setOption({
                animation: false,
                color: ['#1558d6', '#e67e22'],
                title: {
                    text: this.activeSeriesLabel(),
                    left: 'center',
                    top: 4,
                    textStyle: { color: '#303133', fontSize: 13, fontWeight: 500 }
                },
                legend: {
                    top: 32,
                    data: ['Current', 'Voltage']
                },
                grid: { left: 72, right: 76, top: 72, bottom: 68 },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'cross' },
                    formatter: params => {
                        if (!params || params.length === 0) return ''
                        const time = params[0] && params[0].value ? params[0].value[0] : ''
                        const lines = [`Time: ${formatValue(time)} s`]
                        params.forEach(param => {
                            const unit = param.seriesName === 'Current' ? 'A' : 'V'
                            lines.push(`${param.marker}${param.seriesName}: ${formatValue(param.value[1])} ${unit}`)
                        })
                        return lines.join('<br/>')
                    }
                },
                toolbox: {
                    right: 12,
                    top: 3,
                    feature: {
                        dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset zoom' } },
                        restore: { title: 'Restore' },
                        saveAsImage: { title: 'Save image', name: 'motor-current-time-series' }
                    }
                },
                dataZoom: [
                    { type: 'inside', xAxisIndex: 0, filterMode: 'none' },
                    { type: 'slider', xAxisIndex: 0, bottom: 12, height: 20, filterMode: 'none' }
                ],
                xAxis: {
                    type: 'value',
                    name: 'Time (s)',
                    nameLocation: 'middle',
                    nameGap: 42,
                    splitLine: { show: true, lineStyle: { color: '#eef1f5' } }
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Current (A)',
                        nameLocation: 'middle',
                        nameGap: 52,
                        splitLine: { show: true, lineStyle: { color: '#eef1f5' } }
                    },
                    {
                        type: 'value',
                        name: 'Voltage (V)',
                        nameLocation: 'middle',
                        nameGap: 54,
                        splitLine: { show: false }
                    }
                ],
                series: [
                    {
                        name: 'Current',
                        type: 'line',
                        yAxisIndex: 0,
                        data: currentData,
                        showSymbol: false,
                        connectNulls: true,
                        smooth: false,
                        sampling: 'lttb',
                        lineStyle: { width: 1.6 }
                    },
                    {
                        name: 'Voltage',
                        type: 'line',
                        yAxisIndex: 1,
                        data: voltageData,
                        showSymbol: false,
                        connectNulls: true,
                        smooth: false,
                        sampling: 'lttb',
                        lineStyle: { width: 1.4 }
                    }
                ]
            }, true)
            this._chart.resize()
        },
        resizeChart() {
            if (this._chart) this._chart.resize()
        },
        activeSeriesLabel() {
            const series = this.seriesOptions.find(option => option.datasetId === this.activeDatasetId)
            return series ? `${series.label} - Motor current` : 'Motor current'
        }
    }
}
</script>

<style lang="scss" scoped>
.motor-current-waveform-table {
    width: 100%;
}

.waveform-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
}

.waveform-selector {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;

    .el-select {
        width: min(360px, 54vw);
    }
}

.waveform-label {
    color: #303133;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
}

.waveform-count {
    color: #909399;
    font-size: 12px;
    white-space: nowrap;
}

.waveform-chart {
    width: 100%;
    height: 360px;
    margin-bottom: 16px;
    border: 1px solid #e4e7ed;
}

.waveform-table-title {
    margin: 0 0 10px;
    color: #303133;
    font-size: 13px;
    font-weight: 600;
}

.waveform-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 14px;
    overflow-x: auto;
    padding-bottom: 2px;
}

@media (max-width: 640px) {
    .waveform-summary {
        align-items: stretch;
        flex-direction: column;
        gap: 8px;
    }

    .waveform-chart {
        height: 300px;
    }

    .waveform-selector {
        align-items: stretch;
        flex-direction: column;

        .el-select {
            width: 100%;
        }
    }
}
</style>

<style lang="scss">
.motor-current-waveform-dialog {
    .el-dialog {
        max-width: calc(100vw - 24px);
        border-radius: 6px;
        overflow: hidden;
    }

    .el-dialog__header {
        padding: 12px 16px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;
    }

    .el-dialog__title {
        color: #303133;
        font-size: 14px;
        font-weight: 600;
    }

    .el-dialog__body {
        padding: 16px;
        max-height: calc(92vh - 72px);
        overflow-y: auto;
    }

    .el-table {
        font-size: 12px;
    }

    .el-table th {
        background: #f5f7fa;
        color: #606266;
        font-weight: 600;
    }
}
</style>
