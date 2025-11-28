import MeasurementValue from "../MeasurementValue";
import Discrete from "../Discrete";

class DiscreteValue extends MeasurementValue {
    constructor() {
        super();
                this.value = null;
                this.discrete = new Discrete();
    }
}

export default DiscreteValue;
