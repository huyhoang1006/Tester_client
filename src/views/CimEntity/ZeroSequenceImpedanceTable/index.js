import TransformerEndInfo from "../TransformerEndInfo";
import Percent from "../Percent";
import ZeroSequenceImpedance from "../ZeroSequenceImpedance";

class ZeroSequenceImpedanceTable {
    constructor() {
        this.mRID = null;
        this.transformerEnd = new TransformerEndInfo(); // DB: transformer_end_id
        this.zero = new Percent();
        this.zeroSequenceImpedance = new ZeroSequenceImpedance();
    }
}
export default ZeroSequenceImpedanceTable;