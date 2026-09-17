import EquipmentContainer from "../EquipmentContainer";

class Substation extends EquipmentContainer {
    constructor() {
        super()
        this.generation = null
        this.industry = null
        this.operating_date = null
    }
}
export default Substation
