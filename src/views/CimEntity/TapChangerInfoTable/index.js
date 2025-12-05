import TapChanger from "../TapChanger";
import Voltage from "../Voltage";

class TapChangerInfoTable {
    constructor() {
        this.mRID = null;
        this.tap = null; // String/Number
        this.voltage = new Voltage();
        this.tapChangerInfo = new TapChanger();
    }
}
export default TapChangerInfoTable;