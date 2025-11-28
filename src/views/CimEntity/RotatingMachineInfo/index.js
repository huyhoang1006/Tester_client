import AssetInfo from "../AssetInfo"
import Frequency from "../Frequency";
import CurrentFlow from "../CurrentFlow";
import Voltage from "../Voltage";
import ApparentPower from "../ApparentPower";


class RotatingMachineInfo extends AssetInfo {
    constructor() {
        super()
                this.starPoint = null; // Star point connection information
                this.ratedFrequency = new Frequency(); // Reference to rated frequency (Hz)
                this.ratedCurrent = new CurrentFlow(); // Reference to rated current (A)
                this.ratedU = new Voltage(); // Reference to rated voltage (V)
                this.ratedSpeed = null; // Rated speed (rpm)
                this.ratedPower = new ApparentPower(); // Reference to rated apparent power (VA/kVA)
                this.ratedPowerFactor = new ApparentPower(); // Rated power factor
                this.ratedThermalClass = null; // Rated thermal class
                this.ratedIfd = null; // Reference to rated field current
                this.ratedUfd = null; // Reference to rated field voltage
    }
}

export default RotatingMachineInfo
