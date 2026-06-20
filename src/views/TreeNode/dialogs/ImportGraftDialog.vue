<template>
    <el-dialog
        title="Confirm Import Location"
        :visible.sync="innerVisible"
        width="560px"
        :close-on-click-modal="false"
        @close="onCancel">

        <div class="graft-body">
            <div class="graft-alert">
                <i class="el-icon-warning-outline"></i>
                <span>
                    The file's tree starts higher than the selected target.
                    To keep links valid, some top levels will be skipped.
                </span>
            </div>

            <div class="graft-row">
                <span class="graft-label">Target node:</span>
                <span class="graft-value">
                    <span class="badge">{{ labelOf(targetMode) }}</span>
                    {{ targetName || '(no name)' }}
                </span>
            </div>

            <div class="graft-row" v-if="skippedList.length">
                <span class="graft-label">Will skip:</span>
                <span class="graft-value">
                    <span v-for="s in skippedList" :key="s.mode" class="skip-chip">
                        {{ labelOf(s.mode) }} <b>×{{ s.count }}</b>
                    </span>
                </span>
            </div>

            <div class="graft-row">
                <span class="graft-label">Will graft:</span>
                <span class="graft-value">
                    <b>{{ graftCount }}</b>
                    <span class="badge">{{ labelOf(graftMode) }}</span>
                    <template v-if="graftCount > 1">nodes</template>
                    <template v-else>node</template>
                    into <b>{{ targetName || labelOf(targetMode) }}</b>
                </span>
            </div>

            <div class="graft-note">
                Child items (sub-levels, assets, jobs) under each grafted node are imported too.
            </div>
        </div>

        <span slot="footer">
            <el-button class="footer-btn" @click="onCancel">Cancel</el-button>
            <el-button class="footer-btn" type="primary" @click="onConfirm">Confirm Import</el-button>
        </span>
    </el-dialog>
</template>

<script>
const TYPE_LABEL = {
    organisation: 'Organisation',
    substation: 'Substation',
    voltageLevel: 'Voltage Level',
    bay: 'Bay',
    asset: 'Asset',
    job: 'Job',
}

export default {
    name: 'ImportGraftDialog',
    props: {
        visible: { type: Boolean, default: false },
        targetMode: { type: String, default: '' },
        targetName: { type: String, default: '' },
        graftMode: { type: String, default: '' },
        graftCount: { type: Number, default: 0 },
        // [{ mode, count }]
        skippedList: { type: Array, default: () => [] },
    },
    computed: {
        innerVisible: {
            get() { return this.visible },
            set(v) { this.$emit('update:visible', v) },
        },
    },
    methods: {
        labelOf(mode) { return TYPE_LABEL[mode] || mode },
        onCancel() { this.$emit('cancel') },
        onConfirm() { this.$emit('confirm') },
    },
}
</script>

<style scoped>
.graft-body { font-size: 14px; color: #303133; }
.graft-alert {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #fdf6ec;
    border: 1px solid #faecd8;
    color: #b88230;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 16px;
    font-size: 13px;
    line-height: 1.5;
}
.graft-alert i { font-size: 16px; margin-top: 1px; }
.graft-row {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
    align-items: baseline;
}
.graft-label {
    flex: 0 0 110px;
    color: #909399;
    font-size: 13px;
}
.graft-value { flex: 1 1 auto; }
.badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 500;
    color: #146ebe;
    background: #ecf5ff;
    border-radius: 3px;
    padding: 1px 6px;
    margin: 0 2px;
}
.skip-chip {
    display: inline-block;
    font-size: 12px;
    color: #909399;
    background: #f4f4f5;
    border-radius: 3px;
    padding: 1px 8px;
    margin: 0 4px 4px 0;
}
.graft-note {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    font-style: italic;
}
.footer-btn { min-width: 90px; }
</style>
