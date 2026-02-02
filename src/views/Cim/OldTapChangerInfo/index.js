import TapChangerInfo from "../TapChangerInfo";
class OldTapChangerInfo extends TapChangerInfo {
    constructor() {
        super()
        this.tap_scheme = null
        this.number_of_tap = null
        this.power_transformer_info_id = null
        this.transformer_end_info = null
    }
}

export default OldTapChangerInfo