import AssetInfo from "../AssetInfo";
import Voltage from "../Voltage";

class PotentialTransformerInfo extends AssetInfo {
    constructor() {
        super();
                this.accuracyClass = null; // TEXT
                this.nominalRatio = null; // FK -> ratio(mrid)
                this.primaryRatio = null; // FK -> ratio(mrid)
                this.ptClass = null; // TEXT
                this.ratedVoltage = new Voltage(); // FK -> voltage(mrid)
                this.secondaryRatio = null; // FK -> ratio(mrid)
                this.tertiaryRatio = null; // FK -> ratio(mrid)
    }
}
export default PotentialTransformerInfo;