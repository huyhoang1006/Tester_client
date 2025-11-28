import IdentifiedObject from "../IdentifiedObject"
import ElectronicAddress from "../ElectronicAddress";

class Person extends IdentifiedObject {
    constructor() {
        super()
                this.electronicAddress = new ElectronicAddress();
                this.firstName = null;
                this.landlinePhone = null;
                this.lastName = null;
                this.mName = null;
                this.mobilePhone = null;
                this.prefix = null;
                this.specialNeed = null;
                this.suffix = null;
    }
}
export default Person