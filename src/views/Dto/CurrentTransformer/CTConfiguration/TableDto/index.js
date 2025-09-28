import { UnitSymbol } from "@/views/Enum/UnitSymbol";
class TableDto {
    constructor() { 
        this.mrid = '';
        this.isShow = false;
        this.name = '';
        this.ipn = {mrid: '', value: '', unit: UnitSymbol.A};
        this.isn = {mrid: '', value: '', unit: UnitSymbol.A};
        this.inUse = false;
    }
}

export default TableDto;