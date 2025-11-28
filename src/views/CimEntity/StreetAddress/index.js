import Status from "../Status";
import StreetDetail from "../StreetDetail";
import TownDetail from "../TownDetail";
class StreetAddress {
    constructor() {
        this.mRID = null
                this.language = null;
                this.poBox = null;
                this.postalCode = null;
                this.status = new Status();
                this.streetDetail = new StreetDetail();
                this.townDetail = new TownDetail();
    }
}
export default StreetAddress