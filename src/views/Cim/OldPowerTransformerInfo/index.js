import PowerTransformerInfo from "../PowerTransformerInfo";

class OldPowerTransformerInfo extends PowerTransformerInfo {
    constructor() {
        super();
        this.phases = null; // Phase configuration of the transformer (e.g., single-phase, three-phase)
        this.vector_group = null; // Vector group of the transformer
        this.rated_frequency = null; // Rated frequency of the transformer
        this.impedance_temperature = null; // Impedance temperature of the transformer
        this.category = null; // Category of the transformer (e.g., power, distribution)
        this.apparatus_id = null; // Identifier for the apparatus
        this.vector_group_type = null
    }
}
export default OldPowerTransformerInfo;