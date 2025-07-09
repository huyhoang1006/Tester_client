import * as ipcCircuit from './cirCuitBreaker/circuitBreaker'
import * as ipcJobCircuit from './cirCuitBreaker/jobCircuit'
import * as ipcTransformer from './transformer'
import * as ipcCurrentTrans from './currentTransformer/currentTrans'
import * as ipcVoltageTrans from './voltageTransformer/voltageTrans'
import * as ipcDisconnector from './disconnector/disconnector'
import * as ipcSurgeArrester from './surgeArrester/surgeArrester.js'
import * as ipcPowerCable from './powerCable/powerCable'
import * as ipcUploadCustom from './uploadCustom/index'
import * as ipcJobCurrent from "./currentTransformer/jobCurrent"
import * as ipcJobVoltage from "./voltageTransformer/jobVoltage"
import * as ipcJobDisconnector from "./disconnector/jobDisconnector"
import * as ipcJobSurge from "./surgeArrester/jobSurge"
import * as ipcJobPower from "./powerCable/jobPower"
import * as ipcJobTransformer from "./transformer/jobTransformer"
import * as ipcUpdateManu from './manufacturer/manufacturer'
import * as ipcOwner from './owner/owner'
import * as ipcCim from './cim/index.js'
import * as ipcEntity from './entity/index.js'

export {ipcCircuit, ipcJobCircuit, ipcTransformer, ipcCurrentTrans, ipcVoltageTrans, ipcDisconnector, ipcSurgeArrester}
export {ipcPowerCable, ipcUploadCustom, ipcJobCurrent, ipcJobVoltage, ipcJobDisconnector, ipcJobSurge, ipcJobPower, ipcJobTransformer}
export {ipcUpdateManu, ipcOwner, ipcCim, ipcEntity}