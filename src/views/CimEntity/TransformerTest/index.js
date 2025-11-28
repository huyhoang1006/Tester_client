import IdentifiedObject from "../IdentifiedObject";
import BasePower from "../BasePower";
import Voltage from "../Voltage";
import Temperature from "../Temperature";
class TransformerTest extends IdentifiedObject {
    constructor() {
        super();
                this.basePower = new BasePower(); // Base power of the transformer test
                this.baseVoltage = new Voltage(); // Base voltage of the transformer test
                this.temperature = new Temperature(); // Temperature during the test
    }
}

export default TransformerTest;