/**
 * importTreeJSON.js  (MIXIN — lớp gọi mỏng cho import nhánh)
 * ----------------------------------------------------------------------------
 * Gom dependencies thật rồi gọi service importBranchFromJSON.
 *
 * ĐẶT FILE: src/views/TreeNode/Common/Import/importTreeJSON.js
 *
 * Kiến trúc: service đệ quy cây + áp quyết định xung đột (decisions từ dialog).
 * Mỗi node thường: DTO → DtoToEntity → electronAPI.insert<X>Entity (theo pattern
 * deepImportService của Word/Excel — không đụng function/). Job: service regen id
 * + gọi electronAPI.insert<Asset>Job. insert*Entity là upsert (ON CONFLICT UPDATE).
 * ----------------------------------------------------------------------------
 */
import { importBranchFromJSON } from '@/views/Import/services/importJsonService'
import { scanTreeConflicts } from '@/views/TreeNode/Common/Import/mridConflictScan'

// ==== DTO→Entity mappers cho node thường + asset (chiều xuôi import) ====
import { OrgDtoToOrgEntity } from '@/views/Mapping/Organisation'
import { mapDtoToEntity as subDtoToEntity } from '@/views/Mapping/Substation'
import { volDtoToVolEntity } from '@/views/Mapping/VoltageLevel'
import { mapDtoToEntity as vtDtoToEntity } from '@/views/Mapping/VoltageTransformer'
import { mapDtoToEntity as ctDtoToEntity } from '@/views/Mapping/CurrentTransformer'
import { transformerDtoToEntity as tfDtoToEntity } from '@/views/Mapping/Transformer'
import { mapDtoToEntity as cbDtoToEntity } from '@/views/Mapping/Breaker'
import { mapDtoToEntity as saDtoToEntity } from '@/views/Mapping/SurgeArrester'
import { disconnectorDtoToEntity as dcDtoToEntity } from '@/views/Mapping/Disconnector'
import { mapDtoToEntity as pcDtoToEntity } from '@/views/Mapping/PowerCable'
import { mapDtoToEntity as rmDtoToEntity } from '@/views/Mapping/RotatingMachine'
import { mapDtoToEntity as capDtoToEntity } from '@/views/Mapping/Capacitor'
import { mapDtoToEntity as reDtoToEntity } from '@/views/Mapping/Reactor'
import { mapDtoToEntity as buDtoToEntity } from '@/views/Mapping/Bushing'

// ==== Job mappings (DTO->Entity + insert/update) — theo TEN asset ====
import * as VTJob from '@/views/Mapping/VoltageTransformerJob'
import * as CTJob from '@/views/Mapping/CurrentTransformerJob'
import * as TFJob from '@/views/Mapping/TransformerJob'
import * as CBJob from '@/views/Mapping/CircuitBreakerJob'
import * as SAJob from '@/views/Mapping/SurgerArresterJob'
import * as DCJob from '@/views/Mapping/DisconnectorJob'
import * as PCJob from '@/views/Mapping/PowerCableJob'
import * as RMJob from '@/views/Mapping/RotatingMachineJob'
import * as CAPJob from '@/views/Mapping/CapacitorJob'
import * as REJob from '@/views/Mapping/ReactorJob'
import * as BUJob from '@/views/Mapping/BushingJob'

