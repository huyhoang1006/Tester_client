import Asset from "@/views/Cim/Asset";
import OldTapChangerInfo from '@/views/Cim/OldTapChangerInfo'
import productAssetModel from "@/views/Cim/ProductAssetModel";
import RatioTapChanger from '@/views/Cim/RatioTapChanger'
import RatioTapChangerTable from '@/views/Cim/RatioTapChangerTable'
import AssetPsr from '@/views/Cim/AssetPsr'
import SvTapStep from '@/views/Cim/SvTapStep'
class TapChangerEntity {
    constructor() {
        this.asset = new Asset();
        this.productAssetModel = new productAssetModel()
        this.oldTapChangerInfo = new OldTapChangerInfo()
        this.ratioTapChanger = new RatioTapChanger()
        this.ratioTapChangerTable = new RatioTapChangerTable()
        this.ratioTapChangerTablePoint = []
        this.svTapStep = new SvTapStep()
        this.assetPsr = new AssetPsr()
    }
}

export default TapChangerEntity;