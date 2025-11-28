import CurrentFlow from "../CurrentFlow";
import Voltage from "../Voltage";
import Frequency from "../Frequency";
class OperatingMechanismComponent {
    constructor() {
        this.mRID = null
                this.operatingMechanismId = null;
                this.component = null;
                this.ratedCurrent = new CurrentFlow();
                this.ratedVoltage = new Voltage();
                this.ratedFrequency = new Frequency();
                this.powerType = null;
    }
}

export default OperatingMechanismComponent;