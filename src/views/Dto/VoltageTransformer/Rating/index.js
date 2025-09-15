import { UnitSymbol } from "@/views/Enum/UnitSymbol";
import { UnitMultiplier } from "@/views/Enum/UnitMultiplier";

class RatingDto {
    constructor() {
        this.standard = { mrid: '', value: '', unit: 'string' },
            this.rated_frequency = { mrid: '', value: '', unit: UnitSymbol.Hz },
            this.uprRatio = { mrid: '', value: '', unit: 'string' },
            this.upr = '',
            this.c1 = { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.F }
        this.c2 = { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.F }
        this.rated_voltage = { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V }
    }


}

export default RatingDto;