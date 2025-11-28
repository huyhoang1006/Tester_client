import OldSwitchInfo from '../OldSwitchInfo'
import Seconds from "../Seconds";
import Voltage from "../Voltage";
import Frequency from "../Frequency";

class DisconnectorInfo extends OldSwitchInfo {
    constructor() {
        super()
                this.ratedDurationShortCircuit = new Seconds();
                this.withstandVoltageEarthPoles = new Voltage();
                this.powerFrequencyIsolatingDistance = new Frequency();
    }
}

export default DisconnectorInfo
