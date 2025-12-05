import Procedure from "../Procedure";
import Asset from "../Asset";

class ProcedureAsset {
    constructor() {
        this.mRID = null;
        this.procedure = new Procedure();
        this.asset = new Asset();
    }
}
export default ProcedureAsset;