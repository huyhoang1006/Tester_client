import AssetInfo from "../AssetInfo";
import PowerTransformerInfo from "../PowerTransformerInfo";

class TransformerTankInfo extends AssetInfo {
    constructor() {
        super();
                this.powerTransformerInfo = new PowerTransformerInfo(); // Reference to the power transformer info
                this.insulationM = null; // Insulation medium of the transformer tank
                this.insulationW = null; // Insulation weight of the transformer tank
                this.insulationV = null; // Insulation volume of the transformer tank
    }
}

export default TransformerTankInfo;