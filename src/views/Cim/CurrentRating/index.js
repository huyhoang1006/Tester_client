class CurrentRating {
    constructor() {
        this.mrid = null; // Unique identifier for the current rating
        this.rated_power = null; // Rated current of the transformer
        this.transformer_end_id = null; // ID of the transformer end this rating applies to
        this.value = null; // Value of the current rating
    }
}

export default CurrentRating;