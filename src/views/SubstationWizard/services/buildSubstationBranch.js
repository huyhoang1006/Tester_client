import SubstationDto from '@/views/Dto/Substation'
import VoltageLevelDto from '@/views/Dto/VoltageLevel'
import BayDto from '@/views/Dto/Bay'
import TransformerDto from '@/views/Dto/Transformer'
import CircuitBreakerDto from '@/views/Dto/CircuitBreaker'
import CurrentTransformerDto from '@/views/Dto/CurrentTransformer'
import VoltageTransformerDto from '@/views/Dto/VoltageTransformer'
import CapacitorDto from '@/views/Dto/Capacitor'
import CoreDto from '@/views/Dto/CurrentTransformer/CTConfiguration/CoreDto'

const phaseNames = ['A', 'B', 'C']

const node = (type, data, children = [], asset = '') => ({
    type,
    ...(asset ? { asset } : {}),
    data,
    children
})

const unknownSerial = (newUuid) => `UNKNOWN_${newUuid()}`

const assignNestedMrids = (value, newUuid) => {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
        value.forEach((item) => assignNestedMrids(item, newUuid))
        return
    }
    const keys = Object.keys(value)
    // Asset create screens call traverseAndFillMrid before mapping. The generated
    // branch must do the same because several empty-looking child records are
    // still inserted unconditionally by their entity transaction.
    if (Object.prototype.hasOwnProperty.call(value, 'mrid') && !value.mrid) value.mrid = newUuid()
    keys.forEach((key) => assignNestedMrids(value[key], newUuid))
}

const setCommonAssetIds = (dto, newUuid) => {
    dto.assetInfoId = newUuid()
    dto.productAssetModelId = newUuid()
    dto.lifecycleDateId = newUuid()
    dto.assetPsrId = newUuid()
}

const setAssetProperties = (dto, values, newUuid) => {
    dto.properties.mrid = newUuid()
    dto.properties.serial_no = unknownSerial(newUuid)
    dto.properties.apparatus_id = values.name
    dto.properties.manufacturer = values.manufacturer || ''
    dto.properties.manufacturer_type = values.model || ''
    dto.properties.manufacturer_year = values.manufacturingYear || ''
    dto.properties.manufacturing_year = values.manufacturingYear || ''
    dto.properties.country_of_origin = values.country || ''
    dto.properties.status = values.status || 'In operation'
    dto.properties.status_date_time = new Date().toISOString()
}

const buildCircuitBreaker = (name, preset, newUuid) => {
    const dto = new CircuitBreakerDto()
    setCommonAssetIds(dto, newUuid)
    dto.breakerRatingInfoId = newUuid()
    dto.breakerContactSystemInfoId = newUuid()
    dto.breakerOtherInfoId = newUuid()
    dto.operatingMechanismId = newUuid()
    dto.operatingMechanismInfoId = newUuid()
    dto.operatingMechanismLifecycleDateId = newUuid()
    dto.operatingMechanismProductAssetModelId = newUuid()
    dto.assessmentLimitBreakerInfoId = newUuid()
    setAssetProperties(dto, { name, ...preset }, newUuid)
    dto.properties.type = preset.type || 'Vacuum'
    dto.circuitBreaker.numberOfPhases = '3'
    dto.circuitBreaker.interruptersPerPhase = preset.interruptersPerPhase || ''
    dto.circuitBreaker.interruptingMedium = preset.type === 'Vacuum' ? 'Vacuum' : ''
    dto.ratings.rated_voltage_ll.value = String(preset.ratedVoltage || '')
    dto.ratings.rated_current.value = String(preset.ratedCurrent || '')
    dto.ratings.rated_short_circuit_breaking_current.value = String(preset.breakingCurrent || '')
    dto.ratings.short_circuit_nominal_duration.value = String(preset.duration || '')
    dto.ratings.interrupting_duty_cycle = preset.dutyCycle || ''
    assignNestedMrids(dto, newUuid)
    return node('breaker', dto, [], 'Circuit breaker')
}

