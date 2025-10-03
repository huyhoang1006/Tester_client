import FullTapDto from "../FullTapDto";
import MainTapDto from "../MainTapDto";
import InterTapDto from "../InterTapDto";
class CoreDto {
    constructor() {
        this.mrid = '';
        this.taps = '2';
        this.commonTap = '1';
        this.fullTap = new FullTapDto();
        this.mainTap = new MainTapDto();
        this.interTap = new InterTapDto();
    }
}

export default CoreDto;