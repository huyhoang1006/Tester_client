import LifecycleDate from "@/views/Cim/LifecycleDate"
import ProductAssetModel from "@/views/Cim/ProductAssetModel"
import SurgeArrester from "@/views/Cim/SurgeArrester"
import AssetPsr from "@/views/Cim/AssetPsr"
import Attachment from '@/views/Flatten/Attachment';
import OldSurgeArresterInfo from "@/views/Cim/OldSurgeArresterInfo/index"

class SurgeArresterEntity {
    constructor() {
        this.voltage = []
        this.currentFlow = []
        this.seconds = []
        this.oldSurgeArresterInfo = new OldSurgeArresterInfo()
        this.lifecycleDate = new LifecycleDate()
        this.surgeArrester = new SurgeArrester();
        this.assetUnit = []
        this.assetInfoUnit = []
        this.productAssetModel = new ProductAssetModel();
        this.assetPsr = new AssetPsr();
        this.attachment = new Attachment();
    }
}
export default SurgeArresterEntity;