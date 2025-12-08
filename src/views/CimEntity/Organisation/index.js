import IdentifiedObject from "../IdentifiedObject"
import ElectronicAddress from "../ElectronicAddress";
import StreetAddress from "../StreetAddress";
import TelephoneNumber from "../TelephoneNumber";

class Organisation extends IdentifiedObject {
    constructor() {
        super()
        this.electronicAddress = new ElectronicAddress();
        this.phone = new TelephoneNumber(); // Sửa null
        this.postalAddress = null; // Có thể để null hoặc new StreetAddress tùy DB
        this.streetAddress = new StreetAddress();
        this.taxCode = null;
        this.parentOrganisation = null; // Self-reference, để null là ok
    }
}
export default Organisation;