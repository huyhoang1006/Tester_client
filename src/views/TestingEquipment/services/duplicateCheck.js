/* eslint-disable */
/**
 * duplicateCheck.js — check trùng testing equipment, dùng chung cho:
 *   - list.vue (import JSON)
 *   - Import/index.vue (import Excel/Word theo template)
 *
 * Trùng nhau khi: mrid giống nhau, HOẶC bộ (manufacturer, serial, type) giống nhau.
 */

export const norm = (v) => String(v == null ? '' : v).trim().toLowerCase()

// Rút các field khóa từ 1 entity phẳng (shape insertTestingEquipmentEntity)
export const entityKeyFields = (entity) => ({
    mrid: (entity.testingEquipment && entity.testingEquipment.mrid) || (entity.asset && entity.asset.mrid) || null,
    name: (entity.identifiedObject && entity.identifiedObject.name) || (entity.asset && entity.asset.name) || '',
    serial: (entity.asset && entity.asset.serial_number) || '',
    type: (entity.asset && entity.asset.type) || '',
    manufacturer: (entity.productAssetModel && entity.productAssetModel.manufacturer) || '',
    model: (entity.productAssetModel && entity.productAssetModel.model_number) || ''
})

// existingList: rows từ getAllTestingEquipmentList (mrid, manufacturer, serial, type, name...)
export const findExisting = (fields, existingList) => {
    // 1) trùng mrid
    let hit = existingList.find(e => fields.mrid && e.mrid === fields.mrid)
    if (hit) return { existing: hit, reason: 'mrid' }
    // 2) trùng bộ (manufacturer, serial, type) — chỉ xét khi serial có giá trị để tránh match bản ghi trống
    if (norm(fields.serial)) {
        hit = existingList.find(e =>
            norm(e.manufacturer) === norm(fields.manufacturer) &&
            norm(e.serial) === norm(fields.serial)
        )
        if (hit) return { existing: hit, reason: 'attrs' }
    }
    return null
}

// Chia items (entity phẳng) thành thiết bị mới / thiết bị trùng.
// conflicts có sẵn các field hiển thị cho ImportConflictDialog.
export const splitByDuplicate = (items, existingList) => {
    const newcomers = []   // { index, entity }
    const conflicts = []   // { index, entity, existingMrid, reason, name, model, serial, manufacturer, type }
    items.forEach((entity, index) => {
        const f = entityKeyFields(entity)
        const dup = findExisting(f, existingList)
        if (!dup) {
            newcomers.push({ index, entity })
        } else {
            conflicts.push({
                index, entity,
                existingMrid: dup.existing.mrid,
                reason: dup.reason,
                name: f.name || dup.existing.name,
                model: f.model, serial: f.serial,
                manufacturer: f.manufacturer, type: f.type
            })
        }
    })
    return { newcomers, conflicts }
}

// Danh sách hiện có từ DB local (đã kèm type) để so trùng
export const loadExistingList = async (userId) => {
    const rs = await window.electronAPI.getAllTestingEquipmentList(userId)
    return (rs && rs.success && Array.isArray(rs.data)) ? rs.data : []
}

export default { norm, entityKeyFields, findExisting, splitByDuplicate, loadExistingList }
