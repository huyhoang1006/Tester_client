import { UnitSymbol } from '@/views/Enum/UnitSymbol'

class DissipationFactorDto {
    constructor() {
        // Dùng cho phase = 1
        this.dissipation_factor = {
            mrid: '',
            value: { mrid: '', value: '', unit: UnitSymbol.percent },
            phase: '1',
            capacitor_info_id: ''
        };
        this.dissipation_factor_A = {
            mrid: '',
            value: { mrid: '', value: '', unit: UnitSymbol.percent },
            phase: 'A',
            capacitor_info_id: ''
        };
        this.dissipation_factor_B = {
            mrid: '',
            value: { mrid: '', value: '', unit: UnitSymbol.percent },
            phase: 'B',
            capacitor_info_id: ''
        };
        this.dissipation_factor_C = {
            mrid: '',
            value: { mrid: '', value: '', unit: UnitSymbol.percent },
            phase: 'C',
            capacitor_info_id: ''
        };
    }
}

export default DissipationFactorDto;
