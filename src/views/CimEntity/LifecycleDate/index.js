class LifecycleDate {
    constructor() {
        this.mRID = null;
                this.installationDate = new Date();
                this.manufacturedDate = new Date(); // e.g., "commissioning", "decommissioning"
                this.purchaseDate = new Date(); // optional description of the lifecycle event
                this.receivedDate = new Date();
                this.removalDate = new Date();
                this.retiredDate = new Date();
    }
}

export default LifecycleDate;