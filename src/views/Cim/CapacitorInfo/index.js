import AssetInfo from '../AssetInfo';

class CapacitorInfo extends AssetInfo {
    constructor() {
        super();
        this.phase_number = null;
        this.phase_name = null;
        this.rated_voltage = null;
        this.rated_current = null;
        this.rated_frequency = null;
        this.rated_power = null;
        this.insulation_type = null;
        this.weight = null;

    }
}

export default CapacitorInfo;
