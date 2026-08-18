/**
 * exportJsonService.js
 * ----------------------------------------------------------------------------
 * Service export 1 NHÁNH cây ra JSON: node được chọn làm GỐC, kèm TOÀN BỘ
 * con cháu (organisation → substation → voltageLevel → bay → asset → job),
 * mỗi node mang theo DTO dữ liệu của chính nó.
 *
 * Theo pattern của Word/Excel: toàn bộ logic nằm trong service này, mixin chỉ
 * gọi 1 hàm entry. KHÔNG có giao diện: chọn node → gọi export → hỏi chỗ lưu → xuất.
 *
 * Định dạng JSON cây (1 node gốc):
 * {
 *   "type": "substation",          // loại node
 *   "asset": "Voltage transformer",// chỉ có với node asset (để biết loại asset)
 *   "data": { ...DTO... },         // DTO dữ liệu node (như export cũ)
 *   "children": [ { ...node con... }, ... ]
 * }
 *
 * Node job:
 * { "type": "job", "asset": "Voltage transformer", "data": { ...jobDTO... }, "children": [] }
 *
 * dependencies (giống export cũ, thêm jobMappings):
 *   { electronAPI, mappings, jobMappings, userId, messageHandler, loadingHandler }
 *   - mappings: các *Mapping asset/substation/... (đã có trong export cũ)
 *   - jobMappings: map theo TÊN ASSET → { JobEntityToDto }  (xem mixin bên dưới)
 * ----------------------------------------------------------------------------
 */

/**
 * Chính sách id của file export.
 *
 * 'user-scoped' — mrid trong file mang hậu tố `@u-<exportedByUserId>` của người export.
 * Bên import PHẢI đổi hậu tố sang tài khoản đang đăng nhập trước khi ghi, nếu không hai
 * người sẽ tranh nhau cùng một khoá chính.
 *
 * Hiện tại đây là giá trị DUY NHẤT. Đặt tên cho nó không phải để hôm nay chọn giữa hai
 * kiểu, mà để hôm nay tuyên bố kiểu — file sau này có chính sách khác thì bản import cũ
 * nhận ra là mình không hiểu và dừng, thay vì ghi bừa.
 */
export const ID_POLICY_USER_SCOPED = 'user-scoped'

