import OperatingMechanismInfo from "../OperatingMechanismInfo";

class OldOperatingMechanismInfo extends OperatingMechanismInfo {
    constructor() {
        super()
        this.rated_motor_current = null
        this.rated_motor_voltage = null
        this.motor_power_type = null
        this.rated_motor_frequency = null
        this.rated_auxiliary_circuit_current = null
        this.rated_auxiliary_circuit_voltage = null
        this.auxiliary_circuit_power_type = null
        this.rated_auxiliary_circuit_frequency = null
        this.rated_operating_pressure = null
        this.rated_operating_pressure_temperature = null
    }
}

export default OldOperatingMechanismInfo;