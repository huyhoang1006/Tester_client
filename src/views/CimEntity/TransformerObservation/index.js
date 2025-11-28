import IdentifiedObject from "../IdentifiedObject";
import Temperature from "../Temperature";
import Voltage from "../Voltage";
import Status from "../Status";
import Reconditioning from "../Reconditioning";

class TransformerObservation extends IdentifiedObject {
    constructor() {
        super();
                this.bushingTemp = new Temperature();
                this.dga = null;
                this.freqResp = null;
                this.furfuralDp = null;
                this.hotSpotTemp = new Temperature();
                this.oilColor = null;
                this.oilDielectricStrength = new Voltage();
                this.oilIft = null;
                this.oilLevel = null;
                this.oilNeutralizationNumber = null;
                this.pumpVibration = null;
                this.status = new Status();
                this.topOilTemp = new Temperature();
                this.waterContent = null;
                this.transformer = null;
                this.reconditioning = new Reconditioning(); // e.g., "active", "inactive"
    }
}

export default TransformerObservation;