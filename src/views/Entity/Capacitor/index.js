import Attachment from "../Attachment";
import Asset from "../../Cim/Asset";
import LifecycleDate from "../../Cim/LifecycleDate";
import AssetPsr from "../../Cim/AssetPsr";
import ProductAssetModel from "../../Cim/ProductAssetModel";
import CapacitorInfo from "@/views/Cim/CapacitorInfo";

class CapacitorEntity {
    constructor() {
        this.capacitor = new CapacitorInfo()
        this.asset = new Asset()
        this.productAssetModel = new ProductAssetModel()
        this.attachment = new Attachment()
        this.lifecycleDate = new LifecycleDate()
        this.assetPsr = new AssetPsr()
        this.frequency = []
        this.voltage = []
        this.currentFlow = []
        this.reactivePower = []
        this.capacitanceCapacitorInfo = []
        this.dissipationFactorCapacitorInfo = []
        this.percent = []
        this.capacitance = []
        this.mass = []
    }
}

export default CapacitorEntity;