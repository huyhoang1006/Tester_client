import IdentifiedObject from "../IdentifiedObject"
import Person from "../Person";

class PersonRole extends IdentifiedObject {
    constructor() {
        super()
                this.person = new Person();
                this.department = null;
                this.position = null;
    }
}
export default PersonRole