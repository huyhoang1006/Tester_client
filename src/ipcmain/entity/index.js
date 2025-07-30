import * as ipcSubstation from './substation/index.js'
import * as ipcAttachment from './attachment/index.js'
import * as ipcParentOrganisation from './parentOrganization/index.js'
import * as ipcVoltageLevel from './voltageLevel/index.js'
import * as ipcBay from './bay/index.js'
export const active = () => {
    ipcSubstation.active()
    ipcAttachment.active()
    ipcParentOrganisation.active()
    ipcVoltageLevel.active()
    ipcBay.active()
}