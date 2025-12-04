import PowerTransformerInfo from "../PowerTransformerInfo";
import CurrentFlow from "../CurrentFlow";
import Seconds from "../Seconds";

class ShortCircuitRating {
    constructor() {
        this.mRID = null;
        this.powerTransformerInfo = new PowerTransformerInfo();
        this.shortCircuitCurrent = new CurrentFlow();
        this.durationSeconds = new Seconds();
    }
}
export default ShortCircuitRating;