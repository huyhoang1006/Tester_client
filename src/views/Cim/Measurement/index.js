import IdentifiedObject from "../IdentifiedObject";

class Measurement extends IdentifiedObject {
    constructor() {
        super();
        this.measurement_type = null; // Type of measurement (e.g., voltage, current)
        this.phases = null; // Unit of measurement
        this.unit_multiplier = null; // Current value of the measurement
        this.unit_symbol = null; // Current value of the measurement
        this.terminal = null; // Current value of the measurement
        this.calculation_method_hierarchy = null; // Current value of the measurement
        this.power_system_resource = null; // Current value of the measurement
        this.asset = null; // Current value of the measurement
        this.measurement_action = null; // Current value of the measurement
    }
}

export default Measurement;