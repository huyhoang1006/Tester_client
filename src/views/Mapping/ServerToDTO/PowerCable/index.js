import PowerCableDTO from "@/views/Dto/PowerCable";

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

export const mapServerToDto = (serverData) => {
    const dto = new PowerCableDTO();
    if (!serverData) return dto;

    const data = serverData.data || serverData
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

    dto.assetInfoId = assetInfo.id ? String(assetInfo.id) : ''
    dto.psrId = assetInfo.ownerId ? String(assetInfo.ownerId) : null

    dto.configsData.number_of_phase = assetInfo.numberOfPhase ?? ''
    dto.configsData.phase = assetInfo.phase || ''
    dto.configsData.cores.value = core.core || ''
    buildLayersFromSections(dto, core)

    setMeasurement(dto.ratingsData.rated_voltage, rating.ratedVoltage, rating.ratedVoltageUnit, 'k|V')
    setMeasurement(dto.ratingsData.max_voltage, rating.maximumVoltage, rating.maximumVoltageUnit, 'k|V')
    setMeasurement(dto.ratingsData.rated_frequency, rating.rateFrequency, rating.rateFrequencyUnit, 'Hz')
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
            ownerId: idT(dto.psrId),
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
            description: textT(p.comment)
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
            rateFrequency: rateFrequency.value,
            rateFrequencyUnit: rateFrequency.unit,
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
