import Vue from "vue"
import { getValidParentModes, canDropInto } from './moveRules'

export default {
    methods: {
        /**
         * Kéo thả trên cây: dùng lại toàn bộ luồng của dialog Move.
         * Chỉ cần gán nodeToMove + selectedTargetNode rồi gọi confirmMoveNode().
         */
        async handleDropMoveNode({ dragNode, targetNode }) {
            if (!dragNode || !targetNode) return

            // Kiểm tra lại ở đây (TreeNode đã chặn, nhưng không tin phía UI)
            const check = canDropInto(dragNode, targetNode)
            if (!check.allowed) {
                this.$message.warning(check.reason || 'Cannot move here')
                return
            }

            this.nodeToMove = dragNode
            this.validParentTypesForMove = this.getValidParentTypes(dragNode.mode)
            this.selectedTargetNode = targetNode
            this.selectedTargetNodes = [targetNode]

            await this.confirmMoveNode()
        },
        async handleMoveFromContext(node) {
            // Set selectedNodes để handleMoveNode có thể sử dụng
            this.selectedNodes = [node]
            await this.handleMoveNode()
        },
        async handleMoveNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node to move')
                return
            }

            const nodeToMove = this.selectedNodes[this.selectedNodes.length - 1]

            const validTypes = this.getValidParentTypes(nodeToMove.mode)

            // Lưu nodeToMove và validTypes để dùng trong fetchChildrenForMove
            this.nodeToMove = nodeToMove
            this.validParentTypesForMove = validTypes

            // Lấy nguồn dữ liệu (Server hoặc Client side)
            const sourceData = this.clientSlide ? this.organisationClientList : this.ownerServerList

            // Build cây dữ liệu đã lọc
            this.moveTreeData = this.buildMoveTreeData(sourceData, nodeToMove, validTypes)

            // Reset trạng thái chọn trong Dialog
            this.selectedTargetNode = null
            this.selectedTargetNodes = []

            this.moveDialogVisible = true
        },
        // 3. Xử lý khi click chọn 1 node trong Dialog (Thay thế handleTargetNodeClick cũ)
        handleMoveNodeSelection(node) {
            // Nếu là mảng (do TreeNode emit), lấy phần tử cuối hoặc phần tử duy nhất
            const targetNode = Array.isArray(node) ? node[node.length - 1] : node

            if (!targetNode) {
                this.selectedTargetNodes = []
                this.selectedTargetNode = null
                return
            }

            // Nếu node chưa có isValidTarget (có thể là node mới được fetch), tính toán lại
            if (targetNode.isValidTarget === undefined && this.validParentTypesForMove.length > 0) {
                const isValidTarget = this.validParentTypesForMove.includes(targetNode.mode)
                Vue.set(targetNode, 'disabled', !isValidTarget)
                Vue.set(targetNode, 'isValidTarget', isValidTarget)
            }

            // Chặn nếu node không hợp lệ
            if (targetNode.disabled || !targetNode.isValidTarget) {
                // this.$message.warning(`Cannot move here. Invalid parent type.`);
                // Reset selection để không highlight node sai
                this.selectedTargetNodes = []
                this.selectedTargetNode = null
                return
            }

            // Nếu hợp lệ
            this.selectedTargetNodes = [targetNode]
            this.selectedTargetNode = targetNode
        },

        // 4. Reset khi đóng dialog
        handleMoveCancel() {
            this.moveDialogVisible = false
            this.selectedTargetNodes = []
            this.selectedTargetNode = null
            this.nodeToMove = null
            this.validParentTypesForMove = []
        },
        // Bảng phân cấp nằm ở moveRules.js để dialog Move và kéo thả dùng chung 1 nguồn
        getValidParentTypes(nodeMode) {
            return getValidParentModes(nodeMode)
        },
    }
}