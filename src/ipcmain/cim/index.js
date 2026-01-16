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
import * as ipcPositionPoint from './positionPoint/index.js'
import * as ipcVoltageLevel from './voltageLevel/index.js'
import * as ipcBay from './bay/index.js'
import * as ipcVoltage from './voltage/index.js'
import * as ipcBaseVoltage from './baseVoltage/index.js'
import * as ipcPowerSystemResource from './powerSystemResource/index.js'
import * as ipcProductAssetModel from './productAssetModel/index.js'
import * as ipcSurgeArrester from './surgeArrester/index.js'
import * as ipcOldWork from './oldWork/index.js'
import * as ipcAsset from './asset/index.js'
import * as ipcAnalog from './analog/index.js'
import * as ipcStringMeasurement from './stringMeasurement/index.js'
import * as ipcDiscrete from './discrete/index.js'
import * as ipcValueToAlias from './valueToAlias/index.js'
import * as ipcValueAliasSet from './valueAliasSet/index.js'
import * as ipcBushing from './bushing/index.js'
import * as ipcProcedure from './procedure/index.js'


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
    ipcPositionPoint.active()
    ipcVoltageLevel.active()
    ipcBay.active()
    ipcVoltage.active()
    ipcBaseVoltage.active()
    ipcPowerSystemResource.active()
    ipcSurgeArrester.active()
    ipcProductAssetModel.active()
    ipcOldWork.active()
    ipcAsset.active()
    ipcAnalog.active()
    ipcStringMeasurement.active()
    ipcDiscrete.active()
    ipcValueToAlias.active()
    ipcValueAliasSet.active()
    ipcBushing.active()
    ipcProcedure.active()
}