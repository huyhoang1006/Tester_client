import Attachment from "../Attachment";
import Asset from "../../Cim/Asset";
import LifecycleDate from "../../Cim/LifecycleDate";
import AssetPsr from "../../Cim/AssetPsr";
import DisconnectorInfo from "../../Cim/DisconnectorInfo";
import ProductAssetModel from "../../Cim/ProductAssetModel";

class DisconnectorEntity { 
    constructor() {
        this.disconnectorInfo = new DisconnectorInfo()
        this.asset = new Asset()
        this.productAssetModel = new ProductAssetModel()
        this.attachment = new Attachment()
        this.lifecycleDate = new LifecycleDate()
        this.assetPsr = new AssetPsr()
        this.frequency = []
        this.voltage = []
        this.currentFlow = []
        this.seconds = []
    }
}

export default DisconnectorEntity;