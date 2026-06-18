<template>
    <el-dialog
        title="Resolve mRID Conflicts"
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        width="780px"
        custom-class="app-dialog import-conflict-dialog"
        :close-on-click-modal="false"
        @close="handleCancel">

        <div class="conflict-body">
            <!-- Tóm tắt -->
            <div class="conflict-summary">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>
                    Found <b>{{ conflicts.length }}</b> node(s) whose mRID already exists in the database.
                    Choose an action for each before importing.
                </span>
            </div>

            <!-- Apply-to-all -->
            <div class="apply-all-bar">
                <span class="apply-all-label">Apply to all:</span>
                <el-radio-group v-model="applyAll" size="mini" @change="handleApplyAll">
                    <el-radio-button :label="ACTION.OVERWRITE">Overwrite value</el-radio-button>
                    <el-radio-button :label="ACTION.NEW">Create new</el-radio-button>
                    <el-radio-button :label="ACTION.USE_EXISTING">Use existing</el-radio-button>
                </el-radio-group>
            </div>

            <!-- Danh sách node trùng -->
            <div class="conflict-list">
                <div v-for="(c, idx) in rows" :key="c.mrid + '_' + idx" class="conflict-item">
                    <div class="conflict-info">
                        <div class="conflict-name">
                            <i :class="iconOf(c.type)"></i>
                            <span class="name">{{ c.nameInFile || '(no name)' }}</span>
                            <span class="type-badge">{{ labelOf(c.type) }}</span>
                        </div>
                        <div class="conflict-path">
                            <span class="path-label">Exists at:</span>
                            <span class="path-text">{{ c.existsAt.pathText || c.existsAt.name || '(unknown location)' }}</span>
                        </div>
                        <div class="conflict-mrid">mRID: {{ c.mrid }}</div>
                    </div>

                    <div class="conflict-actions">
                        <el-radio-group v-model="c.action" size="mini">
                            <el-radio :label="ACTION.OVERWRITE">Overwrite value</el-radio>
                            <el-radio :label="ACTION.NEW">Create new</el-radio>
                            <el-radio :label="ACTION.USE_EXISTING">Use existing</el-radio>
                        </el-radio-group>

                        <!-- Cảnh báo khi dùng cái đã có -->
                        <div v-if="c.action === ACTION.USE_EXISTING" class="use-existing-warning">
                            <i class="fa-solid fa-circle-info"></i>
                            Using the existing node may cause issues — other data may reference it,
                            or it may reference elsewhere. Its children will still be asked.
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div slot="footer" class="dialog-footer">
            <el-button class="footer-btn" size="small" @click="handleCancel">Cancel</el-button>
            <el-button class="footer-btn" size="small" type="primary" @click="handleConfirm">
                Import
            </el-button>
        </div>
    </el-dialog>
</template>

<script>
// Hằng số khớp với CONFLICT_ACTION trong mridConflictScan.js
const ACTION = {
    OVERWRITE: 'overwrite',
    NEW: 'new',
    USE_EXISTING: 'use_existing',
}

const TYPE_LABEL = {
    organisation: 'Organisation',
    substation: 'Substation',
    voltageLevel: 'Voltage Level',
    bay: 'Bay',
    job: 'Job',
}
const TYPE_ICON = {
    organisation: 'fa-solid fa-building',
    substation: 'fa-solid fa-location-dot',
    voltageLevel: 'fa-solid fa-bolt',
    bay: 'fa-solid fa-layer-group',
    job: 'fa-solid fa-clipboard-list',
}

export default {
    name: 'ImportConflictDialog',
    props: {
        visible: { type: Boolean, default: false },
        // conflicts[] từ scanTreeConflicts: { mrid, type, nameInFile, existsAt:{mode,name,pathText}, node }
        conflicts: { type: Array, default: () => [] },
    },
    data() {
        return {
            ACTION,
            applyAll: null,
            // bản sao có thêm field `action` cho mỗi dòng (mặc định NEW = an toàn nhất)
            rows: [],
        }
    },
    watch: {
        // Mỗi lần mở dialog / đổi danh sách → khởi tạo lại rows
        conflicts: {
            immediate: true,
            handler(list) {
                this.rows = (list || []).map(c => ({ ...c, action: ACTION.NEW }))
                this.applyAll = null
            },
        },
    },
    methods: {
        labelOf(type) { return TYPE_LABEL[type] || type },
        iconOf(type) { return TYPE_ICON[type] || 'fa-solid fa-circle' },

        handleApplyAll(val) {
            this.rows.forEach(r => { r.action = val })
        },

        handleCancel() {
            this.$emit('update:visible', false)
            this.$emit('cancel')
        },

        handleConfirm() {
            // Trả map mrid → action để service xử lý import theo quyết định
            const decisions = {}
            this.rows.forEach(r => { decisions[r.mrid] = r.action })
            this.$emit('confirm', decisions)
            this.$emit('update:visible', false)
        },
    },
}
</script>

<style scoped>
.conflict-body {
    max-height: 60vh;
    overflow-y: auto;
}

.conflict-summary {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #fdf6ec;
    border: 1px solid #faecd8;
    color: #c88c2c;
    border-radius: 4px;
    padding: 10px 12px;
    font-size: 13px;
    margin-bottom: 12px;
}
.conflict-summary i { margin-top: 2px; }

.apply-all-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #e4e7ed;
}
.apply-all-label { font-size: 13px; color: #606266; font-weight: 600; }

.conflict-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.conflict-item {
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 10px 12px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    background: #fff;
}

.conflict-info { flex: 1 1 auto; min-width: 0; overflow: hidden; }
.conflict-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #303133;
    font-weight: 600;
    margin-bottom: 4px;
    min-width: 0;
}
.conflict-name .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    flex: 1 1 auto;
}
.type-badge {
    flex: 0 0 auto;
    white-space: nowrap;
    font-size: 11px;
    font-weight: 500;
    color: #146ebe;
    background: #ecf5ff;
    border-radius: 3px;
    padding: 1px 6px;
}
.conflict-path {
    font-size: 12px;
    color: #606266;
    margin-bottom: 2px;
    word-break: break-word;
}
.path-label { color: #909399; margin-right: 4px; }
.path-text { color: #409eff; }
.conflict-mrid {
    font-size: 11px;
    color: #c0c4cc;
    font-family: monospace;
    word-break: break-all;
}

.conflict-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 0 0 240px;
    width: 240px;
}
.conflict-actions >>> .el-radio {
    display: block;
    margin: 0 0 2px 0;
    font-size: 12px;
}

.use-existing-warning {
    font-size: 11px;
    color: #e6a23c;
    background: #fdf6ec;
    border-radius: 3px;
    padding: 4px 6px;
    line-height: 1.4;
    margin-top: 2px;
}
.use-existing-warning i { margin-right: 4px; }

.dialog-footer { text-align: right; }
.footer-btn { min-width: 80px; }
</style>