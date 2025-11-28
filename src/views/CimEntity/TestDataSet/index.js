import ProcedureDataSet from "../ProcedureDataSet";

class TestDataSet extends ProcedureDataSet {
    constructor() {
        super();
                this.conclusion = null; // Test ID
                this.specimenId = null; // Test Name
                this.specimenToLabDateTime = new Date(); // Test Description
    }
}
export default TestDataSet;
