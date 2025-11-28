import CurrentFlow from "../CurrentFlow";
import Seconds from "../Seconds";
import ApparentPower from "../ApparentPower";
class BreakerRatingInfo {
    constructor() {
        this.mRID = null;
                this.breakerInfoId = null;
                this.ratedShortCircuitBreakingCurrent = new CurrentFlow();
                this.shortCircuitNominalDuration = new Seconds();
                this.ratedInsulationLevel = null;
                this.interruptingDutyCycle = null;
                this.ratedPowerClosing = new ApparentPower();
                this.ratedPowerOpening = new ApparentPower();
                this.ratedPowerMotorCharge = new ApparentPower();
    }
}

export default BreakerRatingInfo;