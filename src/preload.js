import {userPreload, transformerPreload, fmecaPreload, conditionPreload, circuitPreload, currentTransPreload, voltageTransPreload} from '@/preload/index.js'
import {uploadCustomPreload, manufacturerPreload} from '@/preload/index.js'
import {disconnectorPreload, surgeArresterPreload, powerCablePreload, ownerPreload} from '@/preload/index.js'
import { entityPreload, cimPreload } from '@/preload/index.js'
const {contextBridge} = require('electron')

const userAPI = userPreload.userPreload()
const transformerAPI = transformerPreload.transformerPreload()
const fmecaAPI = fmecaPreload.fmecaPreload()
const conditionAPI = conditionPreload.conditionPreload()
const circuitAPI = circuitPreload.circuitPreload()
const currentTransAPI = currentTransPreload.currentTransPreload()
const voltageTransAPI = voltageTransPreload.voltageTransPreload()
const disconnectorAPI = disconnectorPreload.disconnectorPreload()
const surgeArresterAPI = surgeArresterPreload.surgeArresterPreload()
const powerCablePreAPI = powerCablePreload.powerCablePreload()
const uploadCustomAPI = uploadCustomPreload.uploadCustomPreload()
const manufacturerAPI = manufacturerPreload.munufacturerPreload()
const ownerAPI = ownerPreload.ownerPreload()
const attachmentAPI = entityPreload.attachmentPreload.attachmentPreload()
const parentOrganizationAPI = cimPreload.parentOrganizationPreload.parentOrganizationPreload()
const substationAPI = cimPreload.substationPreload.substationPreload()


const ipcMain = Object.assign(userAPI, transformerAPI, fmecaAPI, conditionAPI, circuitAPI, attachmentAPI, 
    currentTransAPI, voltageTransAPI, disconnectorAPI, surgeArresterAPI, powerCablePreAPI, uploadCustomAPI,
    manufacturerAPI, ownerAPI, parentOrganizationAPI, substationAPI)
contextBridge.exposeInMainWorld('electronAPI', 
    ipcMain 
)
