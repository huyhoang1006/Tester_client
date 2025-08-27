import IdentifiedObject from "../IdentifiedObject";

class TransformerObservation extends IdentifiedObject {
    constructor() {
        super();
        this.bushing_temp = null;
        this.dga = null;
        this.freq_resp = null;
        this.furfural_dp = null;
        this.hot_spot_temp = null;
        this.oil_color = null;
        this.oil_dielectric_strength = null;
        this.oil_ift = null;
        this.oil_level = null;
        this.oil_neutralization_number = null;
        this.pump_vibration = null;
        this.status = null;
        this.top_oil_temp = null;
        this.water_content = null;
        this.transformer = null;
        this.reconditioning = null; // e.g., "active", "inactive"
    }
}

export default TransformerObservation;