/* eslint-disable */
/**
 * DC Winding Res Prim/Sec/Tert — số pha theo khai báo asset.
 *  - Máy 1 pha: chỉ có dòng của pha đã chọn, không có "Dev within phases (%)".
 *  - Asset đổi pha mà bảng còn kết quả của pha cũ → hỏi user:
 *      Discard test results  |  Move test results to phase mới
 */
import {
    ALL_PHASES, transformerPhases, detectPhaseMismatch, rebuildRowsForPhases, moveRowsToPhase
} from '@/utils/transformerPhases'
import { askPhaseChange } from '@/utils/phaseChangeDialog'

export default {
    data() {
        return { phaseCheckRunning: false, phaseKeepUnchanged: false }
    },
    computed: {
        assetPhases() { return transformerPhases(this.assetData) },
        phaseCount() { return this.assetPhases.length },
        // Lựa chọn pha trên từng dòng: máy 1 pha đã chọn pha → chỉ pha đó
        phaseOptions() {
            const selected = this.assetPhases.filter(Boolean)
            return this.phaseCount === 1 && selected.length ? selected : ALL_PHASES
        },
        phaseSignature() {
            const wc = (this.assetData && this.assetData.winding_configuration) || {}
            return `${wc.phases || ''}|${wc.phase || ''}`
        }
    },
    watch: {
        phaseSignature() { this.$nextTick(this.checkPhaseMismatch) }
    },
    mounted() {
        this.$nextTick(this.checkPhaseMismatch)
    },
    methods: {
        tableRows() {
            return this.testData && this.testData.table ? this.testData.table.table1 : null
        },
        replaceRows(rows) {
            this.$set(this.testData.table, 'table1', rows)
            this.computeFields()
        },
        async checkPhaseMismatch() {
            if (this.phaseCheckRunning) return
            const rows = this.tableRows()
            const mismatch = detectPhaseMismatch(rows, this.assetPhases)
            if (!mismatch) return

            // Đổi giữa 3 pha ↔ 1 pha mà chưa có kết quả → dựng lại theo pha mới, không cần hỏi
            // (máy 1 pha đổi pha thì luôn hỏi, xét theo pha — xem bên dưới)
            if (!mismatch.singleSwitch && !mismatch.hasResults) {
                this.replaceRows(rebuildRowsForPhases(rows, this.assetPhases, this.rowData, false))
                return
            }

            // Máy 1 pha đổi pha: dùng chung hộp thoại 3 lựa chọn với lúc lưu asset
            if (mismatch.singleSwitch) {
                if (this.phaseKeepUnchanged) return
                this.phaseCheckRunning = true
                try {
                    const choice = await askPhaseChange({
                        title: `Test results exist for phase ${mismatch.oldPhase}`,
                        message: `This test already has results for phase ${mismatch.oldPhase}, but the transformer is now configured as single-phase ${mismatch.newPhase}. What should happen to these results?`,
                        oldPhase: mismatch.oldPhase,
                        newPhase: mismatch.newPhase
                    })
                    if (choice === 'move') {
                        moveRowsToPhase(rows, mismatch.expected[0])
                        this.computeFields()
                        this.$message.success(`Test results were moved to phase ${mismatch.newPhase}`)
                    } else if (choice === 'delete') {
                        // Xoá hẳn bài test khỏi job — trang job (Transformer/index.vue) gỡ tab test,
                        // lưu job là xoá khỏi DB
                        this.$emit('remove-test')
                        this.$message.success('The test was removed from the job. Save the job to apply.')
                    } else if (choice === 'keep') {
                        // Giữ nguyên: không hỏi lại trong lần mở này
                        this.phaseKeepUnchanged = true
                    }
                } finally {
                    this.phaseCheckRunning = false
                }
                return
            }

            this.phaseCheckRunning = true
            const moveLabel = mismatch.singleSwitch
                ? `Move test results to phase ${mismatch.newPhase}`
                : 'Keep results of matching phases'
            const message = mismatch.singleSwitch
                ? `This test already has results for phase ${mismatch.oldPhase}, but the transformer is now configured as single-phase ${mismatch.newPhase}.`
                : `This test already has results for phase(s) ${mismatch.oldPhase}, but the transformer is now configured with phase(s) ${mismatch.newPhase}.`
            try {
                await this.$confirm(message, 'Phase changed', {
                    confirmButtonText: moveLabel,
                    cancelButtonText: 'Discard test results',
                    distinguishCancelAndClose: true,
                    type: 'warning'
                })
                if (mismatch.singleSwitch) {
                    moveRowsToPhase(rows, mismatch.expected[0])
                    this.computeFields()
                } else {
                    this.replaceRows(rebuildRowsForPhases(rows, this.assetPhases, this.rowData, true))
                }
                this.$message.success('Test results updated to the new phase configuration')
            } catch (action) {
                if (action === 'cancel') {
                    this.replaceRows(rebuildRowsForPhases(rows, this.assetPhases, this.rowData, false))
                    this.$message.success('Test results of the old phase were discarded')
                }
                // Đóng hộp thoại (X) → giữ nguyên, lần mở sau hỏi lại
            } finally {
                this.phaseCheckRunning = false
            }
        }
    }
}
