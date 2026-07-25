<template>
    <div class="logbar">
        <div class="option-bar">
            <div class="log-summary">
                <span>{{ filteredLogData.length }} / {{ logData.length }} logs</span>
                <span v-if="selectedIds.length" class="selected-count">{{ selectedIds.length }} selected</span>
            </div>
            <div class="log-actions">
                <input
                    v-model="filterText"
                    class="filter-input"
                    type="text"
                    placeholder="Filter..."
                >
                <button class="icon-btn" title="Delete selected logs" :disabled="!selectedIds.length || isDeleting" @click="deleteSelectedLogs">
                    <i class="fa-solid fa-trash"></i>
                </button>
                <button class="icon-btn danger" title="Delete all logs" :disabled="!logData.length || isDeleting" @click="deleteAllLogs">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
                <i style="font-size: 15px; margin-right: 5px;" @click="hideLog" class="fa-solid fa-square-caret-down"></i>
                <i style="font-size: 15px;" class="fa-solid fa-square-caret-up"></i>
                <i :class="['fa-solid', 'fa-rotate-right', { spin: isLoadingReload }]" style="font-size: 15px;" @click="reloadLog"></i>
            </div>
        </div>
        <div class="table-content">
            <div class="header">
                <div class="icon"></div>
                <div class="header-icon">Date & Time</div>
                <div class="header-icon">Category</div>
                <div class="header-icon">Object</div>
                <div class="header-message">Message</div>
            </div>
            <div class="content-log">
                <div
                    v-for="(item, index) in filteredLogData"
                    :key="item.mrid || index"
                    class="content"
                    :class="{ selected: isSelected(item), active: activeLog && activeLog.mrid === item.mrid }"
                    @click="selectLog(item, $event)"
                    @dblclick="openLogDetail(item)"
                >
                    <div v-if="item.type === 'INSERT'" class="icon"><i style="color: green; background-color: white;" class="fa-solid fa-square-check"></i></div>
                    <div v-else-if="item.type === 'UPDATE'" class="icon"><i style="background-color: white; color: #0b5cad;" class="fa-solid fa-pen-to-square"></i></div>
                    <div v-else-if="item.type === 'ERROR'" class="icon"><i style="background-color: white; color: red;" class="fa-solid fa-bug"></i></div>
                    <div v-else-if="item.type === 'DELETE'" class="icon"><i style="background-color: white; color: #d0021b;" class="fa-solid fa-trash"></i></div>
                    <div v-else class="icon"></div>
                    <div class="header-icon">{{ item.effective_date_time }}</div>
                    <div class="header-icon">{{ item.type }}</div>
                    <div class="header-icon">{{ item.name }}</div>
                    <div class="header-message">{{ formatMessage(item.description) }}</div>
                </div>
                <div v-if="!filteredLogData.length" class="empty-log">No logs found</div>
            </div>

        </div>
        <div v-if="activeLog" class="detail-overlay" @click.self="activeLog = null">
            <div class="detail-panel">
                <div class="detail-header">
                    <strong>Log detail</strong>
                    <button class="detail-close" title="Close" @click="activeLog = null">x</button>
                </div>
                <div class="detail-body">
                    <div class="detail-grid">
                        <div class="detail-row"><span>Date & Time</span><strong>{{ activeLog.effective_date_time || '-' }}</strong></div>
                        <div class="detail-row"><span>Category</span><strong>{{ activeLog.type || '-' }}</strong></div>
                        <div class="detail-row"><span>Object</span><strong>{{ activeLog.name || '-' }}</strong></div>
                    </div>
                    <div class="detail-row full"><span>Message</span><p>{{ formatMessage(activeLog.description) || '-' }}</p></div>
                    <div v-if="activeAuditChanges.length" class="change-list">
                        <div class="change-header">
                            <span>Field</span>
                            <span>From</span>
                            <span>To</span>
                        </div>
                        <div v-for="(change, index) in activeAuditChanges" :key="index" class="change-row">
                            <span>{{ change.field }}</span>
                            <span>{{ formatDetailValue(change.from) }}</span>
                            <span>{{ formatDetailValue(change.to) }}</span>
                        </div>
                    </div>
                    <div class="detail-row full" v-else-if="activeLog.remark"><span>Remark</span><p>{{ activeLog.remark }}</p></div>
                </div>
                <div class="detail-footer">
                    <button class="delete-detail" :disabled="isDeleting" @click="deleteLogs([activeLog.mrid])">
                        <i class="fa-solid fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name : 'LogBar',
    props: {
        logData: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            filterText: '',
            selectedIds: [],
            activeLog: null,
            isLoadingReload: false,
            isDeleting: false,
        }
    },
    computed: {
        filteredLogData() {
            const keyword = this.filterText.trim().toLowerCase()
            if (!keyword) return this.logData
            return this.logData.filter((item) => {
                return [
                    item.effective_date_time,
                    item.type,
                    item.user_name,
                    item.name,
                    item.description,
                    item.remark
                ].some((value) => String(value || '').toLowerCase().includes(keyword))
            })
        },
        activeAuditRemark() {
            if (!this.activeLog || !this.activeLog.remark) return null
            try {
                return JSON.parse(this.activeLog.remark)
            } catch (error) {
                return null
            }
        },
        activeAuditChanges() {
            if (!this.activeAuditRemark || !Array.isArray(this.activeAuditRemark.changes)) return []
            return this.activeAuditRemark.changes
        }
    },
    watch: {
        logData() {
            const existingIds = this.logData.map((item) => item.mrid)
            this.selectedIds = this.selectedIds.filter((id) => existingIds.includes(id))
            if (this.activeLog && !existingIds.includes(this.activeLog.mrid)) {
                this.activeLog = null
            }
        }
    },
    methods: {
        hideLog() {
            this.$emit("hideLogBar", false);
        },
        reloadLog() {
            this.isLoadingReload = true;
            let done = false
            const finish = () => {
                done = true
                this.isLoadingReload = false;
            }
            this.$emit("reloadLog", finish);
            setTimeout(() => {
                if (!done) finish()
            }, 800)
        },
        isSelected(item) {
            return item && this.selectedIds.includes(item.mrid)
        },
        selectLog(item, event) {
            if (!item || !item.mrid) return
            if (event && (event.ctrlKey || event.metaKey)) {
                if (this.selectedIds.includes(item.mrid)) {
                    this.selectedIds = this.selectedIds.filter((id) => id !== item.mrid)
                } else {
                    this.selectedIds = [...this.selectedIds, item.mrid]
                }
                return
            }
            this.selectedIds = [item.mrid]
        },
        openLogDetail(item) {
            if (!item || !item.mrid) return
            this.activeLog = item
        },
        formatDetailValue(value) {
            if (value === undefined || value === null || value === '') return ''
            return value
        },
        formatMessage(value) {
            return String(value || '').replace(/\(blank\)/g, '')
        },
        async deleteSelectedLogs() {
            await this.deleteLogs(this.selectedIds)
        },
        async deleteAllLogs() {
            const ids = this.logData.map((item) => item.mrid).filter(Boolean)
            await this.deleteLogs(ids, true)
        },
        async deleteLogs(ids, deleteAll = false) {
            const targetIds = Array.from(new Set((ids || []).filter(Boolean)))
            if (!targetIds.length || this.isDeleting) return

            const message = deleteAll
                ? 'This will permanently delete all logs. Continue?'
                : `This will permanently delete ${targetIds.length} selected log${targetIds.length > 1 ? 's' : ''}. Continue?`
            try {
                await this.$confirm(message, 'Delete logs', {
                    type: 'warning',
                    confirmButtonText: 'Delete',
                    cancelButtonText: 'Cancel',
                    confirmButtonClass: 'log-confirm-delete'
                })
            } catch (error) {
                return
            }

            this.isDeleting = true
            try {
                for (const id of targetIds) {
                    const result = await window.electronAPI.deleteConfigurationEventByMrid(id)
                    if (!result || !result.success) {
                        throw new Error((result && result.message) || 'Delete log failed')
                    }
                }
                this.selectedIds = this.selectedIds.filter((id) => !targetIds.includes(id))
                if (this.activeLog && targetIds.includes(this.activeLog.mrid)) {
                    this.activeLog = null
                }
                this.reloadLog()
            } catch (error) {
                console.error('Delete log failed:', error)
                if (this.$message) this.$message.error(error.message || 'Delete log failed')
            } finally {
                this.isDeleting = false
            }
        }
    }
}
</script>
<style scoped>
.logbar {
    width: 100%;
    box-sizing: border-box;
    border-left: none;
    border-right: none;
    height: 100%;
    font-size: 13px;
}

