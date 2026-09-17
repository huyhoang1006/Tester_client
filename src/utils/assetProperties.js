import uuid from '@/utils/uuid'

const createStatus = (id, value, dateTime) => ({
    mrid: id,
    date_time: dateTime,
    reason: null,
    remark: null,
    value
})

export const mapCommonAssetPropertiesToEntity = (properties, entity) => {
    const source = properties || {}
    const asset = entity.asset || entity.bushing || entity.surgeArrester
    if (!asset) return

    // Current status is stored in the Status record referenced by asset.status.
    asset.in_use_state = null
    const statusValue = String(source.status || '').trim()
    if (statusValue) {
        const statusId = source.status_id || asset.status || uuid.newUuid()
        const statusDateTime = source.status_date_time || new Date().toISOString()
        source.status_id = statusId
        source.status_date_time = statusDateTime
        asset.status = statusId
        asset.current_status = createStatus(statusId, statusValue, statusDateTime)
    } else {
        asset.status = null
        asset.current_status = null
    }

    const operatingDate = source.operating_date || ''
    asset.current_in_use_date = operatingDate
        ? {
            mrid: source.operating_date_id || uuid.newUuid(),
            asset_id: asset.mrid,
            date_type: 'COMMISSIONING',
            date_value: operatingDate,
            in_use_date: operatingDate
        }
        : { clear: true }
}

export const mapCommonAssetPropertiesToDto = (entity, properties) => {
    const target = properties || {}
    const asset = entity.asset || entity.bushing || entity.surgeArrester
    target.status_id = asset?.status || ''
    target.status_date_time = asset?.status_date_time || asset?.current_status?.date_time || ''
    target.status = asset?.status_value || asset?.current_status?.value || asset?.in_use_state || ''
    target.operating_date_id = asset?.operating_date_id || ''
    target.operating_date = asset?.operating_date || asset?.current_in_use_date?.date_value || ''
    return target
}
