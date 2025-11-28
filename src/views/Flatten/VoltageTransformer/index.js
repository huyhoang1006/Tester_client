import LifecycleDate from "@/views/Cim/LifecycleDate"
import ProductAssetModel from "@/views/Cim/ProductAssetModel"
import AssetPsr from "@/views/Cim/AssetPsr"
import Attachment from '@/views/Flatten/Attachment';
import OldPotentialTransformerInfo from "@/views/Cim/OldPotentialTransformerInfo";
import Asset from "@/views/Cim/Asset";
import AssetInfo from "@/views/Cim/AssetInfo";
class VoltageTransformerEntity {
    constructor() {
        this.OldPotentialTransformerInfo = new OldPotentialTransformerInfo()
        this.potentialTransformerTable = []
        this.length = []
        this.voltage = []
        this.frequency = []
        this.apparentPower = []
        this.lifecycleDate = new LifecycleDate()
        this.productAssetModel = new ProductAssetModel();
        this.assetPsr = new AssetPsr();
        this.attachment = new Attachment();
        this.asset = new Asset()
        this.assetInfo = new AssetInfo()
    }
}
export default VoltageTransformerEntity;