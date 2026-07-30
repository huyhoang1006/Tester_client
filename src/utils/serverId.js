/**
 * Định danh node giữa client và server.
 *
 * VẤN ĐỀ: server đánh id tự tăng RIÊNG cho từng bảng (current_transformer.id,
 * disconnector.id... mỗi cái đếm từ 1), trong khi client nhét mọi loại node vào
 * chung `identified_object` / `asset` khoá theo mrid. Nên CT id 5 và Disconnector
 * id 5 về máy đều thành mrid '5' → UNIQUE constraint failed.
 *
 * CÁCH XỬ LÝ: mrid local = "<id server>@<hậu tố loại node>", ví dụ '5@ct', '5@dc'.
 * Mọi thứ gửi lên server phải cắt hậu tố về lại '5'.
 *
 *   toLocalMrid('5', node)  ->  '5@ct'      (chỗ id server đi VÀO client)
 *   toServerId('5@ct')      ->  '5'        (chỗ id đi RA server)
 *
 * Giá trị không có hậu tố thì toServerId trả nguyên si, nên dữ liệu cũ vẫn chạy,
 * không cần migrate.
 */

export const SERVER_ID_SEPARATOR = '@'

const SUFFIX_BY_ASSET = {
    'Transformer': 'tf',
    'Voltage transformer': 'vt',
    'Current transformer': 'ct',
    'Circuit breaker': 'cb',
    'Disconnector': 'dc',
    'Surge arrester': 'sa',
    'Bushing': 'bu',
    'Power cable': 'pc',
    'Reactor': 're',
    'Capacitor': 'cap',
    'Rotating machine': 'rm'
}

const SUFFIX_BY_MODE = {
    organisation: 'org',
    substation: 'sub',
    voltageLevel: 'vl',
    bay: 'bay',
    job: 'job'
}

// asset.kind trong DB không đồng nhất hoa/thường ('Surge arrester' vs 'Surge Arrester')
// nên tra không phân biệt hoa thường.
const SUFFIX_BY_ASSET_LOWER = Object.keys(SUFFIX_BY_ASSET).reduce((acc, key) => {
    acc[key.toLowerCase()] = SUFFIX_BY_ASSET[key]
    return acc
}, {})

/** Hậu tố theo loại asset ('Current transformer' -> 'ct'). Dùng chung cho cây và migration. */
export const suffixForAssetKind = (kind) => {
    if (!kind) return 'asset'
    return SUFFIX_BY_ASSET_LOWER[String(kind).toLowerCase()] || 'asset'
}

/** Hậu tố tương ứng 1 node trên cây. node dùng `mode` (client) hoặc `_type` (download chain). */
export const suffixForNode = (node) => {
    if (!node) return null
    const mode = node.mode || node._type
    if (mode === 'asset') return suffixForAssetKind(node.asset)
    return SUFFIX_BY_MODE[mode] || null
}

/** id server -> mrid local (gắn hậu tố). Idempotent: đã có hậu tố thì giữ nguyên. */
export const toLocalMrid = (serverId, node) => {
    if (serverId === null || serverId === undefined || serverId === '') return serverId
    const id = String(serverId)
    if (id.indexOf(SERVER_ID_SEPARATOR) !== -1) return id
    const suffix = suffixForNode(node)
    return suffix ? `${id}${SERVER_ID_SEPARATOR}${suffix}` : id
}

/** mrid local -> id server (cắt hậu tố). Không có hậu tố thì trả nguyên giá trị. */
export const toServerId = (localMrid) => {
    if (localMrid === null || localMrid === undefined) return localMrid
    const value = String(localMrid)
    const index = value.lastIndexOf(SERVER_ID_SEPARATOR)
    if (index === -1) return localMrid
    return value.slice(0, index)
}

export const hasServerSuffix = (localMrid) =>
    typeof localMrid === 'string' && localMrid.indexOf(SERVER_ID_SEPARATOR) !== -1

// Các key trong payload chắc chắn là định danh (không phải dữ liệu người dùng).
// Cố ý KHÔNG quét mọi key, vì email trong electronic_address cũng chứa '@'.
const ID_KEY_EXACT = new Set([
    'mRID', 'mrid', 'id', 'ownerId', 'psrId', 'parentId', 'deviceId', 'assetId',
    'parentOrganisation', 'parent_organisation', 'substation', 'voltage_level',
    'voltageLevel', 'bay', 'psr_id', 'asset_id', 'work_task_id', 'standard_id'
])

const isIdKey = (key) =>
    ID_KEY_EXACT.has(key) || /(_id|Id)$/.test(key)

/**
 * Duyệt sâu payload gửi lên server, cắt hậu tố ở MỌI trường định danh.
 * Chỉ đụng vào giá trị chuỗi có chứa dấu phân tách, nên gọi nhiều lần vô hại.
 */
export const stripServerIdsDeep = (value) => {
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) stripServerIdsDeep(value[i])
        return value
    }
    if (!value || typeof value !== 'object') return value

    for (const key of Object.keys(value)) {
        const item = value[key]
        if (typeof item === 'string') {
            if (isIdKey(key) && item.indexOf(SERVER_ID_SEPARATOR) !== -1) {
                value[key] = toServerId(item)
            }
        } else if (item && typeof item === 'object') {
            stripServerIdsDeep(item)
        }
    }
    return value
}
