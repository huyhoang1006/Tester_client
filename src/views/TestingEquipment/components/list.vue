<template>
    <div class="te-list">
        <!-- Toolbar: search + count -->
        <div class="tl-toolbar">
            <div class="tl-search">
                <span class="tl-search-ico">⌕</span>
                <input class="tl-search-input" v-model="keyword"
                    placeholder="Search by name, model, serial no.…" />
                <button v-if="keyword" class="tl-clear" @click="keyword = ''" title="Clear">✕</button>
            </div>
            <div class="tl-toolbar-right">
                <button class="tl-new-btn" @click="$emit('create')" title="Create a new testing equipment">
                    + New
                </button>
                <button class="tl-icon-btn" :disabled="refreshing" @click="refresh" title="Reload the list from database">
                    <span class="tl-sync-ico" :class="{ spin: refreshing }">⟳</span> Refresh
                </button>

                <!-- Import dropdown -->
                <div class="tl-dd">
                    <button class="tl-icon-btn" :class="{ 'is-open': openMenu === 'import' }"
                        @click.stop="toggleMenu('import')" title="Import equipment list from a file">
                        <i class="fa-solid fa-file-import"></i> Import
                        <i class="fa-solid fa-angle-down tl-dd-caret" :class="{ open: openMenu === 'import' }"></i>
                    </button>
                    <div v-if="openMenu === 'import'" class="tl-dd-menu">
                        <button class="tl-dd-item" @click="chooseImport('json')">
                            <i class="fa-solid fa-file-code json"></i> From JSON
                        </button>
                        <button class="tl-dd-item" @click="chooseImport('excel')">
                            <i class="fa-solid fa-file-excel excel"></i> From Excel
                        </button>
                        <button class="tl-dd-item" @click="chooseImport('word')">
                            <i class="fa-solid fa-file-word word"></i> From Word
                        </button>
                    </div>
                </div>

                <!-- Export dropdown -->
                <div class="tl-dd">
                    <button class="tl-icon-btn" :class="{ 'is-open': openMenu === 'export' }"
                        @click.stop="toggleMenu('export')" title="Export equipment list to a file">
                        <i class="fa-solid fa-file-export"></i> Export
                        <i class="fa-solid fa-angle-down tl-dd-caret" :class="{ open: openMenu === 'export' }"></i>
                    </button>
                    <div v-if="openMenu === 'export'" class="tl-dd-menu">
                        <button class="tl-dd-item" @click="chooseExport('json')">
                            <i class="fa-solid fa-file-code json"></i> To JSON
                        </button>
                        <button class="tl-dd-item" @click="chooseExport('excel')">
                            <i class="fa-solid fa-file-excel excel"></i> To Excel
                        </button>
                        <button class="tl-dd-item" @click="chooseExport('word')">
                            <i class="fa-solid fa-file-word word"></i> To Word
                        </button>
                    </div>
                </div>
                <button class="tl-sync-btn" :disabled="syncing" @click="syncFromServer" title="Fetch the full list from server and download to this client">
                    <span class="tl-sync-ico" :class="{ spin: syncing }">↓</span>
                    {{ syncing ? 'Syncing…' : 'Sync from server' }}
                </button>
                <button class="tl-sync-btn" :disabled="pushing" @click="pushToServer" title="Push the local list to the server to update it">
                    <span class="tl-sync-ico" :class="{ spin: pushing }">↑</span>
                    {{ pushing ? 'Pushing…' : 'Push to server' }}
                </button>
                <div class="tl-count">{{ filtered.length }} / {{ effectiveItems.length }} equipment</div>
            </div>
        </div>

        <!-- Compact list table -->
        <div class="tl-table-scroll">
            <table class="tl-table">
                <thead>
                    <tr>
                        <th class="c-name">Equipment name</th>
                        <th class="c-model">Model</th>
                        <th class="c-serial">Serial no.</th>
                        <th class="c-status">Status</th>
                        <th class="c-act"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="!filtered.length">
                        <td colspan="5" class="tl-empty">
                            {{ keyword ? 'No matching equipment' : 'No testing equipment yet — click “+ New” to create one' }}
                        </td>
                    </tr>
                    <tr v-for="it in filtered" :key="it.mrid || it.id" class="tl-row"
                        :class="{ 'is-acc': it.is_accessory }"
                        @click="$emit('open', it)" title="Click to view details">
                        <td class="c-name">
                            <div class="tl-name">
                                {{ it.name || '—' }}
                                <span v-if="it.is_accessory" class="tl-acc-badge">Accessory</span>
                            </div>
                            <div class="tl-sub">{{ it.manufacturer }}<span v-if="it.customer"> · {{ it.customer }}</span></div>
                        </td>
                        <td class="c-model">{{ it.model || '—' }}</td>
                        <td class="c-serial">{{ it.serial || '—' }}</td>
                        <td class="c-status">
                            <span class="tag" :class="statusOf(it).cls">{{ statusOf(it).label }}</span>
                        </td>
                        <td class="c-act">
                            <button class="tl-del" @click.stop="deleteRow(it)" title="Delete">✕</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Dialog xử lý thiết bị trùng khi import JSON -->
        <ImportConflictDialog
            :visible.sync="conflictVisible"
            :conflicts="conflictRows"
            @confirm="onConflictConfirm"
            @cancel="onConflictCancel" />

        <!-- Import/Export theo template Excel/Word — tách biệt với Import/Export cũ -->
        <TemplateImportExport
            :visible.sync="ioVisible"
            :mode="ioMode"
            :file-type="ioFileType"
            @imported="reload" />
    </div>
