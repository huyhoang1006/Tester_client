import Asset from "../Asset";

class SurgeArrester extends Asset {
    constructor() {
        super();
        this.unit_count = null;
        this.manufacturer_type = null;
        this.apparatus_id = null;
        this.asset_system_code = null;
        this.phases = null;
        this.transformer_end_info_id = null;
    }
}

export default SurgeArrester;