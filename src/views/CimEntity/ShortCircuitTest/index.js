import TransformerTest from "../TransformerTest";
import CurrentFlow from "../CurrentFlow";
import Impedance from "../Impedance";
import Voltage from "../Voltage";

class ShortCircuitTest extends TransformerTest {
    constructor() {
        super();
                this.current = new CurrentFlow(); // Base power of the short circuit test
                this.energisedEndStep = null; // Temperature during the test
                this.groundedEndStep = null; // Grounded end step of the short circuit test
                this.leakageImpedance = new Impedance(); // Leakage impedance of the short circuit test
                this.leakageImpedanceZero = new Impedance(); // Leakage impedance in zero sequence of the short circuit test
                this.loss = null; // Loss during the short circuit test
                this.lossZero = null; // Loss in zero sequence during the short circuit test
                this.power = null; // Power during the short circuit test
                this.voltage = new Voltage(); // Voltage during the short circuit test
                this.energisedEnd = null; // Energised end during the short circuit test
    }
}

export default ShortCircuitTest;
