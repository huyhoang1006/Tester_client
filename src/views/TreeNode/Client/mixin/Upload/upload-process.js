/* eslint-disable */

// ─── API ────────────────────────────────────────────────────────────────────
import * as demoAPI            from '@/api/demo/index.js'
import * as voltageAPI         from '@/api/demo/VoltageTransformer.js'
import * as currentAPI         from '@/api/demo/CurrentTransformer.js'
import * as circuitBreakerAPI  from '@/api/demo/CircuitBreaker.js'
import * as disconnectorAPI    from '@/api/demo/Disconnector.js'
import * as surgeArresterAPI   from '@/api/demo/SurgeArrester.js'
import * as transformerAPI     from '@/api/demo/Transformer.js'
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

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                const serverPayload = mapSubstationEntityToServer(entityRes.data, parentNode)
                const response = await demoAPI.createSubstation(serverPayload, node.parentId)

                console.log('[Upload Substation] Response:', response)
                this.$message.success(`Upload Substation "${node.name}" successfully!`)
            } catch (error) {
                this._handleUploadError(error, 'Substation')
            }
        },

        async processUploadVoltageLevel(node) {
            try {
                const entityRes = await window.electronAPI.getVoltageLevelEntityByMrid(node.mrid)
                if (!entityRes.success || !entityRes.data) throw new Error('Local voltage level data not found.')
                if (!node.parentId) throw new Error('Cannot upload voltage level without parent substation.')

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                if (parentNode?.mode !== 'substation') {
                    throw new Error(`VoltageLevel parent must be Substation. Current parent mode: ${parentNode?.mode}`)
                }

                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return

                const serverPayload = mapVoltageLevelEntityToServer(entityRes.data, null)
                const response = await voltageLevelAPI.createVoltageLevel(serverPayload, node.parentId)
                console.log('[Upload VoltageLevel] Response:', response)
                this.$message.success(`Upload VoltageLevel "${node.name}" successfully!`)
            } catch (error) {
                this._handleUploadError(error, 'VoltageLevel')
            }
        },

        async processUploadBay(node) {
            try {
                const entityRes = await window.electronAPI.getBayEntityByMrid(node.mrid)
                if (!entityRes.success || !entityRes.data) throw new Error('Local bay data not found.')
                if (!node.parentId) throw new Error('Cannot upload bay without parent.')
                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                if(!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if(!signParent) {
                    return;
                } else {
                    let ownerType = this.normalizeOwnerType(parentNode?.mode)
                    if(!ownerType) {
                        throw new Error(`Cannot resolve ownerType for parent node with mode: ${parentNode?.mode}`)
                    } else {
                        const serverPayload = mapBayEntityToServer(entityRes.data)
                        const response = await bayAPI.createBay(serverPayload, node.parentId, ownerType)
                        console.log('[Upload Bay] Response:', response)
                        this.$message.success(`Upload Bay "${node.name}" successfully!`)
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

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')

                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)
                if (!ownerType) throw new Error(`Cannot resolve ownerType for parent node with mode: ${parentNode?.mode}`)

                const response = await demoAPI.createPowerCableCim(serverPayload, node.parentId, ownerType)
                console.log('[Upload PowerCable] Response:', response)
                this.$message.success(`Upload PowerCable successfully to ${ownerType} ID: ${node.parentId}`)
            } catch (error) {
                this._handleUploadError(error, 'PowerCable')
            }
        },

        async processUploadTransformer(node) {
            try {
                const entityRes = await window.electronAPI.getTransformerEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Local transformer data not found.')
                if (!node.parentId) throw new Error('Cannot upload transformer without parent.')

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = transformerMapping.transformerEntityToDto(entityRes.data)
                const serverPayload = transformerMappingServer.mapDtoToServer(dto, ownerType)
                const response = await transformerAPI.createTransformer(serverPayload)

                console.log('[Upload Transformer] Response:', response)
                this.$message.success(`Upload Transformer "${node.name}" successfully!`)
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

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)
                if (!ownerType) throw new Error(`Cannot resolve ownerType for parent node with mode: ${parentNode?.mode}`)

                const dto = voltageTransformerMapping.mapEntityToDto(entityRes.data)
                const serverPayload = voltageTransformerMappingServer.mapDtoToServer(dto, ownerType)
                const response = await voltageAPI.createVoltageTransformer(serverPayload, node.parentId, ownerType)

                console.log('[Upload Voltage Transformer] Response:', response)
                this.$message.success(`Upload Voltage Transformer "${node.name}" successfully!`)
            } catch (error) {
                this._handleUploadError(error, 'Voltage Transformer')
            }
        },

        async processUploadCurrentTransformer(node) {
            try {
                const entityRes = await window.electronAPI.getCurrentTransformerEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Current transformer data not found.')
                if (!node.parentId) throw new Error('Cannot upload current transformer without parent.')

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)
                if (!ownerType) throw new Error(`Cannot resolve ownerType for parent node with mode: ${parentNode?.mode}`)

                const dto = currentTransformerMapping.mapEntityToDto(entityRes.data)
                const serverPayload = currentTransformerMappingServer.mapDtoToServer(dto, ownerType)
                const response = await currentAPI.createCurrentTransformer(serverPayload, node.parentId, ownerType)
                this.$message.success(`Upload Current Transformer "${node.name}" successfully!`)
            } catch (error) {
                this._handleUploadError(error, 'Current Transformer')
            }
        },

        async processUploadCircuitBreaker(node) {
            try {
                const entityRes = await window.electronAPI.getBreakerEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Circuit breaker data not found.')
                if (!node.parentId) throw new Error('Cannot upload circuit breaker without parent.')

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)
                if (!ownerType) throw new Error(`Cannot resolve ownerType for parent node with mode: ${parentNode?.mode}`)

                const dto = circuitBreakerMapping.mapEntityToDto(entityRes.data)
                const serverPayload = circuitBreakerMappingServer.mapDtoToServer(dto, ownerType)
                const response = await circuitBreakerAPI.createCircuitBreaker(serverPayload, node.parentId, ownerType)

                console.log('[Upload Circuit Breaker] Response:', response)
                this.$message.success(`Upload Circuit Breaker "${node.name}" successfully!`)
            } catch (error) {
                this._handleUploadError(error, 'Circuit Breaker')
            }
        },

        async processUploadDisconnector(node) {
            try {
                const entityRes = await window.electronAPI.getDisconnectorEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Disconnector data not found.')
                if (!node.parentId) throw new Error('Cannot upload disconnector without parent.')

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = disconnectorMapping.disconnectorEntityToDto(entityRes.data)
                const serverPayload = disconnectorMappingServer.mapDtoToServer(dto, ownerType)
                const response = await disconnectorAPI.createDisconnector(serverPayload)

                console.log('[Upload Disconnector] Response:', response)
                this.$message.success(`Upload Disconnector "${node.name}" successfully!`)
            } catch (error) {
                this._handleUploadError(error, 'Disconnector')
            }
        },

        async processUploadSurgeArrester(node) {
            try {
                const entityRes = await window.electronAPI.getSurgeArresterEntityByMrid(node.mrid, node.parentId)
                if (!entityRes.success || !entityRes.data) throw new Error('Surge arrester data not found.')
                if (!node.parentId) throw new Error('Cannot upload surge arrester without parent.')

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                if (!parentNode) throw new Error('Parent node not found in Client Tree')
                const signParent = await this.checkParentBeforUpload(node.parentId, parentNode?.mode)
                if (!signParent) return
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = surgeArresterMapping.surgeArresterEntityToDto(entityRes.data)
                const serverPayload = surgeArresterMappingServer.mapDtoToServer(dto, ownerType)
                const response = await surgeArresterAPI.createSurgeArrester(serverPayload, node.parentId, ownerType)

                console.log('[Upload Surge Arrester] Response:', response)
                this.$message.success(`Upload Surge Arrester "${node.name}" successfully!`)
            } catch (error) {
                this._handleUploadError(error, 'Surge Arrester')
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

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                const ownerType = this._resolveOwnerType(parentNode)

                const dto = voltageTransformerJobMapping.JobEntityToDto(entityRes.data)
                const serverPayload = voltageTransformerJobMappingServer.mapDtoToServer(dto, ownerType)
                const response = await voltageTransformerJobAPI.createVoltageTransformerJob(serverPayload, node.parentId)

                console.log('[Upload Voltage Transformer Job] Response:', response)
                this.$message.success(`Upload Voltage Transformer Job "${node.name}" successfully!`)
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

                console.log('[Upload Current Transformer Job] Response:', response)
                this.$message.success(`Upload Current Transformer Job "${node.name}" successfully!`)
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

                this.$message.success(`Upload Circuit Breaker Job "${node.name}" successfully!`)
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
                console.log('Surge Arrester Job Payload:', JSON.stringify(serverPayload))
                const response = await surgeArresterJobAPI.createSurgeArresterJob(serverPayload, node.parentId)

                console.log('[Upload Surge Arrester Job] Response:', response)
                this.$message.success(`Upload Surge Arrester Job "${node.name}" successfully!`)
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
                console.log('Disconnector Job Payload:', JSON.stringify(serverPayload))
                const response = await disconnectorJobAPI.createDisconnectorJob(serverPayload, node.parentId)

                console.log('[Upload Disconnector Job] Response:', response)
                this.$message.success(`Upload Disconnector Job "${node.name}" successfully!`)
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
                console.log('Transformer Job DTO:', JSON.stringify(dto))
                const serverPayload = transformerJobMappingServer.mapDtoToServer(dto, ownerType)
                console.log('Transformer Job Payload:', JSON.stringify(serverPayload))
                const response = await transformerJobAPI.createTransformerJob(serverPayload, node.parentId)

                console.log('[Upload Transformer Job] Response:', response)
                this.$message.success(`Upload Transformer Job "${node.name}" successfully!`)
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

        /** Resolve numericOwnerId theo ownerType (fallback nếu parentId đã là số) */
        /** Xử lý lỗi upload thống nhất */
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

        normalizeOwnerType(ownerType) {
            if(ownerType === 'bay') return 'Bay'
            if(ownerType === 'voltageLevel') return 'Voltage level'
            if(ownerType === 'substation') return 'Substation'
            return null
        }
    }
}