</template>

<script>
/* eslint-disable */
import * as TestingEquipmentAPI from '@/api/demo/TestingEquipment'
import * as ServerMapper from '@/views/Mapping/ServerToDTO/TestingEquipment'
import * as Mapper from '@/views/Mapping/TestingEquipment'
import uuid from '@/utils/uuid'
import ImportConflictDialog from './importConflictDialog.vue'
import TemplateImportExport from './templateImportExport.vue'
import { splitByDuplicate } from '../services/duplicateCheck'

const TE_JSON_VERSION = 'testing-equipment-json-v1'

export default {
    name: 'TestingEquipmentList',
    components: { ImportConflictDialog, TemplateImportExport },
    props: {
        // danh sách thiết bị; mặc định rỗng, dữ liệu lấy từ DB qua reload()
        items: { type: Array, default: () => [] }
    },
    data() {
        return {
            keyword: '', syncing: false, pushing: false, refreshing: false, dbItems: null, openMenu: null,
            // import JSON: xử lý trùng
            conflictVisible: false,
            conflictRows: [],
            _pendingImport: null,
            // import/export theo template Excel/Word
            ioVisible: false,
            ioMode: 'export',      // 'import' | 'export'
            ioFileType: 'excel'    // 'excel' | 'word'
        }
    },
    created() {
        this.reload()
    },
    beforeDestroy() {
        document.removeEventListener('click', this.closeMenu)
    },
    computed: {
        // Nguồn dữ liệu: DB (khi đã load); trước khi load thì dùng prop items (mặc định rỗng)
        effectiveItems() {
            return this.dbItems !== null ? this.dbItems : this.items
        },
        filtered() {
            const k = this.keyword.trim().toLowerCase()
            if (!k) return this.effectiveItems
            return this.effectiveItems.filter(it =>
                [it.name, it.model, it.serial, it.manufacturer, it.customer]
                    .filter(Boolean)
                    .some(v => String(v).toLowerCase().includes(k))
            )
        }
    },
    methods: {
        // ===== Import / Export dropdown (UI) =====
        toggleMenu(name) {
            this.openMenu = this.openMenu === name ? null : name
            if (this.openMenu) {
                // đóng khi click ra ngoài
                setTimeout(() => document.addEventListener('click', this.closeMenu), 0)
            }
        },
        closeMenu() {
            this.openMenu = null
            document.removeEventListener('click', this.closeMenu)
        },
        chooseImport(format) {
            this.closeMenu()
            if (format === 'json') return this.importJson()
            this.openTemplateDialog('import', format)
        },
        chooseExport(format) {
            this.closeMenu()
            if (format === 'json') return this.exportJson()
            this.openTemplateDialog('export', format)
        },
        // Excel/Word: mở dialog import/export theo template (tách biệt với Import/Export cũ)
        openTemplateDialog(mode, fileType) {
            this.ioMode = mode
            this.ioFileType = fileType
            this.ioVisible = true
        },

        // ===== EXPORT JSON =====
        async exportJson() {
            const rows = this.effectiveItems || []
            if (!rows.length) return this.$message.info('No equipment to export')
            const loading = this.$loading({ lock: true, text: 'Exporting testing equipment...' })
            try {
                const items = []
                for (const r of rows) {
                    if (!r.mrid) continue
                    const rs = await window.electronAPI.getTestingEquipmentEntityByMrid(r.mrid)
                    if (rs && rs.success && rs.data) {
                        const entity = rs.data
                        // attachment chứa path máy cục bộ -> không mang theo file, bỏ khỏi bản export
                        entity.attachment = null
                        // user link là của máy nguồn -> bỏ, máy đích tự gán user hiện tại khi import
                        entity.userIdentifiedObject = null
                        entity.user = null
                        items.push(entity)
                    }
                }
                const payload = {
                    version: TE_JSON_VERSION,
                    exportedAt: new Date().toISOString(),
                    items
                }
                loading.close()
                const result = await window.electronAPI.exportJSON(payload, {
                    defaultFileName: 'testing-equipment.json',
                    title: 'Save testing equipment JSON',
                    buttonLabel: 'Save'
                })
                if (result && result.success) {
                    this.$message.success(`Exported ${items.length} equipment`)
                } else if (result && result.message !== 'Export cancelled') {
                    this.$message.error(result.message || 'Export JSON failed')
                }
            } catch (e) {
                console.error('exportJson failed:', e)
                this.$message.error('Export JSON failed: ' + (e.message || e))
            } finally {
                loading.close()
            }
        },

        // ===== IMPORT JSON =====
        // Check trùng: tách ra services/duplicateCheck.js (dùng chung với Import Excel/Word)
        async importJson() {
            try {
                const fileResult = await window.electronAPI.importJSON()
                if (!fileResult || !fileResult.success || !fileResult.data) {
                    if (fileResult && fileResult.message !== 'Import cancelled') {
                        this.$message.error((fileResult && fileResult.message) || 'Failed to read JSON file')
                    }
                    return
                }
                let content = fileResult.data
                if (typeof content === 'string') {
                    try { content = JSON.parse(content) } catch (e) { return this.$message.error('Invalid JSON file') }
                }
                // main process (importJSON) luôn bọc object vào mảng -> bóc ra
                if (Array.isArray(content) && content.length === 1 && content[0] && content[0].items) {
                    content = content[0]
                }
                const items = content && Array.isArray(content.items) ? content.items : null
                if (!items || content.version !== TE_JSON_VERSION) {
                    return this.$message.error('This file is not a testing equipment JSON export')
                }
                if (!items.length) return this.$message.info('File contains no equipment')

                // lấy danh sách hiện có (đã kèm type) để so trùng
                await this.reload()
                const existingList = this.dbItems || []
                const { newcomers, conflicts } = splitByDuplicate(items, existingList)

                if (!conflicts.length) {
                    return this._runImport(newcomers, [])
                }
                // có trùng -> hỏi người dùng, chỉ hiện các thiết bị trùng
                this._pendingImport = { newcomers, conflicts }
                this.conflictRows = conflicts.map(c => ({
                    index: c.index, name: c.name, model: c.model, serial: c.serial,
                    manufacturer: c.manufacturer, type: c.type, reason: c.reason
                }))
                this.conflictVisible = true
            } catch (e) {
                console.error('importJson failed:', e)
                this.$message.error('Import JSON failed: ' + (e.message || e))
            }
        },
        // Người dùng chọn xong trong dialog trùng
        async onConflictConfirm(choices) {
            this.conflictVisible = false
            const pending = this._pendingImport
            this._pendingImport = null
            if (!pending) return
            const overwriteIdx = new Set(choices.filter(c => c.choice === 'overwrite').map(c => c.index))
            const overwrites = pending.conflicts.filter(c => overwriteIdx.has(c.index))
            await this._runImport(pending.newcomers, overwrites)
        },
        // Bỏ qua toàn bộ thiết bị trùng, chỉ import thiết bị mới
        async onConflictCancel() {
            this.conflictVisible = false
            const pending = this._pendingImport
            this._pendingImport = null
            if (!pending) return
            await this._runImport(pending.newcomers, [])
        },
        async _runImport(newcomers, overwrites) {
            const total = newcomers.length + overwrites.length
            if (!total) {
                this.$message.info('Nothing to import — kept all existing equipment')
                return
            }
            const loading = this.$loading({ lock: true, text: 'Importing testing equipment...' })
            try {
                const user = this.$store && this.$store.getters.getUser
                const userId = (user && user.user_id) || null
                let ok = 0, fail = 0

                const doInsert = async (entity) => {
                    // gán thiết bị cho user hiện tại để hiện trong list
                    if (userId) {
                        entity.userIdentifiedObject = { mrid: uuid.newUuid(), user_id: userId }
                    }
                    const rs = await window.electronAPI.insertTestingEquipmentEntity(null, entity)
                    rs && rs.success ? ok++ : fail++
                }

                for (const n of newcomers) {
                    try { await doInsert(n.entity) } catch (e) { console.error('import item failed:', e); fail++ }
                }
                for (const c of overwrites) {
                    try {
                        const entity = c.entity
                        // trùng theo (mfr, serial, type) nhưng khác mrid -> ghi đè lên bản ghi CÓ SẴN
                        if (entity.testingEquipment) entity.testingEquipment.mrid = c.existingMrid
                        if (entity.asset) entity.asset.mrid = c.existingMrid
                        await doInsert(entity)
                    } catch (e) { console.error('overwrite item failed:', e); fail++ }
                }

                this.$message.success(
                    `Imported ${ok} equipment` +
                    (overwrites.length ? ` (${overwrites.length} overwritten)` : '') +
                    (fail ? `, ${fail} failed` : '')
                )
                await this.reload()
                this.$emit('imported', { ok, fail })
            } catch (e) {
                console.error('_runImport failed:', e)
                this.$message.error('Import failed: ' + (e.message || e))
            } finally {
                loading.close()
            }
        },

        // Đọc danh sách từ DB local (theo user hiện tại)
        async reload() {
            try {
                const user = this.$store && this.$store.getters.getUser
                const userId = user && user.user_id
                const rs = await window.electronAPI.getAllTestingEquipmentList(userId)
                this.dbItems = (rs && rs.success && Array.isArray(rs.data)) ? rs.data : []
            } catch (e) {
                console.error('reload list failed:', e)
                this.dbItems = []
            }
        },

        // Nút Refresh: load lại danh sách từ DB
        async refresh() {
            if (this.refreshing) return
            this.refreshing = true
            try {
                await this.reload()
                if (this.$message) this.$message.success('List refreshed')
            } finally {
                this.refreshing = false
            }
        },

        // Nút Push: đẩy toàn bộ danh sách local lên server để cập nhật
        async pushToServer() {
            if (this.pushing) return
            const rows = this.dbItems || []
            if (!rows.length) {
                if (this.$message) this.$message.info('No equipment to push')
                return
            }
            this.pushing = true
            try {
                let ok = 0, fail = 0
                for (const r of rows) {
                    try {
                        // lấy entity đầy đủ từ DB rồi đẩy lên server
                        const detail = await window.electronAPI.getTestingEquipmentEntityByMrid(r.mrid)
                        if (!detail || !detail.success || !detail.data) { fail++; continue }
                        await TestingEquipmentAPI.pushTestingEquipment(detail.data)
                        ok++
                    } catch (e) {
                        console.error('push item failed:', r.mrid, e)
                        fail++
                    }
                }
                if (this.$message) {
                    this.$message.success(`Pushed ${ok} equipment` + (fail ? `, ${fail} failed` : ''))
                }
            } catch (error) {
                console.error('pushToServer error:', error)
                if (this.$message) this.$message.error('Push failed: ' + (error.message || error))
            } finally {
                this.pushing = false
            }
        },

        // Xóa hẳn 1 thiết bị (cả asset + testing_equipment + con)
        async deleteRow(it) {
            try {
                await this.$confirm(
                    `Delete "${it.name || it.mrid}"? This cannot be undone.`,
                    'Confirm delete',
                    { type: 'warning', confirmButtonText: 'Delete', cancelButtonText: 'Cancel' }
                )
            } catch (e) {
                return // người dùng bấm Cancel
            }
            try {
                const rs = await window.electronAPI.deleteTestingEquipmentEntity(it.mrid)
                if (rs && rs.success) {
                    if (this.$message) this.$message.success('Deleted')
                    await this.reload()
                } else {
                    if (this.$message) this.$message.error('Delete failed: ' + ((rs && rs.message) || 'unknown'))
                }
            } catch (error) {
                console.error('delete failed:', error)
                if (this.$message) this.$message.error('Delete error: ' + (error.message || error))
            }
        },

        // Status: DB dùng repair_count, mock dùng cột repair (text)
        statusOf(it) {
            const hasRepair = (it.repair && String(it.repair).trim()) || it.repair_count > 0
            return hasRepair
                ? { label: 'Under repair', cls: 'orange' }
                : { label: 'Available', cls: 'green' }
        },

        // Sinh uuid cho các mrid còn trống trong 1 DTO (server có thể chưa cấp)
        _fillMrids(dto) {
            if (!dto.properties.mrid) dto.properties.mrid = uuid.newUuid()
            dto.mrid = dto.properties.mrid
            if (!dto.productAssetModelId) dto.productAssetModelId = uuid.newUuid()
            if (!dto.lifecycleDateId) dto.lifecycleDateId = uuid.newUuid()
            if (!dto.inUseDateId) dto.inUseDateId = uuid.newUuid()
            for (const l of (dto.licenses || [])) if (!l.mrid) l.mrid = uuid.newUuid()
            for (const c of (dto.calibration || [])) if (!c.mrid) c.mrid = uuid.newUuid()
            for (const r of (dto.repairs || [])) if (!r.mrid) r.mrid = uuid.newUuid()
        },

        // Đồng bộ: lấy FULL danh sách trên server và download (insert/upsert) về DB client
        async syncFromServer() {
            if (this.syncing) return
            this.syncing = true
            try {
                const list = await TestingEquipmentAPI.getAllTestingEquipment()
                const rows = Array.isArray(list) ? list : (list && list.data) || []
                if (!rows.length) {
                    if (this.$message) this.$message.info('Server returned no testing equipment')
                    return
                }

                let ok = 0, fail = 0
                for (const serverItem of rows) {
                    try {
                        const dto = ServerMapper.mapServerToDto(serverItem)
                        this._fillMrids(dto)
                        const entity = Mapper.mapDtoToEntity(dto)
                        const rs = await window.electronAPI.insertTestingEquipmentEntity(null, entity)
                        rs && rs.success ? ok++ : fail++
                    } catch (e) {
                        console.error('sync item failed:', e)
                        fail++
                    }
                }

                if (this.$message) {
                    this.$message.success(`Synced ${ok} equipment` + (fail ? `, ${fail} failed` : ''))
                }
                await this.reload()   // hiển thị lại từ DB sau khi download
                this.$emit('synced', { ok, fail, total: rows.length })
            } catch (error) {
                console.error('syncFromServer error:', error)
                if (this.$message) this.$message.error('Sync failed: ' + (error.message || error))
            } finally {
                this.syncing = false
            }
        }
    }
}
</script>

