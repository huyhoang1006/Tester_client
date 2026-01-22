import VoltageLevel from "../../CimEntity/VoltageLevel";

class VoltageLevelCimObject {
    constructor() {
        this.name = null; // String
        this.mRID = null;
        this.aliasNames = null; // Array of String
        this.description = null; // String
        this.voltageLevel = new VoltageLevel();
    }
}

export default VoltageLevelCimObject;