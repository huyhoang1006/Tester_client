import SwitchInfo from '../SwitchInfo'
import Voltage from "../Voltage";
import CurrentFlow from "../CurrentFlow";

class OldSwitchInfo extends SwitchInfo {
    constructor() {
        super()
        // FK references
                this.dielectricStrength = new Voltage();
                this.makingCapacity = null;
                this.minimumCurrent = new CurrentFlow();
                this.withstandCurrent = new CurrentFlow();

        // Plain fields
                this.loadBreak = null;
                this.poleCount = null;
                this.remote = null;
    }
}

export default OldSwitchInfo
