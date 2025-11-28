import IdentifiedObject from "../IdentifiedObject";
import Temperature from "../Temperature";

class Specimen extends IdentifiedObject {
    constructor() {
        super();
                this.ambientTemperatureAtSampling = new Temperature();
                this.humidityAtSampling = null; // e.g., "active", "inactive"
                this.specimenId = null;
                this.specimenSampleDateTime = new Date(); // optional description of the status
                this.specimenToLabDateTime = new Date(); // e.g., "operational", "maintenance", "fault"
                this.assetTestSampleTaker = null; // e.g., "operational", "maintenance", "fault"
    }
}

export default Specimen;
