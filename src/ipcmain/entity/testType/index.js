import * as ipcTestTypeSurgeArrester from './surgeArrester/index.js'
import * as ipcTestTypePowerCable from './powerCable/index.js'
export const active = () => {
    ipcTestTypeSurgeArrester.active()
    ipcTestTypePowerCable.active()
}