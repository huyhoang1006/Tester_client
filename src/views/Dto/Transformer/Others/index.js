import { UnitSymbol } from '@/views/Enum/UnitSymbol'
class OthersDto {
    constructor() {
        this.mrid = ''
        this.category = '',
        this.status = '',
        this.tank_type = '',
        this.insulation_medium = '',
        this.insulation = {
            key: 'Weight',
            weight: {
                mrid: '',
                value: '',
                unit: UnitSymbol.kg
            },
            volume: {
                mrid: '',
                value: '',
                unit: UnitSymbol.l
            }
        },
        this.total_weight = {
            mrid: '',
            value: '',
            unit: UnitSymbol.kg
        },
        this.winding = {
            prim: 'copper',
            sec: 'copper',
            tert: 'copper'
        }
    }
}

export default OthersDto;