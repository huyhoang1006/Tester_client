import { UnitMultiplier } from "@/views/Enum/UnitMultiplier";
import { UnitSymbol } from "@/views/Enum/UnitSymbol";

class impedancesDto {
    constructor() {
        this.ref_temp = {
            mrid: '',
            value: '',
            unit: UnitSymbol.degC
        },
        this.prim_sec = [],
        this.prim_tert = [],
        this.sec_tert = [],
        this.zero_sequence_impedance = {
            mrid: '',
            base_power: {
                mrid: '',
                data: {
                    mrid: '',
                    value: '',
                    unit: UnitMultiplier.k + '|' + UnitSymbol.VA,
                }
            },
            base_voltage: {
                mrid: '',
                data: {
                    mrid: '',
                    value: '',
                    unit: UnitMultiplier.k + '|' + UnitSymbol.V,
                }
            },
            zero_percent: {
                prim : {
                    mrid: '',
                    data: {
                        mrid: '',
                        value: '',
                        unit: UnitSymbol.percent
                    }
                },
                sec : {
                    mrid: '',
                    data: {
                        mrid: '',
                        value: '',
                        unit: UnitSymbol.percent
                    }
                },
                zero : {
                    mrid: '',
                    data: {
                        mrid: '',
                        value: '',
                        unit: UnitSymbol.percent
                    }
                }
            },
        }
    }
}
export default impedancesDto;