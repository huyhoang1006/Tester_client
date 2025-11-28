import IdentifiedObject from "../IdentifiedObject";
import ProductAssetModel from "../ProductAssetModel";
class AssetInfo extends IdentifiedObject {
    constructor() {
        super();
                this.manufacturerType = null; // Year of manufacture
                this.productAssetModel = new ProductAssetModel();
    }
}

export default AssetInfo;