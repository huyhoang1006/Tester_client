import IOPoint from "../IOPoint";
import MeasurementValueSource from "../MeasurementValueSource";

class MeasurementValue extends IOPoint {
    constructor() {
        super();
                this.sensorAccuracy = null;
                this.timeStamp = new Date();
                this.measurementValueSource = new MeasurementValueSource();
                this.calculationMethodHierarchy = null;
                this.erpPerson = null;
    }
}

export default MeasurementValue;
