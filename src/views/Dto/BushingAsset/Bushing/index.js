class BushingDto {
    constructor() {
        this.rated_frequency = {
            mrid: '',
            value: '',
            label: 'Hz',
            unit: 'Hz'
        }
        this.insulation_level = {
            mrid: '',
            value: '',
            label: 'kV',
            unit: 'k|V'
        },
        this.voltage_l_ground = {
            mrid: '',
            value: '',
            label: 'kV',
            unit: 'k|V'
        },
        this.max_system_voltage = {
            mrid: '',
            value: '',
            label: 'kV',
            unit: 'k|V'
        },
        this.rated_current = {
            mrid: '',
            value: '',
            label: 'A',
            unit: 'A'
        },
        this.df_c1 = {
            mrid: '',
            value: '',
            label: '%',
            unit: '%'
        },
        this.cap_c1 = {
            mrid: '',
            value: '',
            label: 'pF',
            unit: 'p|F'
        },
        this.df_c2 = {
            mrid: '',
            value: '',
            label: '%',
            unit: '%'
        },
        this.cap_c2 = {
            mrid: '',
            value: '',
            label: 'pF',
            unit: 'p|F'
        },
        this.insulation_type = ''
    }
}

export default BushingDto;
