import Document from "../Document";
import Priority from "../Priority";
class BaseWork extends Document {
    constructor() {
        super();
                this.kind = null;
                this.priority = new Priority();
                this.statusKind = null;
                this.workLocation = null;
    }
}

export default BaseWork;