import { UnitSymbol } from "@/views/Enum/UnitSymbol";
class ClassRatingSmallDto {
    constructor() {
        this.rated_burden = {mrid: '', value: '', unit:UnitSymbol.VA};
        this.extended_burden = false;
        this.burden = {mrid: '', value: '', unit:UnitSymbol.VA};
        this.burdenCos = '';
        this.operatingBurden = {mrid: '', value: '', unit:UnitSymbol.VA};
        this.operatingBurdenCos = ''
    }
}

export default ClassRatingSmallDto;