import IdentifiedObject from "../IdentifiedObject";
class TransformerTest extends IdentifiedObject {
    constructor() {
        super();
        this.base_power = null; // Base power of the transformer test
        this.temperature = null; // Temperature during the test
    }
}

export default TransformerTest;