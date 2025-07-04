import IdentifiedObject from '../IdentifiedObject';
class PowerRating extends IdentifiedObject {
    constructor() {
        super();
        this.rated_power = null; // Power rating of the transformer
        this.cooling = null; // Cooling information of the transformer
        this.temp = null; // Temperature rating of the transformer
    }
}
export default PowerRating;