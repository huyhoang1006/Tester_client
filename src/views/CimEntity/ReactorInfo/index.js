import AssetInfo from "../AssetInfo";
import Voltage from "../Voltage";
import Frequency from "../Frequency";
import CurrentFlow from "../CurrentFlow";
import ReactivePower from "../ReactivePower";
import Inductance from "../Inductance";

class ReactorInfo extends AssetInfo {
    constructor() {
        super();
        this.ratedVoltage = new Voltage();
        this.ratedFrequency = new Frequency();
        this.ratedCurrent = new CurrentFlow();
        this.ratedPower = new ReactivePower(); // DB: rated_power -> reactive_power
        this.insulationType = null;
        this.inductance = new Inductance();
    }
}
export default ReactorInfo;