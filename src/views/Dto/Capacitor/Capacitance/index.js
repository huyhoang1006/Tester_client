import { UnitSymbol } from '@/views/Enum/UnitSymbol'
import { UnitMultiplier } from '@/views/Enum/UnitMultiplier'

class CapacitanceDto {
    constructor() {
        // Dùng cho phase = 1
        this.capacitance = {
            mrid: '',
            value: { mrid: '', value: '', unit: UnitMultiplier.n + '|' + UnitSymbol.F },
            phase: '1',
            capacitor_info_id: ''
        };

        // Dùng cho phase = 3
        this.capacitance_A = {
            mrid: '',
            value: { mrid: '', value: '', unit: UnitMultiplier.n + '|' + UnitSymbol.F },
            phase: 'A',
            capacitor_info_id: ''
        };
        this.capacitance_B = {
            mrid: '',
            value: { mrid: '', value: '', unit: UnitMultiplier.n + '|' + UnitSymbol.F },
            phase: 'B',
            capacitor_info_id: '',

        };
        this.capacitance_C = {
            mrid: '',
            value: { mrid: '', value: '', unit: UnitMultiplier.n + '|' + UnitSymbol.F },
            phase: 'C',
            capacitor_info_id: '',
        };
    }
}

export default CapacitanceDto;
