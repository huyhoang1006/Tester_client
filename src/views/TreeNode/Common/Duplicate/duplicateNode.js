import TransformerMixin from '@/views/AssetView/Transformer/mixin/index.js'
import SurgeArresterMixin from '@/views/AssetView/SurgeArrester/mixin/index.js'
import BushingMixin from '@/views/AssetView/Bushing/mixin/index.js'
import VoltageTransformerMixin from '@/views/AssetView/VoltageTransformer/mixin/index.js'
import DisconnectorMixin from '@/views/AssetView/Disconnector/mixin/index.js'
import PowerCableMixin from '@/views/AssetView/PowerCable/mixin/index.js'
import CurrentTransformerMixin from '@/views/AssetView/CurrentTransformer/mixin/index.js'
import CircuitBreakerMixin from '@/views/AssetView/CircuitBreaker/mixin/index.js'
import RotatingMachineMixin from '@/views/AssetView/RotatingMachine/mixin/index.js'
import CapacitorMixin from '@/views/AssetView/Capacitor/mixin/index.js'
import ReactorMixin from '@/views/AssetView/Reactor/mixin/index.js'
import BayMixin from '@/views/Bay/mixin/index.js'
import VoltageLevelMixin from '@/views/VoltageLevel/mixin/index.js'
import OrganisationMixin from '@/views/Organisation/mixin/index.js'
import SubstationMixin from '@/views/LocationInsert/mixin/index.js'
import * as BreakerMapping from '@/views/Mapping/Breaker/index'
import * as TransformerMapping from '@/views/Mapping/Transformer/index'
import * as SubstationMapping from '@/views/Mapping/Substation/index'
import * as OrganisationMapping from '@/views/Mapping/Organisation/index'
import * as VoltageLevelMapping from '@/views/Mapping/VoltageLevel/index'
// --- Job mixins + mappings (per asset type) ---
import SurgeArresterJobMixin from '@/views/JobView/SurgeArrester/mixin/index.js'
import TransformerJobMixin from '@/views/JobView/Transformer/mixin/index.js'
import CircuitBreakerJobMixin from '@/views/JobView/CircuitBreaker/mixin/index.js'
import DisconnectorJobMixin from '@/views/JobView/Disconnector/mixin/index.js'
import PowerCableJobMixin from '@/views/JobView/PowerCable/mixin/index.js'
import VoltageTransformerJobMixin from '@/views/JobView/VoltageTransformer/mixin/index.js'
import CurrentTransformerJobMixin from '@/views/JobView/CurrentTransformer/mixin/index.js'
import RotatingMachineJobMixin from '@/views/JobView/RotatingMachine/mixin/index.js'
import CapacitorJobMixin from '@/views/JobView/Capacitor/mixin/index.js'
import ReactorJobMixin from '@/views/JobView/Reactor/mixin/index.js'
import BushingJobMixin from '@/views/JobView/Bushing/mixin/index.js'
import * as SurgeArresterJobMapping from '@/views/Mapping/SurgerArresterJob/index'
import * as TransformerJobMapping from '@/views/Mapping/TransformerJob/index'
import * as CircuitBreakerJobMapping from '@/views/Mapping/CircuitBreakerJob/index'
import * as DisconnectorJobMapping from '@/views/Mapping/DisconnectorJob/index'
import * as PowerCableJobMapping from '@/views/Mapping/PowerCableJob/index'
import * as VoltageTransformerJobMapping from '@/views/Mapping/VoltageTransformerJob/index'
import * as CurrentTransformerJobMapping from '@/views/Mapping/CurrentTransformerJob/index'
import * as RotatingMachineJobMapping from '@/views/Mapping/RotatingMachineJob/index'
import * as CapacitorJobMapping from '@/views/Mapping/CapacitorJob/index'
import * as ReactorJobMapping from '@/views/Mapping/ReactorJob/index'
import * as BushingJobMapping from '@/views/Mapping/BushingJob/index'
import * as SurgeArresterMapping from '@/views/Mapping/SurgeArrester/index'
import * as PowerCableMapping from '@/views/Mapping/PowerCable/index'
import * as DisconnectorMapping from '@/views/Mapping/Disconnector/index'
import * as CapacitorMapping from '@/views/Mapping/Capacitor/index'
import * as VoltageTransformerMapping from '@/views/Mapping/VoltageTransformer/index'
import * as CurrentTransformerMapping from '@/views/Mapping/CurrentTransformer/index'
import * as ReactorMapping from '@/views/Mapping/Reactor/index'
import * as BushingMapping from '@/views/Mapping/Bushing/index'
import * as rotatingMachineMapping from "@/views/Mapping/RotatingMachine/index"

