import AssetInfo from "../AssetInfo";

class SurgeArresterInfo extends AssetInfo{
    constructor() {
        super();
        this.continuous_operating_voltage = null;
        this.is_polymer = null;
        this.lightning_impulse_discharge_voltage = null;
        this.line_discharge_class = null;
        this.nominal_discharge_current = null;
        this.pressure_relief_class = null;
        this.rated_voltage = null;
        this.steep_front_discharge_voltage = null;
        this.switching_impulse_discharge_voltage = null;
    }
}

export default SurgeArresterInfo;