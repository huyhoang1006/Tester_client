import Asset from "../Asset";
import WorkTask from "../WorkTask";

class AssetWorkTask {
    constructor() {
        this.mRID = null;
        this.asset = new Asset();
        this.workTask = new WorkTask();
    }
}
export default AssetWorkTask;