const tapRow = (name, type, ipn = '', isn = '') => ({
    table: {
        isShow: false,
        name,
        ipn: { mrid: '', value: ipn, unit: 'A' },
        isn: { mrid: '', value: isn, unit: 'A' },
        inUse: false,
        type,
        mrid: ''
    },
    classRating: {}
})

const configureCore = (core, profile) => {
    core.taps = String(profile.taps)
    core.commonTap = String(profile.commonTap || '1')
    core.fullTap.table.name = 'S1 - S' + profile.taps
    core.fullTap.table.ipn.value = profile.fullIpn || ''
    core.fullTap.table.isn.value = profile.fullIsn || ''
    core.mainTap.data = (profile.mainTaps || []).map((tap, index) =>
        tapRow(`S1 - S${index + 2}`, 'maintap', tap.ipn, tap.isn)
    )
    core.interTap.data = []
}

const buildCurrentTransformer = (name, phase, preset, newUuid) => {
    const dto = new CurrentTransformerDto()
    setCommonAssetIds(dto, newUuid)
    setAssetProperties(dto, { name, ...preset }, newUuid)
    dto.properties.asset_type = preset.type || 'inductive'
    dto.config.number_of_phase = '1'
    dto.config.phase = phase
    dto.ratings.primary_winding_count = preset.primaryWindingCount || ''
    dto.ctConfiguration.cores = String(preset.cores)
    dto.ctConfiguration.dataCT = []
    for (let index = 0; index < preset.cores; index += 1) {
        const core = new CoreDto()
        configureCore(core, (preset.coreProfiles && preset.coreProfiles[index]) || preset)
        dto.ctConfiguration.dataCT.push(core)
    }
    assignNestedMrids(dto, newUuid)
    return node('currentTransformer', dto, [], 'Current transformer')
}

const buildVoltageTransformer = (name, phase, preset, newUuid) => {
    const dto = new VoltageTransformerDto()
    setCommonAssetIds(dto, newUuid)
    setAssetProperties(dto, { name, ...preset }, newUuid)
    dto.properties.asset_type = preset.type
    dto.config.number_of_phase = '1'
    dto.config.phase = phase
    dto.ratings.c1.value = preset.c1 || ''
    dto.ratings.c2.value = preset.c2 || ''
    dto.ratings.uprRatio.value = '3sqrt'
    dto.ratings.upr = String(preset.upr || '')
    dto.vt_Configuration.windings = String(preset.windings.length)
    dto.vt_Configuration.dataVT = preset.windings.map((winding) => ({
        mrid: '',
        name: winding.name,
        usr_formula: winding.usr,
        usr_rated_voltage: { mrid: '', value: winding.voltage, unit: 'V', multiplier: '' },
        rated_burden: { mrid: '', value: winding.burden, unit: 'VA', multiplier: '' },
        rated_power_factor: winding.powerFactor
    }))
    assignNestedMrids(dto, newUuid)
    return node('voltageTransformer', dto, [], 'Voltage transformer')
}

