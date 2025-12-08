import AssetInfo from "../AssetInfo";
import ApparentPower from "../ApparentPower";
import Voltage from "../Voltage";
import TransformerTankInfo from "../TransformerTankInfo";
import Resistance from "../Resistance"; // Import thêm

class TransformerEndInfo extends AssetInfo {
    constructor() {
        super();
        this.connectionKind = null;
        this.emergencyS = new ApparentPower();
        this.endNumber = null;
        this.insulationU = new Voltage();
        this.phaseAngleClock = null;
        this.r = new Resistance(); // Sửa
        this.ratedS = new ApparentPower();
        this.ratedU = new Voltage();
        this.shortTermS = new ApparentPower();
        this.transformerTankInfo = new TransformerTankInfo(); 
    }
}
export default TransformerEndInfo;