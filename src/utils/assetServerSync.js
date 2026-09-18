export const toServerOperationDate = (value) => {
    if (!value) return null

    const date = String(value).trim()
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00` : date
}

export const fromServerOperationDate = (value) => {
    if (!value) return ''
    return String(value).slice(0, 10)
}

export const applyServerAssetFields = (properties, assetInfo) => {
    properties.operating_date = fromServerOperationDate(assetInfo?.operationDate)
    properties.status = assetInfo?.operationalStatus || ''
}

export const buildServerAssetFields = (properties = {}) => ({
    operationDate: toServerOperationDate(properties.operating_date),
    operationalStatus: properties.status || null
})
