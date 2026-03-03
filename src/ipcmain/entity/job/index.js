import * as ipcSurgeArresterJob from './surgeArrester/index.js'
import * as ipcPowerCableJob from './powerCable/index.js'
import * as ipcCurrentTransformerJob from './currentTransformer/index.js'
import * as ipcVoltageTransformerJob from './voltageTransformer/index.js'
import * as ipcCapacitorJob from './capacitor/index.js'
import * as ipcRotatingMachineJob from './rotatingMachine/index.js'
import * as ipcTransformerJob from './transformer/index.js'
import * as ipcCircuitBreakerJob from './circuitBreaker/index.js'
import * as ipcDisconnectorJob from './disconnector/index.js'
import * as ipcReactorJob from './reactor/index.js'

export const active = () => {
    ipcSurgeArresterJob.active()
    ipcPowerCableJob.active()
    ipcCurrentTransformerJob.active()
    ipcVoltageTransformerJob.active()
    ipcCapacitorJob.active()
    ipcRotatingMachineJob.active()
    ipcTransformerJob.active()
    ipcCircuitBreakerJob.active()
    ipcDisconnectorJob.active()
    ipcReactorJob.active()
}