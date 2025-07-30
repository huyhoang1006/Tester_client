import { UnitMultiplier } from "@/views/Enum/UnitMultiplier"
import { UnitSymbol } from "@/views/Enum/UnitSymbol"
class VoltageLevelDto {
    constructor() {
        this.high_voltage_limit_value = ''
        this.high_voltage_limit_unit = UnitSymbol.V
        this.high_voltage_limit_multiplier = UnitMultiplier.k
        this.low_voltage_limit_value = ''
        this.low_voltage_limit_unit = UnitSymbol.V
        this.low_voltage_limit_multiplier = UnitMultiplier.k
        this.base_voltage_value = ''
        this.base_voltage_unit = UnitSymbol.V
        this.base_voltage_multiplier = UnitMultiplier.k
        this.name = ''
        this.comment = ''
        this.substationId = ''
        this.baseVoltageId = ''
        this.voltageLevelId = ''
        this.highVoltageLimitId = ''
        this.lowVoltageLimitId = ''
        this.nominalVoltageId = ''
    }
}

export default VoltageLevelDto;
