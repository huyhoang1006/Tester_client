export default {
    methods: {

        hasValidTargetInTree(node, nodeToMove, validParentTypes) {
            // Bỏ qua node đang được move
            if (node.mrid === nodeToMove.mrid) return false

            // Nếu node này là valid target
            if (validParentTypes.includes(node.mode)) {
                return true
            }

            // Kiểm tra children
            if (node.children && node.children.length > 0) {
                for (const child of node.children) {
                    if (this.hasValidTargetInTree(child, nodeToMove, validParentTypes)) {
                        return true
                    }
                }
            }

            return false
        },
        // 2. Hàm đệ quy xây dựng cây cho Dialog Move
        // nodeToMove: Node đang được chọn để di chuyển (để ẩn đi khỏi cây đích)
        // validParentTypes: Danh sách các loại node cha hợp lệ
        buildMoveTreeData(nodes, nodeToMove, validParentTypes) {
            let tree = []
            if (!nodes) return tree

            nodes.forEach((node) => {
                // 1. Không hiển thị chính node đang di chuyển (và con của nó)
                if (node.mrid === nodeToMove.mrid) return

                // 2. Chỉ hiển thị node nếu:
                // - Node này là valid target, HOẶC
                // - Node này có children chứa valid target (để user có thể mở rộng tìm node hợp lệ)
                if (!this.hasValidTargetInTree(node, nodeToMove, validParentTypes)) {
                    return // Bỏ qua node này hoàn toàn
                }

                // 3. Logic: Node này có được phép làm cha không?
                const isValidTarget = validParentTypes.includes(node.mode)

                // 4. Đệ quy xử lý con trước để lọc children
                let filteredChildren = []
                if (node.children && node.children.length > 0) {
                    filteredChildren = this.buildMoveTreeData(node.children, nodeToMove, validParentTypes)
                }

                // 5. Chỉ thêm node vào tree nếu:
                // - Node này là valid target, HOẶC
                // - Node này có children hợp lệ (đã được lọc)
                if (isValidTarget || filteredChildren.length > 0) {
                    let newNode = {
                        ...node,
                        disabled: !isValidTarget,
                        isValidTarget: isValidTarget,
                        children: filteredChildren
                    }
                    tree.push(newNode)
                }
            })
            return tree
        },
    }
}