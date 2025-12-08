import IdentifiedObject from "../IdentifiedObject"
import ElectronicAddress from "../ElectronicAddress";
import TelephoneNumber from "../TelephoneNumber";

class Person extends IdentifiedObject {
    constructor() {
        super()
        this.electronicAddress = new ElectronicAddress();
        this.firstName = null;
        this.landlinePhone = new TelephoneNumber(); // Sửa
        this.lastName = null;
        this.mName = null;
        this.mobilePhone = new TelephoneNumber(); // Sửa
        this.prefix = null;
        this.specialNeed = null;
        this.suffix = null;
    }
}
export default Person