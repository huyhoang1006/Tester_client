/* eslint-disable */

// ─── API ────────────────────────────────────────────────────────────────────
import * as demoAPI            from '@/api/demo/index.js'
import * as voltageAPI         from '@/api/demo/VoltageTransformer.js'
import * as currentAPI         from '@/api/demo/CurrentTransformer.js'
import * as circuitBreakerAPI  from '@/api/demo/CircuitBreaker.js'
import * as disconnectorAPI    from '@/api/demo/Disconnector.js'
import * as surgeArresterAPI   from '@/api/demo/SurgeArrester.js'
import * as transformerAPI     from '@/api/demo/Transformer.js'
import * as bushingAPI         from '@/api/demo/Bushing.js'
import * as voltageTransformerJobAPI from '@/api/demo/VoltageTransformerJob.js'
import * as currentTransformerJobAPI from '@/api/demo/CurrentTransformerJob.js'
import * as circuitBreakerJobAPI from '@/api/demo/CircuitBreakerJob.js'
import * as surgeArresterJobAPI from '@/api/demo/SurgeArresterJob.js'
import * as disconnectorJobAPI from '@/api/demo/DisconnectorJob.js'
import * as transformerJobAPI from '@/api/demo/TransformerJob.js'
import * as voltageLevelAPI from '@/api/demo/VoltageLevel.js'
import * as substationAPI from '@/api/demo/Substation.js'
import * as bayAPI from '@/api/demo/Bay.js'

// ─── Entity ↔ DTO mappers ─────────────────────────────────────────────────────
import * as voltageTransformerMapping from '@/views/Mapping/VoltageTransformer/index.js'
import * as currentTransformerMapping from '@/views/Mapping/CurrentTransformer/index.js'
import * as transformerMapping        from '@/views/Mapping/Transformer/index.js'
import * as circuitBreakerMapping     from '@/views/Mapping/Breaker/index.js'
import * as disconnectorMapping       from '@/views/Mapping/Disconnector/index.js'
import * as surgeArresterMapping      from '@/views/Mapping/SurgeArrester/index.js'
import * as bushingMapping            from '@/views/Mapping/Bushing/index.js'
import * as PowerCableMapping         from '@/views/Mapping/PowerCable/index'
import * as voltageTransformerJobMapping from '@/views/Mapping/VoltageTransformerJob/index.js'
import * as currentTransformerJobMapping from '@/views/Mapping/CurrentTransformerJob/index.js'
import * as circuitBreakerJobMapping from '@/views/Mapping/CircuitBreakerJob/index.js'
import * as surgeArresterJobMapping from '@/views/Mapping/SurgerArresterJob/index.js'
import * as disconnectorJobMapping from '@/views/Mapping/DisconnectorJob/index.js'
import * as transformerJobMapping from '@/views/Mapping/TransformerJob/index.js'

// ─── DTO → Server mappers ─────────────────────────────────────────────────────
import * as transformerMappingServer        from '@/views/Mapping/ServerToDTO/Transformer/index.js'
import * as voltageTransformerMappingServer from '@/views/Mapping/ServerToDTO/VoltageTransformer/index.js'
import * as currentTransformerMappingServer from '@/views/Mapping/ServerToDTO/CurrentTransformer/index.js'
import * as circuitBreakerMappingServer     from '@/views/Mapping/ServerToDTO/CircuitBreaker/index.js'
import * as disconnectorMappingServer       from '@/views/Mapping/ServerToDTO/Disconnector/index.js'
import * as surgeArresterMappingServer      from '@/views/Mapping/ServerToDTO/SurgeArrester/index.js'
import * as bushingMappingServer            from '@/views/Mapping/ServerToDTO/Bushing/index.js'
import * as PowerCableServerMapper          from '@/views/Mapping/ServerToDTO/PowerCable/index.js'

