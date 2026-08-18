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
export const USER_SUFFIX_PREFIX = 'u-'
const LEGACY_USER_SUFFIX_PREFIXES = ['u:', 'user:']

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
const splitLocalId = (value) => String(value).split(SERVER_ID_SEPARATOR)

const isUserSuffixPart = (part) =>
    part.indexOf(USER_SUFFIX_PREFIX) === 0
    || LEGACY_USER_SUFFIX_PREFIXES.some(prefix => part.indexOf(prefix) === 0)

export const hasUserSuffix = (localMrid) =>
    typeof localMrid === 'string'
    && splitLocalId(localMrid).some(part => isUserSuffixPart(part))

export const getUserSuffix = (localMrid) => {
    if (typeof localMrid !== 'string') return null
    const found = splitLocalId(localMrid).find(part => isUserSuffixPart(part))
    if (!found) return null
    if (found.indexOf(USER_SUFFIX_PREFIX) === 0) return found.slice(USER_SUFFIX_PREFIX.length)
    const legacyPrefix = LEGACY_USER_SUFFIX_PREFIXES.find(prefix => found.indexOf(prefix) === 0)
    return legacyPrefix ? found.slice(legacyPrefix.length) : null
}

/**
 * Hậu tố LOẠI NODE đọc ngược từ một mrid local.
 *
 *     '108050@sub@u-21'  ->  'sub'
 *     '206495@vl@u-21'   ->  'vl'
 *     'abc-uuid'         ->  null   (node tạo tại máy, chưa từng lên server)
 *
 * Dùng khi chỗ nhận chỉ có id mà cần biết cha thuộc loại nào. Ví dụ rõ nhất là ngăn:
 * bảng `bay` có HAI khoá ngoại, `substation` và `voltage_level`, và ngăn có thể treo
 * trực tiếp dưới trạm hoặc dưới cấp điện áp. Ghi nhầm cột là khoá ngoại trỏ vào bảng
 * không có dòng đó.
 *
 * Bỏ qua phần hậu tố người dùng, nên đọc được cả id đã gắn lẫn chưa gắn.
 *
 * @param {string} localMrid
 * @returns {string|null}
 */
export const getTypeSuffix = (localMrid) => {
    if (typeof localMrid !== 'string') return null
    const parts = splitLocalId(localMrid)
    if (parts.length < 2) return null
    return parts.slice(1).find(part => !isUserSuffixPart(part)) || null
}

/** Mọi hậu tố LOẠI hợp lệ. 'asset' là mức lui của `suffixForAssetKind`. */
const KNOWN_KIND_SUFFIXES = new Set([
    ...Object.values(SUFFIX_BY_ASSET),
    ...Object.values(SUFFIX_BY_MODE),
    'asset',
])

/**
 * Chuỗi này có phải mrid local (đã gắn hậu tố loại) không?
 *
 * Chỉ dựa vào dấu `@` là KHÔNG đủ — email cũng có `@`, và `evn@mail.com` mà bị coi là
 * mrid rồi gắn thêm `@u-21` thì hỏng dữ liệu người dùng. Nên phải kiểm phần hậu tố có
 * nằm trong danh sách loại đã biết hay không.
 *
 * Tiện thể: mrid cấu hình (procedure, measurement, tiêu chuẩn cố định) là UUID trần,
 * không có `@`, nên tự động bị loại — đúng yêu cầu "phần config chung, không được sửa".
 *
 *     '1000@org'          -> true
 *     '108050@sub@u-21'   -> true
 *     'evn@mail.com'      -> false   ('mail.com' khong phai hau to loai)
 *     'abc-uuid'          -> false
 */
export const isLocalMrid = (value) => {
    if (typeof value !== 'string' || value.indexOf(SERVER_ID_SEPARATOR) === -1) return false
    const kind = getTypeSuffix(value)
    return Boolean(kind) && KNOWN_KIND_SUFFIXES.has(kind)
}

export const appendUserSuffix = (id, userId) => {
    if (userId === null || userId === undefined || userId === '') return id
    if (hasUserSuffix(id)) return replaceUserSuffix(id, userId)
    return `${id}${SERVER_ID_SEPARATOR}${USER_SUFFIX_PREFIX}${userId}`
}

export const replaceUserSuffix = (localMrid, userId) => {
    if (localMrid === null || localMrid === undefined || localMrid === '') return localMrid
    const value = String(localMrid)
    if (!userId || value.indexOf(SERVER_ID_SEPARATOR) === -1) return value
    const parts = splitLocalId(value).filter(part => !isUserSuffixPart(part))
    return `${parts.join(SERVER_ID_SEPARATOR)}${SERVER_ID_SEPARATOR}${USER_SUFFIX_PREFIX}${userId}`
}

/** id server -> mrid local (gắn hậu tố loại node, và tùy chọn hậu tố user). */
export const toLocalMrid = (serverId, node, userId = null) => {
    if (serverId === null || serverId === undefined || serverId === '') return serverId
    const id = String(serverId)
    if (id.indexOf(SERVER_ID_SEPARATOR) !== -1) return appendUserSuffix(id, userId)
    const suffix = suffixForNode(node)
    const localId = suffix ? `${id}${SERVER_ID_SEPARATOR}${suffix}` : id
    return appendUserSuffix(localId, userId)
}

/** mrid local -> id server (cắt toàn bộ hậu tố local). Không có hậu tố thì trả nguyên giá trị. */
export const toServerId = (localMrid) => {
    if (localMrid === null || localMrid === undefined) return localMrid
    const value = String(localMrid)
    const index = value.indexOf(SERVER_ID_SEPARATOR)
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
