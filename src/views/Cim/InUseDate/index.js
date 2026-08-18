class InUseDate {
    constructor() {
        this.mrid = null;
        this.asset_id = null;
        this.date_type = null;
        this.date_value = null;
        this.in_use_date = null;
        this.not_ready_for_use_date = null; // e.g., "commissioning", "decommissioning"
        this.ready_for_use_date = null; // optional description of the lifecycle event
        this.note = null;
        this.created_at = null;
        this.updated_at = null;
    }
}

export default InUseDate;
