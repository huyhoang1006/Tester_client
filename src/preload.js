import { userPreload } from '@/preload/index.js'
import { importPreload } from '@/preload/index.js'
import { entityPreload, cimPreload, uploadCustomPreload, appOptionPreload } from '@/preload/index.js'

const { contextBridge } = require('electron')

const appOptionAPI = appOptionPreload.appOptionPreload()
const uploadCustomAPI = uploadCustomPreload.uploadCustomPreload()
const userAPI = userPreload.userPreload()
const exportAPI = entityPreload.exportPreload.exportPreload()
const importAPI = importPreload.importPreload()
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
const surgeArresterJobAPI = entityPreload.jobEntityPreload.surgeArresterJob.surgeArresterJobPreload()
const powerCableJobAPI = entityPreload.jobEntityPreload.powerCableJob.powerCableJobPreload()
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
const assetPsrAPI = entityPreload.assetPsrPreload.assetPsrPreload()
const procedureAPI = cimPreload.procedurePreload.procedurePreload()

const ipcMain = Object.assign(userAPI, attachmentAPI, exportAPI, importAPI, uploadCustomAPI, surgeArresterAPI,
    parentOrganizationAPI, substationAPI, locationAPI, streetAddressAPI, streetDetailAPI, townDetailAPI,
    electronicAddressAPI, personAPI, personRoleAPI, telephoneNumberAPI, configurationEventAPI, substationEntityAPI, parentOrganizationEntityAPI,
    positionPointAPI, voltageLevelEntityAPI, voltageLevelAPI, bayEntityAPI, bayAPI, powerSystemResourceAPI, surgeArresterEntityAPI,
    productAssetModelAPI, surgeArresterJobAPI, powerCableJobAPI, oldWorkAPI, assetAPI, transformerEntityAPI, analogAPI,
    stringMeasurementAPI, discreteAPI, valueToAliasAPI, valueAliasSetAPI, powerCableEntityAPI, voltageTransformerEntityAPI, bushingEntityAPI,
    bushingAPI, disconnectorEntityAPI, rotatingMachineEntityAPI, currentTransformerEntityAPI, capacitorEntityAPI,
    breakerEntityAPI, reactorEntityAPI, assetPsrAPI, appOptionAPI, procedureAPI)
contextBridge.exposeInMainWorld('electronAPI',
    ipcMain
)
