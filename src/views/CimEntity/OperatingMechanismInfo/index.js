import AssetInfo from '../AssetInfo'
import CurrentFlow from "../CurrentFlow";
import Voltage from "../Voltage";
class OperatingMechanismInfo extends AssetInfo {
    constructor() {
        super()
                this.closeAmps = new CurrentFlow();
                this.closeVoltage = new Voltage();
                this.mechanismKind = null;
                this.motorRunCurrent = new CurrentFlow();
                this.motorStartCurrent = new CurrentFlow();
                this.motorVoltage = new Voltage();
                this.tripAmps = new CurrentFlow();
                this.tripVoltage = new Voltage();
    }
}

export default OperatingMechanismInfo