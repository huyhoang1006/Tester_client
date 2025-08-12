import TransformerEndInfo from "../TransformerEndInfo";

class OldTransformerEndInfo extends TransformerEndInfo {
    constructor() {
        super()
        this.material = null; // Reference to the material of the transformer end
        this.spare = null; // Reference to the spare status of the transformer end
        this.accessibility = null; // Reference to the accessibility of the transformer end
        this.power_transformer_info_id = null; // Reference to the associated power transformer info
    }
}

export default OldTransformerEndInfo;