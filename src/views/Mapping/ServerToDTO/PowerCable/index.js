import PowerCableDTO from "@/views/Dto/PowerCable";
import { toServerId } from '@/utils/serverId'
import {
    applyServerAssetFields,
    buildServerAssetFields,
    fromServerOperationDate,
    toServerOperationDate
} from '@/utils/assetServerSync'

const str = (value) => (value !== null && value !== undefined ? String(value) : '')

const textT = (value) => {
    if (value === null || value === undefined) return null
    const text = String(value).trim()
    return text ? text : null
}

const numT = (value) => {
    if (value === null || value === undefined || value === '') return null
    const number = Number(value)
    return Number.isFinite(number) ? number : null
}

const intT = (value) => {
    if (value === null || value === undefined || value === '') return null
    const number = parseInt(value, 10)
    return Number.isFinite(number) ? number : null
}

const idT = (value) => {
    const text = textT(value)
    return text && /^\d+$/.test(text) ? Number(text) : null
}

const splitUnit = (unit, defaultUnit = '') => {
    const value = unit || defaultUnit
    if (!value) return ''
    if (value.includes('|')) return value
    const multipliers = ['da', 'k', 'M', 'G', 'm', 'µ', 'u', 'n', 'p']
    for (const multiplier of multipliers) {
        if (value.length > multiplier.length && value.startsWith(multiplier)) {
            return `${multiplier}|${value.slice(multiplier.length)}`
        }
    }
    return value
}

const joinUnit = (unit) => {
    const text = textT(unit)
    return text ? text.replace('|', '') : null
}

const measurementToServer = (measurement = {}) => ({
    value: numT(measurement.value),
    unit: joinUnit(measurement.unit),
})

const setMeasurement = (target, value, unit, defaultUnit) => {
    target.mrid = ''
    target.value = str(value)
    target.unit = splitUnit(unit, defaultUnit)
}

const setSelect = (target, value) => {
    if (!target) return
    target.value = value || ''
}

const setCustomSelect = (target, customTarget, value, customValue) => {
    if (target) target.value = value || ''
    if (customTarget) customTarget.value = customValue || ''
}

const pickSection = (serverData, ...names) => {
    for (const name of names) {
        if (serverData && serverData[name]) return serverData[name]
    }
    return {}
}

const buildLayersFromSections = (dto, core) => {
    dto.layersData.conductor = Boolean(core.hasConductor)
    dto.layersData.sheath_reinforcing = Boolean(core.hasSheathReinforcingTap)
    dto.layersData.conductor_shield = Boolean(core.hasConductorShield)
    dto.layersData.concentric_neutral = Boolean(core.hasConcentricNeutral)
    dto.layersData.insulation = Boolean(core.hasInsulation)
    dto.layersData.insulation_screen = Boolean(core.hasInsulationScreen)
    dto.layersData.armour_bedding = Boolean(core.hasArmourBedding)
    dto.layersData.armour = Boolean(core.hasArmour)
    dto.layersData.sheath = Boolean(core.hasSheath)
    dto.layersData.oversheath = Boolean(core.hasOversheathJacketServing)
}

const setCimMeasurement = (target, source, defaultUnit = '') => {
    const multiplier = textT(source?.multiplier)
    const unit = textT(source?.unit) || defaultUnit
    target.mrid = str(source?.mRID || source?.mrid)
    target.value = str(source?.value)
    target.unit = multiplier && multiplier !== 'none' ? `${multiplier}|${unit}` : unit
}

const hasCimValue = (value) => {
    if (value === null || value === undefined || value === '') return false
    if (typeof value !== 'object') return true
    return Object.entries(value).some(([key, item]) => key !== 'mRID' && key !== 'mrid' && hasCimValue(item))
}

