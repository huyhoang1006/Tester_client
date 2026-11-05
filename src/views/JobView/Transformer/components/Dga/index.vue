<template>
    <div class="test-ui dga">
        <div class="test-toolbar">
            <div class="test-toolbar-group">
                <el-button size="mini" @click="clear"> <i class="fas fa-xmark"></i> Clear all </el-button>
            </div>
            <div class="test-toolbar-group">
                <el-button size="mini" :type="compareOpen ? 'primary' : ''" @click="$emit('toggle-compare')">
                    <i class="fa-solid fa-scale-balanced"></i> Compare with previous results
                </el-button>
            </div>
        </div>

        <el-tabs v-model="activeTab" type="card" class="dga-tabs">
            <!-- ═══════════════ TAB 1: OVERVIEW ═══════════════ -->
            <el-tab-pane label="Overview" name="dga-overview">
                <!-- Block 1: bảng nhập khí -->
                <section class="dga-card">
                    <div class="dga-card__header">
                        <span>Gas concentrations</span>
                        <el-select v-if="rows.length > 1" v-model="selectedRowIndex" size="mini" class="dga-sample-select">
                            <el-option v-for="(row, index) in rows" :key="index" :label="'Sample ' + (index + 1)" :value="index" />
                        </el-select>
                    </div>
                    <div class="table-scroll">
                        <table class="table-strip-input-data test-table dga-input-table">
                            <thead>
                                <tr>
                                    <th v-for="key in inputGases" :key="key">
                                        {{ gasLabels[key] }}
                                        <info-tip v-if="key === 'o2' || key === 'n2'" :text="tips.o2n2Input" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in rows" :key="index">
                                    <td v-for="key in inputGases" :key="key">
                                        <el-input v-if="item[key]" :measurement="item[key]" type="text" number="positive"
                                            size="mini" v-model="item[key].value">
                                            <template slot="append">ppm</template>
                                        </el-input>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-if="!isOltc && currentRow && currentRow.communicating_oltc" class="dga-option-row">
                        <el-checkbox :value="communicatingOltc" @change="setCommunicatingOltc">Communicating OLTC</el-checkbox>
                        <info-tip :text="tips.communicatingOltc" />
                    </div>
                </section>

                <div v-if="!hasData" class="dga-empty">Enter gas concentrations to see the assessment.</div>

                <!-- OLTC: chỉ Triangle 2 + tỷ số C₂H₄/C₂H₂ -->
                <template v-else-if="isOltc">
                    <el-alert type="info" :closable="false" show-icon class="dga-alert">
                        <span slot="title">{{ tips.oltcNote }}</span>
                    </el-alert>
                    <section class="dga-card">
                        <div class="dga-card__header"><span>OLTC assessment</span></div>
                        <div class="dga-oltc">
                            <div class="dga-oltc__item">
                                <div class="dga-oltc__label">Duval Triangle 2 <info-tip :text="tips.triangle2Limits" /></div>
                                <div v-if="oltc.triangle2" class="dga-oltc__value">
                                    <strong>{{ oltc.triangle2.zone }}</strong> – {{ oltc.triangle2.name }}
                                </div>
                                <div v-else class="dga-oltc__value muted">CH₄, C₂H₄ and C₂H₂ are all zero.</div>
                            </div>
                            <div class="dga-oltc__item">
                                <div class="dga-oltc__label">C₂H₄/C₂H₂ <info-tip :text="tips.oltcRatio" /></div>
                                <div class="dga-oltc__value">{{ oltc.c2h4c2h2 === null ? '—' : formatNumber(oltc.c2h4c2h2) }}</div>
                            </div>
                        </div>
                    </section>
                </template>

                <template v-else>
                    <!-- Block 2: ma trận đối chiếu 6 phương pháp -->
                    <section class="dga-card">
                        <div class="dga-card__header"><span>DGA methods overview</span></div>
                        <div class="table-scroll">
                            <table class="dga-matrix">
                                <thead>
                                    <tr>
                                        <th class="dga-matrix__fault" colspan="2"></th>
                                        <th v-for="method in methodColumns" :key="method.key" :class="{ 'is-disabled': method.disabled }">
                                            {{ method.label }}
                                            <info-tip :text="method.tip" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="dga-matrix__meta">
                                        <td colspan="2">Method applied <info-tip :text="tips.methodApplied" /></td>
                                        <td v-for="method in methodColumns" :key="'a-' + method.key" :class="{ 'is-disabled': method.disabled }">
                                            {{ methodResult(method.key).applied ? 'X' : '' }}
                                        </td>
                                    </tr>
                                    <tr class="dga-matrix__meta">
                                        <td colspan="2">No diagnosis <info-tip :text="tips.noDiagnosis" /></td>
                                        <td v-for="method in methodColumns" :key="'n-' + method.key" :class="{ 'is-disabled': method.disabled }">
                                            <span v-if="hasFault(method.key, 'ND')" :title="methodResult(method.key).note || methodResult(method.key).detail || ''">X</span>
                                        </td>
                                    </tr>
                                    <tr v-for="(row, index) in faultRows" :key="row.key">
                                        <td v-if="index === 0" class="dga-matrix__group" :rowspan="faultRows.length">Fault</td>
                                        <td class="dga-matrix__fault">
                                            <span class="dga-matrix__code">{{ row.key === 'NF' ? '' : row.key }}</span>
                                            {{ row.label }}
                                            <info-tip v-if="row.key === 'NF'" :text="tips.noFault" />
                                            <info-tip v-if="row.key === 'DT'" :text="tips.dt" />
                                        </td>
                                        <td v-for="method in methodColumns" :key="row.key + method.key"
                                            :class="{ 'is-disabled': method.disabled, 'is-hit': hasFault(method.key, row.key) }">
                                            <template v-if="hasFault(method.key, row.key)">
                                                X
                                                <info-tip v-if="cellNote(method.key, row.key)" :text="cellNote(method.key, row.key)" />
                                            </template>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <!-- Block 3: Assessment summary -->
                    <section class="dga-card">
                        <div class="dga-card__header"><span>Assessment summary</span></div>
                        <table class="dga-summary">
                            <tbody>
                                <tr v-for="item in summaryRows" :key="item.key">
                                    <td class="dga-summary__name">
                                        {{ item.name }}
                                        <info-tip :text="item.tip" :notes="item.notes" />
                                        <el-tooltip v-if="item.status3" :content="tips.status3Icon" placement="top">
                                            <i class="fa-solid fa-circle-exclamation dga-summary__alert"></i>
                                        </el-tooltip>
                                    </td>
                                    <td class="dga-summary__status">
                                        <span class="dga-summary__bar" :style="{ backgroundColor: colors[item.result.level] }"></span>
                                        {{ item.result.label }}
                                    </td>
                                    <td class="dga-summary__message">{{ item.result.message }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </template>
            </el-tab-pane>

            <!-- ═══════════════ TAB 2: KEY GAS ANALYSIS ═══════════════ -->
            <el-tab-pane v-if="!isOltc" label="Key Gas Analysis" name="dga-keygas">
                <section class="dga-card">
                    <div class="dga-card__header">
                        <span>Key gas analysis</span>
                        <div class="dga-standard">
                            <span>Standard</span>
                            <el-select v-model="gaugeStandard" size="mini">
                                <el-option v-for="opt in gaugeStandards" :key="opt.key" :label="opt.label" :value="opt.key" />
                            </el-select>
                            <info-tip :text="gaugeTip" :notes="gaugeStandard === 'ieee2019' ? summary.ieee2019.notes : []" />
                        </div>
                    </div>
                    <key-gas-gauges :columns="gauges" />
                </section>

                <section class="dga-card">
                    <div class="dga-card__header">
                        <span>Pattern <info-tip :text="tips.pattern" /></span>
                    </div>
                    <div class="dga-patterns">
                        <pattern-chart v-for="chart in analysis.patterns" :key="chart.key" :chart="chart" />
                    </div>
                    <div class="dga-legend">
                        <span><i class="dga-legend__swatch is-measured"></i> Measurement</span>
                        <span><i class="dga-legend__swatch is-standard"></i> Standard pattern</span>
                    </div>
                </section>
            </el-tab-pane>

            <!-- ═══════════════ TAB 3: DUVAL ═══════════════ -->
            <el-tab-pane label="Duval" name="dga-duval">
                <el-alert v-if="hasData && lowGas" type="info" :closable="false" show-icon class="dga-alert"
                    :title="tips.lowGas" />
                <section class="dga-card">
                    <div class="dga-card__header">
                        <span v-if="isOltc">Duval Triangle 2 (OLTC) <info-tip :text="tips.triangle2Limits" /></span>
                        <span v-else>Duval Triangle 1 <info-tip :text="tips.duval" /></span>
                    </div>
                    <duval-triangle v-if="isOltc" title="Duval Triangle 2 – OLTC"
                        :zones="triangle2Zones" :percentages="oltc.triangle2 ? oltc.triangle2.percentages : null"
                        :active-zone="oltc.triangle2 ? oltc.triangle2.zone : ''" />
                    <duval-triangle v-else title="Duval Triangle 1"
                        :zones="triangle1Zones" :percentages="analysis.triangle1 ? analysis.triangle1.percentages : null"
                        :active-zone="analysis.triangle1 ? analysis.triangle1.zone : ''" />
                </section>

                <section v-if="!isOltc" class="dga-card">
                    <div class="dga-card__header">
                        <span>Duval Pentagons <info-tip :text="tips.pentagonPoint" :notes="[tips.pentagonGaps]" /></span>
                    </div>
                    <div class="dga-pentagons">
                        <duval-pentagon title="Pentagon 1" :zones="pentagon1Zones"
                            :point="analysis.pentagon1" :active-zone="analysis.pentagon1 ? analysis.pentagon1.zone : ''"
                            tip="IEEE C57.104-2019 Annex D.3 — six basic fault types plus stray gassing (S)." />
                        <duval-pentagon title="Pentagon 2" :zones="pentagon2Zones"
                            :point="analysis.pentagon2" :active-zone="analysis.pentagon2 ? analysis.pentagon2.zone : ''"
                            tip="IEEE C57.104-2019 Annex D.5 — thermal sub-types: T3-H (oil only), C (possible paper carbonization), O (overheating < 250 °C)." />
                    </div>
                </section>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
/* eslint-disable */
import transformerTestMap from '@/config/test-definitions/Transformer'
import * as common from '../../../Common/index.js'
import InfoTip from './InfoTip.vue'
import DuvalTriangle from './DuvalTriangle.vue'
import DuvalPentagon from './DuvalPentagon.vue'
import KeyGasGauges from './KeyGasGauges.vue'
import PatternChart from './PatternChart.vue'
import {
    GASES, GAS_LABELS, FAULT_ROWS, STATUS_COLORS, DGA_TOOLTIPS,
    PENTAGON_1_ZONES, PENTAGON_2_ZONES
} from '@/utils/dga/config'
import { DUVAL_TRIANGLE_1_ZONES, DUVAL_TRIANGLE_2_ZONES } from '@/utils/dga/duval'
import { readGases, analyseDga, analyseOltc, gaugeColumns, GAUGE_STANDARDS } from '@/utils/dga/analysis'
import { calculateTransformerConditionIndicators } from '@/utils/transformerConditionIndicator'

const parseTestDate = (text) => {
    // Ngày thí nghiệm lưu dạng MM/dd/yyyy
    const match = String(text || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (!match) return null
    const date = new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]))
    return isNaN(date.getTime()) ? null : date
}

