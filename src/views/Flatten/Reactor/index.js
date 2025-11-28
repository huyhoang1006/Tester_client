import Attachment from "@/views/Flatten/Attachment";
import Asset from "../../Cim/Asset";
import LifecycleDate from "../../Cim/LifecycleDate";
import AssetPsr from "../../Cim/AssetPsr";
import ProductAssetModel from "../../Cim/ProductAssetModel";
import ReactorInfo from "@/views/Cim/ReactorInfo";

class ReactorEntity {
    constructor() {
        this.reactor = new ReactorInfo()
        this.asset = new Asset()
        this.productAssetModel = new ProductAssetModel()
        this.attachment = new Attachment()
        this.lifecycleDate = new LifecycleDate()
        this.assetPsr = new AssetPsr()
        this.inductance = []
        this.frequency = []
        this.voltage = []
        this.currentFlow = []
        this.reactivePower = []
        this.mass = []
    }
}

export default ReactorEntity;