/**
 * Bảng kết quả dùng chung cho các thao tác chạy hàng loạt trên cây
 * (upload nhiều node, download nhiều node).
 *
 * Mỗi dòng: { key, name, typeLabel, status: 'success'|'failed'|'skipped', message }
 */
export default {
    methods: {
        showOpResult(title, results) {
            this.opResultTitle = title || ''
            this.opResults = results || []
            this.opResultVisible = true

            const failed = this.opResults.filter(r => r.status === 'failed').length
            const done = this.opResults.filter(r => r.status === 'success').length
            if (failed) {
                this.$message.warning(`${title}: ${done}/${this.opResults.length} done, ${failed} failed`)
            } else {
                this.$message.success(`${title} completed`)
            }
        },

        closeOpResult() {
            this.opResultVisible = false
            this.opResults = []
        },

        /** Nhãn hiển thị của node trong bảng kết quả */
        getOpNodeName(node) {
            if (!node) return 'Unnamed'
            return node.apparatus_id || node.serial_number || node.serial_no
                || node.aliasName || node.name || node.mrid || 'Unnamed'
        },

        getOpNodeTypeLabel(node) {
            if (!node) return ''
            if (node.mode === 'asset') return node.asset || 'Asset'
            if (node.mode === 'job') return `${node.job || 'Asset'} job`
            if (node.mode === 'voltageLevel') return 'Voltage level'
            return node.mode || ''
        }
    }
}
