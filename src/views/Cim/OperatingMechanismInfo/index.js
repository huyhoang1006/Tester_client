import AssetInfo from '../AssetInfo'
class OperatingMechanismInfo extends AssetInfo {
    constructor() {
        super()
        this.close_amps = null
        this.close_voltage = null
        this.mechanism_kind = null
        this.motor_run_current = null
        this.motor_start_current = null
        this.motor_voltage = null
        this.trip_amps = null
        this.trip_voltage = null
    }
}

export default OperatingMechanismInfo