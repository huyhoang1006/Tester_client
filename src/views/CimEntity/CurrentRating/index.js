import ApparentPower from "../ApparentPower";
class CurrentRating {
    constructor() {
        this.mRID = null; // Unique identifier for the current rating
                this.ratedPower = new ApparentPower(); // Rated current of the transformer
                this.transformerEndId = null; // ID of the transformer end this rating applies to
                this.value = null; // Value of the current rating
    }
}

export default CurrentRating;