import Voltage from "../Voltage";
import CurrentFlow from "../CurrentFlow";
class JointCableInfo {
    constructor() {
        this.mRID = null;
                this.ratedU = new Voltage();
                this.ratedCurrent = new CurrentFlow();
                this.category = null;
                this.construction = null;
                this.serviceCondition = null;
                this.cableInfoId = null;
    }
}

export default JointCableInfo;