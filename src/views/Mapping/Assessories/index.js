import AccessoriesDTO from "@/views/Dto/Assessories";
import Frequency from "@/views/Cim/Frequency";
import Voltage from "@/views/Cim/Voltage";
import Length from "@/views/Cim/Length";


export function mapDtoToEntity(dto) {
    const entity = new AccessoriesDTO();

    /** ================== joint ================== */
    entity.joint.mrid = dto.joint.mrid.value || null;
    entity.joint.cable_info_id = dto.joint.cable_info_id.value || null;

    entity.joint.rated_u = dto.joint.rated_u.mrid || null;
    const newJointRatedU = new Voltage();
    mappingUnit(newJointRatedU, dto.joint.rated_u);
    entity.voltage.push(newJointRatedU);

    entity.joint.rated_current = dto.joint.rated_current.mrid || null;
    const newJointRatedCurrent = new Voltage();
    mappingUnit(newJointRatedCurrent, dto.joint.rated_current);
    entity.voltage.push(newJointRatedCurrent);

    entity.joint.category = dto.joint.category.value || null;
    entity.joint.construction = dto.joint.construction.value || null;

    entity.joint.service_condition = dto.joint.service_condition.mrid || null;
    const newJointServiceCondition = new Length();
    mappingUnit(newJointServiceCondition, dto.joint.service_condition);
    entity.voltage.push(newJointServiceCondition);

    /** ================== terminal ================== */
    entity.terminal.mrid = dto.terminal.mrid.value || null;
    entity.terminal.cable_info_id = dto.terminal.cable_info_id.value || null;

    entity.terminal.rated_u = dto.terminal.rated_u.mrid || null;
    const newTerminalRatedU = new Voltage();
    mappingUnit(newTerminalRatedU, dto.terminal.rated_u);
    entity.voltage.push(newTerminalRatedU);
    entity.terminal.bil = dto.terminal.bil.mrid || null;
    const newTerminalBil = new Voltage();
    mappingUnit(newTerminalBil, dto.terminal.bil);
    entity.voltage.push(newTerminalBil);
    entity.terminal.bsl = dto.terminal.bsl.mrid || null;
    const newTerminalBsl = new Frequency();
    mappingUnit(newTerminalBsl, dto.terminal.bsl);
    entity.voltage.push(newTerminalBsl);
    entity.terminal.type = dto.terminal.type.value || null;
    entity.terminal.connector_type = dto.terminal.connector_type.value || null;
    entity.terminal.service_condition = dto.terminal.service_condition.value || null;
    entity.terminal.class = dto.terminal.class.value || null;


    /** ================== sheathVoltageLimiter ================== */
    entity.sheathVoltageLimiter.mrid = dto.sheathVoltageLimiter.mrid.value || null;
    entity.sheathVoltageLimiter.cable_info_id = dto.sheathVoltageLimiter.cable_info_id.value || null;
    entity.sheathVoltageLimiter.rated_voltage_ur = dto.sheathVoltageLimiter.rated_voltage_ur.value || null;
    entity.sheathVoltageLimiter.max_continuous_operating_voltage = dto.sheathVoltageLimiter.max_continuous_operating_voltage.value || null;
    entity.sheathVoltageLimiter.nominal_discharge_current = dto.sheathVoltageLimiter.nominal_discharge_current.value || null;
    entity.sheathVoltageLimiter.high_current_impulse_withstand = dto.sheathVoltageLimiter.high_current_impulse_withstand.value || null;
    entity.sheathVoltageLimiter.long_duration_current_impulse_withstand = dto.sheathVoltageLimiter.long_duration_current_impulse_withstand.value || null;
    entity.sheathVoltageLimiter.short_circuit_withstand = dto.sheathVoltageLimiter.short_circuit_withstand.value || null;

    return entity;
}