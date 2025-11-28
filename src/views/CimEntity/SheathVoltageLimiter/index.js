import Voltage from "../Voltage";
import CurrentFlow from "../CurrentFlow";
class SheathVoltageLimiter {
    constructor() {
        this.mRID = null;                                // String (unique)
                this.ratedVoltageUr = new Voltage(); // Voltage (FK -> voltage.mrid)
                this.maxContinuousOperatingVoltage = new Voltage(); // Voltage (FK -> voltage.mrid)
                this.nominalDischargeCurrent = new CurrentFlow(); // Frequency (FK -> frequency.mrid)
                this.highCurrentImpulseWithstand = new CurrentFlow(); // String/Number (depends on DB schema)
                this.longDurationCurrentImpulseWithstand = new CurrentFlow(); // String/Number
                this.shortCircuitWithstand = null; // String/Number
                this.cableInfoId = null; // CableInfo (FK -> cable_info.mrid)
    }
}

export default SheathVoltageLimiter;
