import IdentifiedObject from '../IdentifiedObject';
class CoolingPowerRating extends IdentifiedObject {
    constructor() {
        super();
        this.power_rating  = null; // Power rating of the cooling system
        this.stage = null; // Stage of the cooling system
    }
}
export default CoolingPowerRating;