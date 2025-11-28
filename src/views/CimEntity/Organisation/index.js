import IdentifiedObject from "../IdentifiedObject"
import ElectronicAddress from "../ElectronicAddress";
import StreetAddress from "../StreetAddress";

class Organisation extends IdentifiedObject {
    constructor() {
        super()
                this.electronicAddress = new ElectronicAddress();
                this.phone = null;
                this.postalAddress = null;
                this.streetAddress = new StreetAddress();
                this.taxCode = null;
                this.parentOrganisation = null;
    }
}
export default Organisation