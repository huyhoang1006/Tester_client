<template>
    <el-dialog
        title="Importing"
        :visible="visible"
        width="420px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        custom-class="import-progress-dialog"
        append-to-body>

        <div class="prog-body">
            <div class="prog-current">
                <span class="prog-spinner"><i class="el-icon-loading"></i></span>
                <span class="prog-label">{{ currentText }}</span>
            </div>

            <el-progress
                :percentage="percent"
                :stroke-width="14"
                :text-inside="true"
                status="success" />

            <div class="prog-count">{{ done }} / {{ total }} {{ unitLabel }}</div>
        </div>
    </el-dialog>
</template>

<script>
export default {
    name: 'ImportProgressDialog',
    props: {
        visible: { type: Boolean, default: false },
        currentName: { type: String, default: '' },
        currentType: { type: String, default: '' },
        done: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        unitLabel: { type: String, default: 'nodes' },
    },
    computed: {
        percent() {
            if (!this.total) return 0
            return Math.min(100, Math.round((this.done / this.total) * 100))
        },
        currentText() {
            if (!this.currentName) return 'Preparing...'
            const t = this.currentType ? (this.labelOf(this.currentType) + ': ') : ''
            return 'Importing ' + t + this.currentName
        },
    },
    methods: {
        labelOf(type) {
            const m = {
                organisation: 'Organisation', substation: 'Substation',
                voltageLevel: 'Voltage Level', bay: 'Bay', job: 'Job',
                testingEquipment: 'Testing Equipment',
            }
            return m[type] || type
        },
    },
}
</script>

<style scoped>
.prog-body { padding: 4px 2px; }
.prog-current {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    font-size: 14px;
    color: #303133;
}
.prog-spinner { color: #409eff; font-size: 16px; }
.prog-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.prog-count {
    margin-top: 10px;
    text-align: right;
    font-size: 12px;
    color: #909399;
}
</style>