function mapCimServerToDto(data) {
    const dto = new PowerCableDTO()
    const info = data.cableInfo || {}
    const asset = data.assetData || {}
    const model = asset.productAssetModel || {}
    const neutral = data.concentricNeutral || {}
    const accessories = data.accessories || {}
    const terminal = accessories.terminal || {}
    const joint = accessories.joint || {}
    const svl = accessories.sheathVoltageLimiter || {}

    dto.mrid = str(data.mRID || data.mrid)
    dto.properties.mrid = dto.mrid
    dto.properties.type = asset.type || ''
    dto.properties.kind = 'Power cable'
    dto.properties.serial_no = asset.serialNumber || ''
    dto.properties.manufacturer = model.manufacturer?.name || ''
    dto.properties.manufacturer_type = model.modelNumber || neutral.manufacturerType || ''
    dto.properties.manufacturer_year = asset.lotNumber || ''
    dto.properties.country_of_origin = asset.countryOfOrigin || model.countryOfOrigin || ''
    dto.properties.apparatus_id = data.name || asset.name || ''
    dto.properties.comment = data.description || asset.description || ''
    dto.properties.operating_date_id = asset.inUseDate?.mRID || asset.inUseDate?.mrid || ''
    dto.properties.operating_date = fromServerOperationDate(asset.inUseDate?.inUseDate)
    dto.properties.status_id = asset.status?.mRID || asset.status?.mrid || ''
    dto.properties.status_date_time = asset.status?.dateTime || ''
    dto.properties.status = asset.status?.value || ''
    dto.oldCableInfoId = str(info.mRID || info.mrid)
    dto.assetInfoId = str(info.cableInfoId || neutral.mRID || neutral.mrid)
    dto.productAssetModelId = str(model.mRID || model.mrid)

    dto.configsData.number_of_phase = info.phaseCount ?? ''
    dto.configsData.phase = info.phase || ''
    dto.configsData.cores.value = info.coreCount === 1 ? 'Single' : (info.coreCount ? 'Multiple' : '')

    setCimMeasurement(dto.ratingsData.rated_voltage, info.ratedU, 'V')
    setCimMeasurement(dto.ratingsData.max_voltage, info.maxU, 'V')
    setCimMeasurement(dto.ratingsData.rated_frequency, info.ratedFrequency, 'Hz')
    setCimMeasurement(dto.ratingsData.shortcircuit, info.shortCircuitCurrent, 'A')
    setCimMeasurement(dto.ratingsData.rated_duration, info.ratedDurationShortCircuit, 's')
    setSelect(dto.othersData.insulation_method, info.installationMethod)
    setSelect(dto.othersData.bonding_type, info.bondingType)
    setSelect(dto.othersData.install_location, info.installLocation)
    setCimMeasurement(dto.othersData.cable_length, info.length, 'm')

    setCimMeasurement(dto.datasData.conductor.conductor_size, info.conductorSize, 'mm²')
    setSelect(dto.datasData.conductor.conductor_class, info.conductorClass)
    setSelect(dto.datasData.conductor.conductor_material, info.material)
    setSelect(dto.datasData.conductor.conductor_type, info.conductorType)
    setCimMeasurement(dto.datasData.conductor.conductor_diameter, info.nominalConductorDiameter, 'mm')

    setCimMeasurement(dto.datasData.conductor_shield.thickness, info.conductorShieldThickness, 'mm')
    setCimMeasurement(dto.datasData.conductor_shield.diameter, info.diameterOverShield, 'mm')
    setSelect(dto.datasData.sheath.multicore, info.sheathMulticore)
    setSelect(dto.datasData.sheath.construction, info.sheathConstruction)
    setSelect(dto.datasData.sheath.sheath_type, info.sheathType)
    setCimMeasurement(dto.datasData.sheath.thickness, info.sheathThickness, 'mm')
    setCimMeasurement(dto.datasData.sheath.diameter, info.diameterOverThickness, 'mm')

    setSelect(dto.datasData.insulation.insulation_type, info.insulationMaterial || neutral.insulationMaterial)
    setCimMeasurement(dto.datasData.insulation.insulation_operating, info.insulationMaxOperatingTemp, '°C')
    setCimMeasurement(dto.datasData.insulation.thickness, info.insulationThickness || neutral.insulationThickness, 'mm')
    setCimMeasurement(dto.datasData.insulation.diameter, info.diameterOverInsulation || neutral.diameterOverInsulation, 'mm')
    setSelect(dto.datasData.insulation_screen.material, info.screenMaterial || neutral.shieldMaterial)
    setCimMeasurement(dto.datasData.insulation_screen.thickness, info.screenThickness, 'mm')
    setCimMeasurement(dto.datasData.insulation_screen.diameter, info.diameterOverScreen || neutral.diameterOverScreen, 'mm')

    setSelect(dto.datasData.armour_bedding.material, info.armourBeddingMaterial)
    setCimMeasurement(dto.datasData.armour_bedding.thickness, info.armourBeddingThickness, 'mm')
    setCimMeasurement(dto.datasData.armour_bedding.diameter, info.diameterBeddingOverAmour, 'mm')
    setSelect(dto.datasData.sheath_reinforcing.material, info.sheathReinforcingMaterial)
    setCimMeasurement(dto.datasData.sheath_reinforcing.thickness, info.sheathReinforcingThickness, 'mm')
    setCimMeasurement(dto.datasData.sheath_reinforcing.diameter, info.diameterOverSheathReinforcing, 'mm')
    setCimMeasurement(dto.datasData.sheath_reinforcing.width, info.sheathReinforcingWidth, 'mm')
    setCimMeasurement(dto.datasData.sheath_reinforcing.lengthOfLay, info.sheathReinforcingLengthLay, 'mm')
    setSelect(dto.datasData.sheath_reinforcing.numOfTapes, info.sheathReinforcingNoTape)

    setSelect(dto.datasData.armour.material, info.armourMaterial)
    setCimMeasurement(dto.datasData.armour.thickness, info.armourThickness, 'mm')
    setCimMeasurement(dto.datasData.armour.diameter, info.diameterOverArmour, 'mm')
    setSelect(dto.datasData.armour.layerOfTapes, info.armourLayerTape)
    setCimMeasurement(dto.datasData.armour.crossSectional, info.armourCrossSectionalAreaTap, 'mm²')
    setSelect(dto.datasData.oversheath.material, info.outerJacketKind || neutral.outerJacketKind)
    setCimMeasurement(dto.datasData.oversheath.thickness, info.jacketThickness, 'mm')
    setCimMeasurement(dto.datasData.oversheath.diameter, info.diameterOverJacket || neutral.diameterOverJacket, 'mm')

    setSelect(dto.datasData.concentric_neutral.material, info.concentricMaterial || neutral.material)
    setSelect(dto.datasData.concentric_neutral.construction, info.concentricConstruction || neutral.constructionKind)
    setCimMeasurement(dto.datasData.concentric_neutral.thickness, info.concentricThickness, 'mm')
    setCimMeasurement(dto.datasData.concentric_neutral.diameter, neutral.diameterOverNeutral, 'mm')
    setCimMeasurement(dto.datasData.concentric_neutral.lengthOfLay, info.concentricLengthLay, 'mm')
    setCimMeasurement(dto.datasData.concentric_neutral.area, info.concentricArea, 'mm²')
    setSelect(dto.datasData.concentric_neutral.numOfWires, info.concentricNoOfWires || neutral.neutralStrandCount)

    dto.datasData.terminalsData.mrid = str(terminal.mRID || terminal.mrid)
    setCimMeasurement(dto.datasData.terminalsData.rated_u, terminal.ratedU, 'V')
    setCimMeasurement(dto.datasData.terminalsData.bil, terminal.bil, 'V')
    setCimMeasurement(dto.datasData.terminalsData.bsl, terminal.bsl, 'V')
    setSelect(dto.datasData.terminalsData.type, terminal.type)
    setSelect(dto.datasData.terminalsData.class, terminal.class)
    setSelect(dto.datasData.terminalsData.connector_type, terminal.connectorType)
    setSelect(dto.datasData.terminalsData.service_condition, terminal.serviceCondition)

    dto.datasData.jointsData.mrid = str(joint.mRID || joint.mrid)
    setCimMeasurement(dto.datasData.jointsData.rated_u, joint.ratedU, 'V')
    setCimMeasurement(dto.datasData.jointsData.rated_current, joint.ratedCurrent, 'A')
    setSelect(dto.datasData.jointsData.category, joint.category)
    setSelect(dto.datasData.jointsData.construction, joint.construction)
    setSelect(dto.datasData.jointsData.service_condition, joint.serviceCondition)

    dto.datasData.sheathLimitsData.mrid = str(svl.mRID || svl.mrid)
    setCimMeasurement(dto.datasData.sheathLimitsData.rated_voltage_ur, svl.ratedVoltageUr, 'V')
    setCimMeasurement(dto.datasData.sheathLimitsData.max_continuous_operating_voltage, svl.maxContinuousOperatingVoltage, 'V')
    setCimMeasurement(dto.datasData.sheathLimitsData.nominal_discharge_current, svl.nominalDischargeCurrent, 'A')
    setCimMeasurement(dto.datasData.sheathLimitsData.high_current_impulse_withstand, svl.highCurrentImpulseWithstand, 'A')
    setCimMeasurement(dto.datasData.sheathLimitsData.long_duration_current_impulse_withstand, svl.longDurationCurrentImpulseWithstand, 'A')
    setCimMeasurement(dto.datasData.sheathLimitsData.short_circuit_withstand, svl.shortCircuitWithstand, 'A')

    dto.layersData.conductor = hasCimValue({ size: info.conductorSize, class: info.conductorClass, material: info.material, type: info.conductorType })
    dto.layersData.conductor_shield = hasCimValue({ thickness: info.conductorShieldThickness, diameter: info.diameterOverShield })
    dto.layersData.insulation = hasCimValue({ material: info.insulationMaterial, thickness: info.insulationThickness, diameter: info.diameterOverInsulation })
    dto.layersData.insulation_screen = hasCimValue({ material: info.screenMaterial, thickness: info.screenThickness, diameter: info.diameterOverScreen })
    dto.layersData.sheath = hasCimValue({ type: info.sheathType, construction: info.sheathConstruction, thickness: info.sheathThickness })
    dto.layersData.sheath_reinforcing = hasCimValue({ material: info.sheathReinforcingMaterial, thickness: info.sheathReinforcingThickness })
    dto.layersData.concentric_neutral = hasCimValue({ material: info.concentricMaterial, construction: info.concentricConstruction, diameter: neutral.diameterOverNeutral })
    dto.layersData.armour_bedding = hasCimValue({ material: info.armourBeddingMaterial, thickness: info.armourBeddingThickness })
    dto.layersData.armour = hasCimValue({ material: info.armourMaterial, thickness: info.armourThickness })
    dto.layersData.oversheath = hasCimValue({ material: info.outerJacketKind, thickness: info.jacketThickness, diameter: info.diameterOverJacket })

    if (Array.isArray(data.attachments) && data.attachments.length) {
        dto.attachment.path = JSON.stringify(data.attachments.map(item => ({
            path: item.path,
            name: item.name || windowsFileName(item.path),
            type: item.type,
            mrid: item.mRID || item.mrid
        })))
    }

    return dto
}

