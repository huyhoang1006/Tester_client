import IdentifiedObject from "../IdentifiedObject";
import Status from "../Status";

class ActivityRecord extends IdentifiedObject {
    constructor() {
        super();
                this.status = new Status(); // ActivityType
                this.createdDateTime = new Date(); // DateTime
                this.reason = null; // String
                this.severity = null; // IdentifiedObject
                this.type = null; // ActivityType
    }
    
}
export default ActivityRecord;