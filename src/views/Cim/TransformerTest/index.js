import IdentifiedObject from "../IdentifiedObject";
class TransformerTest extends IdentifiedObject {
    constructor() {
        super();
        this.base_power = null; // Base power of the transformer test
        this.base_voltage = null; // Base voltage of the transformer test
        this.temperature = null; // Temperature during the test
    }
}

export default TransformerTest;