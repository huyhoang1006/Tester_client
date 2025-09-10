import BushingInfo from '../BushingInfo';
class OldBushingInfo extends BushingInfo {
    constructor() {
        super();
        this.high_voltage_limit = null;
        this.power_transformer_info_id = null;
        this.c2_capacitance = null;
        this.c2_power_factor = null;
    }
}

export default OldBushingInfo;
