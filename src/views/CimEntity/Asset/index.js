import AcceptanceTest from "../AcceptanceTest";
import ElectronAddress from "../ElectronicAddress"
import InUseDate from "../InUserDate";
import Percent from "../Percent";
import LifecycleDate from "../LifecycleDate"
import Status from "../Status"

class Asset extends IdentifiedObject {
    constructor() {
        super();
        this.acceptanceTest = new AcceptanceTest()
        this.critical = new Boolean()
        this.electronAddress = new ElectronAddress()
        this.initialCondition = null
        this.initialLossOfLife = new Percent()
        this.inUseDate = new InUseDate()
        this.inUseState = null
        this.kind = null
        this.lifecycleDate = new LifecycleDate()
        this.lifecycleState = null
        this.lotNumber = null
        this.position = null
        this.retiredReason = null
        this.serialNumber = null
        this.status = new Status()
        this.type = null
        this.utcNumber = null
    }
}

export default Asset