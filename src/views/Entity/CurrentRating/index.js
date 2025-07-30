import IdentifiedObject from "@/views/Cim/IdentifiedObject";

class CurrentRating extends IdentifiedObject {
    constructor() {
        super();
        this.rated_current = null; // Rated current of the transformer
        this.transformer_end_id = null; // ID of the transformer end this rating applies to
        this.value = null; // Value of the current rating
    }
}

export default CurrentRating;