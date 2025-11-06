class RatingsDto {
    constructor() {
        this.rated_voltage_ll = {
            mrid: '',
            value: '',
            unit: 'k|V'
        };
        this.rated_current = {
            mrid: '',
            value: '',
            unit: 'A'
        };
        this.rated_short_circuit_breaking_current = {
            mrid: '',
            value: '',
            unit: 'k|A'
        };
        this.short_circuit_nominal_duration = {
            mrid: '',
            value: '',
            unit: 's'
        };
        this.rated_insulation_level = {
            mrid : '',
            value : '',
            unit : 'k|V'
        };
        this.rated_interrupting_time = {
            mrid: '',
            value: '',
            unit: 'm|s'
        };
        this.interrupting_duty_cycle = '';
        this.rated_power_at_closing = {
            mrid: '',
            value: '',
            unit: 'W'
        };
        this.rated_power_at_opening = {
            mrid: '',
            value: '',
            unit: 'W'
        };
        this.rated_power_at_motor_charge = {
            mrid: '',
            value: '',
            unit: 'W'
        };
        this.rated_frequency = {
            mrid: '',
            value: '',
            unit: 'Hz'
        };
        this.rated_frequency_custom = {
            mrid: '',
            value: '',
            unit: 'Hz'
        };
    }
}

export default RatingsDto;