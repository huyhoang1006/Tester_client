class RatingsDto {
    constructor() {
        this.rated_frequency = {
            mrid: '',
            value: '',
            custom_value: '',
            unit: 'Hz'
        }
        this.voltage_ratings = []
        this.power_ratings = []
        this.current_ratings = []
        this.short_circuit = {
            mrid: '',
            ka: {
                mrid: '',
                value: '',
                unit: 'kA'
            },
            s: {
                mrid: '',
                value: '',
                unit: 's'
            }
        }
    }
}

export default RatingsDto;