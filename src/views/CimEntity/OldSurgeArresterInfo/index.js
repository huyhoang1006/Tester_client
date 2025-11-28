import SurgeArresterInfo from "../SurgeArresterInfo";
import Voltage from "../Voltage";
import CurrentFlow from "../CurrentFlow";
import Seconds from "../Seconds";

class OldSurgeArresterInfo extends SurgeArresterInfo {
    constructor() {
        super();
                this.serialNumber = null;
                this.maximumSystemVoltage = new Voltage();
                this.shortTimeWithStandCurrent = new CurrentFlow();
                this.ratedDurationOfShortCircuit = new Seconds();
                this.pfWithStandVoltageEarthBetweenPole = new Voltage();
                this.pfWithStandVoltageIsolatedDistance = new Voltage();
                this.surgeArresterId = null;
    }
}

export default OldSurgeArresterInfo;