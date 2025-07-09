import * as ipcSubstation from './substation/index.js'
import * as ipcAttachment from './attachment/index.js'
import * as ipcParentOrganisation from './parentOrganization/index.js'
export const active = () => {
    ipcSubstation.active()
    ipcAttachment.active()
    ipcParentOrganisation.active()
}