
import JointDto from "./Joint";
import TerminalDto from "./Terminal";
import SheathVoltageLimiterDto from "./SheathVoltageLimiter";


class AccessoriesDTO {
    constructor() {
        this.joint = new JointDto();
        this.terminal = new TerminalDto();
        this.sheathVoltageLimiter = new SheathVoltageLimiterDto();
    }
}

export default AccessoriesDTO;
