import AssetInfo from "../AssetInfo"


class RotatingMachineInfo extends AssetInfo {
    constructor() {
        super()
        this.star_point = null              // Star point connection information
        this.rated_frequency = null         // Reference to rated frequency (Hz)
        this.rated_current = null           // Reference to rated current (A)
        this.rated_u = null                 // Reference to rated voltage (V)
        this.rated_speed = null             // Rated speed (rpm)
        this.rated_power = null             // Reference to rated apparent power (VA/kVA)
        this.rated_power_factor = null      // Rated power factor
        this.rated_thermal_class = null     // Rated thermal class
        this.rated_ifd = null               // Reference to rated field current
        this.rated_ufd = null               // Reference to rated field voltage
    }
}

export default RotatingMachineInfo
