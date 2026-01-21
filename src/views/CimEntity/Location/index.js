import IdentifiedObject from "../IdentifiedObject";
import ElectronicAddress from "../ElectronicAddress";
import streetAddress from "../StreetAddress";
import Phone from "../Phone";
import Status from "../Status";

class Location extends IdentifiedObject {
    constructor() {
        super()
        this.direction = null;
        this.electronicAddress = new ElectronicAddress();
        this.geoInfoReference = null;
        this.mainAddress = new streetAddress();
        this.phone = new Phone();
        this.secondaryAddress = new streetAddress();
        this.status = new Status();
        this.type = null;
    }
}

export default Location