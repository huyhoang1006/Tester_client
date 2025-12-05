import Equipment from "../Equipment";
import BaseVoltage from "../BaseVoltage";

class ConductingEquipment extends Equipment {
    constructor() {
        super();
        this.baseVoltage = new BaseVoltage();
        this.jumpingAction = null;
        this.outage = null;
    }
}
export default ConductingEquipment;