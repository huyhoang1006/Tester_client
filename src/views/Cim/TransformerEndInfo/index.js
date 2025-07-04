import AssetInfo from "../AssetInfo";

class TransformerEndInfo extends AssetInfo {
    constructor() {
        super();
        this.connection_kind = null;
        this.emergency_s = null;
        this.end_number = null;
        this.insulation_u = null;
        this.phase_angle_clock = null;
        this.r = null;
        this.rated_s = null;
        this.rated_ln = null; // Rated phase voltage in volts
        this.insulation_bil = null; // Insulation level in kV
        this.insulation_c = null; // Insulation class
        this.rated_u = null;
        this.short_term_s = null;
        this.transformer_tank_info = null; // Reference to the transformer tank info
        this.rated_ln = null; // Rated line-to-neutral voltage in volts
        this.insulation_bil = null; // Insulation level in kV
        this.insulation_c = null; // Insulation class
        this.voltage_regulation = null; // Voltage regulation percentage
        this.base_voltage = null; // Base voltage in volts
        this.material = null; // Material of the transformer end
    }
}

export default TransformerEndInfo;