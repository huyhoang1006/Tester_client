

import deleteData from '@/views/TreeNode/Client/ClientSide/mixin/Delete/deleteDataClient'
import showAddBay from '@/views/TreeNode/Client/ClientSide/mixin/Bay/showAddBay'
import showAddBushing from '@/views/TreeNode/Client/ClientSide/mixin/Bushing/showAddBushing'
import showAddCapacitor from '@/views/TreeNode/Client/ClientSide/mixin/Capacitor/showAddCapacitor'
import showAddCircuitBreaker from '@/views/TreeNode/Client/ClientSide/mixin/CircuitBreaker/showAddCircuitBreaker'
import showAddConnector from '@/views/TreeNode/Client/ClientSide/mixin/Disconnector/showAddDisconnector'
import showAddCt from '@/views/TreeNode/Client/ClientSide/mixin/Ct/showAddCt'
import showAddJob from '@/views/TreeNode/Client/ClientSide/mixin/Job/showAddJob'
import showAddOrganisation from '@/views/TreeNode/Client/ClientSide/mixin/Organisation/showAddOrganisation'
import showAddPowerCable from '@/views/TreeNode/Client/ClientSide/mixin/PowerCable/showAddPowerCable'
import showAddReactor from '@/views/TreeNode/Client/ClientSide/mixin/Reactor/showAddReactor'
import showAddRotatingMachine from '@/views/TreeNode/Client/ClientSide/mixin/RotatingMachine/showAddRotatingMachine'
import showAddSubInTree from '@/views/TreeNode/Client/ClientSide/mixin/Subs/showAddSubInTree'
import showAddSubs from '@/views/TreeNode/Client/ClientSide/mixin/Subs/showAddSubs'
import showAddSurgeArrester from '@/views/TreeNode/Client/ClientSide/mixin/SurgeArrester/showAddSurgeArrester'
import showAddTransformer from '@/views/TreeNode/Client/ClientSide/mixin/Transformer/showAddTransformer'
import showAddVt from '@/views/TreeNode/Client/ClientSide/mixin/Vt/showAddVt'
import showAddVoltageLevel from '@/views/TreeNode/Client/ClientSide/mixin/VoltageLevel/showAddVoltageLevel'
import showLocationRoot from '@/views/TreeNode/Client/ClientSide/mixin/showLocationRoot'
import handleDeleteNode from '@/views/TreeNode/Client/ClientSide/mixin/Delete/deleteNode'
import showDataClient from '@/views/TreeNode/Client/ClientSide/mixin/showDataClient'
import fetchChildrenClient from '@/views/TreeNode/Client/mixin/fetchChildrenClient'
import handleAddCommand from '@/views/TreeNode/mixin/handleCommand'
import bayConfirm from '@/views/TreeNode/Client/ClientSide/mixin/Bay/bayConfirm'
import bushingConfirm from '@/views/TreeNode/Client/ClientSide/mixin/Bushing/bushingConfirm'
import capacitorConfirm from '@/views/TreeNode/Client/ClientSide/mixin/Capacitor/capacitorConfirm'
import circuitBreakerConfirm from '@/views/TreeNode/Client/ClientSide/mixin/CircuitBreaker/circuitConfirm'
import disconnectorConfirm from '@/views/TreeNode/Client/ClientSide/mixin/Disconnector/disconnectorConfirm'
import ctConfirm from '@/views/TreeNode/Client/ClientSide/mixin/Ct/ctConfirm'
import jobConfirm from '@/views/TreeNode/Client/ClientSide/mixin/Job/jobConfirm'
import organisationConfirm from '@/views/TreeNode/Client/ClientSide/mixin/Organisation/OrgConfirm'
import powerCableConfirm from '@/views/TreeNode/Client/ClientSide/mixin/PowerCable/powerCableConfirm'
import reactorConfirm from '@/views/TreeNode/Client/ClientSide/mixin/Reactor/reactorConfirm'
import rotatingMachineConfirm from '@/views/TreeNode/Client/ClientSide/mixin/RotatingMachine/rotatingConfirm'
import substationConfirm from '@/views/TreeNode/Client/ClientSide/mixin/Subs/subsConfirm'
import surgeArresterConfirm from '@/views/TreeNode/Client/ClientSide/mixin/SurgeArrester/surgeConfirm'
import transformerConfirm from '@/views/TreeNode/Client/ClientSide/mixin/Transformer/transformerConfirm'
import vtConfirm from '@/views/TreeNode/Client/ClientSide/mixin/Vt/vtConfirm'
import voltageLevelConfirm from '@/views/TreeNode/Client/ClientSide/mixin/VoltageLevel/voltageLevelConfirm'
import confirmDownloadNode from '@/views/TreeNode/Server/mixin/Download/confirmDownloadNode'

//resize
import resizeClient from '@/views/TreeNode/Client/ClientSide/mixin/Resize/resizeClient'
import logClient from '@/views/TreeNode/Client/ClientSide/mixin/Resize/logClient'
import resizeServer from '@/views/TreeNode/Server/mixin/Resize/resizeServer'


