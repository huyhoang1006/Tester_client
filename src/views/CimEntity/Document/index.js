import IdentifiedObject from "../IdentifiedObject";
import ElectronicAddress from "../ElectronicAddress";
import Status from "../Status";
import Approver from "../Approver";

class Document extends IdentifiedObject{
    constructor() {
        super();
                this.type = null;
                this.createdDateTime = new Date();
                this.lastModifiedDateTime = new Date();
                this.revisionNumber = null;
                this.electronicAddress = new ElectronicAddress();
                this.subject = null;
                this.title = null;
                this.docStatus = null;
                this.status = new Status();
                this.authorName = null;
                this.comment = null;
                this.author = null;
                this.editor = null;
                this.issuer = null;
                this.approver = new Approver();
    }
}

export default Document;