const buildTransformer = (config, index, newUuid) => {
    const dto = new TransformerDto()
    setCommonAssetIds(dto, newUuid)
    dto.oldPowerTransformerInfoId = dto.assetInfoId
    const name = `T${index + 1}`
    setAssetProperties(dto, { name, ...config }, newUuid)
    dto.properties.type = config.type || 'Three-winding'
    dto.winding_configuration.phases = '3'
    dto.winding_configuration.phase = ''
    dto.winding_configuration.vector_group.prim = 'Yn'
    dto.winding_configuration.vector_group.sec.i = 'Yn'
    dto.winding_configuration.vector_group.sec.value = '0'
    dto.winding_configuration.vector_group.tert.i = 'D'
    dto.winding_configuration.vector_group.tert.value = '11'
    dto.winding_configuration.vector_group_data = config.vectorGroup || 'YnYn0D11'
    dto.oldTransformerEndInfo = [1, 2, 3].map((endNumber) => ({
        mrid: newUuid(),
        end_number: endNumber,
        power_transformer_info_id: dto.oldPowerTransformerInfoId,
        connection_kind: '',
        phase_angle_clock: '',
        material: '',
        accessibility: '',
        phase: '',
        spare: false
    }))
    dto.ratings.voltage_ratings = [
        voltageRating('Prim', config.primVoltage),
        voltageRating('Sec', config.secVoltage),
        voltageRating('Tert', config.tertVoltage)
    ]
    dto.ratings.power_ratings = [{
        mrid: '',
        rated_power: { mrid: '', value: String(config.ratedPower || ''), unit: 'M|VA' },
        cooling_class: '',
        temp_rise_wind: { mrid: '', value: '', unit: 'degC' }
    }]
    dto.ratings.current_ratings = []
    dto.tap_changers.mode = config.tapChangerType || 'OLTC'
    dto.tap_changers.mrid = newUuid()
    dto.tap_changers.assetInfoId = newUuid()
    dto.tap_changers.productAssetModelId = newUuid()
    dto.tap_changers.winding = 'Prim'
    dto.tap_changers.tap_scheme = '1...N'
    dto.tap_changers.no_of_taps = String(config.numberOfTaps || 19)
    const count = Number(config.numberOfTaps || 19)
    const middle = Math.ceil(count / 2)
    dto.tap_changers.voltage_table = Array.from({ length: count }, (_, tapIndex) => ({
        id: newUuid(),
        tap: tapIndex + 1,
        voltage: {
            mrid: '',
            value: Math.round(Number(config.principalTapVoltage || 115000) *
                (1 + ((tapIndex + 1) - middle) * Number(config.tapStep || 1.78) / 100)),
            unit: 'V'
        }
    }))
    assignNestedMrids(dto, newUuid)
    return node('transformer', dto, [], 'Transformer')
}

const buildAuxTransformer = (name, newUuid) => {
    const dto = new TransformerDto()
    setCommonAssetIds(dto, newUuid)
    dto.oldPowerTransformerInfoId = dto.assetInfoId
    setAssetProperties(dto, { name, status: 'In operation' }, newUuid)
    dto.properties.type = 'Two-winding'
    dto.winding_configuration.phases = '3'
    dto.oldTransformerEndInfo = [1, 2].map((endNumber) => ({
        mrid: newUuid(),
        end_number: endNumber,
        power_transformer_info_id: dto.oldPowerTransformerInfoId,
        connection_kind: '',
        phase_angle_clock: '',
        material: '',
        accessibility: '',
        phase: '',
        spare: false
    }))
    assignNestedMrids(dto, newUuid)
    return node('transformer', dto, [], 'Transformer')
}

const buildCapacitor = (name, newUuid) => {
    const dto = new CapacitorDto()
    setCommonAssetIds(dto, newUuid)
    setAssetProperties(dto, { name, status: 'In operation' }, newUuid)
    dto.configsData.number_of_phase = '3'
    dto.configsData.phase = ''
    assignNestedMrids(dto, newUuid)
    return node('capacitor', dto, [], 'Capacitor')
}

const voltageRating = (winding, value) => ({
    mrid: '',
    winding,
    voltage_ll: { mrid: '', value: String(value || ''), unit: 'k|V' },
    voltage_ln: { mrid: '', value: '', unit: 'k|V' },
    insul_level_ll: { mrid: '', value: '', unit: 'k|V' },
    voltage_regulation: '',
    insulation_class: ''
})

const buildBay = (name, children, newUuid) => {
    const dto = new BayDto()
    dto.mrid = newUuid()
    dto.bayId = dto.mrid
    dto.name = String(name)
    dto.substation = null
    dto.power_plant = null
    dto.voltage_level = null
    return node('bay', dto, children)
}

const buildVoltageLevel = (name, voltage, children, newUuid) => {
    const dto = new VoltageLevelDto()
    dto.voltageLevelId = newUuid()
    dto.baseVoltageId = newUuid()
    dto.nominalVoltageId = newUuid()
    dto.name = name
    dto.base_voltage_value = String(voltage)
    return node('voltageLevel', dto, children)
}

