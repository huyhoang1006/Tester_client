<template>
    <div class="te-list">
        <!-- Toolbar: search + count -->
        <div class="tl-toolbar">
            <div class="tl-search">
                <span class="tl-search-ico">⌕</span>
                <input class="tl-search-input" v-model="keyword"
                    :placeholder="serverMode ? 'Search overview fields…' : 'Search by name, model, serial no.…'" />
                <button v-if="keyword" class="tl-clear" @click="keyword = ''" title="Clear">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="tl-scope-row">
                <div v-if="!serverMode" class="tl-scope-switch" role="group" aria-label="Equipment list scope">
                    <button type="button" :class="{ active: scopeMode === 'user' }"
                        :aria-pressed="scopeMode === 'user'" @click="setScope('user')">
                        <i class="fa-solid fa-user" aria-hidden="true"></i> All mine
                    </button>
                    <button type="button" :class="{ active: scopeMode === 'organisation' }"
                        :aria-pressed="scopeMode === 'organisation'" @click="setScope('organisation')">
                        <i class="fa-solid fa-sitemap" aria-hidden="true"></i> Organisation tree
                    </button>
                </div>
                <div v-if="serverMode || scopeMode === 'organisation'" class="tl-org-picker">
                    <span>Owner/Customer</span>
                    <OrganisationTreePicker :value="serverMode ? serverOrganisationId : organisationId"
                        title="Select owner/customer organisation" :clearable="serverMode" :server-mode="serverMode"
                        @input="selectOrganisation" />
                </div>
            </div>
            <div class="tl-toolbar-right">
                <button class="tl-new-btn" @click="$emit('create')" title="Create a new testing equipment">
                    + New
                </button>
                <button class="tl-icon-btn" :disabled="refreshing" @click="refresh" title="Reload the list from database">
                    <span class="tl-sync-ico" :class="{ spin: refreshing }">⟳</span> Refresh
                </button>

                <!-- Import dropdown -->
                <div v-if="!serverMode" class="tl-dd">
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
                        <button class="tl-dd-item" @click="chooseImport('columnMapping')">
                            <i class="fa-solid fa-table-columns excel"></i> From Excel/CSV Mapping
                        </button>
                        <button class="tl-dd-item" @click="chooseImport('word')">
                            <i class="fa-solid fa-file-word word"></i> From Word
                        </button>
                    </div>
                </div>

                <!-- Export dropdown -->
                <div v-if="!serverMode" class="tl-dd">
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
                <button v-if="serverMode" class="tl-sync-btn" :disabled="syncing || !selectedKey" @click="downloadSelected" title="Download selected equipment to this client">
                    <i class="fa-solid fa-download" aria-hidden="true"></i>
                    {{ syncing ? 'Downloading…' : 'Download selected' }}
                </button>
                <button v-else class="tl-sync-btn" :disabled="pushing || !selectedKey" @click="pushSelected" title="Push selected equipment to server">
                    <i class="fa-solid fa-upload" aria-hidden="true"></i>
                    {{ pushing ? 'Pushing…' : 'Push selected' }}
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
                            {{ loadingList ? 'Loading equipment…' : keyword ? 'No matching equipment' : 'No testing equipment in this view' }}
                        </td>
                    </tr>
                    <tr v-for="it in filtered" :key="it.mrid || it.id" class="tl-row"
                        :class="{ 'is-acc': it.is_accessory, 'is-selected': selectedKey === (it.mrid || it.id) }"
                        :aria-selected="selectedKey === (it.mrid || it.id)"
                        tabindex="0"
                        @click="toggleSelection(it, $event)"
                        @keydown.enter="toggleSelection(it)"
                        @keydown.space.prevent="toggleSelection(it)"
                        @dblclick="openEquipment(it)" title="Double-click to view details">
                        <td class="c-name">
                            <div class="tl-name">
                                {{ it.name || '—' }}
                                <span v-if="it.is_accessory" class="tl-acc-badge">Accessory</span>
                            </div>
                            <div class="tl-sub">{{ it.manufacturer }}<span v-if="it.organisation"> · {{ it.organisation }}</span></div>
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

        <ImportProgressDialog
            :visible="progressVisible"
            :current-name="progressName"
            :current-type="progressType"
            :done="progressDone"
            :total="progressTotal"
            unit-label="equipment" />

        <!-- Import/Export theo template Excel/Word — tách biệt với Import/Export cũ -->
        <TemplateImportExport
            :visible.sync="ioVisible"
            :mode="ioMode"
            :file-type="ioFileType"
            @imported="reload" />

        <ColumnMappingImport
            :visible.sync="columnMappingVisible"
            @imported="reload" />
    </div>
