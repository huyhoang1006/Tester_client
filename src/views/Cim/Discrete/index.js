import Measurement from "@/views/Cim/Measurement";
class Discrete extends Measurement {
    constructor() {
        super();
        this.max_value = null;
        this.min_value = null;
        this.normal_value = null; // Current value of the measurement
        this.value_alias_set = null; // Alias for the value
    }
}

export default Discrete;
