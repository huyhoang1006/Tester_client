import CableInfo from "../CableInfo";
import Length from "../Length";

class ConcentricNeutralCableInfo extends CableInfo {
    constructor() {
        super()
                this.diameterOverNeutral = new Length();
                this.neutralStrandCount = null;
                this.neutralStrandGmr = new Length();
                this.neutralStrandRadius = new Length();
                this.neutralStrandRdc = null;
    }
}

export default ConcentricNeutralCableInfo