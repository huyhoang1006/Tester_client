import { UnitSymbol, UnitMultiplier } from "@/views/Enum/UnitSymbol"; // import đúng file enum

class SheathVoltageLimiterDto {
    constructor() {
        this.cable_info_id = { mrid: '', value: '', unit: 'string' };
        this.rated_voltage_ur = { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V };
        this.max_continuous_operating_voltage = { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V };
        this.nominal_discharge_current = { mrid: '', value: '', unit: UnitSymbol.Hz };
        this.high_current_impulse_withstand = { mrid: '', value: '', unit: 'string' };
        this.long_duration_current_impulse_withstand = { mrid: '', value: '', unit: 'string' };
        this.short_circuit_withstand = { mrid: '', value: '', unit: 'string' };
        this.mrid = { mrid: '', value: '', unit: 'string' };
    }
}

export default SheathVoltageLimiterDto;

