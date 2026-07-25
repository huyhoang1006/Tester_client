import { normaliseAuditValue, tryWriteAuditLog } from '../auditLog/index'

const ASSET_GROUP_KEYS = [
    'asset',
    'bushing',
    'capacitor',
    'reactor',
    'disconnectorInfo',
    'oldBreakerInfo',
    'oldCurrentTransformerInfo',
    'OldPotentialTransformerInfo',
    'oldPowerTransformerInfo',
    'oldPowerCableInfo',
    'surgeArrester',
    'oldRotatingMachineInfo'
]

const IGNORED_TOP_LEVEL_KEYS = [
    'configurationEvent',
    'user',
    'assetPsr',
    'userIdentifiedObject'
]

const GROUP_LABELS = {
    OldPotentialTransformerInfo: 'Voltage transformer',
    CtCoreInfo: 'Core',
    CtTapInfo: 'Tap',
    activePower: 'Active power',
    apparentPower: 'Apparent power',
    area: 'Area',
    asset: 'Properties',
    assetInfo: 'Asset information',
    assetInfoUnit: 'Surge arrester unit',
    assetUnit: 'Surge arrester asset unit',
    auxiliaryContactsBreakerInfo: 'Auxiliary contacts',
    basePower: 'Base power',
    baseVoltage: 'Base voltage',
    breakerContactSystemInfo: 'Contact system',
    breakerOtherInfo: 'Others',
    breakerRatingInfo: 'Ratings',
    bushing: 'Bushing',
    capacitance: 'Capacitance',
    capacitanceCapacitorInfo: 'Capacitance',
    capacitor: 'Capacitor',
    closeOperation: 'Close operation',
    coilCharacteristicsBreakerInfo: 'Coil characteristics',
    concentricNeutral: 'Concentric neutral',
    contactResistanceBreakerInfo: 'Contact resistance',
    contactTravelBreakerInfo: 'Contact travel',
    coolingPowerRating: 'Cooling power rating',
    currentFlow: 'Current',
    currentRating: 'Current rating',
    disconnectorInfo: 'Disconnector',
    dissipationFactorCapacitorInfo: 'Dissipation factor',
    frequency: 'Frequency',
    joint: 'Joint',
    length: 'Length',
    lifecycleDate: 'Lifecycle date',
    manufacturer: 'Manufacturer',
    mass: 'Mass',
    miscellaneousBreakerInfo: 'Miscellaneous',
    oldBreakerInfo: 'Circuit breaker',
    oldBushingInfo: 'Bushing information',
    oldCableInfo: 'Power cable',
    oldCurrentTransformerInfo: 'Current transformer',
    oldOperatingMechanism: 'Operating mechanism',
    oldOperatingMechanismInfo: 'Operating mechanism information',
    oldPowerCableInfo: 'Power cable',
    oldPowerTransformerInfo: 'Transformer',
    oldRotatingMachineInfo: 'Rotating machine',
    oldSurgeArresterInfo: 'Surge arrester',
    oldTapChangerInfo: 'Tap changer',
    oldTransformerEndInfo: 'Transformer winding',
    operatingLifecycleDate: 'Operating lifecycle date',
    operatingMechanismComponent: 'Operating mechanism component',
    operatingProductAssetModel: 'Operating product asset model',
    operatingTimeBreakerInfo: 'Operating time',
    other: 'Others',
    overcurrentReleaseBreakerInfo: 'Overcurrent release',
    percent: 'Percent',
    pickupVoltageBreakerInfo: 'Pickup voltage',
    potentialTransformerTable: 'Winding configuration',
    pressure: 'Pressure',
    productAssetModel: 'Product asset model',
    quantity: 'Quantity',
    reactivePower: 'Reactive power',
    reactor: 'Reactor',
    resistance: 'Resistance',
    rotatingMachine: 'Rotating machine',
    second: 'Second',
    seconds: 'Second',
    sheathVoltageLimiter: 'Sheath voltage limiter',
    shortCircuitRating: 'Short-circuit rating',
    shortCircuitTest: 'Short-circuit impedance',
    shortCircuitTestTransformerEndInfo: 'Short-circuit winding link',
    surgeArrester: 'Surge arrester',
    tapChanger: 'Tap changer',
    tapChangerTablePoint: 'Tap changer point',
    temperature: 'Temperature',
    terminal: 'Terminal',
    tripOperation: 'Trip operation',
    underVoltageReleaseBreakerInfo: 'Undervoltage release',
    voltage: 'Voltage',
    voltageRating: 'Voltage rating',
    volume: 'Volume',
    zeroSequenceImpedance: 'Zero sequence impedance',
    zeroSequenceImpedanceTable: 'Zero sequence impedance table'
}

