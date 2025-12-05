import PowerTransformerInfo from "../PowerTransformerInfo";
import BasePower from "../BasePower";
import BaseVoltage from "../BaseVoltage";

class ZeroSequenceImpedance {
    constructor() {
        this.mRID = null;
        this.powerTransformerInfo = new PowerTransformerInfo();
        this.basePower = new BasePower();
        this.baseVoltage = new BaseVoltage();
    }
}
export default ZeroSequenceImpedance;