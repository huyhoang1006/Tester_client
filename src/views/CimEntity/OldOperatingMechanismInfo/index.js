import OperatingMechanismInfo from "../OperatingMechanismInfo";
import CurrentFlow from "../CurrentFlow";
import Voltage from "../Voltage";
import Frequency from "../Frequency";
import Pressure from "../Pressure";
import Temperature from "../Temperature";

class OldOperatingMechanismInfo extends OperatingMechanismInfo {
    constructor() {
        super()
                this.ratedMotorCurrent = new CurrentFlow();
                this.ratedMotorVoltage = new Voltage();
                this.motorPowerType = null;
                this.ratedMotorFrequency = new Frequency();
                this.ratedAuxiliaryCircuitCurrent = new CurrentFlow();
                this.ratedAuxiliaryCircuitVoltage = new Voltage();
                this.auxiliaryCircuitPowerType = null;
                this.ratedAuxiliaryCircuitFrequency = new Frequency();
                this.ratedOperatingPressure = new Pressure();
                this.ratedOperatingPressureTemperature = new Temperature();
    }
}

export default OldOperatingMechanismInfo;