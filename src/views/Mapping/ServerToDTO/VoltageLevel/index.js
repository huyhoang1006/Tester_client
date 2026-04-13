import VoltageLevelDto from "@/views/Dto/VoltageLevel";
import { UnitMultiplier } from "@/views/Enum/UnitMultiplier";
import { UnitSymbol } from "@/views/Enum/UnitSymbol";
import uuid from "@/utils/uuid";

export const mapServerToDto = (serverData) => {
    const dto = new VoltageLevelDto();
    if (!serverData) return dto;

    // 1. VoltageLevel
    dto.voltageLevelId = serverData.mRID  || uuid.newUuid()
    dto.name           = serverData.name  || ''
    dto.comment        = serverData.description || ''

    // 2. Location
    dto.locationId = serverData.location?.mRID || null

    // 3. BaseVoltage
    // JSON: baseVoltage { mRID: null, nominalVoltage: { mRID, value, unit, multiplier } }
    const baseVContainer = serverData.baseVoltage || null
    const nominalVoltage = baseVContainer?.nominalVoltage || null

    const hasBaseVoltage = !!(nominalVoltage?.value !== undefined && nominalVoltage?.value !== null)

    // baseVoltageId = mRID của container (null trong JSON → sinh mới nếu có nominalVoltage)
    dto.baseVoltageId    = hasBaseVoltage
        ? (baseVContainer?.mRID || uuid.newUuid())
        : null

    // nominalVoltageId = mRID của nominalVoltage
    dto.nominalVoltageId = hasBaseVoltage
        ? (nominalVoltage?.mRID || uuid.newUuid())
        : null

    dto.base_voltage_value      = nominalVoltage?.value      ?? ''
    dto.base_voltage_unit       = nominalVoltage?.unit       || UnitSymbol.V
    dto.base_voltage_multiplier = nominalVoltage?.multiplier || UnitMultiplier.k

    // 4. HighVoltageLimit — chỉ sinh ID nếu có data
    const highV        = serverData.highVoltageLimit || null
    const hasHighV     = !!(highV?.value !== undefined && highV?.value !== null)

    dto.highVoltageLimitId          = hasHighV ? (highV?.mRID || uuid.newUuid()) : null
    dto.high_voltage_limit_value    = highV?.value      ?? ''
    dto.high_voltage_limit_unit     = highV?.unit       || UnitSymbol.V
    dto.high_voltage_limit_multiplier = highV?.multiplier || UnitMultiplier.k

    // 5. LowVoltageLimit — chỉ sinh ID nếu có data
    const lowV         = serverData.lowVoltageLimit || null
    const hasLowV      = !!(lowV?.value !== undefined && lowV?.value !== null)

    dto.lowVoltageLimitId           = hasLowV ? (lowV?.mRID || uuid.newUuid()) : null
    dto.low_voltage_limit_value     = lowV?.value      ?? ''
    dto.low_voltage_limit_unit      = lowV?.unit       || UnitSymbol.V
    dto.low_voltage_limit_multiplier = lowV?.multiplier || UnitMultiplier.k

    // 6. Substation cha
    dto.substationId = serverData.substation?.mRID || null

    return dto;
};