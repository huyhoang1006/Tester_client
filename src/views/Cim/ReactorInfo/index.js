import AssetInfo from '../AssetInfo';

class ReactorInfo extends AssetInfo {
    constructor() {
        super();
        this.rated_voltage = null;
        this.rated_current = null;
        this.rated_frequency = null;
        this.rated_power = null;
        this.inductance = null;
        this.insulation_type = null;

    }
}

export default ReactorInfo;
