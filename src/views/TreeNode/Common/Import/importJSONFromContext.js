import Vue from "vue"
import { startLoading } from '@/utils/loading'
import * as BreakerMapping from '@/views/Mapping/Breaker/index'
import * as TransformerMapping from '@/views/Mapping/Transformer/index'
import * as SubstationMapping from '@/views/Mapping/Substation/index'
import * as OrganisationMapping from '@/views/Mapping/Organisation/index'
import * as SurgeArresterMapping from '@/views/Mapping/SurgeArrester/index'
import * as PowerCableMapping from '@/views/Mapping/PowerCable/index'
import * as DisconnectorMapping from '@/views/Mapping/Disconnector/index'
import * as CapacitorMapping from '@/views/Mapping/Capacitor/index'
import * as VoltageTransformerMapping from '@/views/Mapping/VoltageTransformer/index'
import * as CurrentTransformerMapping from '@/views/Mapping/CurrentTransformer/index'
import * as ReactorMapping from '@/views/Mapping/Reactor/index'
import * as BushingMapping from '@/views/Mapping/Bushing/index'
import * as rotatingMachineMapping from "@/views/Mapping/RotatingMachine/index"
import * as VoltageLevelMapping from '@/views/Mapping/VoltageLevel/index'
import { importNodeFromJSON as importNodeFromJSONUtil } from '@/function/entity/import/index'

export default {
    methods: {
        async handleImportJSONFromContext(node) {
            if (!node) {
                this.$message.warning('Please select a node to import into')
                return
            }

            try {
                // Mở file picker để chọn JSON file (KHÔNG có loading ở đây)
                const fileResult = await window.electronAPI.importJSON()

                if (!fileResult.success || !fileResult.data) {
                    if (fileResult.message !== 'Import cancelled') {
                        this.$message.error(fileResult.message || 'Failed to load JSON file')
                    }
                    return
                }

                const dtos = fileResult.data

                // Bắt đầu loading SAU KHI user đã chọn file
                const { close } = startLoading(this, {
                    action: 'import',
                    customText: 'Importing JSON...',
                    type: 'heavy'
                });

                // Intercept messages để hiển thị sau khi loading đóng
                const originalMessage = this.$message;
                let capturedMessages = [];

                const interceptedMessage = {
                    success: (msg) => { capturedMessages.push({ type: 'success', message: msg }) },
                    error: (msg) => { capturedMessages.push({ type: 'error', message: msg }) },
                    warning: (msg) => { capturedMessages.push({ type: 'warning', message: msg }) },
                    info: (msg) => { capturedMessages.push({ type: 'info', message: msg }) }
                };

                let importSuccess = false;

                try {
                    const dependencies = {
                        electronAPI: window.electronAPI,
                        mappings: {
                            SubstationMapping,
                            OrganisationMapping,
                            SurgeArresterMapping,
                            PowerCableMapping,
                            DisconnectorMapping,
                            rotatingMachineMapping,
                            CapacitorMapping,
                            VoltageTransformerMapping,
                            CurrentTransformerMapping,
                            TransformerMapping,
                            BreakerMapping,
                            ReactorMapping,
                            BushingMapping,
                            VoltageLevelMapping
                        },
                        userId: this.$store.state.user.user_id,
                        messageHandler: interceptedMessage // Dùng intercepted message
                    }

                    const result = await importNodeFromJSONUtil(dtos, node, dependencies)

                    if (result.success && result.successCount > 0) {
                        importSuccess = true;

                        // Tạo các node đã import vào tree UI
                        if (result.importedNodes && result.importedNodes.length > 0) {
                            console.log('importedNodes:', result.importedNodes)
                            for (const newNodeData of result.importedNodes) {
                                const parentNode = this.findNodeById(newNodeData.parentId, this.organisationClientList)
                                if (parentNode) {
                                    const children = Array.isArray(parentNode.children) ? parentNode.children : []
                                    Vue.set(parentNode, "children", [...children, newNodeData])
                                    console.log('Added node:', newNodeData.mrid, 'to parent:', parentNode.mrid)
                                } else {
                                    console.warn(`Parent node not found for ${newNodeData.mrid}`)
                                }
                            }
                        } else {
                            console.warn('No importedNodes in result')
                        }

                        // Refresh tree để đồng bộ với database
                        Vue.set(node, '_childrenFetched', false)
                        await this.fetchChildren(node)
                    }
                } catch (error) {
                    console.error('Error importing JSON:', error)
                    await close();
                    this.$message.error('An error occurred while importing JSON')
                    return;
                }

                // Đóng loading và đợi modal biến mất hoàn toàn
                await close();

                // Hiển thị captured messages SAU KHI modal đã biến mất
                if (capturedMessages.length > 0) {
                    const last = capturedMessages[capturedMessages.length - 1];
                    originalMessage[last.type](last.message);
                }

                // Nếu không có captured message nhưng import thành công, hiển thị message mặc định
                if (importSuccess && capturedMessages.length === 0) {
                    originalMessage.success('Import successfully')
                }
            } catch (error) {
                console.error('Error importing JSON:', error)
                this.$message.error('An error occurred while importing JSON')
            }
        },
    }
}