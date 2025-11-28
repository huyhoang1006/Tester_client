import IdentifiedObject from "../IdentifiedObject";
import Voltage from "../Voltage";

class BaseVoltage extends IdentifiedObject {
    constructor() {
        super();
                this.nominalVoltage = new Voltage(); // Base voltage value
    }
}

export default BaseVoltage;
