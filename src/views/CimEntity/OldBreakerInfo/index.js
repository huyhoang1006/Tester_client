import BreakerInfo from '../BreakerInfo';
import Resistance from "../Resistance";   // Import thêm
import Capacitance from "../Capacitance"; // Import thêm

class OldBreakerInfo extends BreakerInfo {
    constructor() {
        super();
        this.phaseNumber = null;
        this.numberOfInterruptersPerPhase = null;
        this.poleOperation = null;
        this.pir = null;
        this.pirValue = new Resistance();     // Sửa
        this.gradingCapacitors = null;
        this.capacitorValue = new Capacitance(); // Sửa
        this.interruptingMedium = null;
        this.tankType = null;
    }
}
export default OldBreakerInfo;