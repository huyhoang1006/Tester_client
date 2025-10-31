import Attachment from "../../Entity/Attachment";
import Asset from "../../Cim/Asset";
import LifecycleDate from '../../Cim/LifecycleDate'
import ProductAssetModel from '../../Cim/ProductAssetModel'
import AssetPsr from '../AssetPsr'
import OldBreakerInfo from '../../Cim/OldBreakerInfo'
import BreakerRatingInfo from '../../Cim/BreakerRatingInfo'

class CircuitBreakerEntity {
    constructor() {
        this.asset = new Asset()
        this.productAssetModel = new ProductAssetModel()
        this.attachment = new Attachment()
        this.lifecycleDate = new LifecycleDate()
        this.assetPsr = new AssetPsr()
        this.oldBreakerInfo = new OldBreakerInfo()
        this.breakerRatingInfo = new BreakerRatingInfo()
    }
}

export default CircuitBreakerEntity;