<style scoped>
.te-list {
    --blue-900:#0b2f86; --blue-800:#123c9c; --blue-50:#eef4ff;
    --gray-900:#111827; --gray-700:#374151; --gray-600:#4b5563;
    --gray-500:#6b7280; --gray-400:#9ca3af; --gray-300:#d1d5db;
    --gray-200:#e5e7eb; --gray-100:#f3f4f6; --gray-50:#f9fafb;
    font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif; color: var(--gray-700);
}
.tl-toolbar { display: flex; flex-direction: column; align-items: stretch; gap: 10px; margin-bottom: 14px; }
.tl-search { position: relative; width: 100%; max-width: 420px; }
.tl-search-ico { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--gray-400); font-size: 16px; }
.tl-search-input {
    width: 100%; border: 1px solid var(--gray-200); border-radius: 9px;
    padding: 9px 32px 9px 32px; font-size: 13px; color: var(--gray-900); outline: none; background: #fff;
}
.tl-search-input:focus { border-color: var(--blue-900); box-shadow: 0 0 0 3px rgba(11,47,134,0.08); }
.tl-clear { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); border: none; background: transparent; color: var(--gray-400); cursor: pointer; font-size: 13px; }
.tl-toolbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.tl-count { color: var(--gray-500); font-size: 12px; font-weight: 700; white-space: nowrap; }
.tl-sync-btn {
    display: inline-flex; align-items: center; gap: 7px; border: 1px solid var(--blue-900);
    background: var(--blue-900); color: #fff; padding: 8px 14px; border-radius: 9px;
    font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap;
}
.tl-sync-btn:hover { background: var(--blue-800); border-color: var(--blue-800); }
.tl-sync-btn:disabled { opacity: 0.6; cursor: default; }
.tl-new-btn {
    border: 1px solid var(--gray-300); background: #fff; color: var(--gray-700);
    padding: 8px 14px; border-radius: 9px; font-size: 13px; font-weight: 800; cursor: pointer; white-space: nowrap;
}
.tl-new-btn:hover { border-color: var(--blue-900); color: var(--blue-900); }
.tl-icon-btn {
    display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--gray-300);
    background: #fff; color: var(--gray-700); padding: 8px 12px; border-radius: 9px;
    font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap;
}
.tl-icon-btn:hover { border-color: var(--blue-900); color: var(--blue-900); }
.tl-icon-btn:disabled { opacity: 0.6; cursor: default; }
.tl-sync-ico { font-size: 15px; display: inline-block; }

