import AssetInfo from "../AssetInfo";

class TransformerEndInfo extends AssetInfo {
    constructor() {
        super();
        this.connection_kind = null;
        this.emergency_s = null;
        this.end_number = null;
        this.insulation_u = null;
        this.phase_angle_clock = null;
        this.r = null;
        this.rated_s = null;
        this.rated_u = null;
        this.short_term_s = null;
        this.transformer_tank_info = null; // Reference to the transformer tank info
    }
}

export default TransformerEndInfo;