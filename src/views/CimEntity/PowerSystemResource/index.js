import IdentifiedObject from "../IdentifiedObject";
import Location from "../Location";

class PowerSystemResource extends IdentifiedObject {
    constructor() {
        super()
        this.psrTypeId = null;
        this.location = new Location();
    }
}
export default PowerSystemResource