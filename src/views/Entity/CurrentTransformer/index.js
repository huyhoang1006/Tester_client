import LifecycleDate from "@/views/Cim/LifecycleDate";
import ProductAssetModel from "@/views/Cim/ProductAssetModel";
import AssetPsr from "@/views/Cim/AssetPsr";
import Attachment from '@/views/Entity/Attachment';
import Asset from "@/views/Cim/Asset";
import AssetInfo from "@/views/Cim/AssetInfo";
import OldCurrentTransformerInfo from "@/views/Cim/OldCurrentTransformerInfo";
import CtCoreInfo from "@/views/Cim/CtCoreInfo";
import CtTapInfo from "@/views/Cim/CtTapInfo";

class CurrentTransformerEntity {
    constructor() {
        this.lifecycleDate = new LifecycleDate()
        this.productAssetModel = new ProductAssetModel();
        this.assetPsr = new AssetPsr();
        this.attachment = new Attachment();
        this.asset = new Asset()
        this.assetInfo = new AssetInfo()
        this.oldCurrentTransformerInfo = new OldCurrentTransformerInfo()
        this.CtCoreInfo = new CtCoreInfo() 
        this.CtTapInfo = new CtTapInfo()       
        this.voltage = []
        this.currentFlow = []
        this.seconds = []
        
    }
}

export default CurrentTransformerEntity;