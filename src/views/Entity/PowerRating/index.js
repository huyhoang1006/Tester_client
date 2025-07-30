import IdentifiedObject from "@/views/Cim/IdentifiedObject";

class PowerRating extends IdentifiedObject {
    constructor() {
        super();
        this.rated_power = null; // Rated power of the transformer
        this.cooling = null; // Rated voltage of the transformer
        this.temp = null; // Rated current of the transformer
        this.power_transformer_info_id = null; // Reference to the power transformer info
    }
}

export default PowerRating;