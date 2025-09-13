import Asset from '@/views/Cim/Asset'
import ProductAssetModel from '@/views/Cim/ProductAssetModel'
import ConcentricNeutralCableInfo from '@/views/Cim/ConcentricNeutralCableInfo'
import OldCableInfo from '@/views/Cim/OldCableInfo'
import Attachment from '@/views/Entity/Attachment'
import AssetPsr from '@/views/Cim/AssetPsr'
import LifecycleDate from '@/views/Cim/LifecycleDate'
class PowerCableEntity {
    constructor() {
        this.asset = new Asset()
        this.productAssetModel = new ProductAssetModel()
        this.concentricNeutral = new ConcentricNeutralCableInfo()
        this.oldCableInfo = new OldCableInfo()
        this.attachment = new Attachment()
        this.length = []
        this.area = []
        this.temperature = []
        this.frequency = []
        this.voltage = []
        this.currentFlow = []
        this.lifecycleDate = new LifecycleDate()
        this.assetPsr = new AssetPsr()
    }
}

export default PowerCableEntity