import OldSwitchInfo from '../OldSwitchInfo'

class DisconnectorInfo extends OldSwitchInfo {
    constructor() {
        super()
        this.rated_duration_short_circuit = null
        this.withstand_voltage_earth_poles = null
        this.power_frequency_isolating_distance = null
    }
}

export default DisconnectorInfo
