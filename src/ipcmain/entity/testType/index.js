import * as ipcTestTypeSurgeArrester from './surgeArrester/index.js'
import * as ipcTestTypePowerCable from './powerCable/index.js'
import * as ipcTestTypeCurrentTransformer from './currentTransformer/index.js'
import * as ipcTestTypeVoltageTransformer from './voltageTransformer/index.js'
import * as ipcTestTypeDisconnector from './disconnector/index.js'
import * as ipcTestTypeCircuitBreaker from './circuitBreaker/index.js'
export const active = () => {
    ipcTestTypeSurgeArrester.active()
    ipcTestTypePowerCable.active()
    ipcTestTypeCurrentTransformer.active()
    ipcTestTypeVoltageTransformer.active()
    ipcTestTypeDisconnector.active()
    ipcTestTypeCircuitBreaker.active()
}
