import Asset from '../../Cim/Asset'
import Attachment from "../Attachment";
import Manufacturer from '@/views/Cim/Manufacturer'
import ProductAssetModel from '@/views/Cim/ProductAssetModel'
import OldPowerTransformerInfo from '@/views/Cim/OldPowerTransformerInfo'
import LifecycleDate from '@/views/Cim/LifecycleDate'
import AssetPsr from '../AssetPsr'
import Other from '../Other'
import ShortCircuitRating from '../ShortCircuitRating'
import ZeroSequenceImpedance from '../ZeroSequenceImpedance'
class TransformerEntity {
    constructor() {
        this.asset = new Asset
        this.assetPsr = new AssetPsr() // Reference to the PSR asset
        this.attachment = new Attachment()
        this.manufacturer = new Manufacturer
        this.productAssetModel = new ProductAssetModel
        this.oldPowerTransformerInfo = new OldPowerTransformerInfo() // Reference to the power transformer info
        this.oldTransformerEndInfo = [] // Reference to the transformer end info
        this.shortCircuitTest = [] // Reference to the short circuit test
        this.lifecycleDate = new LifecycleDate() // Reference to the lifecycle date
        this.frequency = [] // Reference to the frequency
        this.voltageRating = [] // Reference to the voltage ratings
        this.voltage = [] // Reference to the voltage ratings
        this.volume = [] // Reference to the volume ratings
        this.mass = [] // Reference to the mass ratings
        this.apparentPower = [] // Reference to the apparent power ratings
        this.currentFlow = [] // Reference to the current flow ratings
        this.coolingPowerRating = [] // Reference to the cooling power ratings
        this.currentRating = [] // Reference to the current ratings
        this.other = new Other
        this.shortCircuitRating = new ShortCircuitRating() // Reference to the short circuit rating
        this.seconds = [] // Reference to the seconds ratings
        this.temperature = [] // Reference to the temperatures
        this.shortCircuitTestTransformerEndInfo = [] // Reference to the short circuit test transformer end info
        this.basePower = [] // Reference to the base power
        this.baseVoltage = [] // Reference to the base voltage
        this.percent = [] // Reference to the percent ratings
        this.activePower = [] // Reference to the active power ratings
        this.zeroSequenceImpedance = new ZeroSequenceImpedance()
        this.zeroSequenceImpedanceTable = [] // Reference to the zero sequence impedance table
    }
}
export default TransformerEntity