import TapChanger from "../TapChanger";

class RatioTapChanger extends TapChanger {
    constructor() {
        super()
        this.step_voltage_increment = null
        this.tcul_control_mode = null
        this.transformer_end = null
        this.ratio_tap_changer_table = null
    }
}

export default RatioTapChanger