const FIELD_LABELS = {
    AC: 'AC',
    DC: 'DC',
    asset_id: 'Asset ID',
    assetId: 'Asset ID',
    assetType: 'Asset type',
    catalogueNumber: 'Catalogue number',
    corporateStandardKind: 'Corporate standard kind',
    countryOfOrigin: 'Country of origin',
    country_of_origin: 'Country of origin',
    dfC1: 'DF (C1)',
    dfC2: 'DF (C2)',
    duration_seconds: 'Duration',
    id_foreign: 'Attachment owner',
    inUseState: 'In use state',
    initialLossOfLife: 'Initial loss of life',
    kind: 'Asset',
    lotNumber: 'Lot number',
    manufacturerType: 'Manufacturer type',
    manufacturer_type: 'Manufacturer type',
    manufacturer_year: 'Manufacturing year',
    manufacturing_year: 'Manufacturing year',
    manufacturedDate: 'Manufacturing date',
    maxSystemVoltage: 'Max system voltage',
    modelNumber: 'Model',
    modelVersion: 'Model version',
    name: 'Name',
    numberOfPhase: 'Number of phase',
    phase: 'Phase',
    productAssetModel: 'Product asset model',
    ratedCurrent: 'Rated current',
    ratedFrequency: 'Rated frequency',
    ratedVoltage: 'Rated voltage',
    rated_frequency_custom: 'Rated frequency custom',
    rated_ln: 'Rated L-N',
    rated_u: 'Rated voltage',
    serialNo: 'Serial no.',
    serialNumber: 'Serial no.',
    serial_no: 'Serial no.',
    serial_number: 'Serial no.',
    short_circuit_current: 'Short-circuit current',
    styleNumber: 'Style number',
    transformer_end_id: 'Transformer winding',
    utcNumber: 'UTC number',
    voltageLGround: 'Voltage L-Ground',
    zero_sequence_impedance: 'Zero sequence impedance'
}

const USER_FIELD_WHITELIST = [
    'apparatus_id',
    'asset_id',
    'assetId',
    'serial_no',
    'serialNo',
    'serialNumber',
    'serial_number'
]

const REFERENCE_VALUE_FIELDS = [
    'c1',
    'c2',
    'rated_burden',
    'rated_frequency',
    'rated_voltage',
    'usr_rated_voltage'
]

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const getMainGroup = (entity) => {
    if (!entity) return null
    for (const key of ASSET_GROUP_KEYS) {
        if (entity[key]) return { key, value: entity[key] }
    }
    return null
}

const getEntityUser = (entity) => {
    const user = entity && entity.user ? entity.user : {}
    return {
        name: user.name || user.user_name || user.username || 'Unknown',
        id: user.user_id || user.id || null
    }
}

const getAttachmentValue = (attachment) => {
    if (!attachment || !attachment.path) return ''
    try {
        const files = JSON.parse(attachment.path)
        if (!Array.isArray(files)) return ''
        return files
            .map((file) => normaliseAuditValue(file.name || file.path || file.fileName))
            .filter(Boolean)
            .join(', ')
    } catch (error) {
        return normaliseAuditValue(attachment.path)
    }
}

const shouldIgnoreField = (key) => {
    if (USER_FIELD_WHITELIST.indexOf(key) !== -1) return false
    const lowerKey = String(key).toLowerCase()
    if ([
        'mrid',
        'id',
        'id_foreign',
        'idforeign',
        'created_date_time',
        'updated_date_time',
        'created_user',
        'updated_user'
    ].map((item) => item.toLowerCase()).indexOf(lowerKey) !== -1
    ) return true
    return /(^|_)id$/.test(lowerKey) || /(^|_)mrid$/.test(lowerKey) || /Id$/.test(key) || /MRID$/.test(key)
}

const shouldSkipOutputField = (key, value) => {
    if (shouldIgnoreField(key)) return true
    const lowerKey = String(key).toLowerCase()
    if (REFERENCE_VALUE_FIELDS.indexOf(lowerKey) !== -1) return true
    return typeof value === 'string' && UUID_PATTERN.test(value.trim()) && USER_FIELD_WHITELIST.indexOf(key) === -1
}

const fieldLabel = (key) => {
    if (GROUP_LABELS[key]) return GROUP_LABELS[key]
    if (FIELD_LABELS[key]) return FIELD_LABELS[key]
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, (char) => char.toUpperCase())
}

const getRowLabel = (groupKey, item, index) => {
    const rowName = item && (item.name || item.position || item.phase || item.winding)
    return normaliseAuditValue(rowName) || `row ${index + 1}`
}

