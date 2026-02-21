import AssetInfo from '../AssetInfo'
class TapChangerInfo extends AssetInfo {
    constructor() {
        super()
        this.bil = null
        this.ct_rating = null
        this.ct_ratio = null
        this.frequency = null
        this.high_step = null
        this.is_tcul = null
        this.low_step = null
        this.neutral_step = null
        this.pt_ratio = null
        this.rated_apparent_power = null
        this.rated_current = null
        this.rated_voltage = null
        this.step_phase_increment = null
        this.step_voltage_increment = null
    }
}

export default TapChangerInfo