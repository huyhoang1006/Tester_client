import * as ipcSurgeArresterJob from './surgeArrester/index.js'
import * as ipcPowerCableJob from './powerCable/index.js'

export const active = () => {
    ipcSurgeArresterJob.active()
    ipcPowerCableJob.active()
}