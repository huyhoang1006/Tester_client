import IdentifiedObject from "../IdentifiedObject";

class BaseVoltage extends IdentifiedObject {
    constructor() {
        super();
        this.nominal_voltage = null; // Base voltage value
    }
}

export default BaseVoltage;
