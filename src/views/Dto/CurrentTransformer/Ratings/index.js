import { UnitSymbol } from "@/views/Enum/UnitSymbol";

class RatingsDto {
    constructor() {
        this.standard = { mrid: '', value: '', unit: 'string' }
        this.rated_frequency_custom = ''
        this.rated_frequency = { mrid: '', value: '', unit: UnitSymbol.Hz }
        this.primary_winding_count = ''
        this.um_rms = { mrid: '', value: '', unit: UnitSymbol.V }
        this.u_withstand_rms = { mrid: '', value: '', unit: UnitSymbol.V }
        this.u_lightning_peak = { mrid: '', value: '', unit: UnitSymbol.V }
        this.icth = { mrid: '', value: '', unit: UnitSymbol.A }
        this.idyn_peak = { mrid: '', value: '', unit: UnitSymbol.A }
        this.ith_rms = { mrid: '', value: '', unit: UnitSymbol.A }
        this.ith_duration = { mrid: '', value: '', unit: UnitSymbol.s }
        this.system_voltage = { mrid: '', value: '', unit: UnitSymbol.V }
        this.system_voltage_type = { mrid: '', value: '', unit: 'string' }
        this.bil = { mrid: '', value: '', unit: UnitSymbol.V }
        this.rating_factor = ''
        this.rating_factor_temp = { mrid: '', value: '', unit: UnitSymbol.degC }
    }
}

export default RatingsDto;  