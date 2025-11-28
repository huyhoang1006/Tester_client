import IdentifiedObject from "../IdentifiedObject";
import AcceptanceTest from "../AcceptanceTest";
import ElectronicAddress from "../ElectronicAddress";
import InUseDate from "../InUseDate";
import LifecycleDate from "../LifecycleDate";
import Status from "../Status";
import AssetInfo from "../AssetInfo";
import ProductAssetModel from "../ProductAssetModel";
import Location from "../Location";
class Asset extends IdentifiedObject {
    constructor() {
        super();
                this.acceptanceTest = new AcceptanceTest(); // Name of the asset
                this.critical = null; // Type of the asset (e.g., transformer, switch)
                this.electronicAddress = new ElectronicAddress(); // Operational status of the asset
                this.initialCondition = null; // Geographical location of the asset
                this.initialLossOfLife = null; // Date when the asset was installed
                this.inUseDate = new InUseDate(); // Date when the asset was manufactured
                this.inUseState = new Boolean(); // Date when the asset was last inspected
                this.kind = null; // Date when the asset was purchased
                this.lifecycleDate = new LifecycleDate(); // Date when the asset was received
                this.lifecycleState = null; // Date when the asset was removed
                this.lotNumber = null; // Date when the asset was retired
                this.position = null; // Manufacturer of the asset
                this.retiredReason = null; // Model of the asset
                this.serialNumber = null; // Version of the asset
                this.status = new Status(); // Status of the asset (e.g., operational, maintenance)
                this.type = null; // Time when the status was last updated
                this.utcNumber = null; // Unique identifier for the asset
                this.assetInfo = new AssetInfo(); // Usage of the asset (e.g., residential, commercial)
                this.productAssetModel = new ProductAssetModel(); // Description of the asset
                this.location = new Location(); // Associated location of the asset
                this.countryOfOrigin = null; // Associated country of origin of the asset
    }
}

export default Asset;