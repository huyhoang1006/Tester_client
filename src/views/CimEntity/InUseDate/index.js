class InUseDate {
    constructor() {
        this.mRID = null;
                this.inUseDate = new Date();
                this.notReadyForUseDate = new Date(); // e.g., "commissioning", "decommissioning"
                this.readyForUseDate = new Date(); // optional description of the lifecycle event
    }
}

export default InUseDate;