// ─── Entity → Server (luồng cũ: Substation/VoltageLevel/Bay) ──────────────────
import { mapSubstationEntityToServer }   from '@/utils/MapperClient/mapSubstationToServer.js'
import { mapVoltageLevelEntityToServer } from '@/utils/MapperClient/mapVoltageLevelToServer.js'
import { mapBayEntityToServer }          from '@/utils/MapperClient/mapBayToServer.js'

// ───JOB DTO → Server (dùng chung cho upload & submit)──────────────────────────────
import * as voltageTransformerJobMappingServer from '@/views/Mapping/ServerToDTO/VoltageTransformerJob/index.js'
import * as currentTransformerJobMappingServer from '@/views/Mapping/ServerToDTO/CurrentTransformerJob/index.js'
import * as circuitBreakerJobMappingServer from '@/views/Mapping/ServerToDTO/CircuitBreakerJob/index.js'
import * as surgeArresterJobMappingServer from '@/views/Mapping/ServerToDTO/SurgeArresterJob/index.js'
import * as disconnectorJobMappingServer from '@/views/Mapping/ServerToDTO/DisconnectorJob/index.js'
import * as transformerJobMappingServer from '@/views/Mapping/ServerToDTO/TransformerJob/index.js'

/**
 * Mixin chứa các hàm xử lý upload từng loại entity lên server.
 *
 * Quy ước chung:
 *  - Lấy entity từ local DB qua window.electronAPI.getXxxEntityByMrid(mrid, ...)
 *  - entity → DTO → payload server (mapEntityToDto → mapDtoToServer)
 *  - ownerType resolve từ parentNode.mode (bay → BAY, substation → SUBSTATION, voltageLevel → VOLTAGE_LEVEL)
 *  - Asset thiết bị (VT/CT/CB/Disconnector/SurgeArrester) gửi node.parentId trực tiếp.
 */
