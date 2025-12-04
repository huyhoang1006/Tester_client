import Organisation from "../Organisation";
import Person from "../Person";

class OrganisationPerson {
    constructor() {
        this.mRID = null;
        this.organisation = new Organisation();
        this.person = new Person();
    }
}
export default OrganisationPerson;