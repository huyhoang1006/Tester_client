import Specimen from "../Specimen";
import Temperature from "../Temperature";

class OldSpecimen extends Specimen {
    constructor() {
        super();
                this.weatherKind = null; // e.g., "active", "inactive"
                this.referenceTemp = new Temperature(); // optional description of the status
                this.windingTemp = new Temperature(); // e.g., "operational", "maintenance", "fault"
                this.workTaskId = null; // reference to the associated work task
    }
}

export default OldSpecimen;
