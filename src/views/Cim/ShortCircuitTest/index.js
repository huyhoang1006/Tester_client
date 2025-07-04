import TransformerTest from "../TransformerTest";

class ShortCircuitTest extends TransformerTest {
    constructor() {
        super();
        this.current = null; // Base power of the short circuit test
        this.energised_end_step = null; // Temperature during the test
        this.grounded_end_step = null; // Grounded end step of the short circuit test
        this.leakage_impedance = null; // Leakage impedance of the short circuit test
        this.leakage_impedance_zero = null; // Leakage impedance in zero sequence of the short circuit test
        this.loss = null; // Loss during the short circuit test
        this.loss_zero = null; // Loss in zero sequence during the short circuit test
        this.power = null; // Power during the short circuit test
        this.voltage = null; // Voltage during the short circuit test
        this.energised_end = null; // Energised end during the short circuit test
    }
}

export default ShortCircuitTest;
