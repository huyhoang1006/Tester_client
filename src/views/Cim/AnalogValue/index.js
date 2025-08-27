import MeasurementValue from '../MeasurementValue';

class AnalogValue extends MeasurementValue {
    constructor() {
        super();
        this.value = null;
        this.analog = null;
    }
}

export default AnalogValue;
