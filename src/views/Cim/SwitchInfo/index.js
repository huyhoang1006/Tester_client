import AssetInfo from '../AssetInfo'

class SwitchInfo extends AssetInfo {
    constructor() {
        super()
        // FK references
        this.breaking_capacity = null
        this.gas_weight_per_tank = null
        this.oil_volume_per_tank = null
        this.rated_current = null
        this.rated_frequency = null
        this.rated_impulse_withstand_voltage = null
        this.rated_interrupting_time = null
        this.rated_voltage = null

        // Plain fields
        this.is_single_phase = null
        this.is_unganged = null
        this.low_pressure_alarm = null
        this.low_pressure_lock_out = null
    }
}

export default SwitchInfo
