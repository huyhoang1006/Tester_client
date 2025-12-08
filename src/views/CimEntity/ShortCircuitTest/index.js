import TransformerTest from "../TransformerTest";
import CurrentFlow from "../CurrentFlow";
import Impedance from "../Impedance";
import Voltage from "../Voltage";
import ApparentPower from "../ApparentPower"; // Import thêm
import ActivePower from "../ActivePower";     // Import thêm
import KiloActivePower from "../KiloActivePower"; // Import thêm
import Percent from "../Percent";             // Import thêm
import TransformerEndInfo from "../TransformerEndInfo"; // Import thêm

class ShortCircuitTest extends TransformerTest {
    constructor() {
        super();
        this.current = new CurrentFlow();
        this.energisedEndStep = null;
        this.groundedEndStep = null;
        this.leakageImpedance = new Impedance();
        this.leakageImpedanceZero = new Impedance();
        this.loss = new ActivePower(); // DB: loss -> active_power
        this.lossZero = new KiloActivePower(); // DB: loss_zero -> kilo_active_power
        this.power = new ApparentPower(); // DB: power -> apparent_power
        this.voltage = new Percent(); // DB: voltage -> percent (Lưu ý: DB map sang percent)
        this.energisedEnd = new TransformerEndInfo(); // DB: energised_end -> transformer_end_info
    }
}
export default ShortCircuitTest;