import EquipmentContainer from "../EquipmentContainer"

class VoltageLevel extends EquipmentContainer {
    constructor() {
        super();
        this.mrid = null
        this.high_voltage_limit = null // e.g., "volt"
        this.low_voltage_limit = null // Numerical value of the voltage
        this.base_voltage = null // e.g., "kilo", "mega" for scaling the value
        this.substation = null // e.g., "kilo", "mega" for scaling the value
    }
}

export default VoltageLevel;