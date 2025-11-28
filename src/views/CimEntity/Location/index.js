import IdentifiedObject from "../IdentifiedObject";
import ElectronicAddress from "../ElectronicAddress";
import Status from "../Status";

class Location extends IdentifiedObject {
    constructor() {
        super()
                this.direction = null;
                this.electronicAddress = new ElectronicAddress();
                this.geoInfoReference = null;
                this.mainAddress = null;
                this.phone = null;
                this.secondaryAddress = null;
                this.status = new Status();
                this.type = null;
    }
}

export default Location