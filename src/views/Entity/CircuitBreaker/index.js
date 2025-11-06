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
import OldOperatingMechanismInfo from '../../Cim/OldOperatingMechanismInfo'
import AssessmentLimitBreakerInfo from "../../Cim/AssessmentLimitBreakerInfo";
import AuxiliaryContactsBreakerInfo from "../../Cim/AuxiliaryContactsBreakerInfo";

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
        this.operatingLifecycleDate = new LifecycleDate()
        this.operatingProductAssetModel = new ProductAssetModel()
        this.operatingMechanismComponent = []
        this.oldOperatingMechanismInfo = new OldOperatingMechanismInfo()
        this.assessmentLimitBreakerInfo = new AssessmentLimitBreakerInfo()
        this.contactResistanceBreakerInfo = []
        this.operatingTimeBreakerInfo = []
        this.contactTravelBreakerInfo = []
        this.auxiliaryContactsBreakerInfo = new AuxiliaryContactsBreakerInfo()
        this.tripOperation = []
        this.closeOperation = []
        this.miscellaneousBreakerInfo = []
        this.coilCharacteristicsBreakerInfo = []
        this.pickupVoltageBreakerInfo = []
        this.motorCharacteristicsBreakerInfo = []
        this.underVoltageReleaseBreakerInfo = []
        this.overcurrentReleaseBreakerInfo = []
        this.resistance = []
        this.capacitance = []
        this.voltage = []
        this.currentFlow = []
        this.second = []
        this.activePower = []
        this.length = []
        this.mass = []
        this.volume = []
        this.temperature = []
        this.frequency = []
        this.quantity = []
        this.pressure = []
    }
}

export default CircuitBreakerEntity;