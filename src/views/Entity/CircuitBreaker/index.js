import Attachment from "../../Entity/Attachment";
import Asset from "../../Cim/Asset";
import LifecycleDate from '../../Cim/LifecycleDate'
import ProductAssetModel from '../../Cim/ProductAssetModel'
import AssetPsr from '../AssetPsr'
import OldBreakerInfo from '../../Cim/OldBreakerInfo'
import BreakerRatingInfo from '../../Cim/BreakerRatingInfo'
import BreakerContactSystemInfo from '../../Cim/BreakerContactSystemInfo'
import BreakerOtherInfo from '../../Cim/BreakerOtherInfo'
import OldOperatingMechanism from '../../Cim/OldOperatingMechanism'
import OperatingMechanismComponent from '../../Cim/OperatingMechanismComponent'
import OldOperatingMechanismInfo from '../../Cim/OldOperatingMechanismInfo'

class CircuitBreakerEntity {
    constructor() {
        this.asset = new Asset()
        this.productAssetModel = new ProductAssetModel()
        this.attachment = new Attachment()
        this.lifecycleDate = new LifecycleDate()
        this.assetPsr = new AssetPsr()
        this.oldBreakerInfo = new OldBreakerInfo()
        this.breakerRatingInfo = new BreakerRatingInfo()
        this.breakerContactSystemInfo = new BreakerContactSystemInfo()
        this.breakerOtherInfo = new BreakerOtherInfo()
        this.oldOperatingMechanism = new OldOperatingMechanism()
        this.operatingMechanismComponent = new OperatingMechanismComponent()
        this.oldOperatingMechanismInfo = new OldOperatingMechanismInfo()
    }
}

export default CircuitBreakerEntity;