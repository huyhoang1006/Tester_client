import IdentifiedObject from "../IdentifiedObject";

class Location extends IdentifiedObject {
    constructor() {
        super()
        this.direction = null
        this.electronic_address = null
        this.geo_info_reference = null
        this.main_address = null
        this.phone = null
        this.secondary_address = null
        this.status = null
        this.type = null
    }
}

export default Location