.table-content::-webkit-scrollbar {
    display: none;
}

.option-bar {
    width: 100%;
    height: 34px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 4px 8px;
    gap: 12px;
    background: #f8fafc;
    border: 1px solid #d9e1ee;
    border-bottom: none;
}

.log-summary {
    flex: 1;
    min-width: 0;
    color: #4b5563;
    display: flex;
    align-items: center;
    gap: 10px;
}

.selected-count {
    color: #012596;
    font-weight: 600;
}

.log-actions {
    flex: 1;
    min-width: 360px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
}

.filter-input {
    width: min(420px, 55%);
    border: 1px solid #cfd8e3;
    outline: none;
    height: 24px;
    box-sizing: border-box;
    padding: 0 8px;
}

.icon-btn {
    height: 24px;
    width: 28px;
    border: 1px solid #cfd8e3;
    background: #ffffff;
    color: #4b5563;
    cursor: pointer;
    border-radius: 4px;
}

.icon-btn:disabled {
    color: #b8c0cc;
    cursor: not-allowed;
}

.icon-btn.danger:not(:disabled),
.delete-detail {
    color: #d0021b;
}

.table-content {
    width: 100%;
    height: calc(100% - 34px);
    border: 1px #012596 solid;
    box-sizing: border-box;
    -ms-overflow-style: none;
    scrollbar-width: none;
    overflow-y: auto;
    position: relative;
}

