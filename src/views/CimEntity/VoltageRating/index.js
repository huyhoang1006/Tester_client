import Voltage from "../Voltage";
class VoltageRating {
    constructor() {
        this.mRID = null;
                this.ratedU = new Voltage();
                this.ratedLn = new Voltage();
                this.insulationU = new Voltage();
                this.insulationC = null;
                this.regulation = null;
                this.transformerEndId = null;
    }
}

export default VoltageRating;