<template>
    <section class="df-cap-plots">
        <div class="plots-heading">
            <i class="fa-solid fa-chart-column"></i>
            <span>Plots</span>
            <span v-if="showComparison" class="comparison-note">Comparison result shown for matching measurement names</span>
        </div>

        <div class="plot-grid">
            <article class="plot-panel">
                <div class="plot-title">DF at 50 Hz</div>
                <div ref="fixedDf" class="plot-chart"></div>
                <div v-if="!hasFixedDf" class="plot-empty">No DF values</div>
            </article>
            <article class="plot-panel">
                <div class="plot-title">Cap. at 50 Hz</div>
                <div ref="fixedCap" class="plot-chart"></div>
                <div v-if="!hasFixedCap" class="plot-empty">No capacitance values</div>
            </article>
        </div>

        <div v-if="hasFrequencySweep" class="plot-grid sweep-grid">
            <article class="plot-panel">
                <div class="plot-title">DF frequency sweep</div>
                <div ref="frequencyDf" class="plot-chart"></div>
            </article>
            <article class="plot-panel">
                <div class="plot-title">Cap. frequency sweep</div>
                <div ref="frequencyCap" class="plot-chart"></div>
            </article>
        </div>

        <div v-if="hasVoltageSweep" class="plot-grid sweep-grid">
            <article class="plot-panel">
                <div class="plot-title">DF voltage sweep</div>
                <div ref="voltageDf" class="plot-chart"></div>
            </article>
            <article class="plot-panel">
                <div class="plot-title">Cap. voltage sweep</div>
                <div ref="voltageCap" class="plot-chart"></div>
            </article>
        </div>
    </section>
</template>

<script>
import * as echarts from 'echarts'

const COLORS = ['#e53935', '#c58a00', '#1558d6', '#17823b', '#7b4ab5', '#00838f', '#d85b00', '#5f6b7a']
const LEGACY_SWEEP = /^(.*?)\s*@\s*([+-]?\d+(?:\.\d+)?)\s*(Hz|kV)\s*$/i

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

const normalizeName = value => String(value || '').trim().replace(/\s+/g, ' ').toLowerCase()

const snapshotRowToPlain = row => {
    const plain = {}
    Object.values((row && row.cells) || {}).forEach(cell => {
        if (cell && cell.aliasName) plain[cell.aliasName] = cell.value
    })
    return plain
}

const classifyRows = tables => {
    const result = { fixed: [], frequency: [], voltage: [] }
    Object.keys(tables || {}).forEach(title => {
        const explicitKind = title === 'table2' ? 'frequency' : title === 'table3' ? 'voltage' : 'fixed'
        ;(tables[title] || []).forEach(sourceRow => {
            const row = sourceRow && sourceRow.cells ? snapshotRowToPlain(sourceRow) : sourceRow
            const rawName = String(valueOf(row, 'measurement') || '').trim()
            const legacy = rawName.match(LEGACY_SWEEP)
            const kind = legacy
                ? (legacy[3].toLowerCase() === 'hz' ? 'frequency' : 'voltage')
                : explicitKind
            const axisValue = legacy
                ? numberOf(legacy[2])
                : numberOf(valueOf(row, kind === 'frequency' ? 'frequency' : 'test_voltage'))
            result[kind].push({
                name: legacy ? legacy[1].trim() : rawName,
                key: normalizeName(legacy ? legacy[1] : rawName),
                axisValue,
                df: numberOf(valueOf(row, 'df_meas')),
                cap: numberOf(valueOf(row, 'c_meas')),
                dfRef: numberOf(valueOf(row, 'df_ref')),
                capRef: numberOf(valueOf(row, 'c_ref'))
            })
        })
    })
    return result
}

const snapshotTables = snapshot => {
    const tables = {}
    ;((snapshot && snapshot.tables) || []).forEach(table => {
        tables[table.title || 'table1'] = table.rows || []
    })
    return tables
}

const firstValuesByName = (rows, metric) => {
    const map = new Map()
    rows.forEach(row => {
        if (!row.key || row[metric] === null || map.has(row.key)) return
        map.set(row.key, row[metric])
    })
    return map
}

