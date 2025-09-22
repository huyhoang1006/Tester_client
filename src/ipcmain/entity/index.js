import * as ipcSubstation from './substation/index.js'
import * as ipcAttachment from './attachment/index.js'
import * as ipcParentOrganisation from './parentOrganization/index.js'
import * as ipcVoltageLevel from './voltageLevel/index.js'
import * as ipcBay from './bay/index.js'
import * as ipcSurgeArrester from './surgeArrester/index.js'
import * as ipcTransformer from './transformer/index.js'
import * as ipcTestType from './testType/index.js'
import * as ipcJob from './job/index.js'
import * as ipcPowerCable from './powerCable/index.js'
import * as ipcVoltageTransformer from './voltageTransformer/index.js'
import * as ipcBushing from './bushing/index.js'
import * as ipcDisconnector from './disconnector/index.js'
import * as ipcRotatingMachine from './rotatingMachine/index.js'

export const active = () => {
    ipcSubstation.active()
    ipcAttachment.active()
    ipcParentOrganisation.active()
    ipcVoltageLevel.active()
    ipcSurgeArrester.active()
    ipcBay.active()
    ipcTestType.active()
    ipcJob.active()
    ipcTransformer.active()
    ipcPowerCable.active()
    ipcVoltageTransformer.active()
    ipcBushing.active()
    ipcDisconnector.active()
    ipcRotatingMachine.active()
}