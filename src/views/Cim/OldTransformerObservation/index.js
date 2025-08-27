import TransformerObservation from "../TransformerObservation";

class OldTransformerObservation extends TransformerObservation {
    constructor() {
        super();
        this.bottom_oil_temp = null;
        this.work_task_id = null; // reference to the associated work task
    }
}

export default OldTransformerObservation;
