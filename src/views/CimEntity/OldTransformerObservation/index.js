import TransformerObservation from "../TransformerObservation";
import Temperature from "../Temperature";

class OldTransformerObservation extends TransformerObservation {
    constructor() {
        super();
                this.bottomOilTemp = new Temperature();
                this.humidity = null;
                this.weather = null;
                this.ambientTemp = new Temperature();
                this.referenceTemp = new Temperature();
                this.windingTemp = new Temperature();
                this.workTaskId = null; // reference to the associated work task
    }
}

export default OldTransformerObservation;
