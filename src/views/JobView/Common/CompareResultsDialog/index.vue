<template>
    <el-dialog
        title="Compare with previous results"
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        @close="$emit('update:visible', false)"
        width="1000px"
        :close-on-click-modal="false"
        custom-class="compare-dialog">

        <div class="cmp-bar">
            <span class="cmp-label">Reference result</span>
            <el-select
                v-model="selectedWorkTaskMrid"
                size="mini"
                class="cmp-select"
                :disabled="!options.length"
                placeholder="Không có lần test nào trước đó"
                @change="loadReference">
                <el-option
                    v-for="opt in options"
                    :key="opt.workTaskMrid"
                    :label="opt.label"
                    :value="opt.workTaskMrid">
                </el-option>
            </el-select>
            <span class="cmp-note">Chỉ để tham khảo — không ảnh hưởng dữ liệu đang nhập.</span>
        </div>

        <div v-if="!options.length" class="cmp-empty">
            Thiết bị này chưa có lần test <b>{{ testName || testCode }}</b> nào khác trên máy.
        </div>

        <div v-else v-loading="loading">
            <!-- Điều kiện thí nghiệm hai lần đo -->
            <div v-if="result && result.conditionDiff.length" class="cmp-card">
                <div class="cmp-card-title">Testing conditions</div>
                <table class="cmp-table">
                    <thead>
                        <tr><th>Condition</th><th>Current</th><th>Previous</th></tr>
                    </thead>
                    <tbody>
                        <tr v-for="c in result.conditionDiff" :key="c.key" :class="{ 'row-differs': c.differs }">
                            <td>{{ c.name }}</td>
                            <td>{{ display(c.current) }}</td>
                            <td>{{ display(c.previous) }}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="cmp-hint">
                    Điều kiện đo khác nhau có thể làm sai lệch so sánh — nhất là các phép đo phụ thuộc nhiệt độ.
                </div>
            </div>

            <!-- Bảng so sánh -->
            <div v-for="table in (result ? result.tables : [])" :key="table.title" class="cmp-card">
                <div class="cmp-card-title">{{ table.title }}</div>
                <table class="cmp-table">
                    <thead>
                        <tr>
                            <th class="col-label">Measurement</th>
                            <template v-for="col in table.columns">
                                <th :key="col.measurementId + '-c'">{{ col.name }}<br><small>Current</small></th>
                                <th :key="col.measurementId + '-p'"><small>Previous</small></th>
                                <th :key="col.measurementId + '-d'"><small>Δ</small></th>
                            </template>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, idx) in table.rows" :key="idx" :class="rowClass(row)">
                            <td class="col-label">
                                {{ row.label || '—' }}
                                <span v-if="row.status === 'onlyCurrent'" class="tag tag-cur">chỉ có ở bản hiện tại</span>
                                <span v-if="row.status === 'onlyReference'" class="tag tag-ref">chỉ có ở bản tham chiếu</span>
                            </td>
                            <template v-for="cell in row.cells">
                                <td :key="cell.measurementId + '-c'">{{ display(cell.current) }}</td>
                                <td :key="cell.measurementId + '-p'" class="muted">{{ display(cell.previous) }}</td>
                                <td :key="cell.measurementId + '-d'" class="delta" :title="cell.note">
                                    {{ deltaText(cell) }}
                                </td>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="result" class="cmp-summary">
                So sánh {{ result.summary.comparedCells }} ô ·
                {{ result.summary.changedCells }} ô thay đổi ·
                {{ result.summary.onlyCurrent }} dòng chỉ có ở bản hiện tại ·
                {{ result.summary.onlyReference }} dòng chỉ có ở bản tham chiếu
            </div>
        </div>

        <span slot="footer">
            <el-button size="small" type="primary" @click="$emit('update:visible', false)">Close</el-button>
        </span>
    </el-dialog>
</template>

<script>
/* eslint-disable */
import { buildSnapshotFromForm, compareSnapshots } from '@/utils/compareTestResults'

