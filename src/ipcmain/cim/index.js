import * as ipcParentOrganization from './parentOrganization/index.js'
import * as ipcSubstation from './substation/index.js'

export const active = () => {
    ipcParentOrganization.active()
    ipcSubstation.active()
}