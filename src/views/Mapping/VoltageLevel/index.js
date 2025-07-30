import VoltageLevelEntity from "@/views/Entity/VoltageLevel";
import VoltageLevelDto from "@/views/Dto/VoltageLevel/index.js";
import Voltage from "@/views/Cim/Voltage";

export const volDtoToVolEntity = (volDto) => {
    const entity = new VoltageLevelEntity();

    // Voltage Level
    entity.voltageLevel.name = volDto.name || null;
    entity.voltageLevel.mrid = volDto.voltageLevelId || null;
    entity.voltageLevel.description = volDto.comment || null;
    entity.voltageLevel.high_voltage_limit = volDto.highVoltageLimitId || null;
    entity.voltageLevel.low_voltage_limit = volDto.lowVoltageLimitId || null;
    entity.voltageLevel.base_voltage = volDto.baseVoltageId || null;
    entity.voltageLevel.substation = volDto.substationId || null;

    // Base Voltage
    entity.baseVoltage.mrid = volDto.baseVoltageId || null;
    entity.baseVoltage.nominal_voltage = volDto.nominalVoltageId || null;

    // Voltage
    if(volDto.highVoltageLimitId) {
        const highVoltage = new Voltage();
        highVoltage.mrid = volDto.highVoltageLimitId;
        highVoltage.value = volDto.high_voltage_limit_value || null;
        highVoltage.unit = volDto.high_voltage_limit_unit || null;
        highVoltage.multiplier = volDto.high_voltage_limit_multiplier || null;
        entity.voltage.push(highVoltage);
    }

    if(volDto.lowVoltageLimitId) {
        const lowVoltage = new Voltage();
        lowVoltage.mrid = volDto.lowVoltageLimitId;
        lowVoltage.value = volDto.low_voltage_limit_value || null;
        lowVoltage.unit = volDto.low_voltage_limit_unit || null;
        lowVoltage.multiplier = volDto.low_voltage_limit_multiplier || null;
        entity.voltage.push(lowVoltage);
    }

    if(volDto.baseVoltageId) {
        const baseVoltage = new Voltage();
        baseVoltage.mrid = volDto.nominalVoltageId;
        baseVoltage.value = volDto.base_voltage_value || null;
        baseVoltage.unit = volDto.base_voltage_unit || null;
        baseVoltage.multiplier = volDto.base_voltage_multiplier || null;
        entity.voltage.push(baseVoltage);
    }

    return entity;
}

export const volEntityToVolDto = (volEntity) => {
    const volDto = new VoltageLevelDto()

    // VoltageLevel
    volDto.voltageLevelId = volEntity.voltageLevel.mrid || ''
    volDto.substationId = volEntity.voltageLevel.substation || ''
    volDto.highVoltageLimitId = volEntity.voltageLevel.high_voltage_limit || ''
    volDto.lowVoltageLimitId = volEntity.voltageLevel.low_voltage_limit || ''
    volDto.baseVoltageId = volEntity.voltageLevel.base_voltage || ''
    volDto.name = volEntity.voltageLevel.name || ''

    // Base Voltage
    volDto.nominalVoltageId = volEntity.baseVoltage.nominal_voltage || ''
    volDto.baseVoltageId = volEntity.baseVoltage.mrid || ''

    // Voltage
    for (const voltage of volEntity.voltage) {
        if (voltage.mrid === volEntity.voltageLevel.high_voltage_limit) {
            volDto.high_voltage_limit_value = voltage.value || ''
            volDto.high_voltage_limit_unit = voltage.unit || ''
            volDto.high_voltage_limit_multiplier = voltage.multiplier || ''
        } else if (voltage.mrid === volEntity.voltageLevel.low_voltage_limit) {
            volDto.low_voltage_limit_value = voltage.value || ''
            volDto.low_voltage_limit_unit = voltage.unit || ''
            volDto.low_voltage_limit_multiplier = voltage.multiplier || ''
        } else if (voltage.mrid === volEntity.baseVoltage.nominal_voltage) {
            volDto.base_voltage_value = voltage.value || ''
            volDto.base_voltage_unit = voltage.unit || ''
            volDto.base_voltage_multiplier = voltage.multiplier || ''
        }
    }
    return volDto;
};
