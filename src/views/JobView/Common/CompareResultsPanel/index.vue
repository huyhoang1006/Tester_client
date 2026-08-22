<template>
    <section class="ti-card cmp-card">
        <div class="ti-header">
            <i class="fa-solid fa-scale-balanced"></i>
            <span>Compare results</span>
            <div class="cmp-actions">
                <i class="fa-solid fa-rotate-right cmp-act" :class="{ spinning: loading }"
                    title="Refresh — đọc lại lần test tham chiếu và so lại với số đang nhập"
                    @click="refresh"></i>
                <i class="fa-solid fa-xmark cmp-act" title="Close" @click="$emit('close')"></i>
            </div>
        </div>

        <div class="ti-body cmp-body" v-loading="loading">
            <!-- Chọn bản tham chiếu -->
            <div class="cmp-pick">
                <span class="cmp-pick-label">Reference result</span>
                <el-select v-model="selectedWorkTaskMrid" size="mini" class="cmp-pick-select"
                    :disabled="!options.length"
                    placeholder="No previous test available"
                    @change="loadReference">
                    <el-option v-for="opt in options" :key="opt.workTaskMrid"
                        :label="opt.label" :value="opt.workTaskMrid"></el-option>
                </el-select>
            </div>

            <div v-if="supportsReferenceValueApply" class="cmp-apply-row">
                <el-button size="mini" type="primary"
                    :disabled="!canApplyReferenceValues"
                    @click="applyReferenceValues">
                    <i class="fa-solid fa-arrow-right-to-bracket"></i>
                    Apply reference values
                </el-button>
            </div>

            <!-- Thông tin bản tham chiếu — theo đúng khối Test date / Source ở ảnh khách -->
            <div v-if="selectedOption" class="cmp-meta">
                <div class="cmp-meta-row">
                    <i class="fa-regular fa-calendar"></i>
                    <div class="cmp-meta-text">
                        <div class="cmp-meta-label">Test date</div>
                        <div class="cmp-meta-value">{{ selectedOption.executionDate || '—' }}</div>
                    </div>
                </div>
                <div class="cmp-meta-row">
                    <i class="fa-regular fa-file-lines"></i>
                    <div class="cmp-meta-text">
                        <div class="cmp-meta-label">Source</div>
                        <div class="cmp-meta-value">{{ selectedOption.source }}</div>
                    </div>
                </div>
                <div class="cmp-meta-row" v-if="selectedOption.testedBy">
                    <i class="fa-regular fa-user"></i>
                    <div class="cmp-meta-text">
                        <div class="cmp-meta-label">Tested by</div>
                        <div class="cmp-meta-value">{{ selectedOption.testedBy }}</div>
                    </div>
                </div>
            </div>

            <!-- Chỉ vùng này cuộn; ô chọn bản tham chiếu và dòng thống kê luôn nhìn thấy -->
            <div class="cmp-scroll">
            <!-- Các trạng thái rỗng -->
            <div v-if="!options.length" class="cmp-state">
                <i class="fa-regular fa-folder-open"></i>
                <p>No other <b>{{ testName || testCode }}</b> test for this asset on this machine.</p>
            </div>

            <div v-else-if="result && !hasReferenceData" class="cmp-state">
                <i class="fa-regular fa-circle-question"></i>
                <p>The reference test has no saved data to compare.</p>
            </div>

            <template v-else-if="result">
                <!-- Điều kiện thí nghiệm -->
                <div v-if="result.conditionDiff.length" class="cmp-block">
                    <div class="cmp-block-title">Testing conditions</div>
                    <table class="cmp-table">
                        <colgroup>
                            <col style="width: 45%" /><col style="width: 27.5%" /><col style="width: 27.5%" />
                        </colgroup>
                        <thead><tr><th>Condition</th><th>This Test</th><th>Reference Test</th></tr></thead>
                        <tbody>
                            <tr v-for="c in result.conditionDiff" :key="c.key" :class="{ 'is-diff': c.differs }">
                                <td class="cell-name">{{ c.name }}</td>
                                <td>{{ display(c.current) }}</td>
                                <td class="muted">{{ display(c.previous) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Bảng so sánh: 5 CỘT CỐ ĐỊNH, không phụ thuộc số measurement -->
                <div v-for="table in flatTables" :key="table.title" class="cmp-block">
                    <!-- Một bảng thì tiêu đề 'table1' vô nghĩa, chỉ hiện khi có nhiều bảng -->
                    <div v-if="flatTables.length > 1" class="cmp-block-title">{{ table.displayTitle || table.title }}</div>
                    <table class="cmp-table">
                        <colgroup>
                            <col style="width: 27%" /><col style="width: 22%" />
                            <col style="width: 14%" /><col style="width: 14%" /><col style="width: 23%" />
                        </colgroup>
                        <thead>
                            <tr><th>Measurement</th><th>Field</th><th>This Test</th><th>Reference Test</th><th>Δ</th></tr>
                        </thead>
                        <tbody>
                            <template v-for="(row, rIdx) in table.rows">
                                <tr v-for="(cell, cIdx) in row.cells" :key="rIdx + '-' + cIdx"
                                    :class="[row.statusClass, { 'row-head': cIdx === 0 }]">
                                    <td v-if="cIdx === 0" :rowspan="row.cells.length" class="cell-name">
                                        <div class="cell-label">{{ row.label || '—' }}</div>
                                        <span v-if="row.status !== 'matched'" class="tag" :class="row.tagClass">
                                            {{ row.tagText }}
                                        </span>
                                    </td>
                                    <td class="cell-field">{{ cell.name }}</td>
                                    <td>{{ display(cell.current) }}</td>
                                    <td class="muted">{{ display(cell.previous) }}</td>
                                    <!-- % xuống dòng riêng để không bao giờ bị cắt cụt.
                                         Màu theo ĐỘ LỚN |%|, không theo dấu. -->
                                    <td class="cell-delta"
                                        :class="['lv-' + levelOf(cell), { 'is-symbol': cell.kind !== 'analog' }]"
                                        :title="cell.note">
                                        <span>{{ deltaMain(cell) }}</span>
                                        <span v-if="deltaPercentText(cell)" class="delta-pct">
                                            {{ deltaPercentText(cell) }}
                                        </span>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </template>
            </div>

            <div v-if="result && hasReferenceData" class="cmp-foot">
                <div class="cmp-stats">
                    <span>{{ result.summary.comparedCells }} compared</span>
                    <span>{{ result.summary.changedCells }} changed</span>
                    <span v-if="result.summary.onlyCurrent">{{ result.summary.onlyCurrent }} new rows</span>
                    <span v-if="result.summary.onlyReference">{{ result.summary.onlyReference }} reference rows</span>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
/* eslint-disable */
import {
    buildSnapshotFromForm, attachAliasFromColumns, compareSnapshots, deltaPercentLevel
} from '@/utils/compareTestResults'
import { resolveCompareKey, resolveCompareDisplay } from '@/config/compare-keys'
import { resolveReferenceValueMapping } from '@/config/reference-value-mappings'
import {
    prepareReferenceValueApplication, applyReferenceValuePlan
} from '@/utils/applyReferenceValues'

export default {
    name: 'CompareResultsPanel',
    props: {
        assetMrid: { type: String, default: '' },
        // Loại thiết bị, để tra cột mốc trong config/compare-keys
        assetKind: { type: String, default: '' },
        testCode: { type: String, default: '' },
        testName: { type: String, default: '' },
        excludeWorkMrid: { type: String, default: '' },
        currentTable: { type: Object, default: () => ({}) },
        currentConditions: { type: Object, default: () => ({}) },
        excludedConditionKeys: { type: Array, default: () => [] },
        columns: { type: Array, default: () => [] },
        assetData: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            options: [],
            selectedWorkTaskMrid: '',
            result: null,
            loading: false,
            referenceRowCount: 0,
            referenceSnapshot: null
        }
    },
    mounted() { this.loadOptions() },
    watch: {
        testCode() { this.loadOptions() },
        assetMrid() { this.loadOptions() }
    },
    computed: {
        selectedOption() {
            return this.options.find(o => o.workTaskMrid === this.selectedWorkTaskMrid) || null
        },
        // Cột mốc để ghép dòng — khai báo trong config/compare-keys, không đoán ở đây
        compareKey() {
            return resolveCompareKey(this.assetKind, this.testCode, this.columns)
        },
        compareDisplay() {
            return {
                ...resolveCompareDisplay(this.assetKind, this.testCode),
                context: { assetData: this.assetData }
            }
        },
        referenceValueMapping() {
            return resolveReferenceValueMapping(this.assetKind, this.testCode)
        },
        supportsReferenceValueApply() {
            return !!this.referenceValueMapping
        },
        canApplyReferenceValues() {
            return !!this.selectedWorkTaskMrid && !!this.referenceSnapshot && !this.loading
        },
        hasReferenceData() { return this.referenceRowCount > 0 },
        /**
         * Trải ma trận (dòng × measurement) thành danh sách dọc.
         * Cột hẹp không chứa nổi 3 cột cho MỖI measurement — cách này giữ đúng
         * 5 cột dù bài test có bao nhiêu cột đo đi nữa.
         */
        flatTables() {
            if (!this.result) return []
            return this.result.tables.map(table => ({
                title: table.title,
                displayTitle: table.displayTitle,
                rows: table.rows.map(row => ({
                    label: row.label,
                    status: row.status,
                    statusClass: row.status === 'onlyCurrent' ? 'is-only-current'
                        : (row.status === 'onlyReference' ? 'is-only-reference' : ''),
                    tagClass: row.status === 'onlyCurrent' ? 'tag-cur' : 'tag-ref',
                    tagText: row.status === 'onlyCurrent' ? 'new' : 'reference',
                    cells: row.cells
                }))
            }))
        }
    },
    methods: {
        display(value) {
            return (value === null || value === undefined || String(value).trim() === '') ? '—' : value
        },
        // Màu theo ĐỘ LỚN |%|: <10 xanh lá, 10–50 vàng, >50 đỏ.
        // Không tô theo dấu, vì tăng là xấu hay tốt còn tuỳ đại lượng.
        // Cột chữ không có % để chia mức, khác nhau thì tô vàng cho dễ soi.
        levelOf(cell) {
            if (cell.note) return ''
            if (cell.kind !== 'analog') return cell.changed ? 'warn' : ''
            return deltaPercentLevel(cell.deltaPercent)
        },
        deltaMain(cell) {
            if (cell.note) return '—'
            // Cột chữ chỉ có hai trạng thái, dùng ký hiệu toán học cho gọn
            if (cell.kind !== 'analog') return cell.changed ? '≠' : '='
            if (cell.delta === null) return '—'
            const sign = cell.delta > 0 ? '+' : ''
            return `${sign}${Number(cell.delta.toFixed(6))}`
        },
        deltaPercentText(cell) {
            if (cell.note || cell.kind !== 'analog' || cell.deltaPercent === null) return ''
            const sign = cell.deltaPercent > 0 ? '+' : ''
            return `${sign}${cell.deltaPercent.toFixed(1)}%`
        },
        /**
         * Đọc lại mọi thứ: danh sách lần test tham chiếu + bảng so sánh.
         *
         * Cần nút này vì bảng so KHÔNG tự cập nhật theo từng phím gõ — dữ liệu
         * bản hiện tại chỉ được chụp lại tại thời điểm nạp. Người dùng sửa số
         * trong bảng nhập, hoặc vừa lưu một job khác trên máy, thì bấm refresh.
         *
         * GIỮ NGUYÊN lần test đang chọn nếu nó vẫn còn trong danh sách — refresh
         * mà nhảy về bản mới nhất thì rất khó chịu khi đang đối chiếu dở.
         */
        async refresh() {
            if (this.loading) return
            this.loading = true
            try {
                await this.loadOptions(this.selectedWorkTaskMrid)
            } finally {
                this.loading = false
            }
        },
        async loadOptions(preferredWorkTaskMrid = '') {
            this.result = null
            this.selectedWorkTaskMrid = ''
            this.options = []
            this.referenceRowCount = 0
            this.referenceSnapshot = null
            if (!window.electronAPI || !window.electronAPI.getComparableTests) return
            if (!this.assetMrid || !this.testCode) return
            try {
                const rs = await window.electronAPI.getComparableTests(
                    this.assetMrid, this.testCode, this.excludeWorkMrid)
                if (!rs || !rs.success) return
                this.options = (rs.data || []).map(item => ({
                    workTaskMrid: item.workTaskMrid,
                    executionDate: item.executionDate,
                    testedBy: item.testedBy,
                    // Source = job nào chứa lần test đó (tên job + loại job)
                    source: [item.workName, item.jobType].filter(Boolean).join(' — ') || 'Untitled job',
                    label: [item.jobType, item.workName, item.executionDate].filter(Boolean).join(' · ')
                        || 'Untitled test'
                }))
                if (this.options.length) {
                    const kept = this.options.some(o => o.workTaskMrid === preferredWorkTaskMrid)
                    this.selectedWorkTaskMrid = kept ? preferredWorkTaskMrid : this.options[0].workTaskMrid
                    await this.loadReference()
                }
            } catch (error) {
                console.error('Load comparable tests failed:', error)
            }
        },
        async loadReference() {
            if (!this.selectedWorkTaskMrid) return
            this.loading = true
            try {
                const keys = this.compareKey.keys
                const rs = await window.electronAPI.getTestSnapshot(this.selectedWorkTaskMrid)
                const reference = attachAliasFromColumns(
                    (rs && rs.success && rs.data) ? rs.data : { conditions: {}, tables: [] },
                    this.columns, keys, this.compareDisplay)
                this.removeExcludedConditions(reference)
                this.referenceSnapshot = reference
                this.referenceRowCount = (reference.tables || [])
                    .reduce((sum, t) => sum + (t.rows ? t.rows.length : 0), 0)
                this.compareCurrentWith(reference)
            } catch (error) {
                console.error('Load reference snapshot failed:', error)
                this.result = null
                this.referenceRowCount = 0
                this.referenceSnapshot = null
            } finally {
                this.loading = false
            }
        },
        compareCurrentWith(reference) {
            const current = buildSnapshotFromForm(
                this.currentTable, this.columns, this.currentConditions,
                this.compareKey.keys, this.compareDisplay)
            this.removeExcludedConditions(current)
            this.result = compareSnapshots(current, reference)
        },
        async applyReferenceValues() {
            if (!this.canApplyReferenceValues || !this.referenceValueMapping) return

            const plan = prepareReferenceValueApplication({
                currentTable: this.currentTable,
                referenceSnapshot: this.referenceSnapshot,
                mapping: this.referenceValueMapping
            })

            if (!plan.matchedCount) {
                this.$message.warning('No matching measurements were found.')
                return
            }

            if (plan.hasExistingValues) {
                try {
                    await this.$confirm(
                        'Applying reference values will replace existing reference values for matched measurements.',
                        'Replace existing reference values?',
                        {
                            confirmButtonText: 'Replace',
                            cancelButtonText: 'Cancel',
                            type: 'warning'
                        }
                    )
                } catch (error) {
                    return
                }
            }

            applyReferenceValuePlan({
                plan,
                mapping: this.referenceValueMapping,
                columns: this.columns,
                reactiveSet: (target, key, value) => this.$set(target, key, value)
            })
            this.compareCurrentWith(this.referenceSnapshot)

            const message = plan.unmatchedCount
                ? `${plan.matchedCount} reference values applied. ${plan.unmatchedCount} measurements were not matched.`
                : `Reference values applied to ${plan.matchedCount} matched measurements.`
            this.$message.success(message)
        },
        removeExcludedConditions(snapshot) {
            if (!snapshot || !snapshot.conditions) return
            for (const key of this.excludedConditionKeys) {
                delete snapshot.conditions[key]
            }
        }
    }
}
</script>

<style scoped>
/* .ti-card / .ti-header / .ti-body được định nghĩa trong TestInformation.vue nhưng
   style ở đó là `scoped` — nó KHÔNG áp vào bên trong component con này, chỉ áp cho
   thẻ gốc. Vì vậy phải khai báo lại y hệt, nếu không header sẽ mất padding và
   khoảng cách icon (đúng lỗi nhìn thấy trên ảnh). */
.ti-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}
.ti-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
    position: relative;
}
.ti-header i { color: #909399; }
.ti-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px;
    min-height: 0;
}

