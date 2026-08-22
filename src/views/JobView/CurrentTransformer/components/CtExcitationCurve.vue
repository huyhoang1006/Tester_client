<template>
    <div class="curve-panel">
        <div class="curve-head">
            <el-button size="mini" plain icon="el-icon-refresh" :loading="loading" @click="reload">
                Refresh
            </el-button>
            <el-button size="mini" plain icon="el-icon-picture-outline" :disabled="series.length === 0"
                       @click="saveImage">
                Save images
            </el-button>
        </div>

        <div v-if="loading" class="curve-empty">Loading curve data...</div>

        <!--
          Không có đường cong là chuyện BÌNH THƯỜNG: dòng nhập tay, hoặc tổ hợp tap chưa
          đo. Nói rõ vì sao trống thay vì để khung trắng — khung trắng khiến người dùng
          tưởng hỏng.
        -->
        <div v-else-if="series.length === 0" class="curve-empty">
            No curve data. Excitation curves come from an imported PTM file; rows entered
            by hand have only the knee point.
        </div>

        <template v-else>
            <div class="core-reviews">
                <section v-for="group in seriesGroups" :key="group.key" class="core-review-block">
                    <div class="core-review-head">
                        <strong>{{ group.label }}</strong>
                        <div class="core-chart-actions">
                            <span>{{ group.series.length }} tap combination(s)</span>
                            <el-button type="text" size="mini" icon="el-icon-download"
                                title="Save this core as image" @click="saveCoreImage(group)"></el-button>
                        </div>
                    </div>
                    <div :ref="'chart-' + group.key" class="curve-chart"></div>

                    <!-- Knee và điểm đo nằm ngay dưới biểu đồ của đúng core đó. -->
                    <div v-if="group.kneeRows.length > 0" class="knee-wrap">
                        <div class="data-section-title">Knee points by standard</div>
                        <table class="points-table">
                            <thead>
                                <tr>
                                    <th class="left">Row</th>
                                    <th class="left">Standard</th>
                                    <th>I knee [A]</th>
                                    <th>V knee [V]</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(k, i) in group.kneeRows" :key="'k' + group.key + i"
                                    :class="{ 'knee-selected': k.isSelected }">
                                    <td class="left">{{ k.rowName }}</td>
                                    <td class="left">
                                        {{ k.method }}
                                        <span v-if="k.isSelected" class="knee-tag">in table</span>
                                    </td>
                                    <td>{{ k.currentText }}</td>
                                    <td>{{ k.voltageText }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="data-section-title">Measured points</div>
                    <div class="points-wrap">
                        <table class="points-table">
                            <thead>
                                <tr>
                                    <th rowspan="2">#</th>
                                    <th v-for="(s, i) in group.series" :key="'h' + group.key + i" colspan="2">{{ s.name }}</th>
                                </tr>
                                <tr>
                                    <template v-for="(s, i) in group.series">
                                        <th :key="'hi' + group.key + i">I [A]</th>
                                        <th :key="'hv' + group.key + i">V [V]</th>
                                    </template>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="r in maxPointsOf(group.series)" :key="'r' + group.key + r">
                                    <td class="idx">{{ r }}</td>
                                    <template v-for="(s, i) in group.series">
                                        <td :key="'i' + group.key + i + '_' + r">{{ cellAt(s, r - 1, 0) }}</td>
                                        <td :key="'v' + group.key + i + '_' + r">{{ cellAt(s, r - 1, 1) }}</td>
                                    </template>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </template>
    </div>
</template>

<script>
/* eslint-disable */
import * as echarts from 'echarts'

/**
 * ĐƯỜNG CONG TỪ HOÁ CT — đồ thị + bảng điểm đo.
 *
 * ─── VÌ SAO HAI TRỤC ĐỀU LOG ─────────────────────────────────────────────────
 *
 * Số liệu thật trong file .ptm mẫu: dòng từ 4.6e-05 A đến 0.76 A (4.22 bậc 10), áp từ
 * 1.03 V đến 937 V (2.96 bậc). Vẽ tuyến tính thì cả phần đầu đường cong bị ép sát trục
 * hoành thành một vạch, và lõi đo lường (knee ~49 V) gần như biến mất cạnh lõi bảo vệ
 * (knee ~673 V) — mất đúng hình chữ L cần nhìn.
 *
 * ECharts có sẵn `type: 'log'`, nên không phải tự tính Math.log10 như bản SVG trước.
 *
 * ─── ĐIỂM KNEE VẼ RIÊNG ──────────────────────────────────────────────────────
 *
 * Mỗi đường có một điểm knee — con số DUY NHẤT của đường cong này lên tới bảng chính.
 * Vẽ nó thành một series `scatter` riêng cùng màu, để nhìn ra ngay nó nằm ở đâu trên
 * khúc gãy, thay vì phải đối chiếu bằng mắt với bảng.
 *
 * ─── BA TIÊU CHUẨN, KHÔNG PHẢI MỘT ───────────────────────────────────────────
 *
 * OMICRON tính knee theo IEC, ANSI45 và ANSI30. Trên file mẫu ba cách ra 673 / 499 / 598 V
 * cho cùng một đường cong — chênh lệch đủ lớn để đổi kết luận. Bảng test chỉ có một cặp ô
 * nên chỉ giữ được tiêu chuẩn đang chọn; hai cái còn lại lưu ở `ct_excitation_knee_point`
 * và chỉ nhìn thấy ở đây.
 *
 * Tiêu chuẩn ĐANG CHỌN vẽ hình tròn đặc, hai cái còn lại vẽ hình thoi rỗng — nhìn là biết
 * con số nào đang nằm trên bảng, không phải đoán.
 *
 * Dòng nhập tay không có bản ghi knee nào; khi đó lùi về đúng cặp ô i_knee/v_knee của
 * bảng như trước.
 */
export default {
    name: 'CtExcitationCurve',
    props: {
        /** Các dòng của bảng test — cần `mrid` để tra, `name` để đặt nhãn. */
        rows: { type: Array, default: () => [] },
        /** Cấu hình CT dùng để xác định chính xác một tap thuộc core nào. */
        asset: { type: Object, default: () => ({}) },
    },
    data() {
        return {
            loading: false,
            /** { [datasetId]: [{ current, voltage }] } */
            pointsByRow: {},
            /** { [datasetId]: [{ method, current, voltage, is_selected }] } */
            kneeByRow: {},
        }
    },
    created() {
        // ECharts instances are large cyclic objects; keep them outside Vue 2 reactivity.
        this._charts = Object.create(null)
    },
    computed: {
        rowIds() {
            return this.rows.map(r => r && r.mrid).filter(Boolean)
        },

        /** Dòng nào thật sự có điểm đo → một đường trên đồ thị. */
        series() {
            const out = []
            for (const row of this.rows) {
                const id = row && row.mrid
                if (!id) continue
                const measuredPoints = (this.pointsByRow[id] || [])
                    .map(p => ({
                        point: [Number(p.current), Number(p.voltage)],
                        text: [String(p.current ?? ''), String(p.voltage ?? '')],
                    }))
                    // Trục log không nhận 0 và số âm — bỏ điểm không hợp lệ, nếu không
                    // ECharts lặng lẽ bỏ qua chúng và đường cong đứt quãng không rõ lý do.
                    .filter(p => Number.isFinite(p.point[0]) && Number.isFinite(p.point[1])
                        && p.point[0] > 0 && p.point[1] > 0)
                if (measuredPoints.length < 2) continue

                out.push({
                    name: (row.name && row.name.value) || 'Row',
                    row,
                    points: measuredPoints.map(p => p.point),
                    pointTexts: measuredPoints.map(p => p.text),
                    knees: this.kneesOf(row),
                })
            }
            return out
        },

        maxPoints() {
            return this.series.reduce((m, s) => Math.max(m, s.points.length), 0)
        },

        seriesGroups() {
            const groups = new Map()
            for (const item of this.series) {
                const coreNumber = this.coreNumberOf(item.row)
                const key = coreNumber === null ? 'unassigned' : `core-${coreNumber}`
                if (!groups.has(key)) {
                    groups.set(key, {
                        key,
                        coreNumber,
                        label: coreNumber === null ? 'Other measurements' : `Core ${coreNumber}`,
                        series: [],
                        kneeRows: [],
                    })
                }
                const group = groups.get(key)
                group.series.push(item)
                item.knees.forEach(k => {
                    group.kneeRows.push({
                        rowName: item.name,
                        method: k.method,
                        isSelected: k.isSelected,
                        currentText: k.currentText,
                        voltageText: k.voltageText,
                    })
                })
            }
            return Array.from(groups.values()).sort((a, b) => {
                if (a.coreNumber === null) return 1
                if (b.coreNumber === null) return -1
                return a.coreNumber - b.coreNumber
            })
        },

    },
    watch: {
        rowIds: {
            immediate: true,
            handler(now, before) {
                if (JSON.stringify(now) === JSON.stringify(before)) return
                this.reload()
            },
        },
        series() {
            this.$nextTick(this.renderChart)
        },
    },
    mounted() {
        window.addEventListener('resize', this.onResize)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize)
        // Không dispose thì các instance ECharts giữ canvas và listener sau khi dialog đóng.
        this.disposeCharts()
    },
    methods: {
        async reload() {
            const ids = this.rowIds
            if (ids.length === 0) { this.pointsByRow = {}; this.kneeByRow = {}; return }
            const api = window.electronAPI
            if (!api || !api.getCtExcitationPointsByDatasetIds) {
                console.warn('[CtExcitationCurve] khong co API doc diem do')
                return
            }
            this.loading = true
            try {
                const rs = await api.getCtExcitationPointsByDatasetIds(ids)
                this.pointsByRow = (rs && rs.success && rs.data) ? rs.data : {}
            } catch (error) {
                console.error('[CtExcitationCurve] doc diem do that bai:', error)
                this.pointsByRow = {}
                this.$message.error('Could not load curve data')
            }

            // Điểm knee đọc RIÊNG và lỗi RIÊNG: mất knee thì đường cong vẫn vẽ được và vẫn
            // đáng xem. Gộp chung một try thì một lỗi làm mất cả hai.
            try {
                if (api.getCtExcitationKneePointsByDatasetIds) {
                    const rsKnee = await api.getCtExcitationKneePointsByDatasetIds(ids)
                    this.kneeByRow = (rsKnee && rsKnee.success && rsKnee.data) ? rsKnee.data : {}
                } else {
                    this.kneeByRow = {}
                }
            } catch (error) {
                console.error('[CtExcitationCurve] doc diem knee that bai:', error)
                this.kneeByRow = {}
            }

            this.loading = false
            this.$nextTick(this.renderChart)
        },

        /**
         * Điểm knee của một dòng: ưu tiên bản ghi theo tiêu chuẩn, không có thì lùi về ô
         * i_knee/v_knee của bảng.
         *
         * Lùi về chứ không bỏ trống: dòng nhập tay và job cũ (import trước khi có bảng
         * knee) vẫn có knee trên bảng, và người dùng vẫn cần thấy nó trên đồ thị.
         */
        kneesOf(row) {
            const stored = this.kneeByRow[row.mrid] || []
            const out = []
            for (const k of stored) {
                const x = Number(k.current)
                const y = Number(k.voltage)
                if (!(Number.isFinite(x) && Number.isFinite(y) && x > 0 && y > 0)) continue
                out.push({
                    method: String(k.method || 'knee'),
                    isSelected: !!k.is_selected,
                    point: [x, y],
                    currentText: String(k.current ?? ''),
                    voltageText: String(k.voltage ?? ''),
                })
            }
            if (out.length > 0) return out

            const kneeX = Number(row.i_knee && row.i_knee.value)
            const kneeY = Number(row.v_knee && row.v_knee.value)
            if (Number.isFinite(kneeX) && Number.isFinite(kneeY) && kneeX > 0 && kneeY > 0) {
                return [{
                    method: 'knee',
                    isSelected: true,
                    point: [kneeX, kneeY],
                    currentText: String(row.i_knee.value),
                    voltageText: String(row.v_knee.value),
                }]
            }
            return []
        },

        coreNumberOf(row) {
            const rowName = String(row && row.name && row.name.value ? row.name.value : '').trim()
            const entityTaps = Array.isArray(this.asset && this.asset.CtTapInfo) ? this.asset.CtTapInfo : []
            const entityCores = Array.isArray(this.asset && this.asset.CtCoreInfo) ? this.asset.CtCoreInfo : []
            const entityTap = entityTaps.find(tap => String(tap.tap_name || '').trim() === rowName)
            if (entityTap) {
                const core = entityCores.find(item => item.mrid === entityTap.ct_core_info_id)
                const coreIndex = Number(core && core.core_index)
                if (Number.isFinite(coreIndex)) return coreIndex
            }

            const dtoCores = this.asset && this.asset.ctConfiguration
                && Array.isArray(this.asset.ctConfiguration.dataCT)
                ? this.asset.ctConfiguration.dataCT
                : []
            for (let index = 0; index < dtoCores.length; index++) {
                if (this.coreTapNames(dtoCores[index]).includes(rowName)) {
                    const configuredIndex = Number(dtoCores[index].core_index)
                    return Number.isFinite(configuredIndex) ? configuredIndex : index + 1
                }
            }

            const tapMatch = rowName.match(/^\s*(\d+)S\d+/i)
            if (tapMatch) return Number(tapMatch[1])
            const coreMatch = rowName.match(/^\s*Core\s+(\d+)/i)
            return coreMatch ? Number(coreMatch[1]) : null
        },

        coreTapNames(core) {
            const names = []
            const addTableName = table => {
                const value = table && table.name
                if (value) names.push(String(value).trim())
            }
            addTableName(core && core.fullTap && core.fullTap.table)
            const main = core && core.mainTap && Array.isArray(core.mainTap.data) ? core.mainTap.data : []
            const inter = core && core.interTap && Array.isArray(core.interTap.data) ? core.interTap.data : []
            main.forEach(item => addTableName(item && item.table))
            inter.forEach(item => addTableName(item && item.table))
            return names
        },

        maxPointsOf(items) {
            return (items || []).reduce((max, item) => Math.max(max, item.points.length), 0)
        },

        renderChart() {
            if (this.series.length === 0) {
                this.disposeCharts()
                return
            }

            const palette = ['#ef3b5d', '#2855e7', '#16a36a', '#f08c00', '#7b3fc6', '#008ca8',
                             '#d9480f', '#52606d', '#0b7285', '#5c940d', '#c2255c', '#7048e8']
            const fmt = (v) => (Math.abs(v) < 0.001 ? Number(v).toExponential(3) : String(Number(Number(v).toPrecision(6))))
            const activeKeys = new Set()

            this.seriesGroups.forEach(group => {
                const ref = this.$refs[`chart-${group.key}`]
                const el = Array.isArray(ref) ? ref[0] : ref
                if (!el) return

                activeKeys.add(group.key)
                const chart = this._charts[group.key] || echarts.init(el)
                if (!this._charts[group.key]) this._charts[group.key] = chart

                const chartSeries = []
                group.series.forEach((s, i) => {
                    const color = palette[i % palette.length]
                    chartSeries.push({
                        name: s.name,
                        type: 'line',
                        data: s.points,
                        showSymbol: true,
                        symbol: 'circle',
                        symbolSize: 5,
                        connectNulls: true,
                        smooth: false,
                        lineStyle: { width: 1.7, type: 'solid', color, opacity: 1 },
                        // Marker trong suốt để không che đoạn line chạy qua từng điểm đo.
                        itemStyle: { color: 'transparent', borderColor: color, borderWidth: 1.3 },
                        emphasis: { focus: 'series' },
                    })
                    // Mỗi tiêu chuẩn một điểm. Điểm đang chọn là hình tròn đặc, các điểm
                    // tham chiếu là hình thoi rỗng và chỉ xuất hiện trên biểu đồ của core đó.
                    for (const k of s.knees) {
                        chartSeries.push({
                            name: s.name,
                            type: 'scatter',
                            data: [k.point],
                            symbolSize: k.isSelected ? 18 : 9,
                            symbol: k.isSelected
                                ? 'path://M-1,-8 L1,-8 L1,-1 L8,-1 L8,1 L1,1 L1,8 L-1,8 L-1,1 L-8,1 L-8,-1 L-1,-1 Z'
                                : 'diamond',
                            itemStyle: k.isSelected
                                ? { color, borderColor: color, borderWidth: 1 }
                                : { color: 'transparent', borderColor: color, borderWidth: 1.5 },
                            tooltip: {
                                formatter: (p) => `${s.name} — knee (${k.method})`
                                    + `${k.isSelected ? ' · shown in table' : ''}`
                                    + `<br/>I: ${fmt(p.value[0])} A<br/>V: ${fmt(p.value[1])} V`,
                            },
                            z: k.isSelected ? 6 : 5,
                        })
                    }
                })

                chart.setOption({
                    animation: false,
                    title: {
                        text: `${group.label} - Excitation curve`,
                        left: 'center',
                        top: 5,
                        textStyle: { color: '#303133', fontSize: 13, fontWeight: 500 },
                    },
                    grid: { left: 68, right: 24, top: 48, bottom: 72 },
                    legend: {
                        type: 'scroll',
                        left: 12,
                        right: 12,
                        bottom: 5,
                        icon: 'circle',
                        data: group.series.map(s => s.name),
                    },
                    tooltip: {
                        trigger: 'item',
                        axisPointer: { type: 'cross' },
                        formatter: (p) => Array.isArray(p.value)
                            ? `${p.seriesName}<br/>I: ${fmt(p.value[0])} A<br/>V: ${fmt(p.value[1])} V`
                            : '',
                    },
                    toolbox: {
                        right: 12, top: 5,
                        feature: {
                            dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset zoom' } },
                            restore: { title: 'Restore' },
                        },
                    },
                    xAxis: {
                        type: 'log', logBase: 10, name: 'A',
                        nameLocation: 'middle', nameGap: 30,
                        axisLabel: { formatter: (v) => (v < 0.001 ? Number(v).toExponential(0) : String(v)) },
                        splitLine: { show: true, lineStyle: { color: '#eef1f5' } },
                        minorTick: { show: true },
                        minorSplitLine: { show: true, lineStyle: { color: '#f3f5f8' } },
                    },
                    yAxis: {
                        type: 'log', logBase: 10, name: 'V',
                        nameLocation: 'middle', nameGap: 42,
                        splitLine: { show: true, lineStyle: { color: '#eef1f5' } },
                        minorTick: { show: true },
                        minorSplitLine: { show: true, lineStyle: { color: '#f3f5f8' } },
                    },
                    series: chartSeries,
                }, true)
                chart.resize()
            })

            Object.keys(this._charts).forEach(key => {
                if (activeKeys.has(key)) return
                this._charts[key].dispose()
                delete this._charts[key]
            })
        },

        onResize() {
            Object.values(this._charts).forEach(chart => chart.resize())
        },

        saveImage() {
            this.seriesGroups.forEach(group => this.saveCoreImage(group))
        },

        saveCoreImage(group) {
            const chart = group && this._charts[group.key]
            if (!chart) return
            const url = chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' })
            const a = document.createElement('a')
            a.href = url
            a.download = `excitation-curve-${group.key}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        },

        disposeCharts() {
            Object.values(this._charts || {}).forEach(chart => chart.dispose())
            this._charts = Object.create(null)
        },

        cellAt(s, index, axis) {
            const p = s.pointTexts[index]
            if (!p) return ''
            // Giữ nguyên chuỗi PTM, không làm tròn tại màn hình review dữ liệu curve.
            return p[axis]
        },
    },
}
</script>

<style scoped>
.curve-panel { padding: 0 2px; }

.curve-head {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-bottom: 8px;
}

.curve-empty {
    padding: 26px 4px;
    font-size: 12px;
    color: #909399;
    text-align: center;
}

.core-reviews { display: grid; gap: 18px; }
.core-review-block { border: 1px solid #dfe4ec; border-radius: 4px; overflow: hidden; background: #fff; }
.core-review-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 36px;
    padding: 0 10px;
    border-bottom: 1px solid #dfe4ec;
    background: #f5f7fa;
    color: #303133;
    font-size: 12px;
}
.core-review-head span { color: #909399; font-size: 11px; }
.core-chart-actions { display: flex; align-items: center; gap: 6px; }
.core-chart-actions .el-button { padding: 4px; font-size: 14px; }
.curve-chart {
    width: 100%;
    height: 380px;
}

.points-wrap { max-height: 260px; overflow: auto; }

.points-table { border-collapse: collapse; font-size: 11px; width: 100%; }
.points-table th,
.points-table td {
    border: 1px solid #ebeef5;
    padding: 2px 6px;
    text-align: right;
    white-space: nowrap;
}
.points-table thead th {
    position: sticky;
    top: 0;
    background: #f5f7fa;
    z-index: 1;
}
.points-table .idx { color: #a0a4aa; text-align: center; }
.points-table .left { text-align: left; }

.knee-wrap { max-height: 220px; overflow: auto; border-top: 1px solid #dfe4ec; }
.data-section-title {
    min-height: 32px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    border-top: 1px solid #dfe4ec;
    border-bottom: 1px solid #dfe4ec;
    background: #fafbfc;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
}
.knee-wrap .data-section-title { border-top: 0; }
.knee-selected { background: #f0f7ff; font-weight: 600; }
.knee-tag {
    font-size: 10px;
    font-weight: 400;
    color: #409eff;
    border: 1px solid #b3d8ff;
    border-radius: 3px;
    padding: 0 4px;
    margin-left: 4px;
}
</style>
