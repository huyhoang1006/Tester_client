import LifecycleDate from "@/views/Cim/LifecycleDate";
import ProductAssetModel from "@/views/Cim/ProductAssetModel";
import AssetPsr from "@/views/Cim/AssetPsr";
import Attachment from '@/views/Entity/Attachment';
import Asset from "@/views/Cim/Asset";
import AssetInfo from "@/views/Cim/AssetInfo";
import OldCurrentTransformerInfo from "@/views/Cim/OldCurrentTransformerInfo";

class CurrentTransformerEntity {
    constructor() {
        this.lifecycleDate = new LifecycleDate()
        this.productAssetModel = new ProductAssetModel();
        this.assetPsr = new AssetPsr();
        this.attachment = new Attachment();
        this.asset = new Asset()
        this.assetInfo = new AssetInfo()
        this.oldCurrentTransformerInfo = new OldCurrentTransformerInfo()
        this.CtCoreInfo = []
        this.CtTapInfo = []       
        this.voltage = []
        this.currentFlow = []
        this.seconds = []
        this.frequency = []
        this.resistance = []
        this.percent = []
        this.apparentPower = []
        this.temperature = []
    }
}

export default CurrentTransformerEntity;