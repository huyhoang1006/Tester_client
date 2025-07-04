class InUseDate {
    constructor() {
        this.mrid = null;
        this.in_use_date = null;
        this.not_ready_for_use_date = null; // e.g., "commissioning", "decommissioning"
        this.ready_for_use_date = null; // optional description of the lifecycle event
    }
}

export default InUseDate;
