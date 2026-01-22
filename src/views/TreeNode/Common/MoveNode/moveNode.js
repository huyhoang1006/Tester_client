import Vue from "vue"

export default {
    methods: {
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
        getValidParentTypes(nodeMode) {
            switch (nodeMode) {
                case 'organisation':
                    return ['organisation'] // Org chỉ nằm trong Org
                case 'substation':
                    return ['organisation'] // Substation nằm trong Org
                case 'voltageLevel':
                    return ['substation'] // Voltage nằm trong Substation
                case 'bay':
                    return ['voltageLevel', 'substation'] // Bay nằm trong Voltage hoặc Substation
                case 'asset':
                    return ['bay', 'substation'] // Asset nằm được nhiều chỗ
                case 'job':
                    return ['asset'] // Job nằm trong Asset
                default:
                    return []
            }
        },
    }
}