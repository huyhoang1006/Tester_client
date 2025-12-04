import Measurement from "@/views/Cim/Measurement";
class Analog extends Measurement {
    constructor() {
        super();
        this.maxValue = null;
        this.minValue = null;
        this.normalValue = null; // Normal value of the analog measurement
        this.positiveFlowIn = null; // Current value of the analog measurement
    }
}

export default Analog;
