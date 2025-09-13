import { UnitSymbol, UnitMultiplier } from "@/views/Enum/UnitSymbol"; // chỉnh lại path import cho đúng dự án

class TerminalDto {
    constructor() {
        this.cable_info_id = { mrid: '', value: '', unit: 'string' };
        this.rated_u = { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V }; // kV
        this.bil = { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V };     // kV
        this.bsl = { mrid: '', value: '', unit: UnitSymbol.Hz };                             // Hz
        this.type = { mrid: '', value: '', unit: 'string' };
        this.connector_type = { mrid: '', value: '', unit: 'string' };
        this.service_condition = { mrid: '', value: '', unit: 'string' };
        this.class = { mrid: '', value: '', unit: 'string' };                                // class là string
        this.mrid = { mrid: '', value: '', unit: 'string' };                                 // id duy nhất
    }
}

export default TerminalDto;