.header {
    width: 100%;
    display: flex;
    height: 30px;
    box-sizing: border-box;
    background-color: #ddd;
    position: sticky;
    top: 0;
    z-index: 10;
}

.content {
    display: flex;
    width: 100%;
    min-height: 34px;
    box-sizing: border-box;
    background-color: white;
    cursor: pointer;
    overflow: hidden;
}

.content:hover {
    background-color: #eef5ff;
}

.content.selected {
    background: #e8f0fe;
}

.content.active {
    box-shadow: inset 3px 0 0 #012596;
}

.content-log {
    width: 100%;
    min-height: calc(100% - 30px);
}

.empty-log {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
}

.icon {
    width: 5%;
    min-width: 42px;
    box-sizing: border-box;
    border: 1px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
}

.header-icon {
    width: 13%;
    font-weight: 700;
    border: 1px solid white;
    padding-left: 8px;
    box-sizing: border-box;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.header-message {
    width: 56%;
    font-weight: 700;
    border: 1px solid white;
    padding-left: 8px;
    box-sizing: border-box;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.header-icon,
.header-message {
    display: block;
    flex-shrink: 0;
}

.header .header-icon,
.header .header-message {
    line-height: 28px;
}

.content .header-icon,
.content .header-message {
    line-height: 32px;
}

.detail-overlay {
    position: fixed;
    inset: 0;
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.28);
}

.detail-panel {
    width: min(760px, calc(100vw - 64px));
    max-height: min(620px, calc(100vh - 80px));
    background: #ffffff;
    border: 1px solid #d9e1ee;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
}

.detail-header,
.detail-footer {
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    background: #f8fafc;
    border-bottom: 1px solid #e4e7ed;
    box-sizing: border-box;
}

.detail-header {
    height: 42px;
}

.detail-footer {
    border-top: 1px solid #e4e7ed;
    border-bottom: none;
    justify-content: flex-end;
}

.detail-close {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
    color: #6b7280;
}

.detail-body {
    padding: 14px 16px;
    overflow: auto;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 18px;
    margin-bottom: 12px;
}

.detail-row {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 10px;
    margin-bottom: 8px;
}

.detail-row span {
    color: #6b7280;
}

.detail-row strong,
.detail-row p {
    margin: 0;
    color: #1f2937;
    word-break: break-word;
}

.detail-row.full {
    display: block;
}

.detail-row.full span {
    display: block;
    margin-bottom: 4px;
}

.change-list {
    margin-top: 12px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    overflow: hidden;
}

.change-header,
.change-row {
    display: grid;
    grid-template-columns: 1fr 1.4fr 1.4fr;
}

.change-header {
    background: #f3f6fb;
    color: #606266;
    font-weight: 700;
}

.change-header span,
.change-row span {
    min-width: 0;
    padding: 8px 10px;
    border-right: 1px solid #e4e7ed;
    word-break: break-word;
}

.change-header span:last-child,
.change-row span:last-child {
    border-right: none;
}

.change-row {
    border-top: 1px solid #e4e7ed;
}

.delete-detail {
    height: 26px;
    border: 1px solid #d9e1ee;
    background: #ffffff;
    border-radius: 4px;
    cursor: pointer;
    padding: 0 10px;
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
