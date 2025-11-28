import Voltage from "../Voltage";
import CurrentFlow from "../CurrentFlow";
import Frequency from "../Frequency";
import ApparentPower from "../ApparentPower";
class TapChanger extends AssetInfo {
    constructor() {
        super();
                this.bil = new Voltage(); // Reference to the name
                this.ctRating = new CurrentFlow(); // Reference to the base voltage
                this.ctRatio = ""; // Reference to the percent ratings
                this.frequency = new Frequency(); // Reference to the active power ratings
                this.highStep = ""; // Reference to the zero sequence impedance
                this.isTcul = new Boolean(); // Reference to the zero sequence impedance table
                this.lowStep = ""; // Reference to the zero sequence impedance table
                this.neutralStep = new Voltage(); // Reference to the zero sequence impedance table
                this.ptRatio = ""; // Reference to the zero sequence impedance table
                this.ratedApparentPower = new ApparentPower(); // Reference to the zero sequence impedance table
                this.ratedCurrent = new CurrentFlow(); // Reference to the zero sequence impedance table
                this.ratedVoltage = new Voltage(); // Reference to the zero sequence impedance table
                this.stepPhaseIncrement = ""; // Reference to the zero sequence impedance table
                this.stepVoltageIncrement = new Voltage(); // Reference to the zero sequence impedance table
    }
}

export default TapChanger;