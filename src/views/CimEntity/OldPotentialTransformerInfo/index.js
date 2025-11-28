import PotentialTransformerInfo from "../PotentialTransformerInfo";
import Frequency from "../Frequency";

class OldPotentialTransformerInfo extends PotentialTransformerInfo {
    constructor() {
        super();
                this.standard = null; // TEXT
                this.ratedFrequency = new Frequency(); // FK -> frequency(mrid)
                this.uprFormula = null; // TEXT
                this.windings = null;
                this.c1 = null;
                this.c2 = null;
    }
}
export default OldPotentialTransformerInfo;