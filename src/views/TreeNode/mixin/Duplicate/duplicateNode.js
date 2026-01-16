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
import * as BreakerMapping from '@/views/Mapping/Breaker/index'
import * as TransformerMapping from '@/views/Mapping/Transformer/index'
// import * as SubstationMapping from '@/views/Mapping/Substation/index'
// import * as OrganisationMapping from '@/views/Mapping/Organisation/index'
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
            let nodeName = node.serial_no || node.serial_number

            // Logic cũ: ưu tiên serial_no nếu name rỗng
            if (!nodeName || nodeName.trim() === '') {
                nodeName = node.name
            }

            // Nếu vẫn chưa có tên, gọi API lấy chi tiết
            if ((!nodeName || nodeName.toString().trim() === '') && node.mode === 'asset' && node.mrid) {
                try {
                    let entityRes = null
                    const getNameFromEntity = (assetData) => {
                        if (!assetData) return 'Unknown'
                        // Ưu tiên Serial Number
                        if (assetData.serial_number && assetData.serial_number.toString().trim() !== '') {
                            return assetData.serial_number
                        }
                        // Sau đó đến Name
                        if (assetData.name && assetData.name.toString().trim() !== '') {
                            return assetData.name
                        }
                        // Cuối cùng là Apparatus ID (nếu có)
                        return assetData.apparatus_id || 'Unknown'
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

            this.$confirm(`Duplicate "${nodeName}"?`, 'Confirmation', {
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                cancelButtonClass: 'el-button--danger',
                type: 'info'
            })
                .then(async () => {
                    let result = {success: false}

                    if (node.asset === 'Transformer') {
                        result = await this.processDuplicateAsset(
                            node,
                            window.electronAPI.getTransformerEntityByMrid,
                            TransformerMapping.transformerEntityToDto,
                            TransformerMixin, // Mixin Object
                            'transformerDto' // Tên biến data trong Mixin
                        )
                    } else if (node.asset === 'Surge arrester') {
                        result = await this.processDuplicateAsset(
                            node,
                            window.electronAPI.getSurgeArresterEntityByMrid,
                            SurgeArresterMapping.mapEntityToDto,
                            SurgeArresterMixin,
                            'surge_arrester_data' // Tên biến data trong Mixin Surge
                        )
                    } else if (node.asset === 'Circuit breaker') {
                        result = await this.processDuplicateAsset(
                            node,
                            window.electronAPI.getBreakerEntityByMrid,
                            BreakerMapping.mapEntityToDto,
                            CircuitBreakerMixin,
                            'circuitBreakerDto'
                        )
                    } else if (node.asset === 'Disconnector') {
                        result = await this.processDuplicateAsset(
                            node,
                            window.electronAPI.getDisconnectorEntityByMrid,
                            DisconnectorMapping.disconnectorEntityToDto,
                            DisconnectorMixin,
                            'disconnector'
                        )
                    } else if (node.asset === 'Power cable') {
                        result = await this.processDuplicateAsset(
                            node,
                            window.electronAPI.getPowerCableEntityByMrid,
                            PowerCableMapping.mapEntityToDto,
                            PowerCableMixin,
                            'powerCable'
                        )
                    } else if (node.asset === 'Voltage transformer') {
                        result = await this.processDuplicateAsset(
                            node,
                            window.electronAPI.getVoltageTransformerEntityByMrid,
                            VoltageTransformerMapping.mapEntityToDto,
                            VoltageTransformerMixin,
                            'voltageTransformer'
                        )
                    } else if (node.asset === 'Current transformer') {
                        result = await this.processDuplicateAsset(
                            node,
                            window.electronAPI.getCurrentTransformerEntityByMrid,
                            CurrentTransformerMapping.mapEntityToDto,
                            CurrentTransformerMixin,
                            'currentTransformer'
                        )
                    } else if (node.asset === 'Rotating machine') {
                        result = await this.processDuplicateAsset(
                            node,
                            window.electronAPI.getRotatingMachineEntityByMrid,
                            rotatingMachineMapping.mapEntityToDto,
                            RotatingMachineMixin,
                            'rotatingMachine'
                        )
                    } else if (node.asset === 'Capacitor') {
                        result = await this.processDuplicateAsset(
                            node,
                            window.electronAPI.getCapacitorEntityByMrid,
                            CapacitorMapping.mapEntityToDto,
                            CapacitorMixin,
                            'capacitor'
                        )
                    } else if (node.asset === 'Reactor') {
                        result = await this.processDuplicateAsset(
                            node,
                            window.electronAPI.getReactorEntityByMrid,
                            ReactorMapping.mapEntityToDto,
                            ReactorMixin,
                            'reactor'
                        )
                    } else if (node.asset === 'Bushing') {
                        result = await this.processDuplicateAsset(
                            node,
                            window.electronAPI.getBushingEntityByMrid,
                            BushingMapping.mapEntityToDto,
                            BushingMixin,
                            'bushing_data'
                        )
                    }
                    // --- LOCATIONS ---
                    else if (node.mode === 'bay') {
                        result = await this.processDuplicateAsset(
                            node,
                            window.electronAPI.getBayEntityByMrid,
                            (entity) => {
                                return {mrid: entity.mrid, name: entity.name, ...entity}
                            },
                            BayMixin,
                            'properties'
                        )
                    }
                    // ... Các location khác tương tự (Substation, Organisation) ...

                    if (result.success && result.data) {
                        this.$message.success('Duplicate successful!')
                        const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                        if (parentNode) {
                            if (!Array.isArray(parentNode.children)) this.$set(parentNode, 'children', [])
                            const index = parentNode.children.findIndex((c) => c.mrid === node.mrid)
                            if (index !== -1) parentNode.children.splice(index + 1, 0, result.data)
                            else parentNode.children.push(result.data)
                            this.$set(parentNode, 'expanded', true)
                            this.clearSelection()
                            this.updateSelection(result.data)
                        }
                    } else {
                        this.$message.error(result.message || 'Failed to duplicate.')
                    }
                })
                .catch((e) => {
                    if (e !== 'cancel') console.error(e)
                })
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