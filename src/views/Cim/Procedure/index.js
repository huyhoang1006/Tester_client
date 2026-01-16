import Document from "../Document";

class Procedure extends Document {
    constructor() {
        super();
        this.instruction = null; // e.g., "surgical", "diagnostic"
        this.kind = null; // e.g., "scalpel", "surgical drape"
        this.sequence_number = null; // e.g., "2023-10-01
        this.generic_asset_model = null; // e.g., "Model X"
    }
}

export default Procedure;