class Status {
    constructor() {
        this.mRID = null;
                this.dateTime = new Date(); // e.g., "active", "inactive"
                this.reason = null;
                this.remark = null; // optional description of the status
                this.value = null; // e.g., "operational", "maintenance", "fault"
    }
}

export default Status;
