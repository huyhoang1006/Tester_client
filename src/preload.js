import { userPreload, transformerPreload, fmecaPreload, conditionPreload, circuitPreload, currentTransPreload, voltageTransPreload } from '@/preload/index.js'
import { uploadCustomPreload, manufacturerPreload, exportPreload } from '@/preload/index.js'
import { disconnectorPreload, surgeArresterPreload, powerCablePreload, ownerPreload } from '@/preload/index.js'
import { entityPreload, cimPreload } from '@/preload/index.js'

const { contextBridge } = require('electron')

const userAPI = userPreload.userPreload()
const transformerAPI = transformerPreload.transformerPreload()
const fmecaAPI = fmecaPreload.fmecaPreload()
const conditionAPI = conditionPreload.conditionPreload()
const circuitAPI = circuitPreload.circuitPreload()
const currentTransAPI = currentTransPreload.currentTransPreload()
const voltageTransAPI = voltageTransPreload.voltageTransPreload()
const disconnectorAPI = disconnectorPreload.disconnectorPreload()
const powerCablePreAPI = powerCablePreload.powerCablePreload()
const uploadCustomAPI = uploadCustomPreload.uploadCustomPreload()
const manufacturerAPI = manufacturerPreload.munufacturerPreload()
const ownerAPI = ownerPreload.ownerPreload()
const exportAPI = exportPreload.exportPreload()
const attachmentAPI = entityPreload.attachmentPreload.attachmentPreload()
const parentOrganizationAPI = cimPreload.parentOrganizationPreload.parentOrganizationPreload()
const substationAPI = cimPreload.substationPreload.substationPreload()
const locationAPI = cimPreload.locationPreload.locationPreload()
const streetAddressAPI = cimPreload.streetAddressPreload.streetAddressPreload()
const streetDetailAPI = cimPreload.streetDetailPreload.streetDetailPreload()
const townDetailAPI = cimPreload.townDetailPreload.townDetailPreload()
const electronicAddressAPI = cimPreload.electronicAddressPreload.electronicAddressPreload()
const personAPI = cimPreload.personPreload.personPreload()
const personRoleAPI = cimPreload.personRolePreload.personRolePreload()
const telephoneNumberAPI = cimPreload.telephoneNumberPreload.telephoneNumberPreload()
const configurationEventAPI = cimPreload.configurationEventPreload.configurationEventPreload()
const substationEntityAPI = entityPreload.substationPreload.substationEntityPreload()
const parentOrganizationEntityAPI = entityPreload.parentOrganizationPreload.parentOrganizationEntityPreload()
const positionPointAPI = cimPreload.positionPointPreload.positionPointPreload()
const voltageLevelEntityAPI = entityPreload.voltageLevelPreload.voltageLevelEntityPreload()
const bayEntityAPI = entityPreload.bayPreload.bayEntityPreload()
const bayAPI = cimPreload.bayPreload.bayPreload()
const voltageLevelAPI = cimPreload.voltageLevelPreload.voltageLevelPreload()
const powerSystemResourceAPI = cimPreload.powerSystemResourcePreload.powerSystemResourcePreload()
const surgeArresterEntityAPI = entityPreload.surgeArresterEntityPreload.surgeArresterEntityPreload()
const transformerEntityAPI = entityPreload.transformerEntityPreload.transformerEntityPreload()
const surgeArresterAPI = cimPreload.SurgeArresterPreload.surgeArresterPreload()
const productAssetModelAPI = cimPreload.productAssetModelPreload.productAssetModelPreload()
const testTypeSurgeArresterAPI = entityPreload.testTypePreload.testTypeSurgeArresterPreload.testTypeSurgeArresterPreload()
const testTypeTransformerAPI = entityPreload.testTypePreload.testTypeTransformerPreload.testTypeTransformerPreload()
const surgeArresterJobAPI = entityPreload.jobEntityPreload.surgeArresterJob.surgeArresterJobPreload()
const powerCableJobAPI = entityPreload.jobEntityPreload.powerCableJob.powerCableJobPreload()
const testTypePowerCableAPI = entityPreload.testTypePreload.testTypePowerCablePreload.testTypePowerCablePreload()
const oldWorkAPI = cimPreload.oldWorkPreload.oldWorkPreload()
const assetAPI = cimPreload.assetPreload.assetPreload()
const analogAPI = cimPreload.analogPreload.analogPreload()
const stringMeasurementAPI = cimPreload.stringMeasurementPreload.stringMeasurementPreload()
const discreteAPI = cimPreload.discretePreload.discretePreload()
const valueToAliasAPI = cimPreload.valueToAliasPreload.valueToAliasPreload()
const valueAliasSetAPI = cimPreload.valueAliasSetPreload.valueAliasSetPreload()
const powerCableEntityAPI = entityPreload.powerCableEntityPreload.powerCableEntityPreload()
const voltageTransformerEntityAPI = entityPreload.voltageTransformerEntityPreload.voltageTransformerEntityPreload()
const bushingEntityAPI = entityPreload.bushingEntityPreload.bushingEntityPreload()
const bushingAPI = cimPreload.bushingPreload.bushingPreload()
const disconnectorEntityAPI = entityPreload.disconnectorEntityPreload.disconnectorEntityPreload()
const rotatingMachineEntityAPI = entityPreload.rotatingMachineEntityPreload.rotatingMachineEntityPreload()
const capacitorEntityAPI = entityPreload.capacitorEntityPreload.capacitorEntityPreload()
const currentTransformerEntityAPI = entityPreload.currentTransformerEntityPreload.currentTransformerEntityPreload()
const breakerEntityAPI = entityPreload.breakerEntityPreload.breakerEntityPreload()
const reactorEntityAPI = entityPreload.reactorEntityPreload.reactorEntityPreload()



const ipcMain = Object.assign(userAPI, transformerAPI, fmecaAPI, conditionAPI, circuitAPI, attachmentAPI,
    currentTransAPI, voltageTransAPI, disconnectorAPI, surgeArresterAPI, powerCablePreAPI, uploadCustomAPI,
    manufacturerAPI, ownerAPI, parentOrganizationAPI, substationAPI, locationAPI, streetAddressAPI, streetDetailAPI, townDetailAPI,
    electronicAddressAPI, personAPI, personRoleAPI, telephoneNumberAPI, configurationEventAPI, substationEntityAPI, parentOrganizationEntityAPI,
    positionPointAPI, voltageLevelEntityAPI, voltageLevelAPI, bayEntityAPI, bayAPI, powerSystemResourceAPI, surgeArresterEntityAPI,
    productAssetModelAPI, testTypeSurgeArresterAPI, testTypeTransformerAPI, surgeArresterJobAPI, powerCableJobAPI, oldWorkAPI, assetAPI, transformerEntityAPI, analogAPI,
    stringMeasurementAPI, discreteAPI, valueToAliasAPI, valueAliasSetAPI, powerCableEntityAPI, voltageTransformerEntityAPI, bushingEntityAPI,
    bushingAPI, disconnectorEntityAPI, rotatingMachineEntityAPI, currentTransformerEntityAPI, testTypePowerCableAPI, capacitorEntityAPI,
    breakerEntityAPI, reactorEntityAPI)
contextBridge.exposeInMainWorld('electronAPI',
    ipcMain
)
