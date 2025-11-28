import IdentifiedObject from "../IdentifiedObject"
import Organisation from "../Organisation";
class OrganisationRole extends IdentifiedObject {
    constructor() {
        super()
                this.organisation = new Organisation();
    }
}

export default OrganisationRole