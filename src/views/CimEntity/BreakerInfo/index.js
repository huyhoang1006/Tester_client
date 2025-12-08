import OldSwitchInfo from '../OldSwitchInfo';
import CurrentFlow from '../CurrentFlow'; // Import thêm

class BreakerInfo extends OldSwitchInfo {
    constructor() {
        super();
        this.phaseTrip = new CurrentFlow(); // Sửa null thành new CurrentFlow
    }
}
export default BreakerInfo;