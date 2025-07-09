import IdentifiedObject from "../IdentifiedObject"

class Organisation extends IdentifiedObject {
    constructor() {
        super()
        this.electronic_address = null
        this.phone = null
        this.postal_address = null
        this.street_address = null
        this.tax_code = null
        this.parent_organisation = null
    }
}
export default Organisation