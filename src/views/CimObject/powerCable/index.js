import TerminalCableInfo from "@/views/CimEntity/TerminalCableInfo/index.js";
import SheathVoltageLimiter from "@/views/CimEntity/SheathVoltageLimiter/index.js";
import Asset from "@/views/CimEntity/Asset/index.js";
import CableInfo from "@/views/CimEntity/CableInfo";
import ConcentricNeutralCableInfo from "@/views/CimEntity/ConcentricNeutralCableInfo";
import JointCableInfo from "@/views/CimEntity/JointCableInfo";

class PowerCable {
    constructor() {
        this.name = null; // String
        this.mRID = null;
        this.aliasNames = null; // Array of String
        this.description = null; // String

        this.accessories = {
            terminal: new TerminalCableInfo(),
            sheathVoltageLimiter: new SheathVoltageLimiter(),
            joint: new JointCableInfo()
        }
        this.assetData = new Asset();
        this.cableInfo = new CableInfo();
        this.concentricNeutral = new ConcentricNeutralCableInfo();
    }
}

export default PowerCable;