.cmp-card { height: 100%; }

.cmp-actions {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    display: flex; align-items: center; gap: 4px;
}
.cmp-act {
    cursor: pointer; color: #b0b4bb; font-size: 13px;
    width: 20px; height: 20px; border-radius: 3px;
    display: flex; align-items: center; justify-content: center;
    transition: color 0.15s, background 0.15s;
}
.cmp-act:hover { color: #409eff; background: #ecf5ff; }

/* Quay trong lúc đang đọc lại dữ liệu */
.cmp-act.spinning { animation: cmp-spin 0.8s linear infinite; color: #409eff; }
@keyframes cmp-spin { to { transform: rotate(360deg); } }

/* min-height:0 là bắt buộc: mặc định flex item không co nhỏ hơn nội dung,
   thiếu nó thì .cmp-scroll phình ra thay vì cuộn. */
.cmp-body { display: flex; flex-direction: column; gap: 10px; min-height: 0; overflow: hidden; }

.cmp-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
/* Khối bảng giữ nguyên chiều cao, không bị flex bóp lại */
.cmp-scroll > .cmp-block { flex: 0 0 auto; }

.cmp-pick { flex: 0 0 auto; display: flex; align-items: center; gap: 10px; }
.cmp-pick-label { font-size: 12px; color: #606266; white-space: nowrap; }
.cmp-pick-select { flex: 1; min-width: 0; }
.cmp-apply-row {
    flex: 0 0 auto;
    display: flex;
    justify-content: flex-end;
}
.cmp-apply-row i { margin-right: 5px; }

.cmp-meta {
    flex: 0 0 auto;
    display: flex; flex-direction: column; gap: 8px;
    padding: 8px 10px; border: 1px solid #ebeef5; border-radius: 4px; background: #fcfcfd;
}
.cmp-meta-row { display: flex; align-items: flex-start; gap: 8px; }
.cmp-meta-row > i { color: #b0b4bb; font-size: 12px; margin-top: 2px; width: 13px; text-align: center; }
.cmp-meta-text { min-width: 0; }
.cmp-meta-label { font-size: 12px; color: #a8abb2; line-height: 1.3; }
.cmp-meta-value { font-size: 12px; color: #303133; line-height: 1.4; word-break: break-word; }

.cmp-state { padding: 28px 12px; text-align: center; color: #a8abb2; }
.cmp-state i { font-size: 22px; display: block; margin-bottom: 8px; }
.cmp-state p { margin: 0; font-size: 12px; line-height: 1.5; }

/* Bỏ overflow:hidden để position:sticky của <thead> còn tác dụng */
.cmp-block { border: 1px solid #ebeef5; border-radius: 4px; }
.cmp-block-title {
    padding: 5px 10px; background: #f7f8fa; font-size: 12px;
    font-weight: 600; color: #606266; border-bottom: 1px solid #ebeef5;
    border-radius: 4px 4px 0 0;
}

/* 12px cho khớp với bảng nhập liệu và các card khác trong app */
.cmp-table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
.cmp-table th, .cmp-table td {
    padding: 4px 8px; text-align: left;
    border-bottom: 1px solid #f2f3f5;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/* Cuộn dài vẫn phải biết cột nào là cột nào → ghim hàng tiêu đề */
.cmp-table th {
    background: #fcfcfd; font-weight: 600; color: #909399;
    position: sticky; top: 0; z-index: 1;
    box-shadow: inset 0 -1px 0 #ebeef5;
}
.cmp-table tbody tr:last-child td { border-bottom: none; }
.cmp-table td.cell-name { border-right: 1px solid #f2f3f5; white-space: normal; vertical-align: top; }
.cell-label { line-height: 1.4; }
/* Cho xuống dòng để 'Condition indicator' hiện đủ chữ thay vì cắt cụt */
.cmp-table td.cell-field { color: #606266; white-space: normal; line-height: 1.3; }
.cell-delta { color: #303133; font-variant-numeric: tabular-nums; white-space: normal; }
.delta-pct { display: block; color: #909399; }

/* Ngưỡng cảnh báo theo |Δ%|.
   Xanh và đỏ lấy sắc đậm hơn màu gốc Element UI (#67c23a / #f56c6c) cho dễ đọc
   ở cỡ chữ 12px; vàng giữ nguyên vì đậm thêm sẽ ngả nâu, khó phân biệt với đỏ. */
.cell-delta.lv-ok   { color: #4a9128; font-weight: 600; }
.cell-delta.lv-warn { color: #e6a23c; font-weight: 600; }
.cell-delta.lv-bad  { color: #cf3a3a; font-weight: 600; }
.lv-ok   .delta-pct { color: #4a9128; }
.lv-warn .delta-pct { color: #e6a23c; }
.lv-bad  .delta-pct { color: #cf3a3a; }

/* Cột chữ chỉ hiện một ký hiệu = hoặc ≠. Một chữ cái tô màu thì quá mờ nhạt,
   nên ≠ được tô nền vàng cho nổi; dấu = giữ xám nhạt, không gây chú ý. */
.cell-delta.is-symbol { font-size: 13px; text-align: center; }
.cell-delta.is-symbol.lv-warn {
    background: #fdf6ec;
    color: #b8791a;
    font-weight: 700;
}
.cell-delta.is-symbol:not(.lv-warn) { color: #b0b4bb; font-weight: 400; }
.muted { color: #a8abb2; }
.row-head td { border-top: 1px solid #ebeef5; }
.cmp-table tbody tr:first-child td { border-top: none; }

.is-only-current td { background: #f6f9fe; }
.is-only-reference td { background: #fdfaf5; }
.is-diff td { background: #fdf8ef; }

.tag { display: inline-block; font-size: 9px; line-height: 14px; padding: 0 5px; border-radius: 7px; margin-top: 3px; }
.tag-cur { background: #e8f1fc; color: #2266b5; }
.tag-ref { background: #f7ecdc; color: #96601b; }

.cmp-foot { flex: 0 0 auto; padding-top: 8px; border-top: 1px solid #f2f3f5; }
.cmp-stats { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: #606266; }
</style>