export default {
    methods: {

        // ═══════════════════════════════════════════════════════════════════════
        //  CONTAINER: Substation / VoltageLevel / Bay
        // ═══════════════════════════════════════════════════════════════════════

        async processUploadSubstation(node) {
            try {
                const userId = this.$store.state.user.user_id
                const entityRes = await window.electronAPI.getSubstationEntityByMrid(node.mrid, userId, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Local substation data not found.')
                if (!node.parentId) throw new Error('Cannot upload substation without parent organisation.')

                const parentNode = this.findUploadParentNode(node)
                const serverPayload = mapSubstationEntityToServer(entityRes.data, parentNode)
                const response = await demoAPI.createSubstation(serverPayload, node.parentId)

                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Substation "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Substation')
            }
        },

        async processUploadVoltageLevel(node) {
            try {
                const entityRes = await window.electronAPI.getVoltageLevelEntityByMrid(node.mrid)
                if (!entityRes.success || !entityRes.data) throw new Error('Local voltage level data not found.')
                if (!node.parentId) throw new Error('Cannot upload voltage level without parent substation.')

                const parentNode = this.findUploadParentNode(node)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                if (parentNode?.mode !== 'substation') {
                    throw new Error(`VoltageLevel parent must be Substation. Current parent mode: ${parentNode?.mode}`)
                }

                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return

                const serverPayload = mapVoltageLevelEntityToServer(entityRes.data, null)
                const response = await voltageLevelAPI.createVoltageLevel(serverPayload, node.parentId)
                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload VoltageLevel "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'VoltageLevel')
            }
        },

        async processUploadBay(node) {
            try {
                const entityRes = await window.electronAPI.getBayEntityByMrid(node.mrid)
                if (!entityRes.success || !entityRes.data) throw new Error('Local bay data not found.')
                if (!node.parentId) throw new Error('Cannot upload bay without parent.')
                const parentNode = this.findUploadParentNode(node)
                if(!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if(!signParent) {
                    return;
                } else {
                    let ownerType = this.normalizeOwnerTypeCode(parentNode?.mode)
                    if(!ownerType) {
                        throw new Error(`Cannot resolve ownerType for parent node with mode: ${parentNode?.mode}`)
                    } else {
                        const serverPayload = mapBayEntityToServer(entityRes.data)
                        this.clearLocalGeneratedMrid(serverPayload)
                        const response = await bayAPI.createBay(serverPayload, node.parentId, ownerType)
                        await this.syncUploadedNodeServerId(node, response)
                        this.$message.success(`Upload Bay "${node.name}" successfully!`)
                        return response
                    }
                }
            } catch (error) {
                this._handleUploadError(error, 'Bay')
            }
        },

        // ═══════════════════════════════════════════════════════════════════════
        //  ASSET: PowerCable / Transformer
        // ═══════════════════════════════════════════════════════════════════════

        async processUploadPowerCable(node) {
            try {
                const entityRes = await window.electronAPI.getPowerCableEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Local data not found.')

                const dto = PowerCableMapping.mapEntityToDto(entityRes.data)
                if (!dto.properties.apparatus_id && !dto.properties.serial_no) {
                    dto.properties.apparatus_id = node.name || 'Unnamed Asset'
                }
                const serverPayload = PowerCableServerMapper.mapDtoToServer(dto)

                const parentNode = this.findUploadParentNode(node)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')

                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)
                if (!ownerType) throw new Error(`Cannot resolve ownerType for parent node with mode: ${parentNode?.mode}`)

                const response = await demoAPI.createPowerCableCim(serverPayload, node.parentId, ownerType)
                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload PowerCable successfully to ${ownerType} ID: ${node.parentId}`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'PowerCable')
            }
        },

        async processUploadTransformer(node) {
            try {
                const entityRes = await window.electronAPI.getTransformerEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Local transformer data not found.')
                if (!node.parentId) throw new Error('Cannot upload transformer without parent.')

                const parentNode = this.findUploadParentNode(node)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = transformerMapping.transformerEntityToDto(entityRes.data)
                const serverPayload = transformerMappingServer.mapDtoToServer(dto, ownerType)
                const response = await transformerAPI.createTransformer(serverPayload)

                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Transformer "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Transformer')
            }
        },

        // ═══════════════════════════════════════════════════════════════════════
        //  ASSET thiết bị (gửi node.parentId trực tiếp + ownerType trong body)
        // ═══════════════════════════════════════════════════════════════════════

        async processUploadVoltageTransformer(node) {
            try {
                const entityRes = await window.electronAPI.getVoltageTransformerEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Voltage transformer data not found.')
                if (!node.parentId) throw new Error('Cannot upload voltage transformer without parent.')

                const parentNode = this.findUploadParentNode(node)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)
                if (!ownerType) throw new Error(`Cannot resolve ownerType for parent node with mode: ${parentNode?.mode}`)

                const dto = voltageTransformerMapping.mapEntityToDto(entityRes.data)
                const serverPayload = voltageTransformerMappingServer.mapDtoToServer(dto, ownerType)
                const response = await voltageAPI.createVoltageTransformer(serverPayload, node.parentId, ownerType)

                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Voltage Transformer "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Voltage Transformer')
            }
        },

        async processUploadCurrentTransformer(node) {
            try {
                const entityRes = await window.electronAPI.getCurrentTransformerEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Current transformer data not found.')
                if (!node.parentId) throw new Error('Cannot upload current transformer without parent.')

                const parentNode = this.findUploadParentNode(node)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)
                if (!ownerType) throw new Error(`Cannot resolve ownerType for parent node with mode: ${parentNode?.mode}`)

                const dto = currentTransformerMapping.mapEntityToDto(entityRes.data)
                const serverPayload = currentTransformerMappingServer.mapDtoToServer(dto, ownerType)
                const response = await currentAPI.createCurrentTransformer(serverPayload, node.parentId, ownerType)
                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Current Transformer "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Current Transformer')
            }
        },

        async processUploadCircuitBreaker(node) {
            try {
                const entityRes = await window.electronAPI.getBreakerEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Circuit breaker data not found.')
                if (!node.parentId) throw new Error('Cannot upload circuit breaker without parent.')

                const parentNode = this.findUploadParentNode(node)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)
                if (!ownerType) throw new Error(`Cannot resolve ownerType for parent node with mode: ${parentNode?.mode}`)

                const dto = circuitBreakerMapping.mapEntityToDto(entityRes.data)
                const serverPayload = circuitBreakerMappingServer.mapDtoToServer(dto, ownerType)
                const response = await circuitBreakerAPI.createCircuitBreaker(serverPayload, node.parentId, ownerType)

                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Circuit Breaker "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Circuit Breaker')
            }
        },

        async processUploadDisconnector(node) {
            try {
                const entityRes = await window.electronAPI.getDisconnectorEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Disconnector data not found.')
                if (!node.parentId) throw new Error('Cannot upload disconnector without parent.')

                const parentNode = this.findUploadParentNode(node)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = disconnectorMapping.disconnectorEntityToDto(entityRes.data)
                const serverPayload = disconnectorMappingServer.mapDtoToServer(dto, ownerType)
                const response = await disconnectorAPI.createDisconnector(serverPayload)

                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Disconnector "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Disconnector')
            }
        },

        async processUploadSurgeArrester(node) {
            try {
                const entityRes = await window.electronAPI.getSurgeArresterEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Surge arrester data not found.')
                if (!node.parentId) throw new Error('Cannot upload surge arrester without parent.')

                const parentNode = this.findUploadParentNode(node)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = surgeArresterMapping.surgeArresterEntityToDto(entityRes.data)
                const serverPayload = surgeArresterMappingServer.mapDtoToServer(dto, ownerType)
                const response = await surgeArresterAPI.createSurgeArrester(serverPayload, node.parentId, ownerType)

                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Surge Arrester "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Surge Arrester')
            }
        },

        async processUploadBushing(node) {
            try {
                const entityRes = await window.electronAPI.getBushingEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Local bushing data not found.')
                if (!node.parentId) throw new Error('Cannot upload bushing without parent.')

                const parentNode = this.findUploadParentNode(node)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')

                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return

                const ownerType = this.normalizeOwnerTypeCode(parentNode?.mode)
                if (!ownerType) {
                    throw new Error(`Cannot resolve ownerType for parent node with mode: ${parentNode?.mode}`)
                }

                const dto = bushingMapping.mapEntityToDto(entityRes.data)
                dto.psrId = node.parentId
                const serverPayload = bushingMappingServer.mapDtoToServer(dto, ownerType)
                const response = await bushingAPI.createBushing(serverPayload)

                console.log('[Upload Bushing] Response:', response)
                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Bushing "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Bushing')
            }
        },

        // ═══════════════════════════════════════════════════════════════════════
        // JOB: Mapping DTO → Server (dùng chung cho upload & submit)
        // ═══════════════════════════════════════════════════════════════════════

        async processUploadVoltageTransformerJob(node) {
            try {
                const entityRes = await window.electronAPI.getVoltageTransformerJobByMrid(node.mrid)
                if (!entityRes.success || !entityRes.data) throw new Error('Voltage transformer job data not found.')
                if (!node.parentId) throw new Error('Cannot upload voltage transformer job without parent.')

                const parentNode = this.findUploadParentNode(node)
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = voltageTransformerJobMapping.JobEntityToDto(entityRes.data)
                const serverPayload = voltageTransformerJobMappingServer.mapDtoToServer(dto, ownerType)
                const response = await voltageTransformerJobAPI.createVoltageTransformerJob(serverPayload, node.parentId)

                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Voltage Transformer Job "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Voltage Transformer Job')
            }
        },

        async processUploadCurrentTransformerJob(node) {
            try {
                const entityRes = await window.electronAPI.getCurrentTransformerJobByMrid(node.mrid)
                if (!entityRes.success || !entityRes.data) throw new Error('Current transformer job data not found.')
                if (!node.parentId) throw new Error('Cannot upload current transformer job without parent.')

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = currentTransformerJobMapping.JobEntityToDto(entityRes.data)
                const serverPayload = currentTransformerJobMappingServer.mapDtoToServer(dto, ownerType)
                const response = await currentTransformerJobAPI.createCurrentTransformerJob(serverPayload, node.parentId)

                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Current Transformer Job "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Current Transformer Job')
            }
        },

        async processUploadCircuitBreakerJob(node) {
            try {
                const entityRes = await window.electronAPI.getCircuitBreakerJobByMrid(node.mrid)
                if (!entityRes.success || !entityRes.data) throw new Error('Circuit breaker job data not found.')
                if (!node.parentId) throw new Error('Cannot upload circuit breaker job without parent.')

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = circuitBreakerJobMapping.JobEntityToDto(entityRes.data)
                const serverPayload = circuitBreakerJobMappingServer.mapDtoToServer(dto, ownerType)
                const response = await circuitBreakerJobAPI.createCircuitBreakerJob(serverPayload, node.parentId)

                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Circuit Breaker Job "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Circuit Breaker Job')
            }
        },

        async processUploadSurgeArresterJob(node) {
            try {
                const entityRes = await window.electronAPI.getSurgeArresterJobByMrid(node.mrid)
                if (!entityRes.success || !entityRes.data) throw new Error('Surge arrester job data not found.')
                if (!node.parentId) throw new Error('Cannot upload surge arrester job without parent.')

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = surgeArresterJobMapping.JobEntityToDto(entityRes.data)
                const serverPayload = surgeArresterJobMappingServer.mapDtoToServer(dto, ownerType)
                const response = await surgeArresterJobAPI.createSurgeArresterJob(serverPayload, node.parentId)

                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Surge Arrester Job "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Surge Arrester Job')
            }
        },

        async processUploadDisconnectorJob(node) {
            try {
                const entityRes = await window.electronAPI.getDisconnectorJobByMrid(node.mrid)
                if (!entityRes.success || !entityRes.data) throw new Error('Disconnector job data not found.')
                if (!node.parentId) throw new Error('Cannot upload disconnector job without parent.')

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = disconnectorJobMapping.JobEntityToDto(entityRes.data)
                const serverPayload = disconnectorJobMappingServer.mapDtoToServer(dto, ownerType)
                const response = await disconnectorJobAPI.createDisconnectorJob(serverPayload, node.parentId)

                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Disconnector Job "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Disconnector Job')
            }
        },

        async processUploadTransformerJob(node) {
            try {
                const entityRes = await window.electronAPI.getTransformerJobByMrid(node.mrid)
                if (!entityRes.success || !entityRes.data) throw new Error('Transformer job data not found.')
                if (!node.parentId) throw new Error('Cannot upload transformer job without parent.')

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = transformerJobMapping.JobEntityToDto(entityRes.data)
                const serverPayload = transformerJobMappingServer.mapDtoToServer(dto, ownerType)
                const response = await transformerJobAPI.createTransformerJob(serverPayload, node.parentId)

                await this.syncUploadedNodeServerId(node, response)
                this.$message.success(`Upload Transformer Job "${node.name}" successfully!`)
                return response
            } catch (error) {
                this._handleUploadError(error, 'Transformer Job')
            }
        },

        // ═══════════════════════════════════════════════════════════════════════
        //  HELPER dùng chung
        // ════
        /** Resolve ownerType từ parentNode.mode */
        _resolveOwnerType(parentNode) {
            switch (parentNode?.mode) {
                case 'bay':          return 'BAY'
                case 'voltageLevel': return 'VOLTAGE_LEVEL'
                case 'substation':   return 'SUBSTATION'
                case 'asset':       return 'ASSET'
                default:             return 'SUBSTATION'
            }
        },

        findUploadParentNode(node) {
            if (!node?.parentId) return null
            return this.findNodeByIdOrMrid(node.parentId, this.organisationClientList)
                || this.findNodeByIdOrMrid(node.parentId, this.ownerServerList)
        },

        async processCreatedNodeOnServer(node, uploadHandler) {
            if (this.clientSlide) return false
            if (!node || typeof uploadHandler !== 'function') return false

            await uploadHandler.call(this, node)
            await this.refreshServerParentAfterCreate(node)
            return true
        },

        async refreshServerParentAfterCreate(node) {
            const parentNode = this.findNodeByIdOrMrid(node.parentId, this.ownerServerList)
            if (parentNode) {
                this.$set(parentNode, 'children', null)
                await this.fetchChildrenServer(parentNode)
                this.$set(parentNode, 'expanded', true)
            } else {
                await this.getOwnerLocation()
            }

            return true
        },

        async saveAssetComponentToServer(component, assetType, serverTab = null) {
            const dto = this.getAssetDtoFromComponent(component, assetType)
            if (!dto) throw new Error(`Cannot read ${assetType} form data`)

            const serialNo = dto.properties?.serial_no
            if (!serialNo) {
                this.$message.error('Serial number is required')
                return { success: false }
            }

            const parentId = this.parentOrganization?.id
            const ownerType = this.normalizeOwnerTypeCode(this.parentOrganization?.mode)
            if (!parentId || !ownerType) {
                throw new Error(`Cannot resolve ${assetType} parent on server`)
            }

            dto.psrId = parentId
            this.applyServerTabIdToDto(dto, serverTab)
            const response = await this.createAssetDtoOnServer(assetType, dto, parentId, ownerType, serverTab)
            const serverId = this.extractUploadedServerId(response)
            const apparatusId = dto.properties?.apparatus_id || dto.properties?.name || ''
            const assetData = {
                mrid: serverId || dto.properties?.mrid || '',
                name: apparatusId,
                apparatus_id: apparatusId,
                serial_number: serialNo,
                serial_no: serialNo,
                type: dto.properties?.type || dto.properties?.asset_type || ''
            }

            return {
                success: true,
                data: {
                    asset: assetData,
                    bushing: assetData,
                    assetPsr: { mrid: parentId },
                    raw: response
                }
            }
        },

        getAssetDtoFromComponent(component, assetType) {
            const keyByAsset = {
                Transformer: 'transformerDto',
                Bushing: 'bushing_data',
                'Surge arrester': 'surge_arrester_data',
                'Circuit breaker': 'circuitBreakerDto',
                'Current transformer': 'currentTransformer',
                'Voltage transformer': 'voltageTransformer',
                'Power cable': 'powerCable',
                Disconnector: 'disconnector'
            }
            const key = keyByAsset[assetType]
            const dto = key ? component?.[key] : null
            return dto ? JSON.parse(JSON.stringify(dto)) : null
        },

        applyServerTabIdToDto(dto, serverTab) {
            const serverId = serverTab?.id || serverTab?.mrid
            if (!serverId || !dto) return

            dto.mrid = serverId
            if (dto.properties) {
                dto.properties.mrid = serverId
            }
        },

        applyServerTabIdToPayload(payload, serverTab) {
            const serverId = serverTab?.id || serverTab?.mrid
            if (!serverId || !payload) return payload

            payload.id = serverId
            payload.mrid = serverId
            payload.mRID = serverId
            if (payload.assetInfo) payload.assetInfo.id = payload.assetInfo.id || null
            if (payload.assetInfoResponseDTO) payload.assetInfoResponseDTO.id = payload.assetInfoResponseDTO.id || null

            const coreKeys = [
                'transformer',
                'bushing',
                'surgeArrester',
                'circuitBreaker',
                'currentTransformer',
                'voltageTransformer',
                'disconnector',
                'powerCableCore'
            ]
            coreKeys.forEach((key) => {
                if (payload[key]) payload[key].id = serverId
            })

            return payload
        },

        async createAssetDtoOnServer(assetType, dto, parentId, ownerType, serverTab = null) {
            if (assetType === 'Transformer') {
                return transformerAPI.createTransformer(this.applyServerTabIdToPayload(transformerMappingServer.mapDtoToServer(dto, ownerType), serverTab))
            }
            if (assetType === 'Bushing') {
                return bushingAPI.createBushing(this.applyServerTabIdToPayload(bushingMappingServer.mapDtoToServer(dto, ownerType), serverTab))
            }
            if (assetType === 'Surge arrester') {
                return surgeArresterAPI.createSurgeArrester(this.applyServerTabIdToPayload(surgeArresterMappingServer.mapDtoToServer(dto, ownerType), serverTab), parentId, ownerType)
            }
            if (assetType === 'Circuit breaker') {
                return circuitBreakerAPI.createCircuitBreaker(this.applyServerTabIdToPayload(circuitBreakerMappingServer.mapDtoToServer(dto, ownerType), serverTab), parentId, ownerType)
            }
            if (assetType === 'Current transformer') {
                return currentAPI.createCurrentTransformer(this.applyServerTabIdToPayload(currentTransformerMappingServer.mapDtoToServer(dto, ownerType), serverTab), parentId, ownerType)
            }
            if (assetType === 'Voltage transformer') {
                return voltageAPI.createVoltageTransformer(this.applyServerTabIdToPayload(voltageTransformerMappingServer.mapDtoToServer(dto, ownerType), serverTab), parentId, ownerType)
            }
            if (assetType === 'Power cable') {
                return demoAPI.createPowerCableCim(this.applyServerTabIdToPayload(PowerCableServerMapper.mapDtoToServer(dto), serverTab), parentId, ownerType)
            }
            if (assetType === 'Disconnector') {
                return disconnectorAPI.createDisconnector(this.applyServerTabIdToPayload(disconnectorMappingServer.mapDtoToServer(dto, ownerType), serverTab))
            }
            throw new Error(`Unsupported asset type: ${assetType}`)
        },

        /** Resolve numericOwnerId theo ownerType (fallback nếu parentId đã là số) */
        /** Xử lý lỗi upload thống nhất */
        extractUploadedServerId(response) {
            return response?.id || response?.data?.id || response?.data?.mrid || response?.mrid || null
        },

        isLocalGeneratedMrid(value) {
            return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ''))
        },

        clearLocalGeneratedMrid(payload) {
            if (payload && this.isLocalGeneratedMrid(payload.mRID)) {
                payload.mRID = null
            }
            return payload
        },

        async syncUploadedNodeServerId(node, response) {
            const serverId = this.extractUploadedServerId(response)
            if (!node || !serverId) return null

            const oldId = node.mrid || node.id
            const newId = String(serverId)
            if (!oldId || oldId === newId) return newId

            const replaceResult = await window.electronAPI.replaceLocalMrid(oldId, newId)
            if (!replaceResult || !replaceResult.success) {
                throw new Error(replaceResult?.message || 'Update local MRID failed')
            }

            this.$set(node, '_serverId', newId)
            this.$set(node, 'mrid', newId)
            this.$set(node, 'id', newId)

            this.syncUploadedChildrenParentId(node, oldId, newId)
            return newId
        },

        syncUploadedChildrenParentId(node, oldParentId, newParentId) {
            if (!node || !Array.isArray(node.children)) return

            node.children.forEach(child => {
                if (child.parentId === oldParentId) {
                    this.$set(child, 'parentId', newParentId)
                }

                if (Array.isArray(child.parentArr)) {
                    child.parentArr.forEach(parent => {
                        if ((parent.mrid || parent.id) === oldParentId) {
                            this.$set(parent, 'mrid', newParentId)
                            this.$set(parent, 'id', newParentId)
                        }
                    })
                }
            })
        },

        _handleUploadError(error, assetName = '') {
            const prefix = assetName ? `[Upload ${assetName}]` : '[Upload]'
            console.error(`${prefix} Error:`, error)

            if (error.response?.data) {
                const msg = error.response.data.message
                    || error.response.data.error
                    || JSON.stringify(error.response.data)
                this.$message.error(`Server Error: ${msg}`)
            } else {
                this.$message.error(error.message || 'Error during upload')
            }
        },

        async checkParentBeforUpload(parentId, parentType) {
            let parentNode = null
            if (!parentId || !parentType) {
                this.$message.error(`Cannot upload ${parentType} without parent.`)
                return false
            }
            if (parentType === 'voltageLevel') {
                parentNode = await voltageLevelAPI.getVoltageLevelById(parentId)
                if (!parentNode) {
                    this.$message.error(`Parent Voltage Level with ID ${parentId} not found on server.`)
                    return false
                }
            } else if (parentType === 'substation') {
                parentNode = await substationAPI.getSubstationById(parentId)
                if (!parentNode) {
                    this.$message.error(`Parent Substation with ID ${parentId} not found on server.`)
                    return false
                }
            } else if (parentType === 'bay') {
                parentNode = await bayAPI.getBayById(parentId)
                if (!parentNode) {
                    this.$message.error(`Parent Bay with ID ${parentId} not found on server.`)
                    return false
                }
            }

            return true
        },

        async checkServerNodeExistsForUpload(node) {
            if (!node) return false
            const id = node.mrid || node.id
            if (!id) return false
            if (this.isLocalGeneratedMrid(id)) return false

            try {
                if (node.mode === 'substation') {
                    await substationAPI.getSubstationById(id)
                    return true
                }
                if (node.mode === 'voltageLevel') {
                    await voltageLevelAPI.getVoltageLevelById(id)
                    return true
                }
                if (node.mode === 'bay') {
                    await bayAPI.getBayById(id)
                    return true
                }
                if (node.mode === 'asset') {
                    await this.getServerAssetForUpload(node, id)
                    return true
                }
                if (node.mode === 'job') {
                    await this.getServerJobForUpload(node, id)
                    return true
                }
            } catch (error) {
                return false
            }

            return false
        },

        async getServerAssetForUpload(node, id) {
            if (node.asset === 'Power cable') {
                return demoAPI.getAssetById(id, 'PowerCable')
            }
            if (node.asset === 'Transformer') {
                return transformerAPI.getTransformerById(id)
            }
            if (node.asset === 'Voltage transformer') {
                return voltageAPI.getVoltageTransformerById(id)
            }
            if (node.asset === 'Current transformer') {
                return currentAPI.getCurrentTransformerById(id)
            }
            if (node.asset === 'Circuit breaker') {
                return circuitBreakerAPI.getCircuitBreakerById(id)
            }
            if (node.asset === 'Disconnector') {
                return disconnectorAPI.getDisconnectorById(id)
            }
            if (node.asset === 'Surge arrester') {
                return surgeArresterAPI.getSurgeArresterById(id)
            }
            if (node.asset === 'Bushing') {
                return bushingAPI.getBushingById(id)
            }
            return Promise.reject(new Error('Unsupported asset type'))
        },

        async getServerJobForUpload(node, id) {
            if (node.job === 'Voltage transformer') {
                return voltageTransformerJobAPI.getVoltageTransformerJobById(id)
            }
            if (node.job === 'Current transformer') {
                return currentTransformerJobAPI.getCurrentTransformerJobById(id)
            }
            if (node.job === 'Circuit breaker') {
                return circuitBreakerJobAPI.getCircuitBreakerJobById(id)
            }
            if (node.job === 'Surge arrester') {
                return surgeArresterJobAPI.getSurgeArresterJobById(id)
            }
            if (node.job === 'Disconnector') {
                return disconnectorJobAPI.getDisconnectorJobById(id)
            }
            if (node.job === 'Transformer') {
                return transformerJobAPI.getTransformerJobById(id)
            }
            return Promise.reject(new Error('Unsupported job type'))
        },

        normalizeOwnerType(ownerType) {
            if(ownerType === 'bay') return 'Bay'
            if(ownerType === 'voltageLevel') return 'Voltage level'
            if(ownerType === 'substation') return 'Substation'
            return null
        },

        normalizeOwnerTypeCode(ownerType) {
            if(ownerType === 'bay') return 'BAY'
            if(ownerType === 'voltageLevel') return 'VOLTAGE_LEVEL'
            if(ownerType === 'substation') return 'SUBSTATION'
            return null
        }
    }
}
