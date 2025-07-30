import IdentifiedObject from "@/views/Cim/IdentifiedObject";

class VoltageRating extends IdentifiedObject {
    constructor() {
        super();
        this.rated_u = null;
        this.rated_ln = null;
        this.insulation_u = null;
        this.insulation_c = null;
        this.regulation = null;
        this.transformer_end_id = null;
    }
}

export default VoltageRating;