import { UnitSymbol } from '@/views/Enum/UnitSymbol'

class ReactorOtherDto {
    constructor() {
        this.insulation_type = '';
        this.weight = {
            mrid: '',
            value: '',
            unit: UnitSymbol.kg,
        };
    }
}

export default ReactorOtherDto;