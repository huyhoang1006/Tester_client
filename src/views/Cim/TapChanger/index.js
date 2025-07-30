class TapChanger extends AssetInfo {
    constructor() {
        super();
        this.bil = '' // Reference to the name
        this.ct_rating = "" // Reference to the base voltage
        this.ct_ratio = "" // Reference to the percent ratings
        this.frequency = "" // Reference to the active power ratings
        this.high_step = "" // Reference to the zero sequence impedance
        this.is_tcul = "" // Reference to the zero sequence impedance table
        this.low_step = "" // Reference to the zero sequence impedance table
        this.neutral_step = "" // Reference to the zero sequence impedance table
        this.pt_ratio = "" // Reference to the zero sequence impedance table
        this.rated_apparent_power = "" // Reference to the zero sequence impedance table
        this.rated_current = "" // Reference to the zero sequence impedance table
        this.rated_voltage = "" // Reference to the zero sequence impedance table
        this.step_phase_increment = "" // Reference to the zero sequence impedance table
        this.step_voltage_increment = "" // Reference to the zero sequence impedance table
    }
}

export default TapChanger;