</template>

<script>
/* eslint-disable */
import * as TestingEquipmentAPI from '@/api/demo/TestingEquipment'
import * as Mapper from '@/views/Mapping/TestingEquipment'
import uuid from '@/utils/uuid'
import ImportConflictDialog from './importConflictDialog.vue'
import TemplateImportExport from './templateImportExport.vue'
import ColumnMappingImport from './columnMappingImport.vue'
import ImportProgressDialog from '@/views/TreeNode/dialogs/ImportProgressDialog.vue'
import { splitByDuplicate } from '../services/duplicateCheck'
import { equipmentStatusTag } from '../statusOptions'
import OrganisationTreePicker from './organisationTreePicker.vue'
import constant from '@/utils/constant'
import * as OrganisationAPI from '@/api/demo'
import { toLocalMrid, toServerId } from '@/utils/serverId'

const TE_JSON_VERSION = 'testing-equipment-json-v1'

export default {
    name: 'TestingEquipmentList',
    components: { ImportConflictDialog, TemplateImportExport, ColumnMappingImport, ImportProgressDialog, OrganisationTreePicker },
    props: {
        // danh sách thiết bị; mặc định rỗng, dữ liệu lấy từ DB qua reload()
        items: { type: Array, default: () => [] },
        serverMode: { type: Boolean, default: false }
    },
    data() {
        return {
            keyword: '', syncing: false, pushing: false, refreshing: false, dbItems: null, openMenu: null,
            selectedKey: null,
            scopeMode: 'user', organisationId: constant.ROOT, serverOrganisationId: '', loadingList: false, reloadSequence: 0,
            // import JSON: xử lý trùng
            conflictVisible: false,
            conflictRows: [],
            _pendingImport: null,
            progressVisible: false,
            progressDone: 0,
            progressTotal: 0,
            progressName: '',
            progressType: 'testingEquipment',
            // import/export theo template Excel/Word
            ioVisible: false,
            ioMode: 'export',      // 'import' | 'export'
            ioFileType: 'excel',   // 'excel' | 'word'
            columnMappingVisible: false
        }
    },
    created() {
        this.reload()
    },
    watch: {
        serverMode() {
            this.selectedKey = null
            this.keyword = ''
            this.reload()
        }
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
                [it.name, it.model, it.serial, it.manufacturer, it.organisation,
                    ...(this.serverMode ? [it.asset_tag, it.country_of_origin, it.manufacturer_year,
                        it.in_use_date, it.status, it.comment, it.type] : [])]
                    .filter(Boolean)
                    .some(v => String(v).toLowerCase().includes(k))
            )
        }
    },
    methods: {
        setScope(mode) {
            this.scopeMode = mode
            this.reload()
        },
        selectOrganisation(mrid) {
            if (this.serverMode) this.serverOrganisationId = mrid || ''
            else this.organisationId = mrid || constant.ROOT
            this.reload()
        },
        toggleSelection(it, event) {
            if (event && event.detail > 1) return
            const key = it.mrid || it.id
            this.selectedKey = this.selectedKey === key ? null : key
        },
        openEquipment(it) {
            this.selectedKey = it.mrid || it.id
            this.$emit('open', it)
        },
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
            if (format === 'columnMapping') {
                this.columnMappingVisible = true
                return
            }
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

        startImportProgress(total, name) {
            this.progressVisible = true
            this.progressDone = 0
            this.progressTotal = total || 0
            this.progressName = name || ''
            this.progressType = 'testingEquipment'
        },
        stepImportProgress(name) {
            this.progressName = name || ''
            this.progressType = 'testingEquipment'
            this.progressDone = Math.min(this.progressTotal || 1, this.progressDone + 1)
        },
        stopImportProgress() {
            this.progressVisible = false
        },
        equipmentProgressName(entity) {
            const asset = entity && entity.asset ? entity.asset : {}
            const pam = entity && entity.productAssetModel ? entity.productAssetModel : {}
            return asset.name || pam.model_number || asset.serial_number || 'Testing equipment'
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
            this.startImportProgress(total, 'Preparing...')
            try {
                const user = this.$store && this.$store.getters.getUser
                const userId = (user && user.user_id) || null
                let ok = 0, fail = 0

                const doInsert = async (entity) => {
                    this.stepImportProgress(this.equipmentProgressName(entity))
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
                this.stopImportProgress()
            }
        },

        // Đọc danh sách từ DB local theo chế độ đang chọn.
        async reload() {
            const requestId = ++this.reloadSequence
            const organisationId = this.scopeMode === 'organisation' ? this.organisationId : null
            this.loadingList = true
            this.dbItems = []
            try {
                if (this.serverMode) {
                    const rows = await TestingEquipmentAPI.getAllTestingEquipment(
                        this.serverOrganisationId ? { organisationId: this.serverOrganisationId } : {})
                    if (requestId !== this.reloadSequence) return false
                    this.dbItems = Array.isArray(rows) ? rows : []
                    if (!this.dbItems.some(it => String(it.mrid) === String(this.selectedKey))) this.selectedKey = null
                    return true
                }
                const user = this.$store && this.$store.getters.getUser
                const userId = user && user.user_id
                const rs = await window.electronAPI.getAllTestingEquipmentList(userId, organisationId)
                if (requestId !== this.reloadSequence) return false
                if (!rs || !rs.success) throw new Error((rs && rs.message) || 'Cannot load equipment')
                this.dbItems = Array.isArray(rs.data) ? rs.data : []
                if (!this.dbItems.some(it => (it.mrid || it.id) === this.selectedKey)) this.selectedKey = null
                return true
            } catch (e) {
                if (requestId !== this.reloadSequence) return false
                console.error('reload list failed:', e)
                this.dbItems = []
                if (this.$message) this.$message.error(
                    (this.serverMode ? 'Cannot load server testing equipment: ' : 'Cannot load testing equipment: ') + e.message)
                return false
            } finally {
                if (requestId === this.reloadSequence) this.loadingList = false
            }
        },

        // Nút Refresh: load lại danh sách từ DB
        async refresh() {
            if (this.refreshing) return
            this.refreshing = true
            try {
                if (await this.reload() && this.$message) this.$message.success('List refreshed')
            } finally {
                this.refreshing = false
            }
        },

        selectedEquipment() {
            return this.effectiveItems.find(it => String(it.mrid || it.id) === String(this.selectedKey))
        },

        async findServerParent(localOrganisationId) {
            let serverId = toServerId(localOrganisationId)
            if (!/^\d+$/.test(String(serverId)) && window.electronAPI.getSyncStateByMrid) {
                const rs = await window.electronAPI.getSyncStateByMrid(localOrganisationId)
                serverId = rs && rs.success && rs.data && rs.data.server_id
            }
            if (!/^\d+$/.test(String(serverId))) return null
            try {
                const organisation = await OrganisationAPI.getOrganisationById(serverId)
                return organisation && (organisation.id || organisation.mrid) ? String(serverId) : null
            } catch (error) {
                return null
            }
        },

        async findLocalParent(serverOrganisationId, userId) {
            if (!userId || !window.electronAPI.getIdentifiedObjectIdsByUser) return null
            const ownership = await window.electronAPI.getIdentifiedObjectIdsByUser(userId)
            if (!ownership || !ownership.success || !Array.isArray(ownership.data)) return null
            const ownedIds = new Set(ownership.data.map(String))
            const candidates = [
                toLocalMrid(serverOrganisationId, { mode: 'organisation' }, userId),
                toLocalMrid(serverOrganisationId, { mode: 'organisation' }),
                String(serverOrganisationId)
            ]
            for (const id of new Set(candidates)) {
                if (!ownedIds.has(String(id))) continue
                const rs = await window.electronAPI.getOrganisationEntityByMrid(id)
                if (rs && rs.success && rs.data) return id
            }
            return null
        },

        async pushSelected() {
            const selected = this.selectedEquipment()
            if (!selected || this.pushing) return
            this.pushing = true
            try {
                const detail = await window.electronAPI.getTestingEquipmentEntityByMrid(selected.mrid)
                if (!detail || !detail.success || !detail.data) throw new Error('Cannot read local equipment')
                const dto = Mapper.mapEntityToDto(detail.data)
                if (dto.attachments && dto.attachments.length) {
                    this.$message.warning('Cannot push equipment with attachments: server file upload is not available yet.')
                    return
                }
                const parentId = await this.findServerParent(dto.properties.owner_organisation_id)
                if (!parentId) {
                    this.$message.warning('Cannot push: Owner/Customer organisation does not exist on the server.')
                    return
                }
                dto.properties.owner_organisation_id = parentId
                delete dto.user
                delete dto.userId
                delete dto.userIdentifiedObjectId
                await TestingEquipmentAPI.pushTestingEquipment(dto)
                this.$message.success('Testing equipment pushed to server')
            } catch (error) {
                this.$message.error('Push failed: ' + error.message)
            } finally {
                this.pushing = false
            }
        },

        async downloadSelected() {
            const selected = this.selectedEquipment()
            if (!selected || this.syncing) return
            this.syncing = true
            try {
                const serverDto = await TestingEquipmentAPI.getTestingEquipmentById(selected.mrid)
                const user = this.$store && this.$store.getters.getUser
                const userId = user && user.user_id
                const parentId = await this.findLocalParent(serverDto.properties.owner_organisation_id, userId)
                if (!parentId) {
                    this.$message.warning('Cannot download: Owner/Customer organisation does not exist on this client.')
                    return
                }
                const dto = JSON.parse(JSON.stringify(serverDto))
                dto.properties.owner_organisation_id = parentId
                dto.userId = userId || ''
                dto.user = user || null
                const current = await window.electronAPI.getTestingEquipmentEntityByMrid(selected.mrid)
                const oldEntity = current && current.success && current.data ? current.data : null
                if (oldEntity) {
                    const localDto = Mapper.mapEntityToDto(oldEntity)
                    dto.productAssetModelId = localDto.productAssetModelId
                    dto.lifecycleDateId = localDto.lifecycleDateId
                    dto.inUseDateId = localDto.inUseDateId
                    dto.attachmentId = localDto.attachmentId
                    dto.userIdentifiedObjectId = localDto.userIdentifiedObjectId
                }
                this._fillMrids(dto)
                const entity = Mapper.mapDtoToEntity(dto)
                const rs = await window.electronAPI.insertTestingEquipmentEntity(oldEntity, entity)
                if (!rs || !rs.success) throw new Error((rs && rs.message) || 'Local save failed')
                this.$message.success('Testing equipment downloaded to this client')
            } catch (error) {
                this.$message.error('Download failed: ' + error.message)
            } finally {
                this.syncing = false
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
                const rs = this.serverMode
                    ? await TestingEquipmentAPI.deleteTestingEquipment(it.mrid)
                    : await window.electronAPI.deleteTestingEquipmentEntity(it.mrid)
                if (this.serverMode || (rs && rs.success)) {
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
            return equipmentStatusTag(it.status || 'Available')
        },

        // Sinh uuid cho các mrid còn trống trong 1 DTO (server có thể chưa cấp)
        _fillMrids(dto) {
            if (!dto.properties.mrid) dto.properties.mrid = uuid.newUuid()
            dto.mrid = dto.properties.mrid
            if (!dto.productAssetModelId) dto.productAssetModelId = uuid.newUuid()
            if (!dto.lifecycleDateId) dto.lifecycleDateId = uuid.newUuid()
            if (!dto.inUseDateId) dto.inUseDateId = uuid.newUuid()
            if (!dto.attachmentId) dto.attachmentId = uuid.newUuid()
            if (!dto.userIdentifiedObjectId) dto.userIdentifiedObjectId = uuid.newUuid()
            for (const l of (dto.licenses || [])) if (!l.mrid) l.mrid = uuid.newUuid()
            for (const c of (dto.calibration || [])) if (!c.mrid) c.mrid = uuid.newUuid()
            for (const r of (dto.repairs || [])) if (!r.mrid) r.mrid = uuid.newUuid()
            for (const a of (dto.accessories || [])) {
                if (!a.mrid) a.mrid = uuid.newUuid()
                if (!a.pamId) a.pamId = uuid.newUuid()
                if (!a.uioId) a.uioId = uuid.newUuid()
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
.tl-scope-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.tl-scope-switch { display: inline-flex; border: 1px solid var(--gray-300); border-radius: 6px; overflow: hidden; background: #fff; }
.tl-scope-switch button { display: inline-flex; align-items: center; gap: 7px; border: 0; background: transparent; color: var(--gray-700); padding: 8px 12px; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.tl-scope-switch button + button { border-left: 1px solid var(--gray-300); }
.tl-scope-switch button:hover { background: var(--gray-100); }
.tl-scope-switch button.active { background: var(--blue-900); color: #fff; }
.tl-scope-switch button.active:hover { background: var(--blue-800); }
.tl-scope-switch button:focus-visible { outline: 2px solid var(--blue-900); outline-offset: -2px; }
.tl-org-picker { display: flex; align-items: center; gap: 8px; min-width: 0; }
.tl-org-picker > span { color: var(--gray-600); font-size: 12px; font-weight: 700; }
.tl-org-picker > .org-picker { width: min(340px, 60vw); }
@media (max-width: 640px) {
    .tl-scope-switch { width: 100%; }
    .tl-scope-switch button { flex: 1; justify-content: center; }
    .tl-org-picker { width: 100%; }
    .tl-org-picker > .org-picker { flex: 1; width: auto; }
}
.tl-search { position: relative; width: 100%; max-width: 420px; }
.tl-search-ico { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--gray-400); font-size: 16px; }
.tl-search-input {
    width: 100%; border: 1px solid var(--gray-200); border-radius: 9px;
    padding: 9px 32px 9px 32px; font-size: 13px; color: var(--gray-900); outline: none; background: #fff;
    box-sizing: border-box;
}
.tl-search-input:focus { border-color: var(--blue-900); box-shadow: 0 0 0 3px rgba(11,47,134,0.08); }
.tl-clear {
    position: absolute;
    right: 7px;
    top: 50%;
    width: 24px;
    height: 24px;
    transform: translateY(-50%);
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--gray-400);
    cursor: pointer;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}
.tl-clear:hover { background: var(--gray-100); color: var(--gray-600); }
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
.tl-row.is-selected, .tl-row.is-selected:hover { background: #dbeafe; }
.tl-row.is-selected td:first-child { box-shadow: inset 3px 0 #1d4ed8; }
.tl-row:focus-visible { outline: 2px solid #1d4ed8; outline-offset: -2px; }
.tl-name { font-weight: 700; color: var(--gray-900); }
.tl-sub { color: var(--gray-500); font-size: 11px; margin-top: 2px; }
.tl-empty { text-align: center; color: var(--gray-400); padding: 26px; font-weight: 600; }

.tag { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 11px; font-size: 12px; font-weight: 800; white-space: nowrap; }
.tag.green { background: #dcfce7; color: #166534; }
.tag.orange { background: #ffedd5; color: #9a3412; }
.tag.blue { background: #dbeafe; color: #1e40af; }
.tag.yellow { background: #fef9c3; color: #854d0e; }
.tag.gray { background: #f3f4f6; color: #374151; }
.tag.red { background: #fee2e2; color: #991b1b; }
</style>
