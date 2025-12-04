import Asset from "../Asset";
import OperatingMechanism from "../OperatingMechanism";

class InterrupterUnit extends Asset {
    constructor() {
        super();
        this.operatingMechanism = new OperatingMechanism();
    }
}
export default InterrupterUnit;