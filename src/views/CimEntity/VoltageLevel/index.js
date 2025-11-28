import EquipmentContainer from "../EquipmentContainer"
import Voltage from "../Voltage";
import Substation from "../Substation";

class VoltageLevel extends EquipmentContainer {
    constructor() {
        super();
        this.mRID = null
                this.highVoltageLimit = new Voltage(); // e.g., "volt"
                this.lowVoltageLimit = new Voltage(); // Numerical value of the voltage
                this.baseVoltage = new Voltage(); // e.g., "kilo", "mega" for scaling the value
                this.substation = new Substation(); // e.g., "kilo", "mega" for scaling the value
    }
}

export default VoltageLevel;