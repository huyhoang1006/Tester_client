import IdentifiedObject from "../IdentifiedObject"

class Person extends IdentifiedObject {
    constructor() {
        super()
        this.electronic_address = null
        this.first_name = null
        this.landline_phone = null
        this.last_name = null
        this.m_name = null
        this.mobile_phone = null
        this.prefix = null
        this.special_need = null
        this.suffix = null
        this.roles = null
    }
}
export default Person