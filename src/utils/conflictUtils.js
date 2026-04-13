// ─── Helpers for nested keys (e.g. "properties.type") ───────────────────────

const getNestedValue = (obj, key) => {
    if (!obj) return null
    const parts = key.split('.')
    let val = obj
    for (const part of parts) {
        if (val == null) return null
        val = val[part]
    }
    return val ?? null
}

const setNestedValue = (obj, key, value) => {
    const parts = key.split('.')
    let target = obj
    for (let i = 0; i < parts.length - 1; i++) {
        if (target[parts[i]] == null) target[parts[i]] = {}
        target = target[parts[i]]
    }
    target[parts[parts.length - 1]] = value
}

// ─── 3-way merge shared across all entities ──────────────────────────────────

export const detectConflicts = (baseDto, clientDto, serverDto, fieldDefs) => {
    const results = []
    for (const group of fieldDefs) {
        for (const field of group.fields) {
            const base   = getNestedValue(baseDto,   field.key)
            const client = getNestedValue(clientDto, field.key)
            const server = getNestedValue(serverDto, field.key)

            const serverChanged = server !== base
            const clientChanged = client !== base

            let status, autoResolved, resolved

            if (!serverChanged && !clientChanged) {
                status   = 'unchanged'
                resolved = client
            } else if (serverChanged && !clientChanged) {
                status       = 'auto'
                autoResolved = 'server'
                resolved     = server
            } else if (!serverChanged && clientChanged) {
                status       = 'auto'
                autoResolved = 'client'
                resolved     = client
            } else if (server === client) {
                status       = 'auto'
                autoResolved = 'both'
                resolved     = client
            } else {
                status   = 'conflict'
                resolved = null
            }

            results.push({
                ...field,
                group: group.group,
                base, client, server,
                status, autoResolved, resolved,
            })
        }
    }
    return results
}

export const applyResolved = (fields, clientDto) => {
    const merged = JSON.parse(JSON.stringify(clientDto)) // deep clone
    for (const field of fields) {
        if (field.status !== 'unchanged') {
            setNestedValue(merged, field.key, field.resolved)
        }
    }
    return merged
}

// Server wins if client is empty, keep client if already has data (no snapshot case)
export const mergeWithoutSnapshot = (clientDto, serverDto, fieldDefs) => {
    const merged = JSON.parse(JSON.stringify(clientDto)) // deep clone
    for (const group of fieldDefs) {
        for (const field of group.fields) {
            const clientVal   = getNestedValue(clientDto, field.key)
            const serverVal   = getNestedValue(serverDto, field.key)
            const clientEmpty = clientVal === null || clientVal === undefined || clientVal === ''
            if (clientEmpty && serverVal) {
                setNestedValue(merged, field.key, serverVal)
            }
        }
    }
    return merged
}

// ─── Field definitions ────────────────────────────────────────────────────────

export const TRANSFORMER_FIELD_DEFS = [
    {
        group: 'Properties',
        fields: [
            { key: 'properties.type',              label: 'Asset Type' },
            { key: 'properties.serial_no',         label: 'Serial No' },
            { key: 'properties.manufacturer',      label: 'Manufacturer' },
            { key: 'properties.manufacturer_type', label: 'Manufacturer Type' },
            { key: 'properties.manufacturer_year', label: 'Manufacturing Year' },
            { key: 'properties.country_of_origin', label: 'Country of Origin' },
            { key: 'properties.apparatus_id',      label: 'Apparatus ID' },
            { key: 'properties.comment',           label: 'Description' },
        ],
    },
    {
        group: 'Winding Configuration',
        fields: [
            { key: 'winding_configuration.phases',                   label: 'Phases' },
            { key: 'winding_configuration.unsupported_vector_group', label: 'Vector Group' },
        ],
    },
    {
        group: 'Ratings',
        fields: [
            { key: 'ratings.rated_frequency.value',  label: 'Rated Frequency' },
            { key: 'ratings.short_circuit.ka.value', label: 'Max Short Circuit Current' },
            { key: 'ratings.short_circuit.s.value',  label: 'Duration' },
        ],
    },
]

export const ORG_FIELD_DEFS = [
    {
        group: 'Organisation Info',
        fields: [
            { key: 'name',      label: 'Name' },
            { key: 'aliasName', label: 'Alias Name' },
            { key: 'tax_code',  label: 'Tax Code' },
            { key: 'comment',   label: 'Description' },
        ],
    },
    {
        group: 'Address',
        fields: [
            { key: 'street',            label: 'Street' },
            { key: 'ward_or_commune',   label: 'Ward / Commune' },
            { key: 'district_or_town',  label: 'District / Town' },
            { key: 'city',              label: 'City' },
            { key: 'state_or_province', label: 'State / Province' },
            { key: 'postal_code',       label: 'Postal Code' },
            { key: 'country',           label: 'Country' },
        ],
    },
    {
        group: 'Contact',
        fields: [
            { key: 'phoneNumber', label: 'Phone Number' },
            { key: 'email',       label: 'Email' },
            { key: 'fax',         label: 'Fax' },
        ],
    },
]

export const SUBSTATION_FIELD_DEFS = [
    {
        group: 'Substation Info',
        fields: [
            { key: 'name',       label: 'Name' },
            { key: 'aliasName',  label: 'Alias Name' },
            { key: 'type',       label: 'PSR Type' },
            { key: 'generation', label: 'Generation' },
            { key: 'industry',   label: 'Industry' },
            { key: 'comment',    label: 'Description' },
        ],
    },
    {
        group: 'Address',
        fields: [
            { key: 'locationName',      label: 'Location Name' },
            { key: 'street',            label: 'Street' },
            { key: 'ward_or_commune',   label: 'Ward / Commune' },
            { key: 'district_or_town',  label: 'District / Town' },
            { key: 'city',              label: 'City' },
            { key: 'state_or_province', label: 'State / Province' },
            { key: 'country',           label: 'Country' },
        ],
    },
    {
        group: 'Contact Person',
        fields: [
            { key: 'personName',  label: 'Name' },
            { key: 'department',  label: 'Department' },
            { key: 'position',    label: 'Position' },
            { key: 'phoneNumber', label: 'Phone Number' },
            { key: 'email',       label: 'Email' },
            { key: 'fax',         label: 'Fax' },
        ],
    },
]

