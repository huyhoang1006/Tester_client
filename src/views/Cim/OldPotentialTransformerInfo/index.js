import PotentialTransformerInfo from "../PotentialTransformerInfo";

class OldPotentialTransformerInfo extends PotentialTransformerInfo {
    constructor() {
        super();
        this.standard = null;                      // TEXT
        this.rated_frequency = null;    // FK -> frequency(mrid)
        this.upr_formula = null;                   // TEXT
        this.windings = null;
        this.c1 = null;
        this.c2 = null;
    }
}
export default OldPotentialTransformerInfo;