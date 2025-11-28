import BaseWork from "../BaseWork";
class WorkTask extends BaseWork {
    constructor() {
        super();
                this.completedDateTime = new Date(); // Task ID
                this.contractorCost = null; // Task Name
                this.crewEta = null; // Assigned To
                this.instruction = null; // Due Date
                this.estimatedCompletionTime = new Date(); // Status
                this.schedOverride = null; // Status
                this.startedDateTime = new Date(); // Status
                this.taskKind = null; // Status
                this.toolCost = null; // Status
                this.troubleOrder = null; // Status
                this.switchingPlan = null; // Status
                this.work = new Work(); // Status
    }
}
export default WorkTask;
