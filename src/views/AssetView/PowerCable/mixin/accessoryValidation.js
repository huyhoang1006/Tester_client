const hasValue = field => {
    const value = field && typeof field === 'object' ? field.value : field
    return value !== null && value !== undefined && String(value).trim() !== ''
}

const missingFieldsForStartedGroup = (group, fields) => {
    const started = fields.some(field => hasValue(group && group[field.key]))
    if (!started) return []

    return fields
        .filter(field => !hasValue(group && group[field.key]))
        .map(field => field.label)
}

export const getMissingPowerCableAccessoryFields = data => {
    const datasData = data && data.datasData ? data.datasData : {}
    const terminalFields = [
        { key: 'type', label: 'Terminal Type' },
        { key: 'class', label: 'Terminal Class' },
        { key: 'connector_type', label: 'Terminal Connector type' },
        { key: 'service_condition', label: 'Terminal Service condition' }
    ]
    const jointFields = [
        { key: 'category', label: 'Joint Category' },
        { key: 'construction', label: 'Joint Construction' },
        { key: 'service_condition', label: 'Joint Service condition' }
    ]

    return [
        ...missingFieldsForStartedGroup(datasData.terminalsData, terminalFields),
        ...missingFieldsForStartedGroup(datasData.jointsData, jointFields)
    ]
}

export default getMissingPowerCableAccessoryFields
