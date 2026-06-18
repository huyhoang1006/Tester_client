/**
 * exportTreeJSON.js  (MIXIN — lớp gọi mỏng, thay thế exportToJSON.js + exportSingleNodeToJSON.js cũ)
 * ----------------------------------------------------------------------------
 * Gom dependencies thật (electronAPI, mappings, jobMappings, userId) rồi gọi
 * service exportBranchToJSON. Dùng được cho cả Toolbar (selectedNodes) lẫn
 * Context menu (1 node).
 *
 * ĐẶT FILE: src/views/TreeNode/Common/Export/exportTreeJSON.js
 * ----------------------------------------------------------------------------
 */
import { exportBranchToJSON } from '@/views/Export/services/exportJsonService'

// ==== Mappings asset/substation/... (GIỮ y như import trong export cũ) ====
import * as SubstationMapping from '@/views/Mapping/Substation'
import * as OrganisationMapping from '@/views/Mapping/Organisation'
import * as VoltageLevelMapping from '@/views/Mapping/VoltageLevel'
import * as SurgeArresterMapping from '@/views/Mapping/SurgeArrester'
import * as PowerCableMapping from '@/views/Mapping/PowerCable'
import * as DisconnectorMapping from '@/views/Mapping/Disconnector'
import * as rotatingMachineMapping from '@/views/Mapping/RotatingMachine'
import * as CapacitorMapping from '@/views/Mapping/Capacitor'
import * as VoltageTransformerMapping from '@/views/Mapping/VoltageTransformer'
import * as CurrentTransformerMapping from '@/views/Mapping/CurrentTransformer'
import * as TransformerMapping from '@/views/Mapping/Transformer'
import * as BreakerMapping from '@/views/Mapping/Breaker'
import * as ReactorMapping from '@/views/Mapping/Reactor'
import * as BushingMapping from '@/views/Mapping/Bushing'

// ==== Job mappings (chiều Entity→DTO) — theo TÊN asset ====
import * as VTJob from '@/views/Mapping/VoltageTransformerJob'
import * as CTJob from '@/views/Mapping/CurrentTransformerJob'
import * as TFJob from '@/views/Mapping/TransformerJob'
import * as CBJob from '@/views/Mapping/CircuitBreakerJob'
import * as SAJob from '@/views/Mapping/SurgerArresterJob'   // chú ý tên thư mục có typo "Surger"
import * as DCJob from '@/views/Mapping/DisconnectorJob'
import * as PCJob from '@/views/Mapping/PowerCableJob'
import * as RMJob from '@/views/Mapping/RotatingMachineJob'
import * as CAPJob from '@/views/Mapping/CapacitorJob'
import * as REJob from '@/views/Mapping/ReactorJob'
import * as BUJob from '@/views/Mapping/BushingJob'

export default {
    methods: {
        // ===== 2 OPTION export (gọi từ Toolbar submenu) =====
        async exportJsonOnlyNode() {
            await this._runExportTreeJSON(this.selectedNodes, 'onlyNode')
        },
        async exportJsonFullTree() {
            await this._runExportTreeJSON(this.selectedNodes, 'fullTree')
        },

        // ===== Context menu (giữ tên cũ template đang gọi: @export-json) =====
        // Mặc định export cả nhánh (full tree) cho node click chuột phải.
        async handleExportJSONFromContext(node) {
            const target = node || (this.selectedNodes && this.selectedNodes[this.selectedNodes.length - 1])
            await this._runExportTreeJSON(target, 'fullTree')
        },

        // Gọi từ Context menu cho 1 node (tùy chọn mode)
        async exportSingleNodeTreeToJSON(node, mode = 'fullTree') {
            await this._runExportTreeJSON(node, mode)
        },

        async _runExportTreeJSON(nodes, mode) {
            const deps = {
                electronAPI: window.electronAPI,
                userId: this.$store.state.user.user_id,
                mappings: {
                    SubstationMapping, OrganisationMapping, VoltageLevelMapping,
                    SurgeArresterMapping, PowerCableMapping, DisconnectorMapping,
                    rotatingMachineMapping, CapacitorMapping, VoltageTransformerMapping,
                    CurrentTransformerMapping, TransformerMapping, BreakerMapping,
                    ReactorMapping, BushingMapping,
                },
                jobMappings: {
                    'Voltage transformer': { getByMrid: (a, m) => a.getVoltageTransformerJobByMrid(m), JobEntityToDto: VTJob.JobEntityToDto },
                    'Current transformer': { getByMrid: (a, m) => a.getCurrentTransformerJobByMrid(m), JobEntityToDto: CTJob.JobEntityToDto },
                    'Transformer':         { getByMrid: (a, m) => a.getTransformerJobByMrid(m),         JobEntityToDto: TFJob.JobEntityToDto },
                    'Circuit breaker':     { getByMrid: (a, m) => a.getCircuitBreakerJobByMrid(m),      JobEntityToDto: CBJob.JobEntityToDto },
                    'Surge arrester':      { getByMrid: (a, m) => a.getSurgeArresterJobByMrid(m),       JobEntityToDto: SAJob.JobEntityToDto },
                    'Disconnector':        { getByMrid: (a, m) => a.getDisconnectorJobByMrid(m),        JobEntityToDto: DCJob.JobEntityToDto },
                    'Power cable':         { getByMrid: (a, m) => a.getPowerCableJobByMrid(m),          JobEntityToDto: PCJob.JobEntityToDto },
                    'Rotating machine':    { getByMrid: (a, m) => a.getRotatingMachineJobByMrid(m),     JobEntityToDto: RMJob.JobEntityToDto },
                    'Capacitor':           { getByMrid: (a, m) => a.getCapacitorJobByMrid(m),           JobEntityToDto: CAPJob.JobEntityToDto },
                    'Reactor':             { getByMrid: (a, m) => a.getReactorJobByMrid(m),             JobEntityToDto: REJob.JobEntityToDto },
                    'Bushing':             { getByMrid: (a, m) => a.getBushingJobByMrid(m),             JobEntityToDto: BUJob.JobEntityToDto },
                },
                messageHandler: {
                    success: (m) => this.$message.success(m),
                    warning: (m) => this.$message.warning(m),
                    error: (m) => this.$message.error(m),
                },
                loadingHandler: {
                    start: (text) => {
                        const l = this.$loading({ lock: true, text: text || 'Exporting...' })
                        return () => l.close()
                    },
                },
            }
            await exportBranchToJSON(nodes, deps, { mode })
        },
    },
}