const ctAssets = (baseName, preset, newUuid) => phaseNames.map((phase) =>
    buildCurrentTransformer(`${baseName}-${phase}`, phase, preset, newUuid)
)

const vtAssets = (baseName, preset, newUuid) => phaseNames.map((phase) =>
    buildVoltageTransformer(`${baseName}-${phase}`, phase, preset, newUuid)
)

const buildLineBay = (bayName, voltage, presets, options, newUuid) => {
    const children = []
    if (options.cb) children.push(buildCircuitBreaker(`CB${bayName}`, voltage === 110 ? presets.cb110 : presets.cb22, newUuid))
    if (options.ct) children.push(...ctAssets(`TI${bayName}`, voltage === 110 ? presets.ct110Line : presets.ct22, newUuid))
    if (options.vt && voltage === 110) children.push(...vtAssets(`TU${bayName}`, presets.vt110, newUuid))
    return buildBay(bayName, children, newUuid)
}

const buildHVCoupler = (presets, options, newUuid) => {
    const children = []
    if (options.cb) children.push(buildCircuitBreaker('CB112', presets.cb110, newUuid))
    if (options.ct) children.push(...ctAssets('TI112', presets.ct110Transformer, newUuid))
    return buildBay('112', children, newUuid)
}

const buildTransformerBay = (transformer, index, presets, options, newUuid) => {
    const number = 131 + index
    const children = [buildTransformer(transformer, index, newUuid)]
    if (options.cb) children.push(buildCircuitBreaker(`CB${number}`, presets.cb110, newUuid))
    if (options.ct) {
        children.push(...ctAssets(`TI${number}`, presets.ct110Transformer, newUuid))
        children.push(...ctAssets(`TIT${index + 1}`, presets.ct110Transformer, newUuid))
    }
    return buildBay(String(number), children, newUuid)
}

const buildMediumVoltageLevel = (level, transformerIndexes, bayConfig, presets, options, sequences, newUuid) => {
    const levelCode = level.slice(1)
    const levelNumber = Number(levelCode) - 40
    const bays = []
    transformerIndexes.forEach((transformerIndex) => {
        const incomerName = String(431 + transformerIndex)
        const incomerChildren = []
        if (options.cb) incomerChildren.push(buildCircuitBreaker(`CB${incomerName}`, presets.cb22, newUuid))
        if (options.ct) incomerChildren.push(...ctAssets(`TI${incomerName}`, presets.ct22, newUuid))
        bays.push(buildBay(incomerName, incomerChildren, newUuid))
    })

    const sequenceKey = levelNumber % 2 === 1 ? 'odd' : 'even'
    for (let i = 0; i < Number(bayConfig.lineBays || 0); i += 1) {
        const bayName = String(sequences[sequenceKey])
        sequences[sequenceKey] += 2
        bays.push(buildLineBay(bayName, 22, presets, options, newUuid))
    }

    for (let i = 0; i < Number(bayConfig.vtBays || 0); i += 1) {
        const bayName = `TUC${levelCode}${i ? `-${i + 1}` : ''}`
        bays.push(buildBay(bayName, options.vt ? vtAssets(bayName, presets.vt22, newUuid) : [], newUuid))
    }
    for (let i = 0; i < Number(bayConfig.auxBays || 0); i += 1) {
        const bayName = `${440 + levelNumber}${i ? `-${i + 1}` : ''}`
        const transformerName = `TD${levelCode}${i ? `-${i + 1}` : ''}`
        bays.push(buildBay(bayName, [buildAuxTransformer(transformerName, newUuid)], newUuid))
    }
    for (let i = 0; i < Number(bayConfig.capacitorBays || 0); i += 1) {
        const base = String(400 + levelNumber)
        const bayName = i ? `${base}-${i + 1}` : base
        bays.push(buildBay(bayName, [buildCapacitor(bayName, newUuid)], newUuid))
    }
    return buildVoltageLevel(level, 22, bays, newUuid)
}

