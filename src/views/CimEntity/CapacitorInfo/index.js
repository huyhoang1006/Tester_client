import AssetInfo from '../AssetInfo';
import Voltage from "../Voltage";
import CurrentFlow from "../CurrentFlow";
import Frequency from "../Frequency";
import ApparentPower from "../ApparentPower";
import Mass from "../Mass";

class CapacitorInfo extends AssetInfo {
    constructor() {
        super();
                this.phaseNumber = null;
                this.phaseName = null;
                this.ratedVoltage = new Voltage();
                this.ratedCurrent = new CurrentFlow();
                this.ratedFrequency = new Frequency();
                this.ratedPower = new ApparentPower();
                this.insulationType = null;
                this.weight = new Mass();

    }
}

export default CapacitorInfo;