export default {
    data() {
        return {
            conflictDialogVisible: false,
            pendingConflicts: [],
            pendingImportContext: null,
        }
    },
    methods: {
        // Goi tu handleCommand 'importJSON' (toolbar import menu).
        async handleImportJSONFromFile() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a target node to import into')
                return
            }
            const targetNode = this.selectedNodes[this.selectedNodes.length - 1]
            await this._pickFileAndImport(targetNode)
        },

        // Context menu (@import-json) -> import vao node click chuot phai
        async handleImportJSONFromContext(node) {
            const targetNode = node || (this.selectedNodes && this.selectedNodes[this.selectedNodes.length - 1])
            if (!targetNode) {
                this.$message.warning('Please select a target node to import into')
                return
            }
            await this._pickFileAndImport(targetNode)
        },

        // Helper: mo file picker, parse JSON, QUET TRUNG, roi import (hoac mo dialog)
        async _pickFileAndImport(targetNode) {
            try {
                console.log('%c[IMPORT] ===== START =====', 'color:#2196F3;font-weight:bold')
                console.log('[IMPORT] targetNode:', JSON.stringify({ mode: targetNode && targetNode.mode, mrid: targetNode && targetNode.mrid, name: targetNode && targetNode.name }))

                const fileResult = await window.electronAPI.importJSON()
                console.log('[IMPORT] fileResult.success:', fileResult && fileResult.success, '| message:', fileResult && fileResult.message)
                console.log('[IMPORT] typeof fileResult.data:', typeof (fileResult && fileResult.data), '| isArray:', Array.isArray(fileResult && fileResult.data))

                if (!fileResult || !fileResult.success || !fileResult.data) {
                    if (fileResult && fileResult.message !== 'Import cancelled') {
                        this.$message.error((fileResult && fileResult.message) || 'Failed to read JSON file')
                    }
                    return
                }
                let content = fileResult.data
                if (typeof content === 'string') {
                    try { content = JSON.parse(content) }
                    catch (e) { console.error('[IMPORT] JSON.parse failed:', e); this.$message.error('Invalid JSON file'); return }
                }
                console.log('[IMPORT] content top keys:', content && Object.keys(content))

                if (Array.isArray(content) && content.length === 1 && content[0] && content[0].roots) {
                    console.log('[IMPORT] content bị bọc mảng → bóc ra content[0]')
                    content = content[0]
                }

                const roots = Array.isArray(content) ? content : (content && content.roots)
                console.log('[IMPORT] roots isArray:', Array.isArray(roots), '| roots.length:', roots && roots.length)
                if (roots && roots[0]) {
                    console.log('[IMPORT] roots[0].type:', roots[0].type, '| roots[0] keys:', Object.keys(roots[0]))
                }
                if (!roots || roots.length === 0) {
                    this.$message.warning('JSON file is empty')
                    return
                }

                let conflicts = []
                try {
                    const scan = await scanTreeConflicts(roots, { electronAPI: window.electronAPI, opts: { resolvePath: true } })
                    conflicts = (scan && scan.conflicts) || []
                    console.log('[IMPORT] scan conflicts:', conflicts.length, conflicts)
                } catch (e) {
                    console.error('[IMPORT] Conflict scan error:', e)
                    this.$message.warning('Could not check for mRID conflicts; importing as new')
                }

                if (conflicts.length > 0) {
                    console.log('[IMPORT] CÓ trùng → mở dialog')
                    this.pendingConflicts = conflicts
                    this.pendingImportContext = { fileContent: content, targetNode }
                    this.conflictDialogVisible = true
                } else {
                    console.log('[IMPORT] KHÔNG trùng → import thẳng')
                    await this.importTreeFromJSON(content, targetNode, null)
                }
            } catch (err) {
                console.error('[IMPORT] Error opening/reading file:', err)
                this.$message.error('An error occurred while importing JSON')
            }
        },

        // Dialog xung dot: user bam Import -> chay import theo quyet dinh
        async handleConflictConfirm(decisions) {
            this.conflictDialogVisible = false
            const ctx = this.pendingImportContext
            this.pendingConflicts = []
            this.pendingImportContext = null
            if (!ctx) return
            await this.importTreeFromJSON(ctx.fileContent, ctx.targetNode, decisions)
        },

        // Dialog xung dot: user Cancel -> huy
        handleConflictCancel() {
            this.conflictDialogVisible = false
            this.pendingConflicts = []
            this.pendingImportContext = null
        },

        // Import nguyen cay vao targetNode (nhan content da parse + decisions)
        // Asset inserters: mỗi loại mapDtoToEntity riêng → insert<X>Entity(oldEntity||{}, entity).
        // Trả { mrid, mode:'asset' }. Asset DTO phẳng có dto.mrid; gán parent (psr) qua dto.
        _buildAssetInserters(api, extractMrid, self) {
            const A = {
                voltageTransformer: { map: vtDtoToEntity, ins: (o, e) => api.insertVoltageTransformerEntity(o, e) },
                currentTransformer: { map: ctDtoToEntity, ins: (o, e) => api.insertCurrentTransformerEntity(o, e) },
                transformer:        { map: tfDtoToEntity, ins: (o, e) => api.insertTransformerEntity(o, e) },
                breaker:            { map: cbDtoToEntity, ins: (o, e) => api.insertBreakerEntity(o, e) },
                surgeArrester:      { map: saDtoToEntity, ins: (o, e) => api.insertSurgeArresterEntity(o, e) },
                disconnector:       { map: dcDtoToEntity, ins: (o, e) => api.insertDisconnectorEntity(o, e) },
                powerCable:         { map: pcDtoToEntity, ins: (o, e) => api.insertPowerCableEntity(o, e) },
                rotatingMachine:    { map: rmDtoToEntity, ins: (o, e) => api.insertRotatingMachineEntity(o, e) },
                capacitor:          { map: capDtoToEntity, ins: (o, e) => api.insertCapacitorEntity(o, e) },
                reactor:            { map: reDtoToEntity, ins: (o, e) => api.insertReactorEntity(o, e) },
                bushing:            { map: buDtoToEntity, ins: (o, e) => api.insertBushingEntity(o, e) },
            }
            const out = {}
            for (const key of Object.keys(A)) {
                const def = A[key]
                out[key] = async (dto, parent) => {
                    // Asset DTO: parent (psr = bay/substation mrid) ở field dto.psrId.
                    if (dto) dto.psrId = parent.mrid
                    let entity, oldEntity, rs
                    try {
                        entity = def.map(dto)
                        // old_entity: insert*Entity so sánh old vs new để biết cái gì cần xóa.
                        // Khi import tạo mới → old rỗng. Tạo old từ entity nhưng rỗng hóa mọi MẢNG
                        // (giữ cấu trúc object để .map không vỡ). KHÔNG dùng def.map({}) vì mapper
                        // truy cập dto.properties.* → throw với {}.
                        oldEntity = self._emptyArraysClone(entity)
                        rs = await def.ins(oldEntity, entity)
                    } catch (err) {
                        console.error('%c[INS asset:' + key + '] THREW:', 'color:#F44336', err)
                        return { success: false, mrid: undefined, mode: 'asset', message: err && err.message }
                    }
                    // mrid asset: kết quả trả data=entity (lồng) → data.asset.mrid;
                    // fallback: mrid trong entity gửi đi, rồi dto.properties.mrid.
                    const dtoMrid = dto && ((dto.properties && dto.properties.mrid) || dto.mrid)
                    const newMrid = (rs && rs.data && rs.data.asset && rs.data.asset.mrid)
                        || (entity && entity.asset && entity.asset.mrid)
                        || extractMrid(rs, dtoMrid)
                    return { success: !!(rs && rs.success), mrid: newMrid, mode: 'asset', message: rs && (rs.message || (rs.error && rs.error.message)) }
                }
            }
            return out
        },

        // Tạo "old entity" cho insert*Entity: clone cấu trúc nhưng mọi MẢNG → rỗng.
        // insert*Entity dùng old để so sánh "cái gì cần xóa"; import tạo mới → old phải rỗng.
        // Giữ object lồng (để .resistance.map... không vỡ), chỉ rỗng hóa các Array.
        _emptyArraysClone(obj) {
            if (Array.isArray(obj)) return []
            if (obj && typeof obj === 'object') {
                const out = {}
                for (const k of Object.keys(obj)) {
                    const v = obj[k]
                    if (Array.isArray(v)) out[k] = []
                    else if (v && typeof v === 'object') out[k] = this._emptyArraysClone(v)
                    else out[k] = v   // giữ primitive (mrid... không ảnh hưởng vì old chỉ so mảng)
                }
                return out
            }
            return obj
        },

        async importTreeFromJSON(fileContent, targetNode, decisions = null) {
            const self = this
            const api = window.electronAPI
            const uuid = { newUuid: () => self.generateUuid() }
            const userId = this.$store.state.user.user_id

            const extractMrid = (rs, fallback) => {
                if (!rs) return fallback
                if (rs.mrid) return rs.mrid
                if (rs.data && rs.data.mrid) return rs.data.mrid
                if (typeof rs.data === 'string') return rs.data
                return fallback
            }

            const deps = {
                electronAPI: api,
                uuid,
                userId,

                // nodeInserters: DTO → DtoToEntity → electronAPI.insert<X>Entity (theo deepImportService).
                nodeInserters: {
                    organisation: async (dto, parent) => {
                        console.log('%c[INS org] DTO:', 'color:#4CAF50', JSON.parse(JSON.stringify(dto)))
                        const entity = OrgDtoToOrgEntity(dto)
                        if (entity && entity.organisation) {
                            entity.organisation.parent_organisation =
                                (parent && parent.mode === 'organisation') ? parent.mrid : null
                        }
                        console.log('[INS org] entity.organisation:', entity && entity.organisation)
                        const rs = await api.insertParentOrganizationEntity(entity)
                        console.log('[INS org] insert result:', rs)
                        const newMrid = (rs && rs.data && rs.data.organisation && rs.data.organisation.mrid)
                            || (entity.organisation && entity.organisation.mrid) || dto.organisationId
                        console.log('[INS org] → success:', !!(rs && rs.success), '| newMrid:', newMrid)
                        return { success: !!(rs && rs.success), mrid: newMrid, mode: 'organisation', message: rs && (rs.message || (rs.error && rs.error.message)) }
                    },
                    substation: async (dto, parent) => {
                        dto.organisationId = parent.mrid
                        console.log('%c[INS sub] DTO (parent org=' + parent.mrid + '):', 'color:#4CAF50', JSON.parse(JSON.stringify(dto)))
                        const entity = subDtoToEntity(dto)
                        console.log('[INS sub] entity.substation:', entity && entity.substation)
                        const rs = await api.insertSubstationEntity(entity)
                        console.log('[INS sub] insert result:', rs)
                        const newMrid = (rs && rs.data && rs.data.substation && rs.data.substation.mrid)
                            || (entity.substation && entity.substation.mrid) || dto.subsId
                        console.log('[INS sub] → success:', !!(rs && rs.success), '| newMrid:', newMrid)
                        return { success: !!(rs && rs.success), mrid: newMrid, mode: 'substation', message: rs && (rs.message || (rs.error && rs.error.message)) }
                    },
                    voltageLevel: async (dto, parent) => {
                        dto.substationId = parent.mrid
                        console.log('%c[INS vl] DTO (parent sub=' + parent.mrid + '):', 'color:#4CAF50', JSON.parse(JSON.stringify(dto)))
                        const entity = volDtoToVolEntity(dto)
                        console.log('[INS vl] entity.voltageLevel:', entity && entity.voltageLevel)
                        const rs = await api.insertVoltageLevelEntity(entity)
                        console.log('[INS vl] insert result:', rs)
                        const newMrid = (rs && rs.data && rs.data.voltageLevel && rs.data.voltageLevel.mrid)
                            || (entity.voltageLevel && entity.voltageLevel.mrid) || dto.voltageLevelId
                        console.log('[INS vl] → success:', !!(rs && rs.success), '| newMrid:', newMrid)
                        return { success: !!(rs && rs.success), mrid: newMrid, mode: 'voltageLevel', message: rs && (rs.message || (rs.error && rs.error.message)) }
                    },
                    bay: async (dto, parent) => {
                        if (parent.mode === 'voltageLevel') { dto.voltage_level = parent.mrid; dto.substation = null }
                        else { dto.substation = parent.mrid; dto.voltage_level = null }
                        console.log('%c[INS bay] DTO (parent=' + parent.mode + ':' + parent.mrid + '):', 'color:#4CAF50', JSON.parse(JSON.stringify(dto)))
                        const rs = await api.insertBayEntity(dto)
                        console.log('[INS bay] insert result:', rs)
                        const newMrid = (rs && rs.data && rs.data.mrid) || dto.mrid || dto.bayId
                        console.log('[INS bay] → success:', !!(rs && rs.success), '| newMrid:', newMrid)
                        return { success: !!(rs && rs.success), mrid: newMrid, mode: 'bay', message: rs && (rs.message || (rs.error && rs.error.message)) }
                    },
                    ...self._buildAssetInserters(api, extractMrid, self),
                },

                jobImporters: {
                    'Voltage transformer': { jobDtoToEntity: VTJob.jobDtoToEntity, insert: (a, o, e) => a.insertVoltageTransformerJob(o, e), update: (a, e) => a.insertVoltageTransformerJob(e, e) },
                    'Current transformer': { jobDtoToEntity: CTJob.jobDtoToEntity, insert: (a, o, e) => a.insertCurrentTransformerJob(o, e), update: (a, e) => a.insertCurrentTransformerJob(e, e) },
                    'Transformer':         { jobDtoToEntity: TFJob.jobDtoToEntity, insert: (a, o, e) => a.insertTransformerJob(o, e),         update: (a, e) => a.insertTransformerJob(e, e) },
                    'Circuit breaker':     { jobDtoToEntity: CBJob.jobDtoToEntity, insert: (a, o, e) => a.insertCircuitBreakerJob(o, e),      update: (a, e) => a.insertCircuitBreakerJob(e, e) },
                    'Surge arrester':      { jobDtoToEntity: SAJob.jobDtoToEntity, insert: (a, o, e) => a.insertSurgeArresterJob(o, e),       update: (a, e) => a.insertSurgeArresterJob(e, e) },
                    'Disconnector':        { jobDtoToEntity: DCJob.jobDtoToEntity, insert: (a, o, e) => a.insertDisconnectorJob(o, e),        update: (a, e) => a.insertDisconnectorJob(e, e) },
                    'Power cable':         { jobDtoToEntity: PCJob.jobDtoToEntity, insert: (a, o, e) => a.insertPowerCableJob(o, e),          update: (a, e) => a.insertPowerCableJob(e, e) },
                    'Rotating machine':    { jobDtoToEntity: RMJob.jobDtoToEntity, insert: (a, o, e) => a.insertRotatingMachineJob(o, e),     update: (a, e) => a.insertRotatingMachineJob(e, e) },
                    'Capacitor':           { jobDtoToEntity: CAPJob.jobDtoToEntity, insert: (a, o, e) => a.insertCapacitorJob(o, e),           update: (a, e) => a.insertCapacitorJob(e, e) },
                    'Reactor':             { jobDtoToEntity: REJob.jobDtoToEntity, insert: (a, o, e) => a.insertReactorJob(o, e),             update: (a, e) => a.insertReactorJob(e, e) },
                    'Bushing':             { jobDtoToEntity: BUJob.jobDtoToEntity, insert: (a, o, e) => a.insertBushingJob(o, e),             update: (a, e) => a.insertBushingJob(e, e) },
                },

                messageHandler: {
                    success: (m) => this.$message.success(m),
                    warning: (m) => this.$message.warning(m),
                    error: (m) => this.$message.error(m),
                },
                loadingHandler: {
                    start: (text) => {
                        const l = this.$loading({ lock: true, text: text || 'Importing...' })
                        return () => l.close()
                    },
                },
            }
            await importBranchFromJSON(fileContent, targetNode, deps, decisions)

            // Refresh giao diện
            try {
                const node = targetNode
                console.log('%c[REFRESH] node=' + node.mrid + ' mode=' + node.mode + ' expanded=' + node.expanded + ' clientSlide=' + this.clientSlide, 'color:#795548')
                this.$set(node, '_childrenFetched', false)
                if (!node.expanded) this.$set(node, 'expanded', true)
                if (this.clientSlide && typeof this.fetchChildren === 'function') {
                    console.log('[REFRESH] → fetchChildren (client)')
                    await this.fetchChildren(node)
                } else if (typeof this.fetchChildrenServer === 'function') {
                    console.log('[REFRESH] → fetchChildrenServer')
                    await this.fetchChildrenServer(node)
                } else if (typeof this.handleRefreshNode === 'function') {
                    console.log('[REFRESH] → handleRefreshNode (fallback)')
                    await this.handleRefreshNode(node)
                }
                console.log('[REFRESH] node.children after:', node.children && node.children.length)
            } catch (e) {
                console.error('[REFRESH] error:', e)
            }
        },
    },
}