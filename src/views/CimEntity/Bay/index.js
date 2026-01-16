import EquipmentContainer from "../EquipmentContainer"
import Substation from "../Substation";
import Voltage from "../Voltage";

class Bay extends EquipmentContainer {
    constructor() {
        super();
        this.bayEnergyMeasFlag = null; // e.g., "volt"
        this.bayPowerMeasFlag = null; // Numerical value of the voltage
        this.breakerConfiguration = null; // e.g., "kilo", "mega" for scaling the value
        this.busBarConfiguration = null; // e.g., "kilo", "mega" for scaling the value
        this.substation = new Substation(); // e.g., "kilo", "mega" for scaling the value
        this.voltageLevel = new Voltage(); // e.g., "kilo", "mega" for scaling the value
    }
}

export default Bay;