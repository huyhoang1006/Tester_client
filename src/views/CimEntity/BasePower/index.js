import IdentifiedObject from "../IdentifiedObject";
import ApparentPower from "../ApparentPower";

class BasePower extends IdentifiedObject {
    constructor() {
        super();
        this.basePower = new ApparentPower(); // Base power value
    }
}

export default BasePower;