//Server
import downloadNode from '@/views/TreeNode/Server/mixin/Download/downloadNode'
import logServer from '@/views/TreeNode/Server/mixin/Resize/logServer.js'
import getOwner from '@/views/TreeNode/Server/mixin/getOwner'
import fetchChildrenServer from '@/views/TreeNode/Server/mixin/fetchChildrenServer'
import breadCum from '@/views/TreeNode/Server/TopBarServer/mixin'
import showOwnerServerRoot from '@/views/TreeNode/Server/mixin/showOwnerServerRoot'



import treeNodeFind from '@/views/TreeNode/mixin/treeNodeFindMixin'
import moveNode from '@/views/TreeNode/mixin/MoveNode/moveNode'
import confirmMove from '@/views/TreeNode/mixin/MoveNode/confirmMove'
import duplicateAsset from '@/views/TreeNode/mixin/Duplicate/duplicateAsset'
import duplicateNode from '@/views/TreeNode/mixin/Duplicate/duplicateNode'
import cleanDtoForDuplicate from '@/views/TreeNode/mixin/Duplicate/cleanDtoForDuplicate'
import buildMoveTreeData from '@/views/TreeNode/mixin/MoveNode/buildMoveTreeData'
import fetchChildrenForMoveMixin from '@/views/TreeNode/mixin/MoveNode/fetchChildrenForMove'
import generateUuid from '@/views/TreeNode/mixin/generateUuid.js'
import openContextMenu from '@/views/TreeNode/mixin/Open/openContextMenu.js'
import _import from '@/views/TreeNode/mixin/Import/import.js'
import importJSONFromContext from '@/views/TreeNode/mixin/Import/importJSONFromContext.js'
import handleOpenNode from '@/views/TreeNode/mixin/Open/handleOpenNode'
import fetchJobsByAssetId from '@/views/TreeNode/mixin/Fetch/fetchJobsByAssetId'
import fetchAssetByPsr from '@/views/TreeNode/mixin/Fetch/fetchAssetByPsr'
import exportTreeToJSON from '@/views/TreeNode/mixin/Export/exportToJSON'
import hideProperties from '@/views/TreeNode/mixin/hideProperties'
import removeTab from '@/views/TreeNode/mixin/removeTab'
import pathMap from '@/views/TreeNode/mixin/pathMap'
import fmeca from '@/views/TreeNode/mixin/fmeca'
import showProperties from '@/views/TreeNode/mixin/showProperties'
import showDataServer from '@/views/TreeNode/Server/mixin/showDataServer'
import checkChildren from '@/views/TreeNode/mixin/checkChildren'
import showPropertiesData from '@/views/TreeNode/mixin/showPropertiesData'
import exportExcel from '@/views/TreeNode/mixin/Export/exportExcel'
import exportJSONCIM from '@/views/TreeNode/mixin/Export/exportJSONCIM'
import exportPDF from '@/views/TreeNode/mixin/Export/exportPDF'
import exportSingleNodeToJSON from '@/views/TreeNode/mixin/Export/exportSingleNodeToJSON'
import exportWord from '@/views/TreeNode/mixin/Export/exportWord'
import exportXML from '@/views/TreeNode/mixin/Export/exportXML'
import importCIM from '@/views/TreeNode/mixin/Import/importCIM'




export default {
    mixins: [treeNodeFind, deleteData, showAddBay, showAddBushing,
        showAddCapacitor, showAddCircuitBreaker, showAddConnector, showAddCt,
        showAddJob, showAddOrganisation, showAddPowerCable, showAddReactor,
        showAddRotatingMachine, showAddSubInTree, showAddSubs, showAddSurgeArrester,
        showAddTransformer, showAddVt, showAddVoltageLevel, showLocationRoot, moveNode,
        confirmMove, handleDeleteNode, duplicateNode, duplicateAsset, showDataClient,
        cleanDtoForDuplicate, bayConfirm, bushingConfirm, capacitorConfirm,
        circuitBreakerConfirm, disconnectorConfirm, ctConfirm, jobConfirm,
        organisationConfirm, powerCableConfirm, reactorConfirm, rotatingMachineConfirm,
        substationConfirm, surgeArresterConfirm, transformerConfirm, vtConfirm,
        voltageLevelConfirm, resizeClient,
        logClient, logServer, resizeServer, confirmDownloadNode, downloadNode,
        buildMoveTreeData, fetchChildrenForMoveMixin, generateUuid, getOwner,
        fetchChildrenServer, fetchChildrenClient, openContextMenu, _import,
        importJSONFromContext, handleAddCommand, handleOpenNode, fetchAssetByPsr,
        fetchJobsByAssetId, exportTreeToJSON, hideProperties, removeTab,
        pathMap, fmeca, showProperties, showDataServer, checkChildren, showPropertiesData,
        breadCum, showOwnerServerRoot, exportExcel, exportJSONCIM, exportPDF, exportSingleNodeToJSON,
        exportWord, exportXML, importCIM
        ]
}