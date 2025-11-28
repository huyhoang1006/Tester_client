import ActivityRecord from "../ActivityRecord";
import PowerSystemResource from "../PowerSystemResource";

class ConfigurationEvent extends ActivityRecord {
    constructor() {
        super();
                this.effectiveDateTime = new Date(); // EventType
                this.remark = null; // DateTime
                this.powerSystemResource = new PowerSystemResource(); // String
                this.changedLocation = null; // IdentifiedObject
                this.changedAsset = null; // String
                this.changedOrganisationRole = null; // IdentifiedObject
                this.changedOrganisation = null; // String
                this.changedPersonRole = null; // String
                this.changedPerson = null; // IdentifiedObject
                this.changedAttachment = null; // String
                this.modifiedBy = null; // String
                this.userName = null; // String
    }
}

export default ConfigurationEvent;
