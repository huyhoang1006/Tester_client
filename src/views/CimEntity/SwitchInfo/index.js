import AssetInfo from '../AssetInfo'
import CurrentFlow from "../CurrentFlow";
import Mass from "../Mass";
import Volume from "../Volume";
import Frequency from "../Frequency";
import Voltage from "../Voltage";
import Seconds from "../Seconds";
import Pressure from "../Pressure";

class SwitchInfo extends AssetInfo {
    constructor() {
        super()
        // FK references
                this.breakingCapacity = new CurrentFlow();
                this.gasWeightPerTank = new Mass();
                this.oilVolumePerTank = new Volume();
                this.ratedCurrent = new CurrentFlow();
                this.ratedFrequency = new Frequency();
                this.ratedImpulseWithstandVoltage = new Voltage();
                this.ratedInterruptingTime = new Seconds();
                this.ratedVoltage = new Voltage();

        // Plain fields
                this.isSinglePhase = new Boolean();
                this.isUnganged = new Boolean();
                this.lowPressureAlarm = new Pressure();
                this.lowPressureLockOut = new Pressure();
    }
}

export default SwitchInfo
