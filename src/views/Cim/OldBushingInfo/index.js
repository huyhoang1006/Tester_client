import BushingInfo from '../BushingInfo';
class OldBushingInfo extends BushingInfo {
    constructor() {
        super();
        this.high_voltage_limit = null;
        this.c2_capacitance = null;
        this.c2_power_factor = null;
        this.rated_frequency = null
        this.transformer_end_info = null
        this.phase = null
    }
}

export default OldBushingInfo;
