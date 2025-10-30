class OperatingDto {
    constructor() {
        this.type = '';
        this.serial_no = '';
        this.manufacturer = '';
        this.manufacturer_year = '';
        this.manufacturer_type = '';
        this.number_of_trip_coil = '';
        this.number_of_close_coil = '';
        this.comment = '';
        this.rated_operating_pressure = {
            mrid: '',
            value: '',
            unit: 'Pa'
        }
        this.rated_operating_pressure_temperature = {
            mrid: '',
            value: '',
            unit: '°C'
        }
        this.motor = {
            component: 'Motor',
            rated_current: {
                mrid: '',
                value: '',
                unit: 'A'
            },
            rated_voltage: {
                mrid: '',
                value: '',
                unit: 'V'
            },
            power: '',
            frequency: {
                mrid: '',
                value: '',
                unit: 'Hz'
            },
        }
        this.auxiliary_circuits = {
            component: 'Auxiliary circuits',
            rated_current: {
                mrid: '',
                value: '',
                unit: 'A'
            },
            rated_voltage: {
                mrid: '',
                value: '',
                unit: 'V'
            },
            power: '',
            frequency: {
                mrid: '',
                value: '',
                unit: 'Hz'
            },
        },
        this.trip_coil_component = []
        this.close_coil_component = []
    }
}

export default OperatingDto;