import IdentifiedObject from "../IdentifiedObject";

class ActivityRecord extends IdentifiedObject {
    constructor() {
        super();
        this.status = null; // ActivityType
        this.created_date_time = null; // DateTime
        this.reason = null; // String
        this.severity = null; // IdentifiedObject
        this.type = null; // ActivityType
    }
    
}
export default ActivityRecord;