export const mapServerToDto = (serverData) => {
    const dto = new PowerCableDTO();
    if (!serverData) return dto;

    const data = serverData.data || serverData
    if (data.cableInfo || data.assetData || data.accessories) {
        return mapCimServerToDto(data)
    }
    const assetInfo = pickSection(data, 'assetInfo', 'assetInfoResponseDTO')
    const core = pickSection(data, 'powerCableCore', 'powerCableCoreResponseDTO')
    const rating = pickSection(data, 'powerCableRating', 'powerCableRatingResponseDTO')
    const other = pickSection(data, 'powerCableOtherInfo', 'powerCableOtherInfoResponseDTO')
    const conductor = pickSection(data, 'powerCableConductor', 'powerCableConductorResponseDTO')
    const sheathReinforcing = pickSection(data, 'powerCableSheathReinforcingTap', 'powerCableSheathReinforcingTapResponseDTO')
    const conductorShield = pickSection(data, 'powerCableConductorShield', 'powerCableConductorShieldResponseDTO')
    const concentricNeutral = pickSection(data, 'powerCableConcentricNeutral', 'powerCableConcentricNeutralResponseDTO')
    const insulation = pickSection(data, 'powerCableInsulation', 'powerCableInsulationResponseDTO')
    const insulationScreen = pickSection(data, 'powerCableInsulationScreen', 'powerCableInsulationScreenResponseDTO')
    const sheath = pickSection(data, 'powerCableSheath', 'powerCableSheathResponseDTO')
    const armourBedding = pickSection(data, 'powerCableArmourBedding', 'powerCableArmourBeddingResponseDTO')
    const armour = pickSection(data, 'powerCableArmour', 'powerCableArmourResponseDTO')
    const oversheath = pickSection(data, 'powerCableOverSheathJacketServing', 'powerCableOverSheathJacketServingResponseDTO')
    const joint = pickSection(data, 'powerCableJoint', 'powerCableJointResponseDTO')
    const terminal = pickSection(data, 'powerCableTerminal', 'powerCableTerminalResponseDTO')
    const svl = pickSection(data, 'powerCableSheathVoltageLimiter', 'powerCableSheathVoltageLimiterResponseDTO')

    dto.properties.mrid = str(core.id || data.id || assetInfo.id || data.mRID)
    dto.properties.type = core.assetType || ''
    dto.properties.kind = 'Power cable'
    dto.properties.serial_no = assetInfo.serialNo || ''
    dto.properties.manufacturer = assetInfo.manufacturer || ''
    dto.properties.manufacturer_type = assetInfo.manufacturerType || ''
    dto.properties.manufacturer_year = assetInfo.manufacturingYear !== null && assetInfo.manufacturingYear !== undefined
        ? String(assetInfo.manufacturingYear)
        : ''
    dto.properties.country_of_origin = assetInfo.country || ''
    dto.properties.apparatus_id = assetInfo.apparatusId || assetInfo.assetName || ''
    dto.properties.comment = assetInfo.description || ''
    applyServerAssetFields(dto.properties, assetInfo)

    dto.assetInfoId = assetInfo.id ? String(assetInfo.id) : ''
    dto.psrId = assetInfo.ownerId ? String(assetInfo.ownerId) : null

    dto.configsData.number_of_phase = assetInfo.numberOfPhase ?? ''
    dto.configsData.phase = assetInfo.phase || ''
    dto.configsData.cores.value = core.core || ''
    buildLayersFromSections(dto, core)

    setMeasurement(dto.ratingsData.rated_voltage, rating.ratedVoltage, rating.ratedVoltageUnit, 'k|V')
    setMeasurement(dto.ratingsData.max_voltage, rating.maximumVoltage, rating.maximumVoltageUnit, 'k|V')
    // `ratedFrequency`, KHÔNG phải `rateFrequency`.
    //
    // Field Java bên server tên là `rateFrequency`, nhưng response DTO có
    // `@JsonProperty("ratedFrequency")` — annotation đó ĐỔI tên lúc ghi JSON, nên JSON về
    // luôn mang khoá `ratedFrequency`. Đọc theo tên field Java thì được `undefined`, và ô
    // Rated frequency hiện rỗng trong khi dữ liệu vẫn nằm nguyên trong DB.
    //
    // Đây là field duy nhất trong 10 field của powerCableRating bị lệch tên như vậy; 9
    // field kia dùng một tên ở cả hai chiều.
    setMeasurement(dto.ratingsData.rated_frequency, rating.ratedFrequency, rating.ratedFrequencyUnit, 'Hz')
    setMeasurement(dto.ratingsData.shortcircuit, rating.shortCircuitCurrent, rating.shortCircuitCurrentUnit, 'k|A')
    setMeasurement(dto.ratingsData.rated_duration, rating.ratedDurationOfShortCircuit, rating.ratedDurationOfShortCircuitUnit, 's')

    setSelect(dto.othersData.insulation_method, other.installationMethod)
    setSelect(dto.othersData.bonding_type, other.bondingType)
    setSelect(dto.othersData.install_location, other.installLocation)
    setMeasurement(dto.othersData.cable_length, other.cableLength, other.cableLengthUnit, 'k|m')

    setMeasurement(dto.datasData.conductor.conductor_size, conductor.conductorSize, conductor.conductorSizeUnit, 'mm²')
    setSelect(dto.datasData.conductor.conductor_class, conductor.conductorClass)
    setSelect(dto.datasData.conductor.conductor_count, conductor.conductorCount)
    setCustomSelect(dto.datasData.conductor.conductor_material, dto.datasData.conductor.conductor_material_custom, conductor.conductorMaterial, conductor.conductorMaterialCustom)
    setCustomSelect(dto.datasData.conductor.conductor_type, dto.datasData.conductor.conductor_type_custom, conductor.conductorType, conductor.conductorTypeCustom)
    setMeasurement(dto.datasData.conductor.conductor_diameter, conductor.nominalConductorDiameter, conductor.nominalConductorDiameterUnit, 'mm')

    setCustomSelect(dto.datasData.sheath_reinforcing.material, dto.datasData.sheath_reinforcing.material_custom, sheathReinforcing.material, sheathReinforcing.materialCustom)
    setMeasurement(dto.datasData.sheath_reinforcing.thickness, sheathReinforcing.thickness, sheathReinforcing.thicknessUnit, 'mm')
    setMeasurement(dto.datasData.sheath_reinforcing.diameter, sheathReinforcing.diameter, sheathReinforcing.diameterUnit, 'mm')
    setMeasurement(dto.datasData.sheath_reinforcing.width, sheathReinforcing.width, sheathReinforcing.widthUnit, 'mm')
    setMeasurement(dto.datasData.sheath_reinforcing.lengthOfLay, sheathReinforcing.lengthOfLay, sheathReinforcing.lengthOfLayUnit, 'mm')
    setSelect(dto.datasData.sheath_reinforcing.numOfTapes, sheathReinforcing.noOfTapes)

    setMeasurement(dto.datasData.conductor_shield.thickness, conductorShield.thickness, conductorShield.thicknessUnit, 'mm')
    setMeasurement(dto.datasData.conductor_shield.diameter, conductorShield.diameter, conductorShield.diameterUnit, 'mm')

    setCustomSelect(dto.datasData.concentric_neutral.material, dto.datasData.concentric_neutral.material_custom, concentricNeutral.material, concentricNeutral.materialCustom)
    setCustomSelect(dto.datasData.concentric_neutral.construction, dto.datasData.concentric_neutral.construction_custom, concentricNeutral.construction, concentricNeutral.constructionCustom)
    setMeasurement(dto.datasData.concentric_neutral.thickness, concentricNeutral.thickness, concentricNeutral.thicknessUnit, 'mm')
    setMeasurement(dto.datasData.concentric_neutral.diameter, concentricNeutral.diameter, concentricNeutral.diameterUnit, 'mm')
    setMeasurement(dto.datasData.concentric_neutral.lengthOfLay, concentricNeutral.lengthOfLay, concentricNeutral.lengthOfLayUnit, 'mm')
    setMeasurement(dto.datasData.concentric_neutral.area, concentricNeutral.area, concentricNeutral.areaUnit, 'mm²')
    setSelect(dto.datasData.concentric_neutral.numOfWires, concentricNeutral.noOfWires)

    setCustomSelect(dto.datasData.insulation.insulation_type, dto.datasData.insulation.insulation_type_custom, insulation.insulationType, insulation.insulationTypeCustom)
    setMeasurement(dto.datasData.insulation.thickness, insulation.thickness, insulation.thicknessUnit, 'mm')
    setMeasurement(dto.datasData.insulation.diameter, insulation.diameter, insulation.diameterUnit, 'mm')
    setMeasurement(dto.datasData.insulation.insulation_operating, insulation.maxOperatingTemp, insulation.maxOperatingTempUnit, '°C')

    setCustomSelect(dto.datasData.insulation_screen.material, dto.datasData.insulation_screen.material_custom, insulationScreen.material, insulationScreen.materialCustom)
    setMeasurement(dto.datasData.insulation_screen.thickness, insulationScreen.thickness, insulationScreen.thicknessUnit, 'mm')
    setMeasurement(dto.datasData.insulation_screen.diameter, insulationScreen.diameter, insulationScreen.diameterUnit, 'mm')

    setCustomSelect(dto.datasData.sheath.sheath_type, dto.datasData.sheath.sheath_type_custom, sheath.sheathType, sheath.sheathTypeCustom)
    setCustomSelect(dto.datasData.sheath.construction, dto.datasData.sheath.construction_custom, sheath.construction, sheath.constructionCustom)
    setMeasurement(dto.datasData.sheath.thickness, sheath.thickness, sheath.thicknessUnit, 'mm')
    setMeasurement(dto.datasData.sheath.diameter, sheath.diameter, sheath.diameterUnit, 'mm')

    setCustomSelect(dto.datasData.armour_bedding.material, dto.datasData.armour_bedding.material_custom, armourBedding.material, armourBedding.materialCustom)
    setMeasurement(dto.datasData.armour_bedding.thickness, armourBedding.thickness, armourBedding.thicknessUnit, 'mm')
    setMeasurement(dto.datasData.armour_bedding.diameter, armourBedding.diameter, armourBedding.diameterUnit, 'mm')

    setCustomSelect(dto.datasData.armour.material, dto.datasData.armour.material_custom, armour.material, armour.materialCustom)
    setMeasurement(dto.datasData.armour.thickness, armour.thickness, armour.thicknessUnit, 'mm')
    setMeasurement(dto.datasData.armour.diameter, armour.diameter, armour.diameterUnit, 'mm')
    setCustomSelect(dto.datasData.armour.layerOfTapes, dto.datasData.armour.layerOfTapes_custom, armour.layerOfTap, armour.layerOfTapCustom)
    setMeasurement(dto.datasData.armour.crossSectional, armour.areaOfTap, armour.areaOfTapUnit, 'mm²')

    setCustomSelect(dto.datasData.oversheath.material, dto.datasData.oversheath.material_custom, oversheath.material, oversheath.materialCustom)
    setMeasurement(dto.datasData.oversheath.thickness, oversheath.thickness, oversheath.thicknessUnit, 'mm')
    setMeasurement(dto.datasData.oversheath.diameter, oversheath.diameter, oversheath.diameterUnit, 'mm')

    setMeasurement(dto.datasData.jointsData.rated_u, joint.ratedVoltage, joint.ratedVoltageUnit, 'k|V')
    setMeasurement(dto.datasData.jointsData.rated_current, joint.ratedCurrent, joint.ratedCurrentUnit, 'A')
    setSelect(dto.datasData.jointsData.category, joint.category)
    setSelect(dto.datasData.jointsData.construction, joint.construction)
    setSelect(dto.datasData.jointsData.service_condition, joint.serviceCondition)

    setMeasurement(dto.datasData.terminalsData.rated_u, terminal.ratedVoltage, terminal.ratedVoltageUnit, 'k|V')
    setMeasurement(dto.datasData.terminalsData.bil, terminal.bil, terminal.bilUnit, 'k|V')
    setMeasurement(dto.datasData.terminalsData.bsl, terminal.bsl, terminal.bslUnit, 'k|V')
    setSelect(dto.datasData.terminalsData.type, terminal.type)
    setSelect(dto.datasData.terminalsData.connector_type, terminal.connectorType)
    setSelect(dto.datasData.terminalsData.service_condition, terminal.serviceCondition)
    setSelect(dto.datasData.terminalsData.class, terminal.class)

    setMeasurement(dto.datasData.sheathLimitsData.rated_voltage_ur, svl.ratedVoltageUr, svl.ratedVoltageUrUnit, 'k|V')
    setMeasurement(dto.datasData.sheathLimitsData.max_continuous_operating_voltage, svl.maximumOperatingVoltageUc, svl.maximumOperatingVoltageUcUnit, 'k|V')
    setMeasurement(dto.datasData.sheathLimitsData.nominal_discharge_current, svl.nominalDischargeCurrent, svl.nominalDischargeCurrentUnit, 'A')
    setSelect(dto.datasData.sheathLimitsData.high_current_impulse_withstand, svl.highCurrentImpulseWithstand)
    setSelect(dto.datasData.sheathLimitsData.long_duration_current_impulse_withstand, svl.longDurationCurrentImpulseWithstand)
    setSelect(dto.datasData.sheathLimitsData.short_circuit_withstand, svl.shortCircuitWithstand)

    return dto;
};

