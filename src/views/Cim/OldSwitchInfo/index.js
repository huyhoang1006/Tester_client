import SwitchInfo from '../SwitchInfo'

class OldSwitchInfo extends SwitchInfo {
    constructor() {
        super()
        // FK references
        this.dielectric_strength = null
        this.making_capacity = null
        this.minimum_current = null
        this.withstand_current = null

        // Plain fields
        this.load_break = null
        this.pole_count = null
        this.remote = null
    }
}

export default OldSwitchInfo