export const buildSubstationBranch = (config, newUuid) => {
    const substation = new SubstationDto()
    substation.subsId = newUuid()
    substation.organisationPsrId = newUuid()
    substation.name = config.substation.name.trim()
    substation.type = 'Substation'

    const options = config.equipment
    const c11Bays = []
    const c12Bays = []
    if (config.scheme === 'h') c11Bays.push(buildHVCoupler(config.presets, options, newUuid))

    for (let index = 0; index < Number(config.lineBayCount); index += 1) {
        const bayName = String(171 + index)
        const bay = buildLineBay(bayName, 110, config.presets, options, newUuid)
        if (config.scheme === 'h' && Number(bayName) % 2 === 0) c12Bays.push(bay)
        else c11Bays.push(bay)
    }

    config.transformers.forEach((transformer, index) => {
        const bay = buildTransformerBay(transformer, index, config.presets, options, newUuid)
        if (config.scheme === 'h' && transformer.busbar === 'C12') c12Bays.push(bay)
        else c11Bays.push(bay)
    })

    const children = [buildVoltageLevel('C11', 110, c11Bays, newUuid)]
    if (config.scheme === 'h') children.push(buildVoltageLevel('C12', 110, c12Bays, newUuid))

    const sequences = { odd: 471, even: 472 }
    const mediumVoltageLevels = [...new Set(config.transformers.map((transformer, index) =>
        transformer.mvLevel || `C4${index + 1}`
    ))].sort((first, second) => Number(first.slice(1)) - Number(second.slice(1)))
    mediumVoltageLevels.forEach((level) => {
        const transformerIndexes = config.transformers
            .map((transformer, index) => ({ transformer, index }))
            .filter(({ transformer, index }) => (transformer.mvLevel || `C4${index + 1}`) === level)
            .map(({ index }) => index)
        children.push(buildMediumVoltageLevel(
            level,
            transformerIndexes,
            config.mvLevels[level],
            config.presets,
            options,
            sequences,
            newUuid
        ))
    })

    return node('substation', substation, children)
}

export const countGeneratedNodes = (root) => {
    let count = 0
    const walk = (current) => {
        count += 1
        current.children.forEach(walk)
    }
    walk(root)
    return count
}

const nodeName = (current) => {
    if (!current || !current.data) return ''
    if (current.data.properties) return current.data.properties.apparatus_id || ''
    return current.data.name || ''
}

const nodeMrid = (current) => {
    if (!current || !current.data) return ''
    if (current.data.properties) return current.data.properties.mrid || ''
    return current.data.mrid || current.data.subsId || current.data.voltageLevelId || ''
}

export const validateGeneratedBranch = (root) => {
    const errors = []
    const seenMrids = new Set()
    const seenSerials = new Set()

    const walk = (current, path) => {
        const name = nodeName(current)
        const currentPath = [...path, name || current.type].join(' / ')
        const mrid = nodeMrid(current)
        if (!mrid) errors.push(`${currentPath}: missing mRID.`)
        else if (seenMrids.has(mrid)) errors.push(`${currentPath}: duplicate mRID ${mrid}.`)
        else seenMrids.add(mrid)

        const serial = current.data && current.data.properties && current.data.properties.serial_no
        if (serial) {
            if (seenSerials.has(serial)) errors.push(`${currentPath}: duplicate serial number ${serial}.`)
            else seenSerials.add(serial)
        }

        const siblingKeys = new Set()
        ;(current.children || []).forEach((child) => {
            const childName = nodeName(child)
            const key = `${child.type}:${String(childName).trim().toLowerCase()}`
            if (!childName) errors.push(`${currentPath}: a ${child.type} child has no name.`)
            else if (siblingKeys.has(key)) errors.push(`${currentPath}: duplicate ${child.type} name "${childName}".`)
            else siblingKeys.add(key)
        })
        ;(current.children || []).forEach((child) => walk(child, [...path, name || current.type]))
    }

    if (!root) return ['Generated substation is empty.']
    walk(root, [])
    return errors
}
