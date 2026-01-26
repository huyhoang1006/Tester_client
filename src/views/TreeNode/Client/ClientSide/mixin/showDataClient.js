import * as BreakerMapping from '@/views/Mapping/Breaker/index'
import * as TransformerMapping from '@/views/Mapping/Transformer/index'
import * as SubstationMapping from '@/views/Mapping/Substation/index'
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
        async doubleClickNode(node) {
            await this.showDataClient(node)
            await this.showPropertiesDataClient(node)
        },
        async showDataClient(node) {
            try {
                // Tạo bản sao của node để đảm bảo reactivity
                const newNode = { ...node }
                const index = this.tabsClient.findIndex((item) => item.mrid === newNode.mrid)
                if (index !== -1) {
                    // Nếu tab đã tồn tại, active nó
                    this.activeTabClient = newNode
                    const clientTabs = this.getClientTabsRef ? this.getClientTabsRef() : this.$refs.clientTabs
                    if (clientTabs) {
                        clientTabs.selectTab(this.activeTabClient, index)
                    }
                } else {
                    const newTabs = [...this.tabsClient] // Tạo mảng mới
                    if (this.activeTabClient?.mrid) {
                        const index = newTabs.findIndex((item) => item.mrid === this.activeTabClient.mrid)
                        newTabs.splice(index + 1, 0, newNode)
                    } else {
                        newTabs.push(newNode)
                    }
                    // Gán lại để trigger reactivity
                    this.tabsClient = newTabs
                    this.activeTabClient = newNode
                    const clientTabs = this.getClientTabsRef ? this.getClientTabsRef() : this.$refs.clientTabs
                    if (clientTabs) {
                        clientTabs.selectTab(this.activeTabClient, newTabs.length - 1)
                        clientTabs.loadData(newNode, newTabs.length - 1)
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur when loading data')
                console.error(error)
            }
        },
        async showPropertiesDataClient(node) {
            this.assetPropertySignClient = false
            this.jobPropertySignClient = false
            if (node.asset != undefined) {
                this.assetPropertySignClient = true
                // Fetch dữ liệu asset từ API để lấy đầy đủ thông tin
                let assetData = null
                try {
                    if (node.asset === 'Transformer') {
                        // @ts-ignore
                        const entityRes = await window.electronAPI.getTransformerEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            assetData = TransformerMapping.transformerEntityToDto(entityRes.data)
                        }
                    } else if (node.asset === 'Bushing') {
                        // @ts-ignore
                        const entityRes = await window.electronAPI.getBushingEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            assetData = BushingMapping.mapEntityToDto(entityRes.data)
                        }
                    } else if (node.asset === 'Circuit breaker') {
                        // @ts-ignore
                        const entityRes = await window.electronAPI.getBreakerEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            assetData = BreakerMapping.mapEntityToDto(entityRes.data)
                        }
                    } else if (node.asset === 'Surge arrester') {
                        // @ts-ignore
                        const entityRes = await window.electronAPI.getSurgeArresterEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            assetData = SurgeArresterMapping.mapEntityToDto(entityRes.data)
                        }
                    } else if (node.asset === 'Power cable') {
                        // @ts-ignore
                        const entityRes = await window.electronAPI.getPowerCableEntityByMrid(node.mrid, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            assetData = PowerCableMapping.mapEntityToDto(entityRes.data)
                        }
                    } else if (node.asset === 'Disconnector') {
                        // @ts-ignore
                        const entityRes = await window.electronAPI.getDisconnectorEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            assetData = DisconnectorMapping.disconnectorEntityToDto(entityRes.data)
                        }
                    } else if (node.asset === 'Capacitor') {
                        // @ts-ignore
                        const entityRes = await window.electronAPI.getCapacitorEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            assetData = CapacitorMapping.mapEntityToDto(entityRes.data)
                        }
                    } else if (node.asset === 'Voltage transformer') {
                        // @ts-ignore
                        const entityRes = await window.electronAPI.getVoltageTransformerEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            assetData = VoltageTransformerMapping.mapEntityToDto(entityRes.data)
                        }
                    } else if (node.asset === 'Current transformer') {
                        // @ts-ignore
                        const entityRes = await window.electronAPI.getCurrentTransformerEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            assetData = CurrentTransformerMapping.mapEntityToDto(entityRes.data)
                        }
                    } else if (node.asset === 'Reactor') {
                        // @ts-ignore
                        const entityRes = await window.electronAPI.getReactorEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            assetData = ReactorMapping.mapEntityToDto(entityRes.data)
                        }
                    } else if (node.asset === 'Rotating machine') {
                        // @ts-ignore
                        const entityRes = await window.electronAPI.getRotatingMachineEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (entityRes.success && entityRes.data) {
                            assetData = rotatingMachineMapping.mapEntityToDto(entityRes.data)
                        }
                    }
                } catch (error) {
                    console.error('Error fetching asset data:', error)
                }

                // Map từ DTO nếu có, nếu không thì map từ node
                if (assetData && assetData.properties) {
                    await this.mappingAssetPropertiesClient(assetData.properties)
                    // Set asset name từ node.asset
                    this.assetPropertiesClient.asset = node.asset || ''
                } else {
                    await this.mappingAssetPropertiesClient(node)
                }

                // Tìm parent thực sự từ cây dữ liệu thay vì dùng node.parent
                const parentNode = node.parentId ? this.findNodeById(node.parentId, this.organisationClientList) : null
                if (parentNode) {
                    await this.mappingPropertiesClient(parentNode)
                }
                await this.loadPathMapClient(node)
                // Với asset: ưu tiên serial_number/serial_no, nếu không có thì dùng name
                const assetName = node.serial_number || node.serial_no || node.name || 'Unknown'
                this.pathMapClient.push({
                    id: node.id || node.mrid,
                    mrid: node.mrid,
                    parent: assetName
                })
            } else if (node.type == 'test') {
                this.assetPropertySignClient = true
                this.jobPropertySignClient = true
                const jobNode = node.parentId ? this.findNodeById(node.parentId, this.organisationClientList) : null
                const assetNode = jobNode ? (jobNode.parentId ? this.findNodeById(jobNode.parentId, this.organisationClientList) : null) : null
                const locationNode = assetNode ? (assetNode.parentId ? this.findNodeById(assetNode.parentId, this.organisationClientList) : null) : null
                if (locationNode) {
                    await this.mappingPropertiesClient(locationNode)
                }
                if (assetNode) {
                    await this.mappingAssetPropertiesClient(assetNode)
                }
                if (jobNode) {
                    await this.mappingJobPropertiesClient(jobNode)
                }
                await this.loadPathMapClient(node)
                const testName = node.name || node.serial_number || node.serial_no || 'Unknown'
                this.pathMapClient.push({
                    id: node.id || node.mrid,
                    mrid: node.mrid,
                    parent: testName
                })
            } else if (node.type == 'job') {
                this.assetPropertySignClient = true
                this.jobPropertySignClient = true
                // Tìm parent thực sự từ cây dữ liệu
                // Job -> Asset (parent)
                // Job -> Location (parent.parent)
                const assetNode = node.parentId ? this.findNodeById(node.parentId, this.organisationClientList) : null
                const locationNode = assetNode ? (assetNode.parentId ? this.findNodeById(assetNode.parentId, this.organisationClientList) : null) : null
                if (locationNode) {
                    await this.mappingPropertiesClient(locationNode)
                }
                if (assetNode) {
                    await this.mappingAssetPropertiesClient(assetNode)
                }
                await this.mappingJobPropertiesClient(node)
                await this.loadPathMapClient(node)
                const jobName = node.name || node.serial_number || node.serial_no || 'Unknown'
                this.pathMapClient.push({
                    id: node.id || node.mrid,
                    mrid: node.mrid,
                    parent: jobName
                })
            } else {
                let detailData = node

                // Nếu là Substation, gọi API lấy full thông tin
                if (node.mode === 'substation') {
                    try {
                        // @ts-ignore
                        const res = await window.electronAPI.getSubstationEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (res.success && res.data) {
                            // Map từ Entity sang DTO để có các trường street, city, email...
                            detailData = SubstationMapping.mapEntityToDto(res.data)
                        }
                    } catch (error) {
                        console.error('Error fetching substation detail:', error)
                    }
                }

                await this.mappingPropertiesClient(detailData)
                await this.loadPathMapClient(node)
                const nodeName = node.name || node.serial_number || node.serial_no || 'Unknown'
                this.pathMapClient.push({
                    id: node.id || node.mrid,
                    mrid: node.mrid,
                    parent: nodeName
                })
            }
        },
    }
}