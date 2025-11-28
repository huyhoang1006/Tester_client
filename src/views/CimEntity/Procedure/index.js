import Document from "../Document";

class Procedure extends Document {
    constructor() {
        super();
                this.instruction = null; // e.g., "surgical", "diagnostic"
                this.kind = null; // e.g., "scalpel", "surgical drape"
                this.sequenceNumber = null; // e.g., "2023-10-01
    }
}

export default Procedure;