export default {
    name: 'Dga',
    components: { InfoTip, DuvalTriangle, DuvalPentagon, KeyGasGauges, PatternChart },
    props: {
        data:           { type: Object, require: true },
        asset:          { type: Object, require: true },
        testAssessment: { type: Object, require: true },
        testCondition:  { type: Object, default: function () { return { condition: {} } } },
        compareOpen:    { type: Boolean, default: false },
        assetMrid:      { type: String, default: '' },
        workMrid:       { type: String, default: '' },
        workTaskMrid:   { type: String, default: '' }
    },
    data() {
        return {
            // Tên tab có tiền tố 'dga-': App.vue ẩn toàn cục #tab-overview (tab Overview của job)
            activeTab: 'dga-overview',
            selectedRowIndex: 0,
            gaugeStandard: 'ieee2019',
            gaugeStandards: GAUGE_STANDARDS,
            gasLabels: GAS_LABELS,
            tips: DGA_TOOLTIPS,
            colors: STATUS_COLORS,
            faultRows: FAULT_ROWS,
            triangle1Zones: DUVAL_TRIANGLE_1_ZONES,
            triangle2Zones: DUVAL_TRIANGLE_2_ZONES,
            pentagon1Zones: PENTAGON_1_ZONES,
            pentagon2Zones: PENTAGON_2_ZONES,
            // Lần đo trước (chỉ DGA - Main tank, cho Delta của IEEE-2019)
            previousGas: null,
            previousDate: '',
            daysBetween: null,
            previousRequestId: 0
        }
    },
    computed: {
        // DGA - OLTC override computed này (xem ../DgaOltc)
        isOltc() { return false },
        testCode() { return this.$options.name },
        testData() { return this.data },
        assetData() { return this.asset || {} },
        rowTemplate() { return common.buildEmptyTestRow(transformerTestMap[this.testCode].columns) },
        rows() { return (this.testData && this.testData.table && this.testData.table.table1) || [] },
        currentRow() { return this.rows[this.selectedRowIndex] || this.rows[0] || null },
        inputGases() { return this.isOltc ? GASES : [...GASES, 'o2', 'n2'] },
        gas() { return readGases(this.currentRow) },
        hasData() { return GASES.some(key => this.gas[key] !== null) },
        communicatingOltc() {
            const cell = this.currentRow && this.currentRow.communicating_oltc
            return !!(cell && String(cell.value || '').toLowerCase() === 'yes')
        },
        testingDate() {
            const meta = this.testCondition && this.testCondition.metadata
            return parseTestDate(meta && meta.testing_date)
        },
        transformerAge() {
            const props = this.assetData.properties || {}
            const match = String(props.manufacturer_year || '').match(/(\d{4})/)
            if (!match) return null
            const year = (this.testingDate || new Date()).getFullYear()
            const age = year - Number(match[1])
            return age >= 0 ? age : null
        },
        analysis() {
            return analyseDga(this.gas, {
                communicatingOltc: this.communicatingOltc,
                age: this.transformerAge,
                previous: this.previousGas,
                previousDate: this.previousDate,
                daysBetween: this.daysBetween
            })
        },
        oltc() { return analyseOltc(this.gas) },
        lowGas() { return this.isOltc ? this.oltc.lowGas : this.analysis.lowGas },
        summary() { return this.analysis.summary },
        methodColumns() {
            return [
                { key: 'duval', label: 'Duval', tip: DGA_TOOLTIPS.duval },
                { key: 'iec', label: 'IEC basic gas ratios', tip: DGA_TOOLTIPS.iec },
                { key: 'rogers', label: 'Rogers', tip: DGA_TOOLTIPS.rogers },
                { key: 'doernenburg', label: 'Doernenburg', tip: DGA_TOOLTIPS.doernenburg },
                { key: 'keyGas', label: 'Key gas method', tip: DGA_TOOLTIPS.keyGas },
                { key: 'mss', label: 'MSS-Scheme', tip: DGA_TOOLTIPS.mss, disabled: true }
            ]
        },
        summaryRows() {
            const s = this.summary
            return [
                { key: 'iec', name: 'IEC 60599:2022', tip: DGA_TOOLTIPS.iecSummary, result: s.iec },
                { key: 'ieee2019', name: 'IEEE-2019 C57.104', tip: DGA_TOOLTIPS.ieee2019Summary, notes: s.ieee2019.notes,
                    result: s.ieee2019, status3: s.ieee2019.status === 3 },
                { key: 'ieee2008Tdcg', name: 'IEEE-2008 C57.104 (TDCG)', tip: DGA_TOOLTIPS.ieee2008TdcgSummary,
                    notes: [`TDCG = ${this.formatNumber(s.ieee2008Tdcg.tdcg)} ppm`], result: s.ieee2008Tdcg },
                { key: 'ieee2008Gas', name: 'IEEE-2008 C57.104 (individual gases)', tip: DGA_TOOLTIPS.ieee2008GasSummary, result: s.ieee2008Gas }
            ]
        },
        gauges() {
            return gaugeColumns(this.gas, this.gaugeStandard, { communicatingOltc: this.communicatingOltc, age: this.transformerAge })
        },
        gaugeTip() {
            return { iec: DGA_TOOLTIPS.gaugeIec, ieee2008: DGA_TOOLTIPS.gaugeIeee2008 }[this.gaugeStandard] || DGA_TOOLTIPS.gaugeIeee2019
        },
        // Chữ ký các giá trị khí — đổi là tính lại CI ngầm cho Health Index
        gasSignature() {
            return this.rows.map(row => GASES.map(key => (row && row[key] ? row[key].value : '')).join('|')).join(';')
        },
        previousKey() {
            return [this.isOltc, this.assetMrid, this.workMrid, this.testingDate ? this.testingDate.getTime() : ''].join('|')
        }
    },
    watch: {
        rows: {
            immediate: true,
            handler() { this.ensureRowFields() }
        },
        // Bỏ nút Calculate CI: CI cũ vẫn tính ngầm (Health Index đọc cột này)
        gasSignature() {
            if (this.isOltc) return
            calculateTransformerConditionIndicators('Dga', this.testData)
        },
        previousKey: {
            immediate: true,
            handler() { this.loadPreviousSample() }
        }
    },
    methods: {
        /** Job cũ chưa có cột O₂, N₂, Communicating OLTC → bổ sung từ định nghĩa cột */
        ensureRowFields() {
            for (const row of this.rows) {
                if (!row) continue
                for (const key of Object.keys(this.rowTemplate)) {
                    if (!row[key]) this.$set(row, key, JSON.parse(JSON.stringify(this.rowTemplate[key])))
                }
            }
        },
        setCommunicatingOltc(checked) {
            if (this.currentRow && this.currentRow.communicating_oltc) {
                this.currentRow.communicating_oltc.value = checked ? 'Yes' : ''
            }
        },
        methodResult(key) {
            return this.analysis.methods[key] || { applied: false, faults: [] }
        },
        hasFault(methodKey, faultKey) {
            return (this.methodResult(methodKey).faults || []).includes(faultKey)
        },
        cellNote(methodKey, faultKey) {
            const result = this.methodResult(methodKey)
            if (methodKey === 'keyGas' && result.note) return result.note
            if (methodKey === 'doernenburg' && result.detail) return result.detail
            return ''
        },
        formatNumber(value) {
            if (value === null || value === undefined) return '—'
            if (value === Infinity) return '∞'
            return String(Math.round(value * 100) / 100)
        },
        /**
         * Lần đo DGA - Main tank ngay trước ngày thí nghiệm hiện tại, cùng thiết bị.
         * Chỉ đọc trên máy này (SQLite) — giống bảng Compare.
         */
        async loadPreviousSample() {
            const requestId = ++this.previousRequestId
            this.previousGas = null
            this.previousDate = ''
            this.daysBetween = null
            if (this.isOltc || !this.assetMrid) return
            const api = window.electronAPI
            if (!api || !api.getComparableTests || !api.getTestSnapshot) return
            try {
                const rs = await api.getComparableTests(this.assetMrid, 'Dga', this.workMrid)
                if (requestId !== this.previousRequestId || !rs || !rs.success) return
                const current = this.testingDate
                const candidates = (rs.data || [])
                    .filter(item => item.workTaskMrid !== this.workTaskMrid)
                    .map(item => ({ ...item, date: parseTestDate(item.executionDate) }))
                    .filter(item => !current || (item.date && item.date < current))
                const previous = candidates[0]
                if (!previous) return
                const snap = await api.getTestSnapshot(previous.workTaskMrid)
                if (requestId !== this.previousRequestId || !snap || !snap.success || !snap.data) return
                const codeByMrid = {}
                for (const col of transformerTestMap.Dga.columns) codeByMrid[col.mrid] = col.code
                const table = (snap.data.tables || []).find(t => t.rows && t.rows.length)
                if (!table) return
                const row = {}
                for (const cell of Object.values(table.rows[0].cells || {})) {
                    const code = codeByMrid[cell.measurementId]
                    if (code) row[code] = { value: cell.value }
                }
                const gas = readGases(row)
                if (!GASES.some(key => gas[key] !== null)) return
                this.previousGas = gas
                this.previousDate = previous.executionDate || ''
                this.daysBetween = current && previous.date
                    ? Math.round((current.getTime() - previous.date.getTime()) / 86400000)
                    : null
            } catch (error) {
                console.error('Load previous DGA sample failed:', error)
            }
        },
        clear() {
            common.clearEditableTestValues(this.testData && this.testData.table)
        }
    }
}
</script>

