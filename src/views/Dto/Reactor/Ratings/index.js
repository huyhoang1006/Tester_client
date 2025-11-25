class ReactorRatingDto {
    constructor() {
        this.rated_voltage = {
            mrid: '',
            value: '',
            unit: 'kV'
        };
        this.rated_frequency = {
            mrid: '',
            value: '',
            unit: 'Hz'
        };
        this.rated_current = {
            mrid: '',
            value: '',  
            unit: 'A'
        };
        this.rated_power = {
            mrid: '',
            value: '',  
            unit: 'kVAr'
        };
        this.inductance = {
            mrid: '',
            value: '',  
            unit: 'H'
        };
    }
}

export default ReactorRatingDto;