export default {
    methods: {
        async handleDuplicateFromContext(node) {
            // Set selectedNodes để duplicateSelectedNodes có thể sử dụng
            this.selectedNodes = [node]
            // Gọi hàm duplicate
            await this.duplicateSelectedNodes()
        },
        async duplicateSelectedNodes() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node to duplicate')
                return
            }

            const node = this.selectedNodes[this.selectedNodes.length - 1]
            let nodeName = node.apparatus_id || node.serial_number || node.serial_no || node.name

            // Logic: ưu tiên apparatus_id nếu có
            if (!nodeName || nodeName.toString().trim() === '') {
                nodeName = node.name
            }

            // Nếu vẫn chưa có tên, gọi API lấy chi tiết
            if ((!nodeName || nodeName.toString().trim() === '') && node.mode === 'asset' && node.mrid) {
                try {
                    let entityRes = null
                    const getNameFromEntity = (assetData) => {
                        if (!assetData) return 'Unknown'
                        // Ưu tiên Apparatus ID
                        if (assetData.apparatus_id && assetData.apparatus_id.toString().trim() !== '') {
                            return assetData.apparatus_id
                        }
                        // Sau đó đến Serial Number
                        if (assetData.serial_number && assetData.serial_number.toString().trim() !== '') {
                            return assetData.serial_number
                        }
                        // Cuối cùng là Name
                        if (assetData.name && assetData.name.toString().trim() !== '') {
                            return assetData.name
                        }
                        return 'Unknown'
                    }
                    // --- SURGE ARRESTER ---
                    if (node.asset === 'Surge arrester') {
                        entityRes = await window.electronAPI.getSurgeArresterEntityByMrid(node.mrid)
                        if (entityRes.success && entityRes.data) {
                            nodeName = getNameFromEntity(entityRes.data.surgeArrester)
                        }
                    } else if (node.asset === 'Transformer') {
                        entityRes = await window.electronAPI.getTransformerEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            nodeName = getNameFromEntity(entityRes.data.asset)
                        }
                    } else if (node.asset === 'Circuit breaker') {
                        entityRes = await window.electronAPI.getBreakerEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            nodeName = getNameFromEntity(entityRes.data.asset)
                        }
                    } else if (node.asset === 'Disconnector') {
                        entityRes = await window.electronAPI.getDisconnectorEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            nodeName = getNameFromEntity(entityRes.data.asset)
                        }
                    } else if (node.asset === 'Power cable') {
                        entityRes = await window.electronAPI.getPowerCableEntityByMrid(node.mrid, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            nodeName = getNameFromEntity(entityRes.data.asset)
                        }
                    } else if (node.asset === 'Rotating machine') {
                        entityRes = await window.electronAPI.getRotatingMachineEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            nodeName = getNameFromEntity(entityRes.data.asset)
                        }
                    } else if (node.asset === 'Voltage transformer') {
                        entityRes = await window.electronAPI.getVoltageTransformerEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            nodeName = getNameFromEntity(entityRes.data.asset)
                        }
                    } else if (node.asset === 'Current transformer') {
                        entityRes = await window.electronAPI.getCurrentTransformerEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            nodeName = getNameFromEntity(entityRes.data.asset)
                        }
                    } else if (node.asset === 'Capacitor') {
                        entityRes = await window.electronAPI.getCapacitorEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            nodeName = getNameFromEntity(entityRes.data.asset)
                        }
                    } else if (node.asset === 'Reactor') {
                        entityRes = await window.electronAPI.getReactorEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            nodeName = getNameFromEntity(entityRes.data.asset)
                        }
                    } else if (node.asset === 'Bushing') {
                        entityRes = await window.electronAPI.getBushingEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            nodeName = getNameFromEntity(entityRes.data.asset) // Bushing thường dùng name hoặc serial
                        }
                    }
                } catch (error) {
                    console.error('Error fetching entity for name:', error)
                }
            }

            nodeName = nodeName || 'Unknown'

            // Determine child nodes (jobs included; test nodes excluded because tests are
            // duplicated inside their parent job entity) to prompt the user
            await this.fetchChildren(node)
            const realChildren = (node.children || []).filter(c => c.mode !== 'test')
            const hasChildren = realChildren.length > 0

            // Popup: only this node / whole subtree
            let includeChildren = false
            if (hasChildren) {
                try {
                    await this.$confirm(
                        `"${nodeName}" has ${realChildren.length} child node(s). How do you want to duplicate?`,
                        'Duplicate',
                        {
                            confirmButtonText: 'Duplicate with children',
                            cancelButtonText: 'Only this node',
                            distinguishCancelAndClose: true,
                            type: 'info'
                        }
                    )
                    includeChildren = true
                } catch (action) {
                    if (action === 'cancel') includeChildren = false
                    else return // closed / ESC -> cancel
                }
            } else {
                try {
                    await this.$confirm(`Duplicate "${nodeName}"?`, 'Confirmation', {
                        confirmButtonText: 'Confirm',
                        cancelButtonText: 'Cancel',
                        cancelButtonClass: 'el-button--danger',
                        type: 'info'
                    })
                } catch (e) {
                    return
                }
            }

            // License
            const licenseName = node.mode === 'substation' ? 'Substation'
                : node.mode === 'organisation' ? 'Organisation' : node.asset
            if (licenseName) {
                const license = await window.electronAPI.checkLicense(licenseName)
                if (license.success && !license.allowed) {
                    return this.$message.error(license.message)
                }
            }

            // Loading like the import-JSON progress dialog
            this.progressType = 'add'
            this.progressName = 'Duplicating...'
            this.progressDone = 0
            this.progressTotal = includeChildren ? await this._countSubtree(node) : 1
            this.progressVisible = true

            try {
                if (includeChildren) {
                    const newRoot = await this._duplicateSubtree(node, null)
                    if (newRoot) this.$message.success('Duplicate successful!')
                    else this.$message.error('Failed to duplicate.')
                } else {
                    const result = await this._duplicateSingle(node, null)
                    if (result && result.success && result.data) {
                        this._insertDuplicatedNodeIntoTree(node, result.data)
                        this.progressDone = 1
                        this.$message.success('Duplicate successful!')
                    } else {
                        this.$message.error((result && result.message) || 'Failed to duplicate.')
                    }
                }
            } catch (error) {
                console.error('Error during duplicate:', error)
                this.$message.error('An error occurred while duplicating')
            } finally {
                this.progressVisible = false
            }
        },

        // Duplicate a single node by type; overrideParent != null when duplicating recursively into a new parent
        async _duplicateSingle(node, overrideParent) {
            if (node.asset === 'Transformer') {
                return this.processDuplicateAsset(node, window.electronAPI.getTransformerEntityByMrid, TransformerMapping.transformerEntityToDto, TransformerMixin, 'transformerDto', overrideParent)
            } else if (node.asset === 'Surge arrester') {
                return this.processDuplicateAsset(node, window.electronAPI.getSurgeArresterEntityByMrid, SurgeArresterMapping.mapEntityToDto, SurgeArresterMixin, 'surge_arrester_data', overrideParent)
            } else if (node.asset === 'Circuit breaker') {
                return this.processDuplicateAsset(node, window.electronAPI.getBreakerEntityByMrid, BreakerMapping.mapEntityToDto, CircuitBreakerMixin, 'circuitBreakerDto', overrideParent)
            } else if (node.asset === 'Disconnector') {
                return this.processDuplicateAsset(node, window.electronAPI.getDisconnectorEntityByMrid, DisconnectorMapping.disconnectorEntityToDto, DisconnectorMixin, 'disconnector', overrideParent)
            } else if (node.asset === 'Power cable') {
                return this.processDuplicateAsset(node, window.electronAPI.getPowerCableEntityByMrid, PowerCableMapping.mapEntityToDto, PowerCableMixin, 'powerCable', overrideParent)
            } else if (node.asset === 'Voltage transformer') {
                return this.processDuplicateAsset(node, window.electronAPI.getVoltageTransformerEntityByMrid, VoltageTransformerMapping.mapEntityToDto, VoltageTransformerMixin, 'voltageTransformer', overrideParent)
            } else if (node.asset === 'Current transformer') {
                return this.processDuplicateAsset(node, window.electronAPI.getCurrentTransformerEntityByMrid, CurrentTransformerMapping.mapEntityToDto, CurrentTransformerMixin, 'currentTransformer', overrideParent)
            } else if (node.asset === 'Rotating machine') {
                return this.processDuplicateAsset(node, window.electronAPI.getRotatingMachineEntityByMrid, rotatingMachineMapping.mapEntityToDto, RotatingMachineMixin, 'rotatingMachine', overrideParent)
            } else if (node.asset === 'Capacitor') {
                return this.processDuplicateAsset(node, window.electronAPI.getCapacitorEntityByMrid, CapacitorMapping.mapEntityToDto, CapacitorMixin, 'capacitor', overrideParent)
            } else if (node.asset === 'Reactor') {
                return this.processDuplicateAsset(node, window.electronAPI.getReactorEntityByMrid, ReactorMapping.mapEntityToDto, ReactorMixin, 'reactor', overrideParent)
            } else if (node.asset === 'Bushing') {
                return this.processDuplicateAsset(node, window.electronAPI.getBushingEntityByMrid, BushingMapping.mapEntityToDto, BushingMixin, 'bushing_data', overrideParent)
            } else if (node.mode === 'bay') {
                return this.processDuplicateAsset(node, window.electronAPI.getBayEntityByMrid, (entity) => ({ mrid: entity.mrid, name: entity.name, ...entity }), BayMixin, 'properties', overrideParent)
            } else if (node.mode === 'voltageLevel') {
                return this.processDuplicateAsset(node, window.electronAPI.getVoltageLevelEntityByMrid, VoltageLevelMapping.volEntityToVolDto, VoltageLevelMixin, 'properties', overrideParent)
            } else if (node.mode === 'substation') {
                return this.processDuplicateAsset(node, window.electronAPI.getSubstationEntityByMrid, SubstationMapping.mapEntityToDto, SubstationMixin, 'properties', overrideParent)
            } else if (node.mode === 'organisation') {
                return this.processDuplicateAsset(node, window.electronAPI.getOrganisationEntityByMrid, OrganisationMapping.OrgEntityToOrgDto, OrganisationMixin, 'properties', overrideParent)
            } else if (node.mode === 'job') {
                // job under an asset; route by asset type (node.job). getFn, entity->dto mapper, mixin, data prop
                const jobMap = {
                    'Surge arrester': [window.electronAPI.getSurgeArresterJobByMrid, SurgeArresterJobMapping.JobEntityToDto, SurgeArresterJobMixin, 'surgeArresterJobDto'],
                    'Transformer': [window.electronAPI.getTransformerJobByMrid, TransformerJobMapping.JobEntityToDto, TransformerJobMixin, 'transformerJobDto'],
                    'Circuit breaker': [window.electronAPI.getCircuitBreakerJobByMrid, CircuitBreakerJobMapping.JobEntityToDto, CircuitBreakerJobMixin, 'circuitBreakerJobDto'],
                    'Disconnector': [window.electronAPI.getDisconnectorJobByMrid, DisconnectorJobMapping.JobEntityToDto, DisconnectorJobMixin, 'disconnectorJobDto'],
                    'Power cable': [window.electronAPI.getPowerCableJobByMrid, PowerCableJobMapping.JobEntityToDto, PowerCableJobMixin, 'powerCableJobDto'],
                    'Voltage transformer': [window.electronAPI.getVoltageTransformerJobByMrid, VoltageTransformerJobMapping.JobEntityToDto, VoltageTransformerJobMixin, 'voltageTransformerJobDto'],
                    'Current transformer': [window.electronAPI.getCurrentTransformerJobByMrid, CurrentTransformerJobMapping.JobEntityToDto, CurrentTransformerJobMixin, 'currentTransformerJobDto'],
                    'Rotating machine': [window.electronAPI.getRotatingMachineJobByMrid, RotatingMachineJobMapping.JobEntityToDto, RotatingMachineJobMixin, 'rotatingMachineJobDto'],
                    'Capacitor': [window.electronAPI.getCapacitorJobByMrid, CapacitorJobMapping.JobEntityToDto, CapacitorJobMixin, 'capacitorJobDto'],
                    'Reactor': [window.electronAPI.getReactorJobByMrid, ReactorJobMapping.JobEntityToDto, ReactorJobMixin, 'reactorJobDto'],
                    'Bushing': [window.electronAPI.getBushingJobByMrid, BushingJobMapping.JobEntityToDto, BushingJobMixin, 'bushingJobDto']
                }
                const cfg = jobMap[node.job]
                if (cfg) return this.processDuplicateAsset(node, cfg[0], cfg[1], cfg[2], cfg[3], overrideParent)
            }
            return { success: false, message: 'Unsupported node type for duplicate' }
        },

        // Count nodes in the subtree (jobs included; test nodes excluded) to set progressTotal
        async _countSubtree(node) {
            let count = 1
            await this.fetchChildren(node)
            const children = (node.children || []).filter(c => c.mode !== 'test')
            for (const c of children) count += await this._countSubtree(c)
            return count
        },

        // Recursively duplicate the whole subtree. Jobs are duplicated (their tests are copied
        // inside the job entity); standalone test nodes are skipped to avoid double-creating tests.
        async _duplicateSubtree(node, overrideParent) {
            const result = await this._duplicateSingle(node, overrideParent)
            if (!result || !result.success || !result.data) return null
            this.progressDone++
            this.progressName = result.data.name || node.name || ''
            const newNode = result.data
            if (!overrideParent) this._insertDuplicatedNodeIntoTree(node, newNode)
            // Job nodes carry their tests internally; don't recurse into their children.
            if (node.mode === 'job') return newNode
            await this.fetchChildren(node)
            const children = (node.children || []).filter(c => c.mode !== 'test')
            for (const child of children) {
                await this._duplicateSubtree(child, newNode)
            }
            return newNode
        },

        // Insert the newly duplicated node into the UI tree right next to the original
        _insertDuplicatedNodeIntoTree(node, newNodeData) {
            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
            if (!parentNode) return
            if (!Array.isArray(parentNode.children)) this.$set(parentNode, 'children', [])
            const index = parentNode.children.findIndex((c) => c.mrid === node.mrid)
            if (index !== -1) parentNode.children.splice(index + 1, 0, newNodeData)
            else parentNode.children.push(newNodeData)
            this.$set(parentNode, 'expanded', true)
            this.clearSelection()
            this.updateSelection(newNodeData)
        },

        //useless function
        cloneNodeRecursive(node) {
            const copy = JSON.parse(JSON.stringify(node))
            const walk = (n) => {
                n.mrid = this.generateUuid()
                if (n.id !== undefined) n.id = n.mrid
                if (n.parentArr && Array.isArray(n.parentArr)) {
                    // keep parentArr of copy pointing to same ancestors (not changing)
                }
                if (n.children && n.children.length) {
                    n.children = n.children.map((child) => walk(child))
                }
                return n
            }
            return walk(copy)
        },
    }
}