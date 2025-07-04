import Asset from '../../Cim/Asset'
import Manufacturer from '@/views/Cim/Manufacturer'
import ProductAssetModel from '@/views/Cim/ProductAssetModel'
import PowerTransformerInfo from '@/views/Cim/PowerTransformerInfo'
import TransformerTankInfo from '@/views/Cim/TransformerTankInfo'
class Transformer {
    constructor() {
        this.asset = new Asset
        // this.assetInfo = new AssetInfo
        this.manufacturer = new Manufacturer
        this.productAssetModel = new ProductAssetModel
        this.transformerTankInfo = new TransformerTankInfo() // Reference to the transformer tank info
        this.powerTransformerInfo = new PowerTransformerInfo() // Reference to the power transformer info
        this.transformerEndInfo = [] // Reference to the transformer end info
        this.powerRating = []  // Reference to the cooling power rating
        this.shortCircuitTest = [] // Reference to the short circuit
    }
}
export default Transformer