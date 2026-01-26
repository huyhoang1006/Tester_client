import VoltageLevelDto from "@/views/Dto/VoltageLevel";
import { UnitMultiplier } from "@/views/Enum/UnitMultiplier";
import { UnitSymbol } from "@/views/Enum/UnitSymbol";

export const mapServerToDto = (serverData) => {
    const dto = new VoltageLevelDto();
    if (!serverData) return dto;

    // 1. Identification
    dto.voltageLevelId = serverData.mRID || '';
    dto.name = serverData.name || '';
    dto.comment = serverData.description || '';

    // Map Location ID nếu có
    if (serverData.location) {
        dto.locationId = serverData.location.mRID || '';
    }

    // 2. Base Voltage
    const baseV = serverData.baseVoltage || {};
    dto.baseVoltageId = baseV.mRID || '';
    dto.base_voltage_value = baseV.value !== undefined ? baseV.value : '';
    dto.base_voltage_unit = baseV.unit || UnitSymbol.V;
    dto.base_voltage_multiplier = baseV.multiplier || UnitMultiplier.k;

    // 3. High Voltage Limit
    const highV = serverData.highVoltageLimit || {};
    dto.highVoltageLimitId = highV.mRID || '';
    dto.high_voltage_limit_value = highV.value !== undefined ? highV.value : '';
    dto.high_voltage_limit_unit = highV.unit || UnitSymbol.V;
    dto.high_voltage_limit_multiplier = highV.multiplier || UnitMultiplier.k;

    // 4. Low Voltage Limit
    const lowV = serverData.lowVoltageLimit || {};
    dto.lowVoltageLimitId = lowV.mRID || '';
    dto.low_voltage_limit_value = lowV.value !== undefined ? lowV.value : '';
    dto.low_voltage_limit_unit = lowV.unit || UnitSymbol.V;
    dto.low_voltage_limit_multiplier = lowV.multiplier || UnitMultiplier.k;

    // 5. Relations
    // Nếu JSON trả về Substation cha chứa VoltageLevel này (thường là Container)
    if (serverData.substation) {
        dto.substationId = serverData.substation.mRID || '';
    }

    return dto;
};