<style scoped>
/* Tab dạng card: có vạch ngăn giữa các tab; khoảng đệm đều cho cả tab đầu/cuối
   (kiểu tab thường của Element bỏ padding tab đầu/cuối → chữ dính mép khi tô nền) */
.dga-tabs ::v-deep(.el-tabs__header) {
    margin-bottom: 10px;
}

.dga-tabs ::v-deep(.el-tabs__item),
.dga-tabs ::v-deep(.el-tabs__item:nth-child(2)),
.dga-tabs ::v-deep(.el-tabs__item:last-child) {
    padding: 0 22px !important;
    text-align: center;
    /* Giữ chiều cao mặc định 40px của Element; vertical-align để không sinh khe
       baseline giữa tab và đường kẻ dưới */
    vertical-align: bottom;
}

.dga-tabs ::v-deep(.el-tabs__item:not(:first-child)) {
    border-left: 1px solid #e4e7ed;
}

.dga-card {
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 12px;
}

.dga-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 8px;
}

.dga-sample-select {
    width: 130px;
}

.dga-option-row {
    display: flex;
    align-items: center;
    margin-top: 8px;
    font-size: 12px;
}

.dga-empty {
    padding: 28px;
    text-align: center;
    color: #909399;
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    margin-bottom: 12px;
}

