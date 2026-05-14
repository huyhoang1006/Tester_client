import Work from "../Work";

class OldWork extends Work {
    constructor() {
        super();
        this.approval_date = null; // Work kind
        this.tested_by = null; // Work priority
        this.ref_standard = null; // Work status kind
        this.execution_date = null; // Work location
        this.test_method = null; // Work type
        this.asset_id = null; // Work description
    }
}
export default OldWork;
