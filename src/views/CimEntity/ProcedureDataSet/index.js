import Document from "../Document";
import WorkTask from "../WorkTask";
import Asset from "../Asset";
import Procedure from "../Procedure";

class ProcedureDataSet extends Document {
    constructor() {
        super();
                this.completedDateTime = new Date(); // Procedure ID
                this.workTask = new WorkTask(); // Procedure Name
                this.asset = new Asset(); // Procedure Description
                this.procedure = new Procedure(); // Procedure Steps
    }
}
export default ProcedureDataSet;
