<template>
    <div class="curve-panel">
        <div class="curve-head">
            <span class="curve-note">{{ summary }}</span>
            <el-button size="mini" plain icon="el-icon-refresh" :loading="loading" @click="reload">
                Refresh
            </el-button>
            <el-button size="mini" plain icon="el-icon-picture-outline" :disabled="series.length === 0"
                       @click="saveImage">
                Save image
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
            <div ref="chart" class="curve-chart"></div>

            <!--
              Bảng điểm knee theo từng tiêu chuẩn. OMICRON tính ba cách (IEC, ANSI45,
              ANSI30) và ba con số lệch nhau thật — bảng test chỉ giữ được cái đang chọn,
              nên hai cái còn lại chỉ nhìn thấy ở đây.
            -->
            <div v-if="kneeRows.length > 0" class="knee-wrap">
                <div class="knee-title">Knee points by standard</div>
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
                        <tr v-for="(k, i) in kneeRows" :key="'k' + i" :class="{ 'knee-selected': k.isSelected }">
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

            <div class="points-wrap">
                <table class="points-table">
                    <thead>
                        <tr>
                            <th rowspan="2">#</th>
                            <th v-for="(s, i) in series" :key="'h' + i" colspan="2">{{ s.name }}</th>
                        </tr>
                        <tr>
                            <template v-for="(s, i) in series">
                                <th :key="'hi' + i">I [A]</th>
                                <th :key="'hv' + i">V [V]</th>
                            </template>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="r in maxPoints" :key="'r' + r">
                            <td class="idx">{{ r }}</td>
                            <template v-for="(s, i) in series">
                                <td :key="'i' + i + '_' + r">{{ cellAt(s, r - 1, 0) }}</td>
                                <td :key="'v' + i + '_' + r">{{ cellAt(s, r - 1, 1) }}</td>
                            </template>
                        </tr>
                    </tbody>
                </table>
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
    },
    data() {
        return {
            loading: false,
            /** { [datasetId]: [{ current, voltage }] } */
            pointsByRow: {},
            /** { [datasetId]: [{ method, current, voltage, is_selected }] } */
            kneeByRow: {},
            chart: null,
        }
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
                const pts = (this.pointsByRow[id] || [])
                    .map(p => [Number(p.current), Number(p.voltage)])
                    // Trục log không nhận 0 và số âm — bỏ điểm không hợp lệ, nếu không
                    // ECharts lặng lẽ bỏ qua chúng và đường cong đứt quãng không rõ lý do.
                    .filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]) && p[0] > 0 && p[1] > 0)
                if (pts.length < 2) continue

                out.push({
                    name: (row.name && row.name.value) || 'Row',
                    points: pts,
                    knees: this.kneesOf(row),
                })
            }
            return out
        },

        /** Bảng knee phẳng, mỗi dòng một (dòng test × tiêu chuẩn). */
        kneeRows() {
            const out = []
            for (const s of this.series) {
                for (const k of s.knees) {
                    out.push({
                        rowName: s.name,
                        method: k.method,
                        isSelected: k.isSelected,
                        currentText: this.fmtNumber(k.point[0]),
                        voltageText: this.fmtNumber(k.point[1]),
                    })
                }
            }
            return out
        },

        maxPoints() {
            return this.series.reduce((m, s) => Math.max(m, s.points.length), 0)
        },

        summary() {
            if (this.series.length === 0) return ''
            const knees = this.series.reduce((n, s) => n + s.knees.length, 0)
            const methods = new Set()
            this.series.forEach(s => s.knees.forEach(k => methods.add(k.method)))
            const methodNote = methods.size > 1 ? ` (${[...methods].join(', ')})` : ''
            return `${this.series.length} curve(s) · ${this.maxPoints} points max · ${knees} knee point(s)${methodNote}`
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
        // Không dispose thì instance ECharts giữ canvas và listener sau khi dialog đóng;
        // mở đi mở lại vài lần là rò bộ nhớ.
        if (this.chart) { this.chart.dispose(); this.chart = null }
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
                })
            }
            if (out.length > 0) return out

            const kneeX = Number(row.i_knee && row.i_knee.value)
            const kneeY = Number(row.v_knee && row.v_knee.value)
            if (Number.isFinite(kneeX) && Number.isFinite(kneeY) && kneeX > 0 && kneeY > 0) {
                return [{ method: 'knee', isSelected: true, point: [kneeX, kneeY] }]
            }
            return []
        },

        fmtNumber(v) {
            const n = Number(v)
            if (!Number.isFinite(n)) return ''
            return Math.abs(n) < 0.001 ? n.toExponential(4) : String(Number(n.toPrecision(6)))
        },

        renderChart() {
            const el = this.$refs.chart
            if (!el || this.series.length === 0) return
            if (!this.chart) this.chart = echarts.init(el)

            const palette = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9c27b0',
                             '#00bcd4', '#795548', '#3f51b5', '#8bc34a', '#ff5722', '#607d8b']
            const fmt = (v) => (Math.abs(v) < 0.001 ? Number(v).toExponential(3) : String(Number(Number(v).toPrecision(6))))

            const chartSeries = []
            this.series.forEach((s, i) => {
                const color = palette[i % palette.length]
                chartSeries.push({
                    name: s.name,
                    type: 'line',
                    data: s.points,
                    showSymbol: false,
                    symbolSize: 5,
                    lineStyle: { width: 1.8, color },
                    itemStyle: { color },
                    emphasis: { focus: 'series' },
                })
                // Mỗi tiêu chuẩn một điểm. Tiêu chuẩn đang nằm trên bảng vẽ tròn ĐẶC, các
                // tiêu chuẩn khác vẽ thoi RỖNG — phân biệt bằng hình, không bằng màu, vì
                // màu đã dùng để phân biệt các đường với nhau.
                for (const k of s.knees) {
                    chartSeries.push({
                        // Cùng tên với đường: bấm chú giải là ẩn/hiện CẢ đường lẫn điểm knee.
                        name: s.name,
                        type: 'scatter',
                        data: [k.point],
                        symbolSize: k.isSelected ? 12 : 9,
                        symbol: k.isSelected ? 'circle' : 'diamond',
                        itemStyle: k.isSelected
                            ? { color, borderColor: '#fff', borderWidth: 1.5 }
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

            this.chart.setOption({
                animation: false,
                grid: { left: 68, right: 24, top: 46, bottom: 56 },
                legend: { type: 'scroll', top: 4, data: this.series.map(s => s.name) },
                tooltip: {
                    trigger: 'item',
                    axisPointer: { type: 'cross' },
                    formatter: (p) => Array.isArray(p.value)
                        ? `${p.seriesName}<br/>I: ${fmt(p.value[0])} A<br/>V: ${fmt(p.value[1])} V`
                        : '',
                },
                toolbox: {
                    right: 12, top: 4,
                    feature: {
                        // Phóng vùng knee — cả quyết định nằm ở khúc gãy, mà khúc đó chiếm
                        // chưa tới 1/5 chiều ngang.
                        dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset zoom' } },
                        restore: { title: 'Restore' },
                    },
                },
                xAxis: {
                    type: 'log', logBase: 10, name: 'Excitation current [A]',
                    nameLocation: 'middle', nameGap: 30,
                    axisLabel: { formatter: (v) => (v < 0.001 ? Number(v).toExponential(0) : String(v)) },
                    splitLine: { show: true, lineStyle: { color: '#eef1f5' } },
                },
                yAxis: {
                    type: 'log', logBase: 10, name: 'Excitation voltage [V]',
                    nameLocation: 'middle', nameGap: 48,
                    splitLine: { show: true, lineStyle: { color: '#eef1f5' } },
                },
                series: chartSeries,
            }, true)

            this.chart.resize()
        },

        onResize() {
            if (this.chart) this.chart.resize()
        },

        saveImage() {
            if (!this.chart) return
            const url = this.chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' })
            const a = document.createElement('a')
            a.href = url
            a.download = 'excitation-curve.png'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        },

        cellAt(s, index, axis) {
            const p = s.points[index]
            if (!p) return ''
            const value = p[axis]
            // Giữ đủ chữ số có nghĩa: dòng nhỏ cỡ 4.6e-05, hiển thị 2 chữ số là mất hết.
            return value < 0.001 ? value.toExponential(4) : String(Number(value.toPrecision(6)))
        },
    },
}
</script>

<style scoped>
.curve-panel { padding: 0 2px; }

.curve-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}
.curve-note { font-size: 12px; color: #909399; margin-right: auto; }

.curve-empty {
    padding: 26px 4px;
    font-size: 12px;
    color: #909399;
    text-align: center;
}

.curve-chart {
    width: 100%;
    height: 380px;
}

.points-wrap { max-height: 260px; overflow: auto; margin-top: 10px; }

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

.knee-wrap { margin-top: 12px; max-height: 180px; overflow: auto; }
.knee-title { font-size: 12px; color: #606266; margin-bottom: 4px; }
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