const uniqueFixedNames = rows => {
    const seen = new Set()
    return rows.filter(row => {
        if (!row.key || seen.has(row.key)) return false
        seen.add(row.key)
        return true
    })
}

const groupedSweep = (rows, metric) => {
    const groups = new Map()
    rows.forEach(row => {
        if (!row.key || row.axisValue === null || row[metric] === null) return
        if (!groups.has(row.key)) groups.set(row.key, { key: row.key, name: row.name, points: [] })
        groups.get(row.key).points.push([row.axisValue, row[metric]])
    })
    groups.forEach(group => group.points.sort((left, right) => left[0] - right[0]))
    return groups
}

export default {
    name: 'WindingDfCapCharts',
    props: {
        table: { type: Object, default: () => ({}) },
        compareOpen: { type: Boolean, default: false },
        comparisonSnapshot: { type: Object, default: null },
        showReferenceValues: { type: Boolean, default: false }
    },
    created() {
        this._charts = Object.create(null)
    },
    computed: {
        currentRows() { return classifyRows(this.table) },
        referenceRows() { return classifyRows(snapshotTables(this.comparisonSnapshot)) },
        showComparison() { return this.compareOpen && !!this.comparisonSnapshot },
        fixedNames() { return uniqueFixedNames(this.currentRows.fixed) },
        hasFixedDf() {
            return this.currentRows.fixed.some(row => row.df !== null || (this.showReferenceValues && row.dfRef !== null))
        },
        hasFixedCap() {
            return this.currentRows.fixed.some(row => row.cap !== null || (this.showReferenceValues && row.capRef !== null))
        },
        hasFrequencySweep() {
            return this.currentRows.frequency.some(row => row.df !== null || row.cap !== null)
        },
        hasVoltageSweep() {
            return this.currentRows.voltage.some(row => row.df !== null || row.cap !== null)
        },
        renderState() {
            return {
                table: this.table,
                comparisonSnapshot: this.comparisonSnapshot,
                compareOpen: this.compareOpen
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
    },
    methods: {
        fixedSeries(metric) {
            const currentMap = firstValuesByName(this.currentRows.fixed, metric)
            const referenceMap = firstValuesByName(this.referenceRows.fixed, metric)
            const currentKeys = new Set(this.fixedNames.map(row => row.key))
            const series = [{
                name: 'Measured values',
                type: 'bar',
                barMaxWidth: 38,
                data: this.fixedNames.map(row => currentMap.has(row.key) ? currentMap.get(row.key) : null),
                itemStyle: { color: '#1558d6' }
            }]
            const referenceMetric = metric === 'df' ? 'dfRef' : 'capRef'
            const nameplateMap = firstValuesByName(this.currentRows.fixed, referenceMetric)
            if (this.showReferenceValues && nameplateMap.size > 0) {
                series.push({
                    name: 'Reference values',
                    type: 'bar',
                    barMaxWidth: 38,
                    data: this.fixedNames.map(row => nameplateMap.has(row.key) ? nameplateMap.get(row.key) : null),
                    itemStyle: { color: '#d71945' }
                })
            }
            const hasMatchingReference = this.showComparison && Array.from(referenceMap.keys())
                .some(key => currentKeys.has(key))
            if (hasMatchingReference) {
                series.push({
                    name: 'Comparison values',
                    type: 'bar',
                    barMaxWidth: 38,
                    data: this.fixedNames.map(row => referenceMap.has(row.key) ? referenceMap.get(row.key) : null),
                    itemStyle: { color: '#17823b' }
                })
            }
            return series
        },
        sweepSeries(kind, metric) {
            const current = groupedSweep(this.currentRows[kind], metric)
            const reference = groupedSweep(this.referenceRows[kind], metric)
            const series = []
            Array.from(current.values()).forEach((group, index) => {
                const color = COLORS[index % COLORS.length]
                series.push({
                    name: group.name,
                    type: 'line',
                    showSymbol: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    data: group.points,
                    lineStyle: { width: 2, color },
                    itemStyle: { color }
                })
                const comparison = reference.get(group.key)
                if (this.showComparison && comparison) {
                    series.push({
                        name: `${group.name} (comparison)`,
                        type: 'line',
                        showSymbol: true,
                        symbol: 'cross',
                        symbolSize: 8,
                        data: comparison.points,
                        lineStyle: { width: 2, type: 'dashed', color },
                        itemStyle: { color }
                    })
                }
            })
            return series
        },
        baseOption(unit, imageName) {
            return {
                animation: false,
                tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
                legend: { type: 'scroll', left: 12, right: 82, bottom: 5 },
                toolbox: {
                    top: 0,
                    right: 5,
                    feature: {
                        dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset zoom' } },
                        restore: { title: 'Restore' },
                        saveAsImage: { title: 'Save image', name: imageName }
                    }
                },
                grid: { left: 62, right: 24, top: 38, bottom: 64 },
                yAxis: {
                    type: 'value',
                    name: unit,
                    scale: true,
                    splitLine: { lineStyle: { color: '#e6eaf0' } }
                }
            }
        },
        renderFixed(refName, metric, unit) {
            const element = this.$refs[refName]
            if (!element) return
            const chart = this.chartFor(refName, element)
            chart.setOption(Object.assign(this.baseOption(unit, `winding-${metric}-50hz`), {
                xAxis: {
                    type: 'category',
                    data: this.fixedNames.map(row => row.name),
                    axisLabel: { interval: 0, hideOverlap: true }
                },
                series: this.fixedSeries(metric)
            }), true)
        },
        renderSweep(refName, kind, metric, unit, axisUnit) {
            const element = this.$refs[refName]
            if (!element) return
            const chart = this.chartFor(refName, element)
            chart.setOption(Object.assign(this.baseOption(unit, `winding-${metric}-${kind}-sweep`), {
                xAxis: {
                    type: 'value',
                    name: axisUnit,
                    nameLocation: 'middle',
                    nameGap: 28,
                    scale: true,
                    splitLine: { show: true, lineStyle: { color: '#eef1f5' } }
                },
                series: this.sweepSeries(kind, metric)
            }), true)
        },
        chartFor(name, element) {
            if (!this._charts[name]) this._charts[name] = echarts.init(element)
            return this._charts[name]
        },
        disposeMissingCharts() {
            const visible = new Set(['fixedDf', 'fixedCap'])
            if (this.hasFrequencySweep) visible.add('frequencyDf').add('frequencyCap')
            if (this.hasVoltageSweep) visible.add('voltageDf').add('voltageCap')
            Object.keys(this._charts).forEach(name => {
                if (visible.has(name)) return
                this._charts[name].dispose()
                delete this._charts[name]
            })
        },
        renderAll() {
            this.disposeMissingCharts()
            this.renderFixed('fixedDf', 'df', '%')
            this.renderFixed('fixedCap', 'cap', 'pF')
            if (this.hasFrequencySweep) {
                this.renderSweep('frequencyDf', 'frequency', 'df', '%', 'Hz')
                this.renderSweep('frequencyCap', 'frequency', 'cap', 'pF', 'Hz')
            }
            if (this.hasVoltageSweep) {
                this.renderSweep('voltageDf', 'voltage', 'df', '%', 'kV')
                this.renderSweep('voltageCap', 'voltage', 'cap', 'pF', 'kV')
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
.df-cap-plots {
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
.comparison-note {
    margin-left: auto;
    color: #606266;
    font-weight: 400;
}
.plot-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 10px;
}
.sweep-grid { border-top: 1px solid #ebeef5; }
.plot-panel {
    position: relative;
    min-width: 0;
    border: 1px solid #e3e7ed;
    border-radius: 4px;
    overflow: hidden;
}
.plot-title {
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #ebeef5;
    color: #303133;
    font-size: 12px;
    font-weight: 600;
}
.plot-chart { width: 100%; height: 300px; }
.plot-empty {
    position: absolute;
    inset: 75px 0 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 12px;
    pointer-events: none;
}
@media (max-width: 900px) {
    .plot-grid { grid-template-columns: minmax(0, 1fr); }
    .comparison-note { display: none; }
    .plot-chart { height: 280px; }
}
</style>
