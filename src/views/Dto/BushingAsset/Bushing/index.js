class BushingDto {
    constructor() {
        this.rated_frequency = {
            value: '',
            label: 'Hz',
            unit: 'Hz'
        }
        this.insulation_level = {
            value: '',
            label: 'kV',
            unit: 'k|V'
        },
        this.voltage_l_ground = {
            value: '',
            label: 'kV',
            unit: 'k|V'
        },
        this.max_system_voltage = {
            value: '',
            label: 'kV',
            unit: 'k|V'
        },
        this.rated_current = {
            value: '',
            label: 'A',
            unit: 'A'
        },
        this.df_c1 = {
            value: '',
            label: '%',
            unit: '%'
        },
        this.cap_c1 = {
            value: '',
            label: 'pF',
            unit: 'p|F'
        },
        this.df_c2 = {
            value: '',
            label: '%',
            unit: '%'
        },
        this.cap_c2 = {
            value: '',
            label: 'pF',
            unit: 'p|F'
        },
        this.insulation_type = ''
    }
}

export default BushingDto;