export const VOLTAGE_LEVEL_FIELD_DEFS = [
    {
        group: 'Voltage Level Info',
        fields: [
            { key: 'name',    label: 'Name' },
            { key: 'comment', label: 'Description' },
        ],
    },
    {
        group: 'High Voltage Limit',
        fields: [
            { key: 'high_voltage_limit_value',      label: 'Value' },
            { key: 'high_voltage_limit_unit',       label: 'Unit' },
            { key: 'high_voltage_limit_multiplier', label: 'Multiplier' },
        ],
    },
    {
        group: 'Low Voltage Limit',
        fields: [
            { key: 'low_voltage_limit_value',      label: 'Value' },
            { key: 'low_voltage_limit_unit',       label: 'Unit' },
            { key: 'low_voltage_limit_multiplier', label: 'Multiplier' },
        ],
    },
    {
        group: 'Base Voltage',
        fields: [
            { key: 'base_voltage_value',      label: 'Value' },
            { key: 'base_voltage_unit',       label: 'Unit' },
            { key: 'base_voltage_multiplier', label: 'Multiplier' },
        ],
    },
]

export const CIRCUIT_BREAKER_FIELD_DEFS = [
    {
        group: 'Properties',
        fields: [
            { key: 'properties.type',              label: 'Asset Type' },
            { key: 'properties.serial_no',         label: 'Serial No' },
            { key: 'properties.manufacturer',      label: 'Manufacturer' },
            { key: 'properties.manufacturer_type', label: 'Manufacturer Type' },
            { key: 'properties.manufacturer_year', label: 'Manufacturing Year' },
            { key: 'properties.country_of_origin', label: 'Country of Origin' },
            { key: 'properties.apparatus_id',      label: 'Apparatus ID' },
            { key: 'properties.comment',           label: 'Description' },
        ],
    },
]

export const DISCONNECTOR_FIELD_DEFS = [
    {
        group: 'Properties',
        fields: [
            { key: 'properties.type',              label: 'Asset Type' },
            { key: 'properties.serial_no',         label: 'Serial No' },
            { key: 'properties.manufacturer',      label: 'Manufacturer' },
            { key: 'properties.manufacturer_type', label: 'Manufacturer Type' },
            { key: 'properties.manufacturing_year',label: 'Manufacturing Year' },
            { key: 'properties.country_of_origin', label: 'Country of Origin' },
            { key: 'properties.apparatus_id',      label: 'Apparatus ID' },
            { key: 'properties.comment',           label: 'Description' },
        ],
    },
    {
        group: 'Ratings',
        fields: [
            { key: 'ratings.rated_voltage.value',                              label: 'Rated Voltage' },
            { key: 'ratings.rated_frequency.value',                            label: 'Rated Frequency' },
            { key: 'ratings.rated_current.value',                              label: 'Rated Current' },
            { key: 'ratings.short_time_withstand_current.value',               label: 'Short Time Withstand Current' },
            { key: 'ratings.rated_duration_of_short_circuit.value',            label: 'Rated Duration of Short Circuit' },
            { key: 'ratings.power_freq_withstand_voltage_earth_poles.value',   label: 'PF Withstand to Earth/Poles' },
            { key: 'ratings.power_freq_withstand_voltage_isolating_distance.value', label: 'PF Withstand Isolating Distance' },
        ],
    },
]

export const CURRENT_TRANSFORMER_FIELD_DEFS = [
    {
        group: 'Properties',
        fields: [
            { key: 'properties.asset_type',        label: 'Asset Type' },
            { key: 'properties.serial_no',         label: 'Serial No' },
            { key: 'properties.manufacturer',      label: 'Manufacturer' },
            { key: 'properties.manufacturer_type', label: 'Manufacturer Type' },
            { key: 'properties.manufacturing_year',label: 'Manufacturing Year' },
            { key: 'properties.country_of_origin', label: 'Country of Origin' },
            { key: 'properties.apparatus_id',      label: 'Apparatus ID' },
            { key: 'properties.comment',           label: 'Description' },
        ],
    },
    {
        group: 'Ratings',
        fields: [
            { key: 'ratings.standard.value',       label: 'Standard' },
            { key: 'ratings.primary_winding_count', label: 'Primary Winding Count' },
            { key: 'ratings.rating_factor',        label: 'Rating Factor' },
        ],
    },
]

export const VOLTAGE_TRANSFORMER_FIELD_DEFS = [
    {
        group: 'Properties',
        fields: [
            { key: 'properties.type',              label: 'Type' },
            { key: 'properties.serial_no',         label: 'Serial No' },
            { key: 'properties.manufacturer',      label: 'Manufacturer' },
            { key: 'properties.manufacturer_type', label: 'Manufacturer Type' },
            { key: 'properties.manufacturer_year', label: 'Manufacturing Year' },
            { key: 'properties.country_of_origin', label: 'Country of Origin' },
            { key: 'properties.apparatus_id',      label: 'Apparatus ID' },
            { key: 'properties.comment',           label: 'Description' },
        ],
    },
    {
        group: 'Ratings',
        fields: [
            { key: 'ratings.standard', label: 'Standard' },
            { key: 'ratings.upr',      label: 'UPR Value' },
        ],
    },
]