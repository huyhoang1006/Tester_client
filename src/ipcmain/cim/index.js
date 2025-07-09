import * as ipcParentOrganization from './parentOrganization/index.js'
import * as ipcSubstation from './substation/index.js'
import * as ipcLocation from './location/index.js'
import * as ipcStreetDetail from './streetDetail/index.js'
import * as ipcTownDetail from './townDetail/index.js'
import * as ipcStreetAddress from './streetAddress/index.js'
import * as ipcPerson from './person/index.js'
import * as ipcPersonRole from './personRole/index.js'
import * as ipcElectronicAddress from './electronicAddress/index.js'
import * as ipcTelephoneNumber from './telephoneNumber/index.js'
import * as ipcConfigurationEvent from './configurationEvent/index.js'

export const active = () => {
    ipcParentOrganization.active()
    ipcSubstation.active()
    ipcLocation.active()
    ipcStreetDetail.active()
    ipcTownDetail.active()
    ipcStreetAddress.active()
    ipcPerson.active()
    ipcPersonRole.active()
    ipcElectronicAddress.active()
    ipcTelephoneNumber.active()
    ipcConfigurationEvent.active()
}