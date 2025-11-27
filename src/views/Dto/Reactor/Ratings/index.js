import {UnitSymbol} from '@/views/Enum/UnitSymbol'
import {UnitMultiplier} from '@/views/Enum/UnitMultiplier'
class ReactorRatingDto {
    constructor() {
        this.rated_voltage = {
            mrid: '',
            value: '',
            unit: UnitMultiplier.k + '|' + UnitSymbol.V,
        };
        this.rated_frequency = {
            mrid: '',
            value: '',
            unit: UnitSymbol.Hz,
        };
        this.rated_current = {
            mrid: '',
            value: '',  
            unit: UnitSymbol.A
        };
        this.rated_power = {
            mrid: '',
            value: '',  
            unit: UnitMultiplier.k + '|' + UnitSymbol.VAr
        };
        this.inductance = {
            mrid: '',
            value: '',  
            unit: UnitSymbol.H
        };
    }
}

export default ReactorRatingDto;