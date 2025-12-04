import MeasurementValue from '../MeasurementValue';
import Analog from "../Analog";

class AnalogValue extends MeasurementValue {
    constructor() {
        super();
        this.value = null;
        this.analog = new Analog();
    }
}

export default AnalogValue;
