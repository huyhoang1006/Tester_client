import { UnitSymbol, UnitMultiplier } from "@/views/Enum/UnitSymbol"; // nhớ import đúng file của bạn

class JointDto {
    constructor() {
        this.cable_info_id = { mrid: '', value: '', unit: 'string' };
        this.rated_u = { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V };
        this.rated_current = { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.A };
        this.category = { mrid: '', value: '', unit: 'string' };
        this.construction = { mrid: '', value: '', unit: 'string' };
        this.service_condition = { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.m };
    }
}

export default JointDto;
