import MeasurementValue from "@/views/Cim/MeasurementValue";
import StringMeasurement from "../StringMeasurement";
class StringMeasurementValue extends MeasurementValue {
    constructor() {
        super();
                this.value = null;
                this.stringMeasurement = new StringMeasurement();
    }
}

export default StringMeasurementValue;
