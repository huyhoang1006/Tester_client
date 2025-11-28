import Voltage from "../Voltage";

class TerminalCableInfo {
    constructor() {
        this.mRID = null;            // String (unique)
                this.ratedU = new Voltage(); // Voltage (FK -> voltage.mrid)
                this.bil = new Voltage(); // Voltage (FK -> voltage.mrid)
                this.bsl = null; // Frequency (FK -> frequency.mrid)
                this.type = null; // String (cable type)
                this.connectorType = null; // String (connector type)
                this.serviceCondition = null; // String (service condition)
                this.cableInfoId = null; // CableInfo (FK -> cable_info.mrid)
                this.class = null; // String (class)
    }
}

export default TerminalCableInfo;
