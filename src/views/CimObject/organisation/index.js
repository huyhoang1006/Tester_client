import Organisation from '@/views/CimEntity/Organisation';
import Attachment from '@/views/Flatten/Attachment';
class Organization {
    constructor() {
        this.name = null; // String
        this.mRID = null;
        this.aliasNames = null; // Array of String
        this.description = null; // String
        this.organisation = new Organisation()
        this.attachment = new Attachment();
        this.positionPoints = [];
    }
}

export default Organization;

