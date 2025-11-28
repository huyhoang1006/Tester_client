import Work from "../Work";

class OldWork extends Work {
    constructor() {
        super();
                this.approvalDate = new Date(); // Work kind
                this.testedBy = null; // Work priority
                this.refStandard = null; // Work status kind
                this.executionDate = new Date(); // Work location
                this.testMethod = null; // Work type
                this.assetId = null; // Work description
    }
}
export default OldWork;