/* ===== Import / Export dropdown ===== */
.tl-dd { position: relative; }
.tl-icon-btn.is-open { border-color: var(--blue-900); color: var(--blue-900); }
.tl-dd-caret { font-size: 11px; margin-left: 2px; transition: transform 0.15s ease; }
.tl-dd-caret.open { transform: rotate(180deg); }
.tl-dd-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 160px;
    background: #fff;
    border: 1px solid var(--gray-200);
    border-radius: 9px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    padding: 5px;
    z-index: 60;
}
.tl-dd-item {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    border: none;
    background: transparent;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-700);
    cursor: pointer;
    text-align: left;
    white-space: nowrap;
}
.tl-dd-item:hover { background: var(--blue-50); color: var(--blue-900); }
.tl-dd-item i { width: 16px; text-align: center; font-size: 14px; }
.tl-dd-item i.json { color: #b45309; }
.tl-dd-item i.excel { color: #166534; }
.tl-dd-item i.word { color: #1d4ed8; }
.tl-sync-ico.spin { animation: tl-spin 0.9s linear infinite; }
@keyframes tl-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.tl-table-scroll { overflow-x: auto; border: 1px solid var(--gray-200); border-radius: 10px; }
.tl-table { width: 100%; min-width: 640px; border-collapse: collapse; background: #fff; }
.tl-table th {
    background: var(--gray-100); color: var(--gray-700); text-align: left;
    padding: 12px 16px; font-size: 12px; font-weight: 800; white-space: nowrap;
    border-bottom: 1px solid var(--gray-300); position: sticky; top: 0;
}
.tl-table td { padding: 11px 16px; border-bottom: 1px solid var(--gray-200); vertical-align: middle; font-size: 13px; }
.tl-table tr:last-child td { border-bottom: 0; }

.c-model { width: 150px; white-space: nowrap; }
.c-serial { width: 150px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.c-status { width: 140px; }
.c-act { width: 44px; text-align: center; }
.tl-del { border: none; background: transparent; color: #d90429; font-size: 14px; cursor: pointer; padding: 4px 6px; border-radius: 6px; }
.tl-del:hover { background: #fee2e2; }
.tl-acc-badge { margin-left: 8px; font-size: 10px; font-weight: 800; color: #92400e; background: #fef3c7; padding: 1px 7px; border-radius: 999px; vertical-align: middle; }
.tl-row.is-acc { background: #fafafa; }
.tl-row.is-acc .tl-name { color: var(--gray-500); font-weight: 600; }
.tl-row.is-acc:hover { background: #f1f5f9; }

.tl-row { cursor: pointer; transition: background .12s; }
.tl-row:hover { background: var(--blue-50); }
.tl-name { font-weight: 700; color: var(--gray-900); }
.tl-sub { color: var(--gray-500); font-size: 11px; margin-top: 2px; }
.tl-empty { text-align: center; color: var(--gray-400); padding: 26px; font-weight: 600; }

.tag { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 11px; font-size: 12px; font-weight: 800; white-space: nowrap; }
.tag.green { background: #dcfce7; color: #166534; }
.tag.orange { background: #ffedd5; color: #9a3412; }
</style>
