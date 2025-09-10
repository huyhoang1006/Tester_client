import AssetInfo from '../AssetInfo';
class BushingInfo extends AssetInfo {
    constructor() {
        super();
        this.c_capacitance = null;
        this.c_power_factor = null;
        this.insulation_kind = null;
        this.rated_current = null;
        this.rated_impulse_withstand_voltage = null;
        this.rated_line_to_ground_voltage = null;
        this.rated_voltage = null;
    }
}

export default BushingInfo;