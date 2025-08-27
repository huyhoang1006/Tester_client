import Document from "../Document";
class BaseWork extends Document {
    constructor() {
        super();
        this.kind = null;
        this.priority = null;
        this.status_kind = null;
        this.work_location = null;
    }
}

export default BaseWork;