const getReferencedItemLabel = (entity, groupKey, item) => {
    if (!entity || !item || !item.mrid) return ''
    const itemId = item.mrid

    for (const key of Object.keys(entity)) {
        if (key === groupKey || IGNORED_TOP_LEVEL_KEYS.indexOf(key) !== -1) continue
        const value = entity[key]

        if (Array.isArray(value)) {
            for (let index = 0; index < value.length; index += 1) {
                const row = value[index]
                if (!row || typeof row !== 'object' || Array.isArray(row)) continue
                const matchedField = Object.keys(row).find((field) => row[field] === itemId && !shouldIgnoreField(field))
                if (matchedField) {
                    return `${fieldLabel(key)} ${getRowLabel(key, row, index)} ${fieldLabel(matchedField)}`
                }
            }
            continue
        }

        if (value && typeof value === 'object') {
            const matchedField = Object.keys(value).find((field) => value[field] === itemId && !shouldIgnoreField(field))
            if (matchedField) {
                return `${fieldLabel(key)} ${fieldLabel(matchedField)}`
            }
        }
    }

    return ''
}

const getObjectId = (entity) => {
    const mainGroup = getMainGroup(entity)
    return mainGroup && mainGroup.value ? mainGroup.value.mrid : null
}

const getObjectName = (entity, fallback) => {
    const mainGroup = getMainGroup(entity)
    const main = mainGroup && mainGroup.value ? mainGroup.value : {}
    return normaliseAuditValue(main.name || main.serial_no || main.serialNo || main.serialNumber || main.serial_number || main.asset_id || main.apparatus_id) || fallback || 'Unnamed asset'
}

const hasPersistedObjectIdentity = (entity) => {
    const mainGroup = getMainGroup(entity)
    const main = mainGroup && mainGroup.value ? mainGroup.value : {}
    return !!normaliseAuditValue(main.name || main.serial_no || main.serialNo || main.serialNumber || main.serial_number || main.asset_id || main.apparatus_id)
}

const getEntityFields = (entity) => {
    if (!entity) return {}
    const fields = {}
    const setScalarFields = (prefix, value, groupKey = '') => {
        if (value === undefined || value === null) {
            fields[prefix] = ''
            return
        }

        if (typeof value !== 'object') {
            fields[prefix] = normaliseAuditValue(value)
            return
        }

        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                const itemPrefix = getReferencedItemLabel(entity, groupKey, item) || `${prefix} ${getRowLabel(groupKey, item, index)}`
                if (item && typeof item === 'object' && !Array.isArray(item)) {
                    Object.keys(item)
                        .filter((itemKey) => !shouldSkipOutputField(itemKey, item[itemKey]))
                        .forEach((itemKey) => {
                            setScalarFields(`${itemPrefix} ${fieldLabel(itemKey)}`, item[itemKey], groupKey)
                        })
                } else {
                    setScalarFields(itemPrefix, item, groupKey)
                }
            })
            return
        }

        Object.keys(value)
            .filter((field) => !shouldSkipOutputField(field, value[field]))
            .forEach((field) => {
                setScalarFields(`${prefix} ${fieldLabel(field)}`, value[field], groupKey)
            })
    }

    Object.keys(entity)
        .filter((key) => IGNORED_TOP_LEVEL_KEYS.indexOf(key) === -1)
        .forEach((key) => {
            if (key === 'attachment') {
                fields.Attachment = getAttachmentValue(entity.attachment)
                return
            }
            setScalarFields(fieldLabel(key), entity[key], key)
        })
    return fields
}

const getChanges = (beforeEntity, afterEntity) => {
    const before = getEntityFields(beforeEntity)
    const after = getEntityFields(afterEntity)
    return Object.keys(after)
        .map((field) => ({
            field,
            from: normaliseAuditValue(before[field]),
            to: normaliseAuditValue(after[field])
        }))
        .filter((change) => change.from !== change.to)
        .slice(0, 60)
}

export const writeAssetSaveAuditLog = async (objectType, oldEntity, entity) => {
    const isUpdate = !!getObjectId(oldEntity) && hasPersistedObjectIdentity(oldEntity)
    const changes = isUpdate ? getChanges(oldEntity, entity) : []
    const result = await tryWriteAuditLog({
        objectType,
        objectId: getObjectId(entity),
        objectName: getObjectName(entity, objectType),
        action: isUpdate ? 'UPDATE' : 'INSERT',
        changes,
        user: getEntityUser(entity)
    })
    return { ...result, changed: isUpdate ? changes.length > 0 : true }
}

export const writeAssetDeleteAuditLog = async (objectType, entity) => {
    await tryWriteAuditLog({
        objectType,
        objectId: getObjectId(entity),
        objectName: getObjectName(entity, objectType),
        action: 'DELETE',
        user: getEntityUser(entity)
    })
}
