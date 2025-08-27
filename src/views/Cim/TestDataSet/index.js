import ProcedureDataSet from "../ProcedureDataSet";

class TestDataSet extends ProcedureDataSet {
    constructor() {
        super();
        this.conclusion = null; // Test ID
        this.specimen_id = null; // Test Name
        this.specimen_to_lab_date_time = null; // Test Description
    }
}
export default TestDataSet;
