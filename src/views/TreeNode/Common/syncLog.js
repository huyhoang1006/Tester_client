/**
 * Ghi log upload / download vào bảng log của app (configuration_event + activity_record),
 * chính là nguồn dữ liệu của LogBar.
 *
 * Mọi lời gọi đều "fire and forget": ghi log hỏng không được phép làm hỏng
 * luồng upload/download đang chạy.
 */
export default {
    methods: {
        _syncLogNodeName(node) {
            if (!node) return 'Unnamed'
            return node.apparatus_id || node.serial_number || node.serial_no
                || node.aliasName || node.name || node.mrid || 'Unnamed'
        },

        _syncLogNodeType(node) {
            if (!node) return 'Node'
            if (node.mode === 'asset') return node.asset || 'Asset'
            if (node.mode === 'job') return `${node.job || 'Asset'} job`
            if (node.mode === 'voltageLevel') return 'Voltage level'
            return node.mode || 'Node'
        },

        /**
         * @param action     'UPLOAD' | 'DOWNLOAD'
         * @param target     { objectType, objectName, objectId }
         * @param success    true/false
         * @param message    lý do khi thất bại
         */
        async writeSyncLogEntry(action, target, success, message) {
            try {
                if (!window.electronAPI || !window.electronAPI.writeAuditLogEntry) return

                const objectType = (target && target.objectType) || 'Node'
                const objectName = (target && target.objectName) || 'Unnamed'
                const verb = action === 'DOWNLOAD' ? 'Download' : 'Upload'
                const description = success
                    ? `${verb} succeeded: ${objectType} "${objectName}"`
                    : `${verb} failed: ${objectType} "${objectName}" - ${message || 'Unknown error'}`

                await window.electronAPI.writeAuditLogEntry({
                    objectType,
                    objectId: (target && target.objectId) || null,
                    objectName,
                    // Category chỉ là UPLOAD / DOWNLOAD; thành hay bại nằm ở severity,
                    // LogBar dùng severity để chọn icon đầu dòng.
                    action,
                    severity: success ? 'success' : 'failed',
                    description,
                    user: this.$store && this.$store.state && this.$store.state.user
                })
            } catch (error) {
                console.error('Write sync log failed:', error)
            }
        },

        /** Ghi log cho 1 node trên cây */
        async writeSyncLog(action, node, success, message) {
            await this.writeSyncLogEntry(action, {
                objectType: this._syncLogNodeType(node),
                objectName: this._syncLogNodeName(node),
                objectId: node && (node.mrid || node.id) || null
            }, success, message)
        },

        /** Ghi log cho cả mảng kết quả (upload/download nhiều node) */
        async writeSyncLogBatch(action, rows) {
            for (const row of (rows || [])) {
                if (row.status === 'skipped') continue
                await this.writeSyncLogEntry(action, {
                    objectType: row.typeLabel,
                    objectName: row.name,
                    objectId: row.mrid || null
                }, row.status === 'success', row.message)
            }
        }
    }
}
