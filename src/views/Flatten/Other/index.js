import IdentifiedObject from "@/views/Cim/IdentifiedObject";

class Other extends IdentifiedObject {
    constructor() {
        super();
        this.category = null; // Reference to the power transformer info
        this.insulation_medium = null; // Base power in VA
        this.insulation_weight = null; // Base voltage in V
        this.insulation_volume = null; // Load losses in W
        this.power_transformer_info_id = null; // Reference to the power transformer info
        this.insulation_key = null; // Reference to the power transformer info
        this.tank_type = null; // Reference to the tank type
    }
}
export default Other;