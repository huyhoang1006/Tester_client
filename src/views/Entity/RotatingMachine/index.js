import Attachment from "../../Entity/Attachment";
import Asset from "../../Cim/Asset";
import LifecycleDate from "../../Cim/LifecycleDate";
import AssetPsr from "../../Cim/AssetPsr";
import ProductAssetModel from "../../Cim/ProductAssetModel";
import RotatingMachineInfo from "@/views/Cim/RotatingMachineInfo";

class RotatingMachineEntity {
    constructor() {
        this.rotatingMachine = new RotatingMachineInfo()
        this.asset = new Asset()
        this.productAssetModel = new ProductAssetModel()
        this.attachment = new Attachment()
        this.lifecycleDate = new LifecycleDate()
        this.assetPsr = new AssetPsr()
        this.frequency = []
        this.voltage = []
        this.currentFlow = []
        this.apparentPower = []
    }
}

export default RotatingMachineEntity;