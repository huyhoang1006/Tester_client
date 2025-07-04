import AssetInfo from "../AssetInfo";

class PowerTransformerInfo extends AssetInfo {
    constructor() {
        super()
        this.category = null; // Category of the power transformer
        this.phase = null; // Phase configuration of the transformer (e.g., single-phase, three-phase)
        this.vector_group = null; // Vector group of the transformer
    }
}
export default PowerTransformerInfo;