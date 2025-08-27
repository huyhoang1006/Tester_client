import IdentifiedObject from "../IdentifiedObject";

class IOPoint extends IdentifiedObject {
    constructor() {
        super();
        this.iopoint_source = null; // Type of I/O point (e.g., digital, analog)
    }
}

export default IOPoint;
