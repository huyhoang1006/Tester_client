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
import { importBranchFromJSON, collectGraftBranches, isOrgIntoOrg, nodeModeOf } from '@/views/Import/services/importJsonService'
import { scanTreeConflicts, CONFLICT_ACTION } from '@/views/TreeNode/Common/Import/mridConflictScan'
import { hasUserSuffix, getUserSuffix, replaceUserSuffix, isLocalMrid, appendUserSuffix } from '@/utils/serverId'
import { ID_POLICY_USER_SCOPED } from '@/views/Export/services/exportJsonService'
import { startLoading } from '@/utils/loading'

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
            pendingAutoDecisions: null,
            pendingImportContext: null,
            graftDialogVisible: false,
            graftInfo: null,
            // Reporter của overlay chung; không để trong `data` vì không cần reactive và
            // Vue sẽ đi làm reactive cả closure bên trong.
            _importReporter: null,
            _importDone: 0,
            importFailures: [],
            importFailureDialogVisible: false,
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
        _retargetImportedJsonOwnership(value, userId) {
            if (!value || !userId) return value
            const walk = (item) => {
                if (Array.isArray(item)) {
                    item.forEach(walk)
                    return
                }
                if (!item || typeof item !== 'object') return
                for (const key of Object.keys(item)) {
                    const current = item[key]
                    if (key === 'userId' || key === 'user_id') {
                        item[key] = String(userId)
                    } else if (key === 'userIdentifiedObjectId') {
                        // Liên kết ownership thuộc bản export cũ; bản import sẽ tạo lại
                        // cho tài khoản hiện tại sau khi node được insert thành công.
                        item[key] = ''
                    } else if (typeof current === 'string' && hasUserSuffix(current) && getUserSuffix(current) !== String(userId)) {
                        item[key] = replaceUserSuffix(current, userId)
                    } else if (isLocalMrid(current) && !hasUserSuffix(current)) {
                        // mrid CÓ hậu tố loại nhưng CHƯA có hậu tố người dùng — file export
                        // từ trước khi tách theo người dùng. Phải gắn thêm, nếu không:
                        //
                        //   import  ->  '1000@org'         (giu nguyen)
                        //   tai ve  ->  '1000@org@u-21'    (toLocalMrid gan them)
                        //
                        // Hai mrid khác nhau cho cùng một tổ chức => HAI dòng trong DB =>
                        // hai node ADMIN trên cây. Nhánh `hasUserSuffix` ở trên không bắt
                        // được vì nó chỉ đổi hậu tố của NGƯỜI KHÁC, còn đây là KHÔNG CÓ.
                        //
                        // `isLocalMrid` kiểm hậu tố có thuộc danh sách loại đã biết, nên
                        // email ('evn@mail.com') và mrid cấu hình (UUID trần) không bị đụng.
                        item[key] = appendUserSuffix(current, userId)
                    } else if (current && typeof current === 'object') {
                        walk(current)
                    }
                }
            }
            walk(value)
            return value
        },

        /**
         * Kiểm chính sách id của file TRƯỚC khi ghi bất cứ thứ gì.
         *
         * Bản import này chỉ biết một cách xử lý: đổi hậu tố `@u-<người export>` sang tài
         * khoản đang đăng nhập. File khai một chính sách khác nghĩa là nó được sinh bởi
         * bản mới hơn theo quy ước khác — ghi bừa thì id sai và không có cách lần ngược.
         * Dừng lại rõ ràng tốt hơn.
         *
         * File CŨ không có `idPolicy` thì vẫn cho qua: hoặc là chưa có hậu tố (dữ liệu
         * trước khi tách theo người dùng), hoặc có và bước retarget xử lý được.
         *
         * @returns {boolean} true = được phép import
         */
        _checkImportIdPolicy(content) {
            if (Array.isArray(content)) return true   // file cũ: mảng roots trần
            const policy = content && content.idPolicy
            if (!policy) {
                console.warn('[IMPORT] file khong khai idPolicy → coi la file cu, van import')
                return true
            }
            if (policy !== ID_POLICY_USER_SCOPED) {
                console.error('[IMPORT] idPolicy khong nhan dang:', policy)
                this.$message.error(
                    `This file uses an unsupported id policy ("${policy}"). ` +
                    'Please update the application before importing it.'
                )
                return false
            }
            // Cùng chính sách nhưng KHÁC người export → mọi mrid sẽ bị đổi hậu tố. Nói ra,
            // vì người dùng cần biết bản import là BẢN RIÊNG của mình chứ không phải cùng
            // một bản ghi với người gửi file.
            const exporter = content.exportedByUserId
            const me = String(this.$store.state.user.user_id)
            if (exporter && String(exporter) !== me) {
                console.log(`[IMPORT] file export boi user ${exporter}, import voi user ${me} → doi hau to`)
                this.$message.info(
                    `This file was exported by another account (user ${exporter}). ` +
                    'It will be imported as your own copy.'
                )
            }
            return true
        },

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
                // Kiểm chính sách id TRƯỚC khi đổi hậu tố — không hiểu file thì không sửa nó.
                if (!this._checkImportIdPolicy(content)) return

                content = this._retargetImportedJsonOwnership(content, this.$store.state.user.user_id)

                // ── BƯỚC 1: kiểm tra GHÉP ĐÚNG CẤP (Cách A) ─────────────────────
                // Nếu cây file bắt đầu cao hơn node đích → cần bỏ cấp → hỏi xác nhận.
                const graftInfo = this._computeGraftInfo(roots, targetNode)
                if (graftInfo && graftInfo.needConfirm) {
                    console.log('[IMPORT] cần ghép cấp → mở graft dialog', graftInfo)
                    this.pendingImportContext = { fileContent: content, targetNode }
                    this.graftInfo = graftInfo
                    this.graftDialogVisible = true
                    return   // chờ người dùng confirm → _proceedAfterGraft
                }
                if (graftInfo && graftInfo.noMatch) {
                    this.$message.warning('No matching nodes to import into the selected target.')
                    return
                }

                // Cấp khớp sẵn → tiếp tục scan conflict + import
                await this._proceedImport(content, targetNode, roots)
            } catch (err) {
                console.error('[IMPORT] Error opening/reading file:', err)
                this.$message.error('An error occurred while importing JSON')
            }
        },

        // Tính thông tin ghép cấp để hiển thị dialog (dùng helper từ service).
        _computeGraftInfo(roots, targetNode) {
            const targetMode = targetNode.mode
            // org vào org → không bỏ cấp
            if (isOrgIntoOrg(roots, targetMode)) return { needConfirm: false }

            const { grafts, skipped } = collectGraftBranches(roots, targetMode)
            if (!grafts || grafts.length === 0) return { noMatch: true }

            const skippedList = Object.keys(skipped).map(mode => ({ mode, count: skipped[mode] }))
            const needConfirm = skippedList.length > 0   // có bỏ cấp → cần xác nhận
            return {
                needConfirm,
                targetMode,
                targetName: targetNode.name || '',
                graftMode: nodeModeOf(grafts[0].type),
                graftCount: grafts.length,
                skippedList,
            }
        },

        // Sau khi confirm graft dialog → tiếp tục import.
        async handleGraftConfirm() {
            this.graftDialogVisible = false
            const ctx = this.pendingImportContext
            if (!ctx) return
            const roots = Array.isArray(ctx.fileContent) ? ctx.fileContent : (ctx.fileContent && ctx.fileContent.roots)
            await this._proceedImport(ctx.fileContent, ctx.targetNode, roots)
        },

        handleGraftCancel() {
            this.graftDialogVisible = false
            this.pendingImportContext = null
            this.graftInfo = null
        },

        // Scan conflict mrid → dialog conflict hoặc import thẳng.
        async _proceedImport(content, targetNode, roots) {
            try {
                // Chỉ scan trùng trên các nhánh THỰC SỰ sẽ import (đã ghép cấp),
                // bỏ qua org/sub cấp cao đã loại — nếu không Resolve mRID Conflicts
                // sẽ hiện cả những node đã bị graft bỏ.
                let branchesToScan = roots
                if (!isOrgIntoOrg(roots, targetNode.mode)) {
                    const { grafts } = collectGraftBranches(roots, targetNode.mode)
                    if (grafts && grafts.length > 0) branchesToScan = grafts
                }
                console.log('[IMPORT] scan trên', branchesToScan.length, 'nhánh đã ghép (roots gốc:', roots.length, ')')

                let conflicts = []
                try {
                    const scan = await scanTreeConflicts(branchesToScan, {
                        electronAPI: window.electronAPI,
                        userId: this.$store.state.user.user_id,
                        opts: { resolvePath: true, targetMrid: targetNode.mrid },
                    })
                    conflicts = (scan && scan.conflicts) || []
                    console.log('[IMPORT] scan conflicts:', conflicts.length, conflicts)
                } catch (e) {
                    console.error('[IMPORT] Conflict scan error:', e)
                    this.$message.warning('Could not check for mRID conflicts; importing as new')
                }

                // TỐI ƯU LỰA CHỌN: trùng mrid nhưng node cũ ở NHÁNH KHÁC (cha khác)
                // → auto "create new", KHÔNG đưa vào dialog. Dialog chỉ hỏi các node
                // trùng CÙNG NHÁNH (mới thật sự cần người dùng quyết định).
                const autoDecisions = {}
                const askConflicts = []
                for (const c of conflicts) {
                    if (c.autoNew) autoDecisions[c.mrid] = CONFLICT_ACTION.NEW
                    else askConflicts.push(c)
                }
                if (Object.keys(autoDecisions).length) {
                    console.log('[IMPORT] auto create-new (khác nhánh):', Object.keys(autoDecisions).length, Object.keys(autoDecisions))
                }

                if (askConflicts.length > 0) {
                    console.log('[IMPORT] CÓ trùng cùng nhánh → mở dialog', askConflicts.length)
                    this.pendingConflicts = askConflicts
                    this.pendingAutoDecisions = autoDecisions
                    this.pendingImportContext = { fileContent: content, targetNode }
                    this.conflictDialogVisible = true
                } else if (Object.keys(autoDecisions).length > 0) {
                    console.log('[IMPORT] tất cả trùng đều khác nhánh → import thẳng với auto create-new')
                    await this.importTreeFromJSON(content, targetNode, autoDecisions)
                } else {
                    console.log('[IMPORT] KHÔNG trùng → import thẳng')
                    await this.importTreeFromJSON(content, targetNode, null)
                }
            } catch (err) {
                console.error('[IMPORT] _proceedImport error:', err)
                this.$message.error('An error occurred while importing JSON')
            }
        },

        // Dialog xung dot: user bam Import -> chay import theo quyet dinh
        async handleConflictConfirm(decisions) {
            this.conflictDialogVisible = false
            const ctx = this.pendingImportContext
            // gộp quyết định dialog + auto create-new (khác nhánh)
            const merged = Object.assign({}, this.pendingAutoDecisions || {}, decisions || {})
            this.pendingConflicts = []
            this.pendingAutoDecisions = null
            this.pendingImportContext = null
            if (!ctx) return
            await this.importTreeFromJSON(ctx.fileContent, ctx.targetNode, merged)
        },

        // Dialog xung dot: user Cancel -> huy
        handleConflictCancel() {
            this.conflictDialogVisible = false
            this.pendingConflicts = []
            this.pendingAutoDecisions = null
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
                disconnector:       { map: dcDtoToEntity, ins: (o, e) => api.insertDisconnectorEntity(e) },
                powerCable:         { map: pcDtoToEntity, ins: (o, e) => api.insertPowerCableEntity(o, e) },
                rotatingMachine:    { map: rmDtoToEntity, ins: (o, e) => api.insertRotatingMachineEntity(e) },
                capacitor:          { map: capDtoToEntity, ins: (o, e) => api.insertCapacitorEntity(o, e) },
                reactor:            { map: reDtoToEntity, ins: (o, e) => api.insertReactorEntity(o, e) },
                bushing:            { map: buDtoToEntity, ins: (o, e) => api.insertBushingEntity(e) },
            }
            const out = {}
            for (const key of Object.keys(A)) {
                const def = A[key]
                out[key] = async (dto, parent) => {
                    // Asset DTO: parent (psr = bay/substation mrid) ở field dto.psrId.
                    if (dto) dto.psrId = parent.mrid
                    // TƯƠNG THÍCH NGƯỢC (DTO mới có number_of_phase/phase): file export CŨ
                    // không có object config/configuration → mapper mới đọc
                    // dto.config.number_of_phase sẽ CRASH. Bổ sung khung rỗng trước khi map.
                    self._ensurePhaseFields(dto, key)
                    let entity, oldEntity, rs
                    try {
                        entity = def.map(dto)
                        // CRITICAL: asset CRUD gọi JSON.parse(entity.attachment.path) rồi
                        // syncFilesWithDeletion(srcList) để đồng bộ FILE đính kèm. Khi import
                        // sang nhánh/máy mới, file cũ KHÔNG tồn tại → sync fail → insert trả
                        // success:false ("fail"). Tạo mới không kèm file → ÉP path='[]'.
                        if (!entity.attachment) entity.attachment = {}
                        entity.attachment.path = '[]'
                        // Đảm bảo mọi object con (sẽ insert vào identified_object) có mrid.
                        // Một số sub-object trong entity (voltage/baseVoltage/winding...) có
                        // mrid=null → insert vi phạm NOT NULL: identified_object.mrid. Sinh mrid
                        // mới cho object có dữ liệu mà mrid đang null.
                        self._fillNullMrids(entity)
                        // FK rỗng '' → null: nhiều assetInfo có FK (c1/c2/rated_frequency/
                        // rated_voltage...) = '' khi giá trị chưa nhập. SQLite coi '' là giá trị
                        // → tìm record mrid='' không có → FOREIGN KEY constraint failed.
                        // Đổi '' → null để FK được bỏ qua (nullable).
                        self._nullifyEmptyFKs(entity)
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
        // Sinh mrid mới cho mọi object con CÓ DỮ LIỆU nhưng mrid null/rỗng
        // (tránh NOT NULL constraint: identified_object.mrid khi insert).
        // Đổi FK rỗng '' → null (tránh FOREIGN KEY constraint failed).
        // Áp cho field tham chiếu: kết thúc _id/Id, hoặc tên FK đã biết của assetInfo
        // (c1, c2, rated_frequency, rated_voltage, rated_power, base_voltage...).
        // TƯƠNG THÍCH NGƯỢC cho DTO mới (number_of_phase + phase, chỉ asset):
        // file export cũ thiếu object chứa 2 field này → mapper mới crash khi đọc.
        // Bổ sung khung rỗng đúng vị trí từng asset (theo Dto mới):
        //   CT/VT/Disconnector/SurgeArrester/Reactor → dto.config
        //   Bushing → dto.configuration | CB → dto.circuitBreaker (numberOfPhases)
        //   Transformer → dto.winding_configuration | PowerCable/Capacitor → dto gốc
        _ensurePhaseFields(dto, type) {
            if (!dto || typeof dto !== 'object') return
            const fill = (o, npKey = 'number_of_phase') => {
                if (o[npKey] === undefined) o[npKey] = ''
                if (o.phase === undefined) o.phase = ''
            }
            switch (type) {
                case 'currentTransformer':
                case 'voltageTransformer':
                case 'disconnector':
                case 'surgeArrester':
                case 'reactor':
                    if (!dto.config) dto.config = {}
                    fill(dto.config)
                    break
                case 'bushing':
                    if (!dto.configuration) dto.configuration = {}
                    fill(dto.configuration)
                    break
                case 'breaker':
                    if (!dto.circuitBreaker) dto.circuitBreaker = {}
                    fill(dto.circuitBreaker, 'numberOfPhases')
                    break
                case 'transformer':
                    if (!dto.winding_configuration) dto.winding_configuration = {}
                    if (dto.winding_configuration.phase === undefined) dto.winding_configuration.phase = ''
                    break
                case 'powerCable':
                case 'capacitor':
                    fill(dto)
                    break
                default:
                    break
            }
        },
        _nullifyEmptyFKs(obj) {
            if (!obj || typeof obj !== 'object') return
            if (Array.isArray(obj)) { for (const it of obj) this._nullifyEmptyFKs(it); return }
            const FK_NAMES = new Set([
                'c1', 'c2', 'rated_frequency', 'rated_voltage', 'rated_power',
                'rated_current', 'rated_burden', 'base_voltage', 'nominal_voltage',
            ])
            for (const k of Object.keys(obj)) {
                const v = obj[k]
                if (typeof v === 'string' && v === '') {
                    if (k.endsWith('_id') || k.endsWith('Id') || FK_NAMES.has(k)) {
                        obj[k] = null
                    }
                } else if (v && typeof v === 'object') {
                    this._nullifyEmptyFKs(v)
                }
            }
        },
        _fillNullMrids(obj) {
            if (!obj || typeof obj !== 'object') return
            if (Array.isArray(obj)) { for (const it of obj) this._fillNullMrids(it); return }
            const keys = Object.keys(obj)
            // "có data" = có field primitive không rỗng NGOÀI mrid/unit/type.
            // Object value-cell rỗng ({mrid:'', value:'', unit:'p|F'}) KHÔNG tính là có data
            // (chỉ unit là placeholder) → không cấp mrid → không insert record value rỗng
            // → tránh FK rỗng trỏ tới record không tồn tại.
            const IGNORE = new Set(['mrid', 'unit', 'type'])
            const hasData = keys.some(k => {
                if (IGNORE.has(k)) return false
                const v = obj[k]
                return v !== null && v !== undefined && v !== '' && typeof v !== 'object'
            })
            if (Object.prototype.hasOwnProperty.call(obj, 'mrid')) {
                if ((obj.mrid === null || obj.mrid === undefined || obj.mrid === '') && hasData) {
                    obj.mrid = this.generateUuid()
                }
            }
            for (const k of keys) {
                const v = obj[k]
                if (v && typeof v === 'object') this._fillNullMrids(v)
            }
        },
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
                        const entity = subDtoToEntity(dto)
                        // QUAN TRỌNG: substation gắn org QUA bảng organisation_psr.
                        // Đảm bảo organisationPsr trỏ đúng org mới (parent đã chọn).
                        if (entity && entity.organisationPsr) {
                            entity.organisationPsr.organisation_id = parent.mrid
                            entity.organisationPsr.psr_id = entity.substation && entity.substation.mrid
                            // nếu chưa có mrid bản ghi psr → tạo mới để upsert đúng
                            if (!entity.organisationPsr.mrid) entity.organisationPsr.mrid = self.generateUuid()
                        }
                        console.log('[INS sub] organisationPsr:', JSON.stringify(entity && entity.organisationPsr), '| parent=', parent.mrid)
                        const rs = await api.insertSubstationEntity(entity)
                        console.log('[INS sub] insert result:', rs && rs.success, rs && rs.message)
                        const newMrid = (rs && rs.data && rs.data.substation && rs.data.substation.mrid)
                            || (entity.substation && entity.substation.mrid) || dto.subsId
                        return { success: !!(rs && rs.success), mrid: newMrid, mode: 'substation', message: rs && (rs.message || (rs.error && rs.error.message)) }
                    },
                    voltageLevel: async (dto, parent) => {
                        dto.substationId = parent.mrid
                        // Export cũ có thể chỉ mang locationId nhưng không mang entity
                        // Location. Không được giữ/sinh một FK không có bản ghi đích.
                        if (!dto.location || !dto.location.mrid) dto.locationId = null
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
                    'Voltage transformer': { jobDtoToEntity: VTJob.jobDtoToEntity, insert: (a, o, e) => a.insertVoltageTransformerJob(self._emptyArraysClone(e), e), update: (a, e) => a.insertVoltageTransformerJob(e, e) },
                    'Current transformer': { jobDtoToEntity: CTJob.jobDtoToEntity, insert: (a, o, e) => a.insertCurrentTransformerJob(self._emptyArraysClone(e), e), update: (a, e) => a.insertCurrentTransformerJob(e, e) },
                    'Transformer':         { jobDtoToEntity: TFJob.jobDtoToEntity, insert: (a, o, e) => a.insertTransformerJob(self._emptyArraysClone(e), e),         update: (a, e) => a.insertTransformerJob(e, e) },
                    'Circuit breaker':     { jobDtoToEntity: CBJob.jobDtoToEntity, insert: (a, o, e) => a.insertCircuitBreakerJob(self._emptyArraysClone(e), e),      update: (a, e) => a.insertCircuitBreakerJob(e, e) },
                    'Surge arrester':      { jobDtoToEntity: SAJob.jobDtoToEntity, insert: (a, o, e) => a.insertSurgeArresterJob(self._emptyArraysClone(e), e),       update: (a, e) => a.insertSurgeArresterJob(e, e) },
                    'Disconnector':        { jobDtoToEntity: DCJob.jobDtoToEntity, insert: (a, o, e) => a.insertDisconnectorJob(self._emptyArraysClone(e), e),        update: (a, e) => a.insertDisconnectorJob(e, e) },
                    'Power cable':         { jobDtoToEntity: PCJob.jobDtoToEntity, insert: (a, o, e) => a.insertPowerCableJob(self._emptyArraysClone(e), e),          update: (a, e) => a.insertPowerCableJob(e, e) },
                    'Rotating machine':    { jobDtoToEntity: RMJob.jobDtoToEntity, insert: (a, o, e) => a.insertRotatingMachineJob(self._emptyArraysClone(e), e),     update: (a, e) => a.insertRotatingMachineJob(e, e) },
                    'Capacitor':           { jobDtoToEntity: CAPJob.jobDtoToEntity, insert: (a, o, e) => a.insertCapacitorJob(self._emptyArraysClone(e), e),           update: (a, e) => a.insertCapacitorJob(e, e) },
                    'Reactor':             { jobDtoToEntity: REJob.jobDtoToEntity, insert: (a, o, e) => a.insertReactorJob(self._emptyArraysClone(e), e),             update: (a, e) => a.insertReactorJob(e, e) },
                    'Bushing':             { jobDtoToEntity: BUJob.jobDtoToEntity, insert: (a, o, e) => a.insertBushingJob(self._emptyArraysClone(e), e),             update: (a, e) => a.insertBushingJob(e, e) },
                },

                messageHandler: {
                    success: (m) => this.$message.success(m),
                    warning: (m) => this.$message.warning(m),
                    error: (m) => this.$message.error(m),
                },
                // MỘT KIỂU LOADING DUY NHẤT. Trước đây import có hộp thoại tiến trình
                // riêng (ImportProgressDialog) — hình thức khác, không nhịp tim, không
                // nút dừng. Giờ dùng chung overlay với tải/xoá/export.
                //
                // Import BIẾT trước tổng số node (onProgressInit), nên đây là một trong
                // ít chỗ thanh phần trăm là số thật.
                loadingHandler: {
                    start: () => {
                        this._importReporter = startLoading(this, {
                            action: 'import',
                            text: 'Reading file...',
                            type: 'heavy',
                        })
                        this._importDone = 0
                        return () => {
                            const r = this._importReporter
                            this._importReporter = null
                            return r ? r.close() : undefined
                        }
                    },
                },
                onProgressInit: (total) => {
                    this._importDone = 0
                    if (this._importReporter) this._importReporter.progress(null, 0, total)
                },
                onProgress: ({ name, type }) => {
                    this._importDone = (this._importDone || 0) + 1
                    if (this._importReporter) {
                        const label = name || 'node'
                        this._importReporter.progress(`Importing ${type || 'node'} "${label}"`, this._importDone)
                    }
                },
                // Tôn trọng nút Dừng. Kiểm ở ranh giới giữa hai node: node đang ghi xong
                // hẳn rồi mới thoát, nên không để lại node nào ghi được một nửa.
                isAborted: () => Boolean(this._importReporter && this._importReporter.aborted()),
                // Node fail → mở HỘP THOẠI BẢNG, không phải notification.
                //
                // Bản trước nhồi vào một `$notify` với `<ul>` cắt ở 10 dòng và phần còn lại
                // ghi "...and 29 more (see console)". Ba vấn đề: cắt mất dữ liệu, không sao
                // chép được, và mọi dòng lặp lại cùng một câu lỗi nên đọc 10 dòng vẫn không
                // rõ có mấy nguyên nhân.
                //
                // Hộp thoại gộp theo THÔNG BÁO LỖI: 39 thiết bị hỏng cùng một nguyên nhân là
                // MỘT vấn đề, không phải 39.
                onImportFailures: (failures) => {
                    this.importFailures = failures || []
                    this.importFailureDialogVisible = this.importFailures.length > 0
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
