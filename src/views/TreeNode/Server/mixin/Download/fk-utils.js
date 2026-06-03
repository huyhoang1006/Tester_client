/* eslint-disable */
// Helper dùng chung cho download flow: đảm bảo mọi mrid + FK id được điền
// trước khi map DTO → entity → insert DB, tránh lỗi foreign key.
// Tương đương các hàm check* trong AssetView/<asset>/mixin/index.js
import uuid from '@/utils/uuid'

// Các FK id thường gặp ở nested objects (bushing, surge, dataTable...)
const NESTED_FK_KEYS = ['assetInfoId', 'productAssetModelId', 'lifecycleDateId']

// Duyệt đệ quy: fill mrid + nested FK id rỗng
export const traverseAndFillMrid = (obj, fkKeys = NESTED_FK_KEYS) => {
    if (Array.isArray(obj)) {
        obj.forEach(item => traverseAndFillMrid(item, fkKeys))
    } else if (obj !== null && typeof obj === 'object') {
        if ('mrid' in obj && (!obj.mrid || obj.mrid === '')) {
            obj.mrid = uuid.newUuid()
        }
        for (const key of fkKeys) {
            if (key in obj && (!obj[key] || obj[key] === '')) {
                obj[key] = uuid.newUuid()
            }
        }
        Object.values(obj).forEach(val => traverseAndFillMrid(val, fkKeys))
    }
}

// Fill các FK top-level theo danh sách key (mỗi asset truyền danh sách riêng)
export const ensureTopLevelFK = (dto, fkKeys) => {
    for (const key of fkKeys) {
        if (!dto[key] || dto[key] === '') dto[key] = uuid.newUuid()
    }
    if (dto.properties && (!dto.properties.mrid || dto.properties.mrid === '')) {
        // không override nếu đã set context mrid; chỉ fill khi rỗng
        dto.properties.mrid = dto.properties.mrid || uuid.newUuid()
    }
}

// Danh sách FK top-level cho từng asset (khớp với các hàm check* trong mixin)
export const FK_KEYS = {
    currentTransformer:  ['assetInfoId', 'productAssetModelId', 'lifecycleDateId', 'assetPsrId'],
    voltageTransformer:  ['assetInfoId', 'productAssetModelId', 'lifecycleDateId', 'assetPsrId'],
    disconnector:        ['assetInfoId', 'productAssetModelId', 'lifecycleDateId', 'assetPsrId'],
    surgeArrester:       ['assetInfoId', 'productAssetModelId', 'lifecycleDateId', 'assetPsrId'],
    transformer: [
        'oldPowerTransformerInfoId', 'productAssetModelId', 'lifecycleDateId', 'assetPsrId',
    ],
    circuitBreaker: [
        'assetInfoId', 'productAssetModelId', 'lifecycleDateId', 'assetPsrId',
        'operatingMechanismId', 'operatingMechanismInfoId',
        'operatingMechanismLifecycleDateId', 'operatingMechanismProductAssetModelId',
        'assessmentLimitBreakerInfoId', 'breakerRatingInfoId',
        'breakerContactSystemInfoId', 'breakerOtherInfoId',
    ],
}