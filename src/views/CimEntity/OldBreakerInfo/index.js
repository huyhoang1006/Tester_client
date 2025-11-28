import BreakerInfo from '../BreakerInfo';
class OldBreakerInfo extends BreakerInfo {
    constructor() {
        super();
                this.phaseNumber = null;
                this.numberOfInterruptersPerPhase = null;
                this.poleOperation = null;
                this.pir = null;
                this.pirValue = null;
                this.gradingCapacitors = null;
                this.capacitorValue = null;
                this.interruptingMedium = null;
                this.tankType = null;
    }
}
export default OldBreakerInfo;