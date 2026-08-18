import { replaceUserSuffix, SERVER_ID_SEPARATOR, USER_SUFFIX_PREFIX } from '@/utils/serverId'

export const scopeDownloadedId = (value, scope, userId) => {
    if (value === null || value === undefined || value === '') return value
    const id = String(value)
    if (!userId) return id
    if (id.indexOf(SERVER_ID_SEPARATOR) !== -1) return replaceUserSuffix(id, userId)
    return scope
        ? `${id}${SERVER_ID_SEPARATOR}${scope}${SERVER_ID_SEPARATOR}${USER_SUFFIX_PREFIX}${userId}`
        : `${id}${SERVER_ID_SEPARATOR}${USER_SUFFIX_PREFIX}${userId}`
}

export const scopeDtoIds = (dto, fieldScopes, userId) => {
    if (!dto) return dto
    for (const [field, scope] of Object.entries(fieldScopes)) {
        dto[field] = scopeDownloadedId(dto[field], scope, userId)
    }
    return dto
}

/**
 * Các bản ghi VỆ TINH của một thiết bị — thứ dùng chung giữa các tài khoản nếu không gắn hậu tố.
 *
 * Node chính đã mang hậu tố nhờ chuỗi tải xuống (`toLocalMrid`), nhưng những id dưới
 * đây lấy NGUYÊN VĂN từ phản hồi server:
 *
 *     mergedDto.locationId = clientDto.locationId || serverDto.locationId
 *
 * Hai người cùng tải một thiết bị là trỏ vào cùng một dòng `location`, `asset_info`,
 * `product_asset_model`… Người này xoá thiết bị của mình thì hoặc khoá ngoại chặn,
 * hoặc tệ hơn là xoá mất bản ghi người kia đang dùng. Đúng thứ đã xảy ra với
 * `psrtype-108040` khi xoá trạm.
 *
 * Cố ý KHÔNG có `psrId` trong danh sách: đó là id node CHA (ngăn/trạm), đã được chuỗi
 * gắn hậu tố từ trước. Đưa vào cũng vô hại vì `scopeDownloadedId` thấy chuỗi đã có
 * dấu phân tách thì chỉ thay lại hậu tố người dùng, nhưng để ngoài cho rõ ý.
 */
export const ASSET_SATELLITE_SCOPES = {
    assetInfoId:         'asset-info',
    productAssetModelId: 'pam',
    lifecycleDateId:     'lifecycle',
    locationId:          'loc',
    assetPsrId:          'asset-psr',
}

/**
 * Gắn hậu tố người dùng cho toàn bộ vệ tinh của một thiết bị.
 *
 * Phải gọi cho CẢ HAI bản — bản tải về và bản đang có ở máy — trước khi gộp. Chỉ gắn
 * một bên thì phép so sánh đem `12@loc@u-21` đối chiếu với `12`, thấy khác nhau, và
 * sinh ra xung đột giả ở mọi trường.
 *
 * @param {object} dto         bản ghi cần gắn, bị sửa TẠI CHỖ
 * @param {number|string} userId
 * @param {object} extraScopes vệ tinh riêng của từng loại, vd máy cắt có thêm sáu thứ
 * @returns {object} chính `dto`
 */
export const scopeAssetDtoForUser = (dto, userId, extraScopes = {}) => {
    if (!dto) return dto
    scopeDtoIds(dto, { ...ASSET_SATELLITE_SCOPES, ...extraScopes }, userId)
    if (dto.positionPoints) scopePositionPointIds(dto.positionPoints, userId)
    return dto
}

export const scopePositionPointIds = (positionPoints, userId) => {
    if (!positionPoints) return positionPoints
    for (const axis of ['x', 'y', 'z']) {
        if (!Array.isArray(positionPoints[axis])) continue
        positionPoints[axis].forEach(point => {
            if (point && point.id) point.id = scopeDownloadedId(point.id, 'pos', userId)
        })
    }
    return positionPoints
}

const OWNED_ID_KEYS = new Set([
    'id',
    'mrid',
    'assetInfoId',
    'productAssetModelId',
    'lifecycleDateId',
    'assetPsrId',
    'operatingMechanismId',
    'operatingMechanismInfoId',
    'operatingMechanismLifecycleDateId',
    'operatingMechanismProductAssetModelId',
    'assessmentLimitBreakerInfoId',
    'breakerRatingInfoId',
    'breakerContactSystemInfoId',
    'breakerOtherInfoId',
])

const isOwnedIdKey = (key) =>
    OWNED_ID_KEYS.has(key)
    || /(_id|Id)$/.test(key)

/**
 * Gắn hậu tố user cho một nhánh DTO thuộc riêng asset hiện tại.
 *
 * Chỉ dùng cho các nhánh con đã chắc chắn là dữ liệu "owned" của asset, ví dụ
 * ratings/tableRating/ctConfiguration/assessmentLimits. Không gọi trên toàn bộ DTO
 * vì `psrId`, `parentId`, `ownerId` là id node cha và đã được scope ở luồng cây.
 *
 * Hàm có cache theo raw id trong một lần gọi để các FK nội bộ vẫn trỏ đúng bản ghi
 * vừa được scope. Ví dụ `short_circuit_test_id` trỏ tới `impedance.mrid` sẽ nhận cùng
 * một id sau khi thêm hậu tố.
 */
export const scopeOwnedBranchIds = (value, userId, scope = 'owned', options = {}) => {
    if (!value || !userId) return value
    const seen = options.seen || new Map()
    const refScopes = options.refScopes || {}
    const scoped = (id, targetScope) => {
        if (id === null || id === undefined || id === '') return id
        const raw = String(id)
        const key = `${targetScope}:${raw}`
        if (!seen.has(key)) {
            seen.set(key, scopeDownloadedId(raw, targetScope, userId))
        }
        return seen.get(key)
    }

    const walk = (node) => {
        if (Array.isArray(node)) {
            node.forEach(walk)
            return
        }
        if (!node || typeof node !== 'object') return

        for (const key of Object.keys(node)) {
            const item = node[key]
            if (typeof item === 'string' || typeof item === 'number') {
                if (isOwnedIdKey(key)) node[key] = scoped(item, refScopes[key] || scope)
            } else {
                walk(item)
            }
        }
    }

    walk(value)
    return value
}
