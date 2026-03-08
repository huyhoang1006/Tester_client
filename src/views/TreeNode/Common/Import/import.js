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
        handleImportConfirm() {
            this.openImportDialog = false
            this.$message.success('Import successfully')
        },
        async handleImportCommand(cmd) {
            if (cmd === 'importETAP') {
                await this.importETAPTransformers()
            } else if (cmd === 'importExcel') {
                this.openImportDialog = true
            } else if (cmd === 'importJSON') {
                await this.importTreeFromJSON('dto')
            } else if (cmd === 'importJSONCIM') {
                // TODO: Implement import JSON by CIM (sau khi có import JSON thường)
                this.$message.info('Import JSON by CIM feature is coming soon')
            } else if (cmd === 'importXML') {
                this.openImportDialog = true
            } else if (cmd === 'importWord') {
                this.openImportDialog = true
            } else if (cmd === 'importPDF') {
                this.openImportDialog = true
            }
        },
        async importTreeFromJSON() {
            // Validate: Phải có selectedNode (giống export)
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select at least one node to import into')
                return
            }

            // Lấy parent node (node được chọn đầu tiên)
            const parentNode = this.selectedNodes[0]

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

                let importSuccess = false;

                try {
                    // Prepare dependencies
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
                        messageHandler: this.$message
                    }

                    // Import với parent node
                    const result = await importNodeFromJSONUtil(dtos, parentNode, dependencies)

                    // Tạo node trong tree UI sau khi import thành công
                    if (result.success && result.successCount > 0) {
                        console.log('Import result:', result)
                        importSuccess = true;
                        
                        // Tạo các node đã import vào tree UI
                        if (result.importedNodes && result.importedNodes.length > 0) {
                            console.log('Creating nodes in tree UI:', result.importedNodes)
                            for (const newNodeData of result.importedNodes) {
                                const node = this.findNodeById(newNodeData.parentId, this.organisationClientList)
                                if (node) {
                                    const children = Array.isArray(node.children) ? node.children : []
                                    Vue.set(node, 'children', [...children, newNodeData])
                                    console.log('Added node to tree:', newNodeData.mrid, 'to parent:', node.mrid)
                                } else {
                                    console.warn(`Parent node not found for ${newNodeData.mrid}, parentId: ${newNodeData.parentId}`)
                                }
                            }
                        } else {
                            console.warn('No importedNodes in result:', result)
                        }

                        // Refresh tree để đồng bộ với database
                        // Reset flag để force fetch lại từ server
                        Vue.set(parentNode, '_childrenFetched', false)
                        await this.fetchChildren(parentNode)
                    }
                } catch (error) {
                    console.error('Error importing JSON:', error)
                    // Đóng loading và đợi modal biến mất
                    await close();
                    // Hiển thị error sau khi modal đã ẩn
                    this.$message.error('An error occurred while importing JSON')
                    return;
                }

                // Đóng loading và đợi modal biến mất hoàn toàn
                await close();
                
                // Hiển thị message SAU KHI modal đã biến mất
                if (importSuccess) {
                    this.$message.success('Import successfully')
                }
            } catch (error) {
                console.error('Error importing JSON:', error)
                this.$message.error('An error occurred while importing JSON')
            }
        },

        handleCancelImport() {
            this.openImportDialog = false
        },

        /**
         * Import ETAP Transformers from Excel file
         * Opens file dialog, parses Excel, and imports transformers
         */
        async importETAPTransformers() {
        //     // Validate: Must have selected node as parent
        //     // if (!this.selectedNodes || this.selectedNodes.length === 0) {
        //     //     this.$message.warning('Please select a parent node (Bay or Voltage Level) to import transformers into')
        //     //     return
        //     // }

        //     const parentNode = this.selectedNodes[0]

        //     // Validate parent node type - only allow Bay or VoltageLevel
        //     // if (parentNode.mode !== 'bay' && parentNode.mode !== 'voltageLevel') {
        //     //     this.$message.warning('Please select a Bay or Voltage Level node to import transformers')
        //     //     return
        //     // }

        //     try {
        //         // Open file picker for .xlsx files
        //         const fileResult = await window.electronAPI.selectFile({
        //             filters: [
        //                 { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
        //             ],
        //             properties: ['openFile']
        //         })

        //         if (!fileResult || fileResult.canceled || !fileResult.filePaths || fileResult.filePaths.length === 0) {
        //             return // User cancelled
        //         }

        //         const filePath = fileResult.filePaths[0]
        //         const fileName = filePath.split(/[\\/]/).pop()

        //         // Set importing status
        //         this.$store.dispatch('importHistory/setImporting', true)
        //         this.$store.dispatch('importHistory/setProgress', 0)

        //         const { close } = startLoading(this, {
        //             action: 'import',
        //             customText: `Importing ${fileName}...`,
        //             type: 'heavy'
        //         });

        //         let result;

        //         try {
        //             // Import transformers using the ETAP parser
        //             const { importETAPTransformer: importETAPUtil } = await import('@/function/entity/import/ETAPTransformer')
                    
        //             const dependencies = {
        //                 electronAPI: window.electronAPI,
        //                 mappings: {
        //                     TransformerMapping
        //                 },
        //                 userId: this.$store.state.user.user_id,
        //                 messageHandler: this.$message,
        //                 progressCallback: (progress) => {
        //                     this.$store.dispatch('importHistory/setProgress', progress)
        //                 }
        //             }

        //             result = await importETAPUtil(filePath, parentNode, dependencies)

        //             // Set importing status to false
        //             this.$store.dispatch('importHistory/setImporting', false)
        //             this.$store.dispatch('importHistory/setProgress', 0)

        //             // Add to import history
        //             this.$store.dispatch('importHistory/addSession', {
        //                 fileName: fileName,
        //                 timestamp: new Date(),
        //                 totalRecords: result.totalRecords,
        //                 successCount: result.successCount,
        //                 errorCount: result.errorCount,
        //                 errors: result.errors || [],
        //                 importedNodeIds: result.importedNodeIds || []
        //             })

        //             // Refresh parent node to show new transformers
        //             if (result.importedNodes && result.importedNodes.length > 0) {
        //                 // Add nodes to tree UI
        //                 for (const newNodeData of result.importedNodes) {
        //                     const node = this.findNodeById(newNodeData.parentId, this.organisationClientList)
        //                     if (node) {
        //                         const children = Array.isArray(node.children) ? node.children : []
        //                         Vue.set(node, 'children', [...children, newNodeData])
        //                     }
        //                 }
        //             }

        //             // Force refresh parent node
        //             Vue.set(parentNode, '_childrenFetched', false)
        //             await this.fetchChildren(parentNode)

        //         } catch (error) {
        //             console.error('Error importing ETAP transformers:', error)
                    
        //             // Set importing status to false
        //             this.$store.dispatch('importHistory/setImporting', false)
        //             this.$store.dispatch('importHistory/setProgress', 0)
                    
        //             // Đóng loading và đợi modal biến mất
        //             await close();
                    
        //             // Hiển thị error sau khi modal đã ẩn
        //             this.$message.error(`An error occurred while importing: ${error.message}`)
        //             return;
        //         }

        //         // Đóng loading và đợi modal biến mất hoàn toàn
        //         await close();

        //         // Show result message SAU KHI modal đã biến mất
        //         if (result.success) {
        //             if (result.errorCount > 0) {
        //                 this.$message.warning(
        //                     `Import completed with warnings: ${result.successCount} transformers imported, ${result.errorCount} errors. Check ETAP History for details.`
        //                 )
        //             } else {
        //                 this.$message.success(
        //                     `Successfully imported ${result.successCount} transformers from ${fileName}`
        //                 )
        //             }
        //         } else {
        //             this.$message.error(
        //                 `Import failed: ${result.errors && result.errors.length > 0 ? result.errors[0].message : 'Unknown error'}`
        //             )
        //         }
        //     } catch (error) {
        //         console.error('Error importing ETAP transformers:', error)
                
        //         // Set importing status to false
        //         this.$store.dispatch('importHistory/setImporting', false)
        //         this.$store.dispatch('importHistory/setProgress', 0)
                
        //         this.$message.error(`An error occurred while importing: ${error.message}`)
        //     }
        },
    }
}
