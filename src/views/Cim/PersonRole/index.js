import IdentifiedObject from "../IdentifiedObject"

class PersonRole extends IdentifiedObject {
    constructor() {
        super()
        this.department = null
        this.position = null
    }
}
export default PersonRole