export const mapDtoToServer = (dto, ownerType) => {
    if (!dto) return null;

    const p = dto.properties || {};
    const c = dto.configsData || {};
    const l = dto.layersData || {};
    const r = dto.ratingsData || {};
    const o = dto.othersData || {};
    const d = dto.datasData || {};

    const ratedVoltage = measurementToServer(r.rated_voltage)
    const maximumVoltage = measurementToServer(r.max_voltage)
    const rateFrequency = measurementToServer(r.rated_frequency)
    const shortCircuitCurrent = measurementToServer(r.shortcircuit)
    const ratedDuration = measurementToServer(r.rated_duration)
    const cableLength = measurementToServer(o.cable_length)

    return {
        assetInfo: {
            ownerId: idT(toServerId(dto.psrId)),
            ownerType: textT(ownerType),
            assetName: textT(p.apparatus_id),
            serialNo: textT(p.serial_no),
            phase: textT(c.phase),
            numberOfPhase: intT(c.number_of_phase),
            manufacturer: textT(p.manufacturer),
            manufacturerId: null,
            manufacturerType: textT(p.manufacturer_type),
            manufacturingYear: intT(p.manufacturer_year),
            country: textT(p.country_of_origin),
            countryOfOriginId: null,
            apparatusId: textT(p.apparatus_id),
            description: textT(p.comment),
            ...buildServerAssetFields(p)
        },
        powerCableCore: {
            assetType: textT(p.type),
            feeder: null,
            core: textT(c.cores?.value),
            hasConductor: Boolean(l.conductor),
            hasSheathReinforcingTap: Boolean(l.sheath_reinforcing),
            hasConductorShield: Boolean(l.conductor_shield),
            hasConcentricNeutral: Boolean(l.concentric_neutral),
            hasInsulation: Boolean(l.insulation),
            hasInsulationScreen: Boolean(l.insulation_screen),
            hasArmourBedding: Boolean(l.armour_bedding),
            hasArmour: Boolean(l.armour),
            hasSheath: Boolean(l.sheath),
            hasOversheathJacketServing: Boolean(l.oversheath)
        },
        powerCableRating: {
            ratedVoltage: ratedVoltage.value,
            ratedVoltageUnit: ratedVoltage.unit,
            maximumVoltage: maximumVoltage.value,
            maximumVoltageUnit: maximumVoltage.unit,
            // Gửi `ratedFrequency` để KHỚP tên mà response trả về — một field một tên ở cả
            // hai chiều. Server nhận được vì request DTO có `@JsonAlias("ratedFrequency")`;
            // `@JsonAlias` THÊM tên hợp lệ lúc đọc chứ không đổi tên, nên cả hai cách viết
            // đều vào. Không phải chờ server sửa gì.
            ratedFrequency: rateFrequency.value,
            ratedFrequencyUnit: rateFrequency.unit,
            shortCircuitCurrent: shortCircuitCurrent.value,
            shortCircuitCurrentUnit: shortCircuitCurrent.unit,
            ratedDurationOfShortCircuit: ratedDuration.value,
            ratedDurationOfShortCircuitUnit: ratedDuration.unit
        },
        powerCableOtherInfo: {
            installationMethod: textT(o.insulation_method?.value),
            bondingType: textT(o.bonding_type?.value),
            installLocation: textT(o.install_location?.value),
            cableLength: cableLength.value,
            cableLengthUnit: cableLength.unit
        },
        powerCableConductor: {
            conductorSize: measurementToServer(d.conductor?.conductor_size).value,
            conductorSizeUnit: measurementToServer(d.conductor?.conductor_size).unit,
            conductorClass: textT(d.conductor?.conductor_class?.value),
            conductorCount: textT(d.conductor?.conductor_count?.value),
            conductorMaterial: textT(d.conductor?.conductor_material?.value),
            conductorMaterialCustom: textT(d.conductor?.conductor_material_custom?.value),
            conductorType: textT(d.conductor?.conductor_type?.value),
            conductorTypeCustom: textT(d.conductor?.conductor_type_custom?.value),
            nominalConductorDiameter: measurementToServer(d.conductor?.conductor_diameter).value,
            nominalConductorDiameterUnit: measurementToServer(d.conductor?.conductor_diameter).unit
        },
        powerCableSheathReinforcingTap: {
            material: textT(d.sheath_reinforcing?.material?.value),
            materialCustom: textT(d.sheath_reinforcing?.material_custom?.value),
            thickness: measurementToServer(d.sheath_reinforcing?.thickness).value,
            thicknessUnit: measurementToServer(d.sheath_reinforcing?.thickness).unit,
            diameter: measurementToServer(d.sheath_reinforcing?.diameter).value,
            diameterUnit: measurementToServer(d.sheath_reinforcing?.diameter).unit,
            width: measurementToServer(d.sheath_reinforcing?.width).value,
            widthUnit: measurementToServer(d.sheath_reinforcing?.width).unit,
            lengthOfLay: measurementToServer(d.sheath_reinforcing?.lengthOfLay).value,
            lengthOfLayUnit: measurementToServer(d.sheath_reinforcing?.lengthOfLay).unit,
            noOfTapes: intT(d.sheath_reinforcing?.numOfTapes?.value)
        },
        powerCableConductorShield: {
            thickness: measurementToServer(d.conductor_shield?.thickness).value,
            thicknessUnit: measurementToServer(d.conductor_shield?.thickness).unit,
            diameter: measurementToServer(d.conductor_shield?.diameter).value,
            diameterUnit: measurementToServer(d.conductor_shield?.diameter).unit
        },
        powerCableConcentricNeutral: {
            material: textT(d.concentric_neutral?.material?.value),
            materialCustom: textT(d.concentric_neutral?.material_custom?.value),
            construction: textT(d.concentric_neutral?.construction?.value),
            constructionCustom: textT(d.concentric_neutral?.construction_custom?.value),
            thickness: measurementToServer(d.concentric_neutral?.thickness).value,
            thicknessUnit: measurementToServer(d.concentric_neutral?.thickness).unit,
            diameter: measurementToServer(d.concentric_neutral?.diameter).value,
            diameterUnit: measurementToServer(d.concentric_neutral?.diameter).unit,
            lengthOfLay: measurementToServer(d.concentric_neutral?.lengthOfLay).value,
            lengthOfLayUnit: measurementToServer(d.concentric_neutral?.lengthOfLay).unit,
            area: measurementToServer(d.concentric_neutral?.area).value,
            areaUnit: measurementToServer(d.concentric_neutral?.area).unit,
            noOfWires: intT(d.concentric_neutral?.numOfWires?.value)
        },
        powerCableInsulation: {
            insulationType: textT(d.insulation?.insulation_type?.value),
            insulationTypeCustom: textT(d.insulation?.insulation_type_custom?.value),
            thickness: measurementToServer(d.insulation?.thickness).value,
            thicknessUnit: measurementToServer(d.insulation?.thickness).unit,
            diameter: measurementToServer(d.insulation?.diameter).value,
            diameterUnit: measurementToServer(d.insulation?.diameter).unit,
            maxOperatingTemp: measurementToServer(d.insulation?.insulation_operating).value,
            maxOperatingTempUnit: measurementToServer(d.insulation?.insulation_operating).unit
        },
        powerCableInsulationScreen: {
            material: textT(d.insulation_screen?.material?.value),
            materialCustom: textT(d.insulation_screen?.material_custom?.value),
            thickness: measurementToServer(d.insulation_screen?.thickness).value,
            thicknessUnit: measurementToServer(d.insulation_screen?.thickness).unit,
            diameter: measurementToServer(d.insulation_screen?.diameter).value,
            diameterUnit: measurementToServer(d.insulation_screen?.diameter).unit
        },
        powerCableSheath: {
            sheathType: textT(d.sheath?.sheath_type?.value),
            sheathTypeCustom: textT(d.sheath?.sheath_type_custom?.value),
            construction: textT(d.sheath?.construction?.value),
            constructionCustom: textT(d.sheath?.construction_custom?.value),
            thickness: measurementToServer(d.sheath?.thickness).value,
            thicknessUnit: measurementToServer(d.sheath?.thickness).unit,
            diameter: measurementToServer(d.sheath?.diameter).value,
            diameterUnit: measurementToServer(d.sheath?.diameter).unit
        },
        powerCableArmourBedding: {
            material: textT(d.armour_bedding?.material?.value),
            materialCustom: textT(d.armour_bedding?.material_custom?.value),
            thickness: measurementToServer(d.armour_bedding?.thickness).value,
            thicknessUnit: measurementToServer(d.armour_bedding?.thickness).unit,
            diameter: measurementToServer(d.armour_bedding?.diameter).value,
            diameterUnit: measurementToServer(d.armour_bedding?.diameter).unit
        },
        powerCableArmour: {
            material: textT(d.armour?.material?.value),
            materialCustom: textT(d.armour?.material_custom?.value),
            thickness: measurementToServer(d.armour?.thickness).value,
            thicknessUnit: measurementToServer(d.armour?.thickness).unit,
            diameter: measurementToServer(d.armour?.diameter).value,
            diameterUnit: measurementToServer(d.armour?.diameter).unit,
            layerOfTap: textT(d.armour?.layerOfTapes?.value),
            layerOfTapCustom: textT(d.armour?.layerOfTapes_custom?.value),
            areaOfTap: measurementToServer(d.armour?.crossSectional).value,
            areaOfTapUnit: measurementToServer(d.armour?.crossSectional).unit
        },
        powerCableOverSheathJacketServing: {
            material: textT(d.oversheath?.material?.value),
            materialCustom: textT(d.oversheath?.material_custom?.value),
            thickness: measurementToServer(d.oversheath?.thickness).value,
            thicknessUnit: measurementToServer(d.oversheath?.thickness).unit,
            diameter: measurementToServer(d.oversheath?.diameter).value,
            diameterUnit: measurementToServer(d.oversheath?.diameter).unit
        },
        powerCableJoint: {
            ratedVoltage: measurementToServer(d.jointsData?.rated_u).value,
            ratedVoltageUnit: measurementToServer(d.jointsData?.rated_u).unit,
            ratedCurrent: measurementToServer(d.jointsData?.rated_current).value,
            ratedCurrentUnit: measurementToServer(d.jointsData?.rated_current).unit,
            category: textT(d.jointsData?.category?.value),
            construction: textT(d.jointsData?.construction?.value),
            serviceCondition: textT(d.jointsData?.service_condition?.value)
        },
        powerCableTerminal: {
            ratedVoltage: measurementToServer(d.terminalsData?.rated_u).value,
            ratedVoltageUnit: measurementToServer(d.terminalsData?.rated_u).unit,
            bil: measurementToServer(d.terminalsData?.bil).value,
            bilUnit: measurementToServer(d.terminalsData?.bil).unit,
            bsl: measurementToServer(d.terminalsData?.bsl).value,
            bslUnit: measurementToServer(d.terminalsData?.bsl).unit,
            type: textT(d.terminalsData?.type?.value),
            connectorType: textT(d.terminalsData?.connector_type?.value),
            serviceCondition: textT(d.terminalsData?.service_condition?.value),
            class: textT(d.terminalsData?.class?.value)
        },
        powerCableSheathVoltageLimiter: {
            ratedVoltageUr: measurementToServer(d.sheathLimitsData?.rated_voltage_ur).value,
            ratedVoltageUrUnit: measurementToServer(d.sheathLimitsData?.rated_voltage_ur).unit,
            maximumOperatingVoltageUc: measurementToServer(d.sheathLimitsData?.max_continuous_operating_voltage).value,
            maximumOperatingVoltageUcUnit: measurementToServer(d.sheathLimitsData?.max_continuous_operating_voltage).unit,
            nominalDischargeCurrent: measurementToServer(d.sheathLimitsData?.nominal_discharge_current).value,
            nominalDischargeCurrentUnit: measurementToServer(d.sheathLimitsData?.nominal_discharge_current).unit,
            highCurrentImpulseWithstand: textT(d.sheathLimitsData?.high_current_impulse_withstand?.value),
            longDurationCurrentImpulseWithstand: textT(d.sheathLimitsData?.long_duration_current_impulse_withstand?.value),
            shortCircuitWithstand: textT(d.sheathLimitsData?.short_circuit_withstand?.value)
        }
    };
};

