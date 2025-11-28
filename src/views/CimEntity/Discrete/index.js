import Measurement from "@/views/Cim/Measurement";
import ValueAliasSet from "../ValueAliasSet";
class Discrete extends Measurement {
    constructor() {
        super();
                this.maxValue = null;
                this.minValue = null;
                this.normalValue = null; // Current value of the measurement
                this.valueAliasSet = new ValueAliasSet(); // Alias for the value
    }
}

export default Discrete;
