import AssetInfo from "../AssetInfo";

class PotentialTransformerInfo extends AssetInfo {
    constructor() {
        super();
        this.accuracy_class = null;        // TEXT
        this.nominal_ratio = null;  // FK -> ratio(mrid)
        this.primary_ratio = null;  // FK -> ratio(mrid)
        this.pt_class = null;              // TEXT
        this.rated_voltage = null; // FK -> voltage(mrid)
        this.secondary_ratio = null; // FK -> ratio(mrid)
        this.tertiary_ratio = null;  // FK -> ratio(mrid)
    }
}
export default PotentialTransformerInfo;