import LifecycleDate from "@/views/Cim/LifecycleDate"
import ProductAssetModel from "@/views/Cim/ProductAssetModel"
import SurgeArrester from "@/views/Cim/SurgeArrester"
import AssetPsr from "@/views/Cim/AssetPsr"
import Attachment from '@/views/Entity/Attachment';


class SurgeArresterEntity {
    constructor() {
        this.voltage = []
        this.currentFlow = []
        this.seconds = []
        this.oldSurgeArresterInfo = []
        this.lifecycleDate = new LifecycleDate()
        this.surgeArrester = new SurgeArrester();
        this.productAssetModel = new ProductAssetModel();
        this.assetPsr = new AssetPsr();
        this.attachment = new Attachment();
    }
}
export default SurgeArresterEntity;