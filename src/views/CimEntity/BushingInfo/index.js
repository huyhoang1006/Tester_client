import AssetInfo from '../AssetInfo';
import Percent from "../Percent";
import CurrentFlow from "../CurrentFlow";
import Voltage from "../Voltage";
class BushingInfo extends AssetInfo {
    constructor() {
        super();
                this.cCapacitance = null;
                this.cPowerFactor = new Percent();
                this.insulationKind = null;
                this.ratedCurrent = new CurrentFlow();
                this.ratedImpulseWithstandVoltage = new Voltage();
                this.ratedLineToGroundVoltage = new Voltage();
                this.ratedVoltage = new Voltage();
    }
}

export default BushingInfo;