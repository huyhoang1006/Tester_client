import Person from "../Person";
import Substation from "../Substation";

class PersonSubstation {
    constructor() {
        this.mRID = null;
        this.person = new Person();
        this.substation = new Substation();
    }
}
export default PersonSubstation;