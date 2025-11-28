import BaseWork from "../BaseWork";

class Work extends BaseWork {
    constructor() {
        super();
                this.requestDateTime = new Date(); // Work kind
                this.workOrderNumber = null; // Work priority
                this.erpProjectAccounting = null; // Work status kind
                this.project = null; // Work location
                this.workFlowSteps = null; // Work location
                this.businessCase = null; // Work location
                this.workBillingInfo = null; // Work location
    }
}
export default Work;