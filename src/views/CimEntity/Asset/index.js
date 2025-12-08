import IdentifiedObject from "../IdentifiedObject";
import AcceptanceTest from "../AcceptanceTest";
import ElectronicAddress from "../ElectronicAddress";
import InUseDate from "../InUseDate";
import LifecycleDate from "../LifecycleDate";
import Status from "../Status";
import AssetInfo from "../AssetInfo";
import ProductAssetModel from "../ProductAssetModel";
import Location from "../Location";
import Percent from "../Percent"; // Import thêm

class Asset extends IdentifiedObject {
    constructor() {
        super();
        this.acceptanceTest = new AcceptanceTest();
        this.critical = null;
        this.electronicAddress = new ElectronicAddress();
        this.initialCondition = null;
        this.initialLossOfLife = new Percent(); // DB: initial_loss_of_life -> percent
        this.inUseDate = new InUseDate();
        this.inUseState = null; // Sửa new Boolean()
        this.kind = null;
        this.lifecycleDate = new LifecycleDate();
        this.lifecycleState = null;
        this.lotNumber = null;
        this.position = null;
        this.retiredReason = null;
        this.serialNumber = null;
        this.status = new Status();
        this.type = null;
        this.utcNumber = null;
        this.assetInfo = new AssetInfo();
        this.productAssetModel = new ProductAssetModel();
        this.location = new Location();
        this.countryOfOrigin = null;
    }
}
export default Asset;