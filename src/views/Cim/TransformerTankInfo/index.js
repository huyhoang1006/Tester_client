import AssetInfo from "../AssetInfo";

class TransformerTankInfo extends AssetInfo {
    constructor() {
        super();
        this.power_transformer_info = null; // Reference to the power transformer info
        this.insulation_m = null; // Insulation medium of the transformer tank
        this.insulation_w = null; // Insulation weight of the transformer tank
        this.insulation_v = null; // Insulation volume of the transformer tank
    }
}

export default TransformerTankInfo;