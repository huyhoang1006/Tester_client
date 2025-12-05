import Organisation from "../Organisation";
import PowerSystemResource from "../PowerSystemResource";

class OrganisationPsr {
    constructor() {
        this.mRID = null;
        this.organisation = new Organisation();
        this.psr = new PowerSystemResource();
    }
}
export default OrganisationPsr;