import AssetInfo from "../AssetInfo";
import Voltage from "../Voltage";
import CurrentFlow from "../CurrentFlow";
// Bỏ import Pressure

class SurgeArresterInfo extends AssetInfo {
    constructor() {
        super();
        this.continuousOperatingVoltage = new Voltage();
        this.isPolymer = null; // Sửa new Boolean()
        this.lightningImpulseDischargeVoltage = new Voltage();
        this.lineDischargeClass = null;
        this.nominalDischargeCurrent = new CurrentFlow();
        this.pressureReliefClass = new CurrentFlow(); // Sửa thành CurrentFlow
        this.ratedVoltage = new Voltage();
        this.steepFrontDischargeVoltage = new Voltage();
        this.switchingImpulseDischargeVoltage = new Voltage();
    }
}
export default SurgeArresterInfo;