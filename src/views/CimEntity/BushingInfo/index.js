import AssetInfo from '../AssetInfo';
import Percent from "../Percent";
import CurrentFlow from "../CurrentFlow";
import Voltage from "../Voltage";
import Capacitance from "../Capacitance"; // Import thêm

class BushingInfo extends AssetInfo {
    constructor() {
        super();
        this.cCapacitance = new Capacitance(); // Sửa null
        this.cPowerFactor = new Percent();
        this.insulationKind = null;
        this.ratedCurrent = new CurrentFlow();
        this.ratedImpulseWithstandVoltage = new Voltage();
        this.ratedLineToGroundVoltage = new Voltage();
        this.ratedVoltage = new Voltage();
    }
}
export default BushingInfo;