const measurementToCim = (measurement = {}, defaultUnit = '') => {
    const measurementUnit = textT(measurement.unit)
    const rawUnit = measurementUnit && measurementUnit !== 'string' ? measurementUnit : defaultUnit
    const unitParts = rawUnit.includes('|') ? rawUnit.split('|') : ['', rawUnit]
    const multiplier = textT(unitParts[0])

    return {
        value: numT(measurement.value),
        unit: textT(unitParts.slice(1).join('|')),
        multiplier: multiplier && multiplier !== 'none' ? multiplier : 'none',
        mRID: textT(measurement.mrid)
    }
}

const selectedValue = (field, customField) => {
    return field?.value === 'Custom' ? textT(customField?.value) : textT(field?.value)
}

const powerCableCoreCount = (value) => {
    if (value === 'Single') return 1
    if (value === 'Multiple') return 3
    return intT(value)
}

const windowsFileName = (value) => String(value || '').split(/[/\\]/).pop()

const mapAttachmentsToCim = (dto, powerCableMrid) => {
    const raw = dto?.attachment?.path
    if (!raw) return []

    try {
        const attachments = Array.isArray(raw) ? raw : JSON.parse(raw)
        if (!Array.isArray(attachments)) return []

        return attachments
            .filter(item => item?.path)
            .map(item => ({
                name: textT(item.name) || windowsFileName(item.path),
                path: textT(item.path),
                type: textT(item.type) || 'asset',
                idForeign: textT(powerCableMrid),
                mRID: textT(item.mRID || item.mrid || item.id)
            }))
    } catch (error) {
        return []
    }
}

