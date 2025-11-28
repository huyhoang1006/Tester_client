import IdentifiedObject from "../IdentifiedObject";
import PowerSystemResource from "../PowerSystemResource";
import Asset from "../Asset";

class Measurement extends IdentifiedObject {
    constructor() {
        super();
                this.measurementType = null; // Type of measurement (e.g., voltage, current)
                this.phases = null; // Unit of measurement
                this.unitMultiplier = null; // Current value of the measurement
                this.unitSymbol = null; // Current value of the measurement
                this.terminal = null; // Current value of the measurement
                this.calculationMethodHierarchy = null; // Current value of the measurement
                this.powerSystemResource = new PowerSystemResource(); // Current value of the measurement
                this.asset = new Asset(); // Current value of the measurement
                this.measurementAction = null; // Current value of the measurement
    }
}

export default Measurement;