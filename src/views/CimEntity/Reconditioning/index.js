import IdentifiedObject from "../IdentifiedObject";
import Asset from "../Asset";

class Reconditioning extends IdentifiedObject {
    constructor() {
        super()
                this.asset = new Asset();
                this.dateTime = new Date();
    }
}

export default Reconditioning