const sanitizeFileName = (name) => {
    if (!name) return 'export-data'
    return name.replace(/[<>:"/\\|?*]/g, '').trim() || 'export-data'
}

const unwrap = (res) => (res && res.success && res.data !== undefined ? res.data : null)

// Bay entity (SELECT * FROM bay, phẳng) → Bay DTO phẳng khớp insertBayEntity.
const bayEntityToDto = (e) => {
    if (!e) return null
    const b = e.bay || e
    return {
        mrid: b.mrid || '',
        bayId: b.mrid || '',
        name: b.name || '',
        aliasName: b.alias_name || b.aliasName || '',
        substation: b.substation || null,
        voltage_level: b.voltage_level || null,
        breaker_configuration: b.breaker_configuration || '',
        bus_bar_configuration: b.bus_bar_configuration || '',
        bay_energy_meas_flag: b.bay_energy_meas_flag || '',
        bay_power_meas_flag: b.bay_power_meas_flag || '',
    }
}


// ===========================================================================
// 1. LẤY DTO DỮ LIỆU CỦA 1 NODE (không kèm con) — tách từ export cũ, dùng lại
//    Trả về { type, asset?, data } hoặc null nếu không lấy được.
// ===========================================================================
const fetchNodeSelfDto = async (node, deps) => {
    const { electronAPI, mappings, userId } = deps
    try {
        if (node.mode === 'organisation') {
            const e = unwrap(await electronAPI.getOrganisationEntityByMrid(node.mrid))
            if (e) return { type: 'organisation', data: mappings.OrganisationMapping.OrgEntityToOrgDto(e) }

        } else if (node.mode === 'substation') {
            const e = unwrap(await electronAPI.getSubstationEntityByMrid(node.mrid, userId, node.parentId))
            if (e) return { type: 'substation', data: mappings.SubstationMapping.mapEntityToDto(e) }

        } else if (node.mode === 'voltageLevel') {
            const e = unwrap(await electronAPI.getVoltageLevelEntityByMrid(node.mrid))
            // Xuất DTO (đối xứng volDtoToVolEntity khi import) thay vì raw entity
            if (e) return { type: 'voltageLevel', data: mappings.VoltageLevelMapping.volEntityToVolDto(e) }

        } else if (node.mode === 'bay') {
            const e = unwrap(await electronAPI.getBayEntityByMrid(node.mrid))
            // Bay DTO phẳng — convert entity → DTO khớp insertBayEntity
            if (e) return { type: 'bay', data: bayEntityToDto(e) }

        } else if (node.mode === 'asset') {
            return await fetchAssetSelfDto(node, deps)
        }
    } catch (err) {
        console.error(`[exportJson] Error fetching node DTO ${node.mode} ${node.mrid}:`, err)
    }
    return null
}

// Bảng tra asset: tên asset → { api, mapping, type }
// api(node, electronAPI) trả promise entity; mapping(e) trả dto.
const ASSET_DEFS = {
    'Surge arrester':        { type: 'surgeArrester',      get: (n, a) => a.getSurgeArresterEntityByMrid(n.mrid),
                               map: (m, e) => m.SurgeArresterMapping.mapEntityToDto(e) },
    'Power cable':           { type: 'powerCable',         get: (n, a) => a.getPowerCableEntityByMrid(n.mrid, n.parentId),
                               map: (m, e) => m.PowerCableMapping.mapEntityToDto(e) },
    'Disconnector':          { type: 'disconnector',       get: (n, a) => a.getDisconnectorEntityByMrid(n.mrid, n.parentId),
                               map: (m, e) => m.DisconnectorMapping.disconnectorEntityToDto(e) },
    'Rotating machine':      { type: 'rotatingMachine',    get: (n, a) => a.getRotatingMachineEntityByMrid(n.mrid, n.parentId),
                               map: (m, e) => m.rotatingMachineMapping.mapEntityToDto(e) },
    'Capacitor':             { type: 'capacitor',          get: (n, a) => a.getCapacitorEntityByMrid(n.mrid, n.parentId),
                               map: (m, e) => m.CapacitorMapping.mapEntityToDto(e) },
    'Voltage transformer':   { type: 'voltageTransformer', get: (n, a) => a.getVoltageTransformerEntityByMrid(n.mrid, n.parentId),
                               map: (m, e) => m.VoltageTransformerMapping.mapEntityToDto(e) },
    'Current transformer':   { type: 'currentTransformer', get: (n, a) => a.getCurrentTransformerEntityByMrid(n.mrid, n.parentId),
                               map: (m, e) => m.CurrentTransformerMapping.mapEntityToDto(e) },
    'Transformer':           { type: 'transformer',        get: (n, a) => a.getTransformerEntityByMrid(n.mrid, n.parentId),
                               map: (m, e) => m.TransformerMapping.transformerEntityToDto(e) },
    'Circuit breaker':       { type: 'breaker',            get: (n, a) => a.getBreakerEntityByMrid(n.mrid, n.parentId),
                               map: (m, e) => m.BreakerMapping.mapEntityToDto(e) },
    'Reactor':               { type: 'reactor',            get: (n, a) => a.getReactorEntityByMrid(n.mrid, n.parentId),
                               map: (m, e) => m.ReactorMapping.mapEntityToDto(e) },
    'Bushing':               { type: 'bushing',            get: (n, a) => a.getBushingEntityByMrid(n.mrid, n.parentId),
                               map: (m, e) => m.BushingMapping.mapEntityToDto(e) },
}

const fetchAssetSelfDto = async (node, deps) => {
    const { electronAPI, mappings } = deps
    const def = ASSET_DEFS[node.asset]
    if (!def) {
        console.warn(`[exportJson] Asset not supported yet: ${node.asset}`)
        return null
    }
    const e = unwrap(await def.get(node, electronAPI))
    if (!e) return null
    return { type: def.type, asset: node.asset, data: def.map(mappings, e) }
}

// ===========================================================================
// 2. LẤY DANH SÁCH NODE CON (1 cấp) — dùng đúng các electronAPI mà cây dùng
//    Trả về mảng node con dạng { mode, mrid, parentId, name?, asset? }
// ===========================================================================
const fetchChildNodes = async (node, deps) => {
    const { electronAPI, userId } = deps
    const children = []
    try {
        if (node.mode === 'organisation') {
            const [orgRes, subRes] = await Promise.all([
                electronAPI.getParentOrganizationByParentMrid(node.mrid),
                electronAPI.getSubstationsInOrganisationForUser(node.mrid, userId),
            ])
            for (const o of (unwrap(orgRes) || []))
                children.push({ mode: 'organisation', mrid: o.mrid, parentId: node.mrid, name: o.name })
            for (const s of (unwrap(subRes) || []))
                children.push({ mode: 'substation', mrid: s.mrid, parentId: node.mrid, name: s.name })

        } else if (node.mode === 'substation') {
            const [vlRes, bayRes] = await Promise.all([
                electronAPI.getVoltageLevelBySubstationId(node.mrid),
                electronAPI.getBayByVoltageBySubstationId(null, node.mrid), // bay trực tiếp dưới substation
            ])
            for (const vl of (unwrap(vlRes) || []))
                children.push({ mode: 'voltageLevel', mrid: vl.mrid, parentId: node.mrid, name: vl.name })
            for (const b of (unwrap(bayRes) || []))
                children.push({ mode: 'bay', mrid: b.mrid, parentId: node.mrid, name: b.name })
            // asset gắn trực tiếp substation
            children.push(...await fetchAssetChildNodes(node.mrid, deps))

        } else if (node.mode === 'voltageLevel') {
            const bayRes = await electronAPI.getBayByVoltageBySubstationId(node.mrid, null)
            for (const b of (unwrap(bayRes) || []))
                children.push({ mode: 'bay', mrid: b.mrid, parentId: node.mrid, name: b.name })
            children.push(...await fetchAssetChildNodes(node.mrid, deps))

        } else if (node.mode === 'bay') {
            children.push(...await fetchAssetChildNodes(node.mrid, deps))

        } else if (node.mode === 'asset') {
            // con của asset = các job
            const jobRes = await electronAPI.getOldWorkByAssetId(node.mrid)
            for (const j of (unwrap(jobRes) || []))
                children.push({ mode: 'job', mrid: j.mrid, parentId: node.mrid, asset: node.asset, name: j.name })
        }
    } catch (err) {
        console.error(`[exportJson] Error fetching children of ${node.mode} ${node.mrid}:`, err)
    }
    return children
}

// Lấy toàn bộ asset gắn dưới 1 psrId (bay/voltageLevel/substation)
const fetchAssetChildNodes = async (psrId, deps) => {
    const { electronAPI } = deps
    const out = []
    const calls = [
        ['Transformer',         electronAPI.getAssetByPsrIdAndKind(psrId, 'Transformer')],
        ['Surge arrester',      electronAPI.getSurgeArresterByPsrId(psrId)],
        ['Bushing',             electronAPI.getBushingByPsrId(psrId)],
        ['Voltage transformer', electronAPI.getAssetByPsrIdAndKind(psrId, 'Voltage transformer')],
        ['Disconnector',        electronAPI.getAssetByPsrIdAndKind(psrId, 'Disconnector')],
        ['Power cable',         electronAPI.getAssetByPsrIdAndKind(psrId, 'Power cable')],
        ['Rotating machine',    electronAPI.getAssetByPsrIdAndKind(psrId, 'Rotating machine')],
        ['Current transformer', electronAPI.getAssetByPsrIdAndKind(psrId, 'Current transformer')],
        ['Capacitor',           electronAPI.getAssetByPsrIdAndKind(psrId, 'Capacitor')],
        ['Circuit breaker',     electronAPI.getAssetByPsrIdAndKind(psrId, 'Circuit breaker')],
        ['Reactor',             electronAPI.getAssetByPsrIdAndKind(psrId, 'Reactor')],
    ]
    const results = await Promise.all(calls.map(c => c[1]))
    results.forEach((res, i) => {
        const assetName = calls[i][0]
        for (const a of (unwrap(res) || []))
            out.push({ mode: 'asset', asset: assetName, mrid: a.mrid, parentId: psrId,
                       name: a.name, serial_number: a.serial_number })
    })
    return out
}

// ===========================================================================
// 3. LẤY DTO JOB ĐẦY ĐỦ (kèm test data) cho 1 node job
// ===========================================================================
const fetchJobSelfDto = async (node, deps) => {
    const { electronAPI, jobMappings } = deps
    const def = jobMappings[node.asset]   // jobMappings theo TÊN asset
    if (!def) {
        console.warn(`[exportJson] No job mapping for asset: ${node.asset}`)
        return null
    }
    try {
        const res = await def.getByMrid(electronAPI, node.mrid)
        const entity = unwrap(res)
        if (!entity) return null
        const dto = def.JobEntityToDto(entity)
        return { type: 'job', asset: node.asset, data: dto }
    } catch (err) {
        console.error(`[exportJson] Error fetching job ${node.mrid}:`, err)
        return null
    }
}

// ===========================================================================
// 4. ĐỆ QUY: build node cây { type, asset?, data, children: [] }
//    withChildren=false → chỉ build node đó (Export only Node)
//    withChildren=true  → đệ quy cả con cháu (Export Full Tree)
// ===========================================================================
/** Tên loại node cho người đọc, dùng trong dòng mô tả tiến độ. */
const describeNode = (node) => {
    if (node.mode === 'asset') return node.asset || 'asset'
    if (node.mode === 'voltageLevel') return 'voltage level'
    return node.mode || 'node'
}

const buildBranch = async (node, deps, withChildren = true, counter = { done: 0 }) => {
    const reporter = deps.reporter

    // Dừng ở RANH GIỚI GIỮA HAI NODE. Export chỉ ĐỌC nên dừng giữa đường không hỏng dữ
    // liệu, nhưng file sẽ thiếu — nên phải báo lỗi ra ngoài, không được lặng lẽ ghi ra
    // một nhánh cụt rồi nói "thành công".
    if (reporter && reporter.aborted && reporter.aborted()) throw new Error('CANCELED')

    if (reporter && reporter.progress) {
        const label = node.aliasName || node.name || node.serial_number || node.mrid
        // Không biết trước tổng số node (phải đọc mới biết có con), nên KHÔNG vẽ phần
        // trăm. Đếm số node đã đọc và đưa vào chính dòng mô tả: đó là số thật.
        reporter.progress(`Reading ${describeNode(node)} "${label}" (${counter.done} done)`)
    }

    let self
    if (node.mode === 'job') {
        self = await fetchJobSelfDto(node, deps)
    } else {
        self = await fetchNodeSelfDto(node, deps)
    }
    if (!self) return null
    counter.done++

    const branch = { ...self, children: [] }

    // job là lá; nếu chỉ export node thì cũng không duyệt con
    if (withChildren && node.mode !== 'job') {
        const childNodes = await fetchChildNodes(node, deps)
        for (const child of childNodes) {
            const childBranch = await buildBranch(child, deps, true, counter)
            if (childBranch) branch.children.push(childBranch)
        }
    }
    return branch
}

// ===========================================================================
// 5. ENTRY: export node gốc ra file JSON
//    options.mode: 'fullTree' (mặc định) = node + con cháu
//                  'onlyNode'            = chỉ node được chọn
// ===========================================================================
export const exportBranchToJSON = async (nodes, deps, options = {}) => {
    const { electronAPI, messageHandler, reporter, userId } = deps
    const mode = options.mode || 'fullTree'
    const withChildren = mode !== 'onlyNode'
    const nodesArray = Array.isArray(nodes) ? nodes : (nodes ? [nodes] : [])

    if (nodesArray.length === 0) {
        messageHandler && messageHandler.warning('No node selected to export')
        if (reporter) await reporter.close()
        return
    }

    try {
        // Build cho từng node gốc được chọn
        const counter = { done: 0 }
        const roots = []
        for (const node of nodesArray) {
            const branch = await buildBranch(node, deps, withChildren, counter)
            if (branch) roots.push(branch)
        }

        if (roots.length === 0) {
            messageHandler && messageHandler.warning('No data to export')
            return
        }

        // Payload: { version, exportMode, exportedByUserId, idPolicy, exportedAt, roots }
        //
        // exportedByUserId + idPolicy TỰ KHAI mrid bên trong file thuộc dạng nào. Không
        // có hai field này thì bên import phải SUY từ dữ liệu: gặp `108050@sub@u-21` mà
        // không biết 21 là ai, cũng không biết hậu tố đó là cố ý hay là rác. Ghi ra thì
        // đọc thẳng.
        //
        // idPolicy chỉ có MỘT giá trị hợp lệ hôm nay: 'user-scoped' — mọi mrid mang hậu
        // tố `@u-<exportedByUserId>` và bên import sẽ đổi sang hậu tố của mình.
        const payload = {
            version: 'tree-json-v1',
            exportMode: mode,                 // ghi rõ kiểu export vào file
            exportedByUserId: userId != null ? String(userId) : null,
            idPolicy: ID_POLICY_USER_SCOPED,
            exportedAt: new Date().toISOString(),
            roots,
        }

        // Tên file mặc định từ node gốc đầu tiên + hậu tố kiểu export
        const first = nodesArray[0]
        const baseName = first?.name || first?.serial_number || first?.asset || 'tree-export'
        const suffix = withChildren ? 'full-tree' : 'node'
        const fileName = `${sanitizeFileName(baseName)}-${suffix}.json`

        // Đóng overlay TRƯỚC khi mở hộp thoại chọn chỗ lưu — hộp thoại của hệ điều hành
        // chờ người dùng, mà overlay thì đếm nhịp tim; để chung sẽ bị coi là treo.
        if (reporter) await reporter.close()

        const result = await electronAPI.exportJSON(payload, {
            defaultFileName: fileName,
            title: 'Save JSON file',
            buttonLabel: 'Save',
        })

        if (result && result.success) {
            messageHandler && messageHandler.success(result.message ||
                (withChildren ? 'Branch exported successfully' : 'Node exported successfully'))
        } else if (result && result.message !== 'Export cancelled') {
            messageHandler && messageHandler.error(result.message || 'Export JSON failed')
        }
        return
    } catch (err) {
        if (err && err.message === 'CANCELED') {
            console.warn('[exportJson] nguoi dung dung export')
            messageHandler && messageHandler.warning('Export stopped. No file was written.')
            return
        }
        console.error('[exportJson] Export error:', err)
        messageHandler && messageHandler.error('An error occurred while exporting JSON')
        throw err
    } finally {
        // Đóng lần nữa là vô hại (RESET không phụ thuộc trạng thái) và cần thiết cho mọi
        // đường thoát sớm: không có gì để export, lỗi, hoặc người dùng bấm dừng.
        if (reporter) await reporter.close()
    }
}