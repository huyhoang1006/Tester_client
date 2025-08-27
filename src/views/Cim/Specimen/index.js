import IdentifiedObject from "../IdentifiedObject";

class Specimen extends IdentifiedObject {
    constructor() {
        super();
        this.ambient_temperature_at_sampling = null;
        this.humidity_at_sampling = null; // e.g., "active", "inactive"
        this.specimen_id = null;
        this.specimen_sample_date_time = null; // optional description of the status
        this.specimen_to_lab_date_time = null; // e.g., "operational", "maintenance", "fault"
        this.asset_test_sample_taker = null; // e.g., "operational", "maintenance", "fault"
    }
}

export default Specimen;
