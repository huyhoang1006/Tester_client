import PowerSystemResource from "../PowerSystemResource";
import EquipmentContainer from "../EquipmentContainer";

class Equipment extends PowerSystemResource {
    constructor() {
        super();
        this.aggregate = null; // Boolean/String
        this.inService = null; // Boolean
        this.networkAnalysisEnabled = null; // Boolean
        this.normallyInService = null; // Boolean
        this.equipmentContainer = new EquipmentContainer();
    }
}
export default Equipment;