.dga-alert {
    margin-bottom: 12px;
}

/* Ma trận phương pháp */
.dga-matrix {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}

.dga-matrix th,
.dga-matrix td {
    border: 1px solid #ebeef5;
    padding: 5px 8px;
    text-align: center;
    white-space: nowrap;
}

.dga-matrix th {
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
}

.dga-matrix td.dga-matrix__fault,
.dga-matrix__meta td:first-child {
    text-align: left;
}

.dga-matrix__meta td:first-child {
    text-align: right;
    font-weight: 600;
    color: #606266;
}

.dga-matrix__group {
    font-weight: 700;
    color: #606266;
    background: #fafafa;
}

.dga-matrix__code {
    display: inline-block;
    min-width: 26px;
    font-weight: 700;
}

.dga-matrix td.is-hit {
    font-weight: 700;
    color: #c0392b;
    background: #fff4f2;
}

.dga-matrix .is-disabled {
    color: #c0c4cc;
    background: #f7f7f7;
}

/* Bảng tóm tắt */
.dga-summary {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.dga-summary td {
    padding: 6px 8px;
    vertical-align: top;
    border-bottom: 1px solid #f2f3f5;
}

.dga-summary__name {
    width: 280px;
    font-weight: 700;
    color: #303133;
    white-space: nowrap;
}

.dga-summary__alert {
    margin-left: 6px;
    color: #8e44ad;
    cursor: help;
}

.dga-summary__status {
    width: 150px;
    white-space: nowrap;
}

.dga-summary__bar {
    display: inline-block;
    width: 14px;
    height: 18px;
    margin-right: 6px;
    vertical-align: -4px;
    border-radius: 2px;
}

.dga-summary__message {
    color: #303133;
    line-height: 1.5;
}

/* Key gas */
.dga-standard {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 400;
    font-size: 12px;
}

.dga-patterns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.dga-legend {
    display: flex;
    justify-content: center;
    gap: 18px;
    margin-top: 8px;
    font-size: 12px;
    color: #606266;
}

.dga-legend__swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    vertical-align: -1px;
    margin-right: 4px;
}

.dga-legend__swatch.is-measured { background: #4a90e2; }
.dga-legend__swatch.is-standard { background: #bdbdbd; }

/* Duval */
.dga-pentagons {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

/* OLTC */
.dga-oltc {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    font-size: 13px;
}

.dga-oltc__label {
    color: #606266;
    margin-bottom: 4px;
}

.dga-oltc__value {
    font-size: 14px;
    color: #303133;
}

.muted {
    color: #909399;
}

@media (max-width: 900px) {
    .dga-patterns {
        grid-template-columns: 1fr;
    }
}
</style>
<style lang="scss" scoped>
@import "~@/views/JobView/Common/testUi.scss";
</style>
