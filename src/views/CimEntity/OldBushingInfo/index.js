import BushingInfo from '../BushingInfo';
import Voltage from "../Voltage";
import Percent from "../Percent";
import Frequency from "../Frequency";
class OldBushingInfo extends BushingInfo {
    constructor() {
        super();
                this.highVoltageLimit = new Voltage();
                this.powerTransformerInfoId = null;
                this.c2Capacitance = null;
                this.c2PowerFactor = new Percent();
                this.ratedFrequency = new Frequency();
    }
}

export default OldBushingInfo;