/**
 * Map Power Cable sang request CIM. Endpoint legacy `/power-cable/create` không
 * khai báo accessories và attachments nên các field đó bị Jackson bỏ qua.
 */
export const mapDtoToCimServer = (dto) => {
    if (!dto) return null

    const p = dto.properties || {}
    const c = dto.configsData || {}
    const r = dto.ratingsData || {}
    const o = dto.othersData || {}
    const d = dto.datasData || {}
    const name = textT(p.apparatus_id) || textT(p.serial_no) || 'Unnamed Cable'
    const powerCableMrid = textT(p.mrid || dto.mrid)

    return {
        name,
        aliasName: name,
        description: textT(p.comment),
        mRID: powerCableMrid,
        assetData: {
            name,
            description: textT(p.comment),
            serialNumber: textT(p.serial_no),
            lotNumber: textT(p.manufacturer_year),
            type: textT(p.type) || 'Power cable',
            kind: textT(p.kind) || 'Power cable',
            countryOfOrigin: textT(p.country_of_origin),
            inUseState: true,
            inUseDate: p.operating_date ? {
                mRID: textT(p.operating_date_id),
                inUseDate: toServerOperationDate(p.operating_date)
            } : null,
            status: p.status ? {
                mRID: textT(p.status_id),
                dateTime: p.status_date_time || new Date().toISOString(),
                value: textT(p.status)
            } : null,
            mRID: powerCableMrid,
            productAssetModel: {
                modelNumber: textT(p.manufacturer_type),
                countryOfOrigin: textT(p.country_of_origin),
                mRID: textT(dto.productAssetModelId),
                manufacturer: {
                    name: textT(p.manufacturer)
                }
            }
        },
        cableInfo: {
            name: `${name} Info`,
            __type: 'OldCableInfo',
            mRID: textT(dto.oldCableInfoId),
            cableInfoId: textT(dto.assetInfoId),
            phaseCount: intT(c.number_of_phase),
            phase: textT(c.phase),
            coreCount: powerCableCoreCount(c.cores?.value),
            ratedU: measurementToCim(r.rated_voltage, 'k|V'),
            maxU: measurementToCim(r.max_voltage, 'k|V'),
            ratedFrequency: measurementToCim(r.rated_frequency, 'Hz'),
            shortCircuitCurrent: measurementToCim(r.shortcircuit, 'k|A'),
            ratedDurationShortCircuit: measurementToCim(r.rated_duration, 's'),
            installationMethod: textT(o.insulation_method?.value),
            bondingType: textT(o.bonding_type?.value),
            installLocation: textT(o.install_location?.value),
            length: measurementToCim(o.cable_length, 'k|m'),
            conductorSize: measurementToCim(d.conductor?.conductor_size, 'mm²'),
            conductorClass: textT(d.conductor?.conductor_class?.value),
            conductorType: selectedValue(d.conductor?.conductor_type, d.conductor?.conductor_type_custom),
            material: selectedValue(d.conductor?.conductor_material, d.conductor?.conductor_material_custom),
            nominalConductorDiameter: measurementToCim(d.conductor?.conductor_diameter, 'mm'),
            conductorShieldThickness: measurementToCim(d.conductor_shield?.thickness, 'mm'),
            diameterOverShield: measurementToCim(d.conductor_shield?.diameter, 'mm'),
            sheathMulticore: textT(d.sheath?.multicore?.value),
            sheathConstruction: selectedValue(d.sheath?.construction, d.sheath?.construction_custom),
            sheathType: selectedValue(d.sheath?.sheath_type, d.sheath?.sheath_type_custom),
            sheathThickness: measurementToCim(d.sheath?.thickness, 'mm'),
            diameterOverThickness: measurementToCim(d.sheath?.diameter, 'mm'),
            insulationMaterial: selectedValue(d.insulation?.insulation_type, d.insulation?.insulation_type_custom),
            insulationMaxOperatingTemp: measurementToCim(d.insulation?.insulation_operating, '°C'),
            insulationThickness: measurementToCim(d.insulation?.thickness, 'mm'),
            diameterOverInsulation: measurementToCim(d.insulation?.diameter, 'mm'),
            screenMaterial: selectedValue(d.insulation_screen?.material, d.insulation_screen?.material_custom),
            screenThickness: measurementToCim(d.insulation_screen?.thickness, 'mm'),
            diameterOverScreen: measurementToCim(d.insulation_screen?.diameter, 'mm'),
            armourBeddingMaterial: selectedValue(d.armour_bedding?.material, d.armour_bedding?.material_custom),
            armourBeddingThickness: measurementToCim(d.armour_bedding?.thickness, 'mm'),
            diameterBeddingOverAmour: measurementToCim(d.armour_bedding?.diameter, 'mm'),
            sheathReinforcingMaterial: selectedValue(d.sheath_reinforcing?.material, d.sheath_reinforcing?.material_custom),
            sheathReinforcingThickness: measurementToCim(d.sheath_reinforcing?.thickness, 'mm'),
            diameterOverSheathReinforcing: measurementToCim(d.sheath_reinforcing?.diameter, 'mm'),
            sheathReinforcingWidth: measurementToCim(d.sheath_reinforcing?.width, 'mm'),
            sheathReinforcingLengthLay: measurementToCim(d.sheath_reinforcing?.lengthOfLay, 'mm'),
            sheathReinforcingNoTape: textT(d.sheath_reinforcing?.numOfTapes?.value),
            armourMaterial: selectedValue(d.armour?.material, d.armour?.material_custom),
            armourThickness: measurementToCim(d.armour?.thickness, 'mm'),
            diameterOverArmour: measurementToCim(d.armour?.diameter, 'mm'),
            armourLayerTape: selectedValue(d.armour?.layerOfTapes, d.armour?.layerOfTapes_custom),
            armourCrossSectionalAreaTap: measurementToCim(d.armour?.crossSectional, 'mm²'),
            jacketThickness: measurementToCim(d.oversheath?.thickness, 'mm'),
            outerJacketKind: selectedValue(d.oversheath?.material, d.oversheath?.material_custom),
            diameterOverJacket: measurementToCim(d.oversheath?.diameter, 'mm'),
            concentricMaterial: selectedValue(d.concentric_neutral?.material, d.concentric_neutral?.material_custom),
            concentricConstruction: selectedValue(d.concentric_neutral?.construction, d.concentric_neutral?.construction_custom),
            concentricThickness: measurementToCim(d.concentric_neutral?.thickness, 'mm'),
            concentricLengthLay: measurementToCim(d.concentric_neutral?.lengthOfLay, 'mm'),
            concentricArea: measurementToCim(d.concentric_neutral?.area, 'mm²'),
            concentricNoOfWires: intT(d.concentric_neutral?.numOfWires?.value)
        },
        concentricNeutral: {
            mRID: textT(dto.assetInfoId),
            productAssetModel: textT(dto.productAssetModelId),
            manufacturerType: textT(p.manufacturer_type),
            material: selectedValue(d.conductor?.conductor_material, d.conductor?.conductor_material_custom),
            insulationMaterial: selectedValue(d.insulation?.insulation_type, d.insulation?.insulation_type_custom),
            constructionKind: selectedValue(d.concentric_neutral?.construction, d.concentric_neutral?.construction_custom),
            diameterOverInsulation: measurementToCim(d.insulation?.diameter, 'mm'),
            diameterOverJacket: measurementToCim(d.oversheath?.diameter, 'mm'),
            diameterOverScreen: measurementToCim(d.insulation_screen?.diameter, 'mm'),
            outerJacketKind: selectedValue(d.oversheath?.material, d.oversheath?.material_custom),
            neutralStrandCount: intT(d.concentric_neutral?.numOfWires?.value),
            diameterOverNeutral: measurementToCim(d.concentric_neutral?.diameter, 'mm')
        },
        accessories: {
            terminal: {
                name: `Terminal ${name}`,
                mRID: textT(d.terminalsData?.mrid),
                cableInfoId: textT(dto.assetInfoId),
                ratedU: measurementToCim(d.terminalsData?.rated_u, 'k|V'),
                bil: measurementToCim(d.terminalsData?.bil, 'k|V'),
                bsl: measurementToCim(d.terminalsData?.bsl, 'k|V'),
                type: textT(d.terminalsData?.type?.value),
                class: textT(d.terminalsData?.class?.value),
                connectorType: textT(d.terminalsData?.connector_type?.value),
                serviceCondition: textT(d.terminalsData?.service_condition?.value)
            },
            joint: {
                name: `Joint ${name}`,
                mRID: textT(d.jointsData?.mrid),
                cableInfoId: textT(dto.assetInfoId),
                ratedU: measurementToCim(d.jointsData?.rated_u, 'k|V'),
                ratedCurrent: measurementToCim(d.jointsData?.rated_current, 'A'),
                category: textT(d.jointsData?.category?.value),
                construction: textT(d.jointsData?.construction?.value),
                serviceCondition: textT(d.jointsData?.service_condition?.value)
            },
            sheathVoltageLimiter: {
                name: `SVL ${name}`,
                mRID: textT(d.sheathLimitsData?.mrid),
                ratedVoltageUr: measurementToCim(d.sheathLimitsData?.rated_voltage_ur, 'k|V'),
                maxContinuousOperatingVoltage: measurementToCim(d.sheathLimitsData?.max_continuous_operating_voltage, 'k|V'),
                nominalDischargeCurrent: measurementToCim(d.sheathLimitsData?.nominal_discharge_current, 'A'),
                highCurrentImpulseWithstand: measurementToCim(d.sheathLimitsData?.high_current_impulse_withstand, 'k|A'),
                longDurationCurrentImpulseWithstand: measurementToCim(d.sheathLimitsData?.long_duration_current_impulse_withstand, 'k|A'),
                shortCircuitWithstand: measurementToCim(d.sheathLimitsData?.short_circuit_withstand, 'k|A')
            }
        },
        attachments: mapAttachmentsToCim(dto, powerCableMrid)
    }
}
