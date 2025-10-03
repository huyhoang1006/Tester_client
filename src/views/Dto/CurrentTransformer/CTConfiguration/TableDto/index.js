import { UnitSymbol } from "@/views/Enum/UnitSymbol";
class TableDto {
    constructor() { 
        this.isShow = false;
        this.name = '';
        this.ipn = {mrid: '', value: '', unit: UnitSymbol.A};
        this.isn = {mrid: '', value: '', unit: UnitSymbol.A};
        this.inUse = false;
        this.type = '';
        this.mrid = '';
    }
}

export default TableDto;