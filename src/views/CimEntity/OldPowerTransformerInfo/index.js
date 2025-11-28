import PowerTransformerInfo from "../PowerTransformerInfo";
import Frequency from "../Frequency";
import Impedance from "../Impedance";

class OldPowerTransformerInfo extends PowerTransformerInfo {
    constructor() {
        super();
                this.phases = null; // Phase configuration of the transformer (e.g., single-phase, three-phase)
                this.vectorGroup = null; // Vector group of the transformer
                this.ratedFrequency = new Frequency(); // Rated frequency of the transformer
                this.impedanceTemperature = new Impedance(); // Impedance temperature of the transformer
                this.category = null; // Category of the transformer (e.g., power, distribution)
                this.apparatusId = null; // Identifier for the apparatus
    }
}
export default OldPowerTransformerInfo;