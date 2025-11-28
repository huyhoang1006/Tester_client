import IdentifiedObject from '../IdentifiedObject';
import Temperature from "../Temperature";
class CoolingPowerRating extends IdentifiedObject {
    constructor() {
        super();
                this.powerRating = null; // Power rating of the cooling system
                this.stage = null; // Stage of the cooling system
                this.coolingKind = null; // Type of cooling system (e.g., air, water)
                this.temp = new Temperature(); // Temperature rating of the cooling system
                this.powerTransformerInfoId = null;
    }
}
export default CoolingPowerRating;