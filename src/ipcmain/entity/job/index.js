import * as ipcSurgeArresterJob from './surgeArrester/index.js'
import * as ipcPowerCableJob from './powerCable/index.js'
import * as ipcCurrentTransformerJob from './currentTransformer/index.js'
import * as ipcVoltageTransformerJob from './voltageTransformer/index.js'

export const active = () => {
    ipcSurgeArresterJob.active()
    ipcPowerCableJob.active()
    ipcCurrentTransformerJob.active()
    ipcVoltageTransformerJob.active()
}