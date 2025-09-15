import Asset from '@/views/Cim/Asset'
import ProductAssetModel from '@/views/Cim/ProductAssetModel'
import ConcentricNeutralCableInfo from '@/views/Cim/ConcentricNeutralCableInfo'
import OldCableInfo from '@/views/Cim/OldCableInfo'
import Attachment from '@/views/Entity/Attachment'
import AssetPsr from '@/views/Cim/AssetPsr'
import LifecycleDate from '@/views/Cim/LifecycleDate'
import TerminalCableInfo from '@/views/Cim/TerminalCableInfo'
import JointCableInfo from '@/views/Cim/JointCableInfo'
import SheathVoltageLimiter from '@/views/Cim/SheathVoltageLimiter'

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
        this.terminal = new TerminalCableInfo()
        this.joint = new JointCableInfo()
        this.sheathVoltageLimiter = new SheathVoltageLimiter()
    }
}

export default PowerCableEntity