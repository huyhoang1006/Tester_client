import ActivityRecord from "../ActivityRecord";

class ConfigurationEvent extends ActivityRecord {
    constructor() {
        super();
        this.effective_date_time = null; // EventType
        this.remark = null; // DateTime
        this.power_system_resource = null; // String
        this.changed_location = null; // IdentifiedObject
        this.changed_asset = null; // String
        this.changed_organisation_role = null; // IdentifiedObject
        this.changed_organisation = null; // String
        this.changed_person_role = null; // String
        this.changed_person = null; // IdentifiedObject
        this.changed_attachment = null; // String
        this.modified_by = null; // String
        this.user_name = null; // String
    }
}

export default ConfigurationEvent;