export default {
    name: 'CompareResultsDialog',
    props: {
        visible: { type: Boolean, default: false },
        // thiết bị + bài test để tìm các lần test trước
        assetMrid: { type: String, default: '' },
        testCode: { type: String, default: '' },
        testName: { type: String, default: '' },
        excludeWorkMrid: { type: String, default: '' },
        // dữ liệu ĐANG NHẬP trên form (chưa có trong DB)
        currentTable: { type: Object, default: () => ({}) },
        currentConditions: { type: Object, default: () => ({}) },
        columns: { type: Array, default: () => [] }
    },
    data() {
        return {
            options: [],
            selectedWorkTaskMrid: '',
            result: null,
            loading: false
        }
    },
    watch: {
        visible: {
            immediate: true,
            handler(open) { if (open) this.loadOptions() }
        }
    },
    methods: {
        display(value) {
            return (value === null || value === undefined || String(value).trim() === '') ? '—' : value
        },
        rowClass(row) {
            if (row.status === 'onlyCurrent') return 'row-only-current'
            if (row.status === 'onlyReference') return 'row-only-reference'
            return ''
        },
        // Δ để TRUNG TÍNH, không tô xanh/đỏ theo dấu: với tanδ, dòng rò, điện trở
        // tiếp xúc thì tăng là xấu — tô theo dấu sẽ khiến người đọc hiểu ngược.
        deltaText(cell) {
            if (cell.note) return '—'
            if (cell.kind !== 'analog') return cell.changed ? 'đổi' : ''
            if (cell.delta === null) return '—'
            const sign = cell.delta > 0 ? '+' : ''
            const percent = cell.deltaPercent === null ? '' : ` (${sign}${cell.deltaPercent.toFixed(1)}%)`
            return `${sign}${Number(cell.delta.toFixed(6))}${percent}`
        },
        async loadOptions() {
            this.result = null
            this.selectedWorkTaskMrid = ''
            this.options = []
            if (!window.electronAPI || !window.electronAPI.getComparableTests) return
            try {
                const rs = await window.electronAPI.getComparableTests(
                    this.assetMrid, this.testCode, this.excludeWorkMrid)
                if (!rs || !rs.success) return
                this.options = (rs.data || []).map(item => ({
                    workTaskMrid: item.workTaskMrid,
                    label: [item.jobType, item.executionDate, item.workName].filter(Boolean).join(' — ')
                        || item.workTaskMrid
                }))
                if (this.options.length) {
                    this.selectedWorkTaskMrid = this.options[0].workTaskMrid
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
                const rs = await window.electronAPI.getTestSnapshot(this.selectedWorkTaskMrid)
                const reference = (rs && rs.success && rs.data) ? rs.data : { conditions: {}, tables: [] }
                const current = buildSnapshotFromForm(this.currentTable, this.columns, this.currentConditions)
                this.result = compareSnapshots(current, reference)
            } catch (error) {
                console.error('Load reference snapshot failed:', error)
                this.result = null
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style scoped>
.cmp-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.cmp-label { font-size: 12px; color: #606266; }
.cmp-select { width: 340px; }
.cmp-note { font-size: 11px; color: #909399; margin-left: auto; }
.cmp-empty { padding: 24px; text-align: center; color: #909399; font-size: 13px; }
.cmp-card { border: 1px solid #e4e7ed; border-radius: 4px; margin-bottom: 12px; overflow: auto; }
.cmp-card-title { padding: 6px 10px; background: #f5f7fa; font-size: 12px; font-weight: 600; }
.cmp-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.cmp-table th, .cmp-table td { border: 1px solid #ebeef5; padding: 4px 8px; text-align: left; white-space: nowrap; }
.cmp-table th { background: #fafafa; font-weight: 600; }
.cmp-table th small { font-weight: 400; color: #909399; }
.col-label { min-width: 180px; white-space: normal; }
.muted { color: #909399; }
.delta { color: #606266; }
.row-only-current { background: #f4f8ff; }
.row-only-reference { background: #fbf7f0; }
.row-differs td { background: #fdf6ec; }
.tag { font-size: 10px; padding: 0 4px; border-radius: 2px; margin-left: 6px; }
.tag-cur { background: #e6f1fb; color: #146ebe; }
.tag-ref { background: #f6e9d8; color: #a15c00; }
.cmp-hint { padding: 6px 10px; font-size: 11px; color: #909399; border-top: 1px solid #ebeef5; }
.cmp-summary { font-size: 11px; color: #909399; padding-top: 4px; }
</style>
