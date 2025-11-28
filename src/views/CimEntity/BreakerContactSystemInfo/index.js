import Seconds from "../Seconds";
import Length from "../Length";
class BreakerContactSystemInfo {
    constructor() {
        this.mRID = null;
                this.breakerInfoId = null;
                this.nominalTotalTravel = null;
                this.dampingTime = new Seconds();
                this.nozzleLength = new Length();
    }
}

export default BreakerContactSystemInfo;