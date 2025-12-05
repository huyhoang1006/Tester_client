import Organisation from "../Organisation";
import Location from "../Location";

class OrganisationLocation {
    constructor() {
        this.mRID = null;
        this.organisation = new Organisation();
        this.location = new Location();
    }
}
export default OrganisationLocation;