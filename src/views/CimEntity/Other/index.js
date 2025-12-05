import IdentifiedObject from "../IdentifiedObject";
import Mass from "../Mass";
import Volume from "../Volume";
import PowerTransformerInfo from "../PowerTransformerInfo";

class Other extends IdentifiedObject {
    constructor() {
        super();
        this.category = null;
        this.insulationMedium = null;
        this.insulationWeight = new Mass();
        this.insulationVolume = new Volume();
        this.powerTransformerInfo = new PowerTransformerInfo();
        this.insulationKey = null;
        this.tankType = null;
    }
}
export default Other;