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
import { exportNodeToJSON as exportNodeToJSONUtil } from '@/function/entity/export/index'
export default {
    methods: {
        handleCancelExport() {
            this.openExportDialog = false
        },

        handleExportConfirm() {
            this.openExportDialog = false
            this.$message.success('Export successfully')
        },
        async exportTreeToJSON(type) {
            // Yêu cầu phải chọn ít nhất 1 node để export
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select at least one node to export')
                return
            }

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

            await exportNodeToJSONUtil(this.selectedNodes, type, dependencies)
        },
    }
}