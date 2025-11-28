import ApparentPower from "../ApparentPower";
import Voltage from "../Voltage";
class PotentialTransformerTable {
    constructor() {
        this.mRID = null;                             // TEXT NOT NULL, PK
                this.name = null; // TEXT
                this.usrFormula = null; // TEXT
                this.ratedBurden = null; // FK -> apparent_power(mrid)
                this.ratedPowerFactor = new ApparentPower(); // REAL (number)
                this.usrRatedVoltage = new Voltage(); // FK -> voltage(mrid)
                this.potentialTransformerInfoId = null; // FK -> potential_transformer_info(mrid)
    }
}
export default PotentialTransformerTable;