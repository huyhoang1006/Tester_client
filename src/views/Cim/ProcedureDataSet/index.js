import Document from "../Document";

class ProcedureDataSet extends Document {
    constructor() {
        super();
        this.completed_date_time = null; // Procedure ID
        this.work_task = null; // Procedure Name
        this.asset = null; // Procedure Description
        this.procedure = null; // Procedure Steps
    }
}
export default ProcedureDataSet;
