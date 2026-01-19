import Vue from "vue"
export default {
    methods: {
        // 5. Fetch children cho move dialog (lọc và set disabled, isValidTarget cho các node mới)
        async fetchChildrenForMove(node) {
            // Gọi fetchChildren bình thường
            await this.fetchChildren(node)

            // Sau khi fetch xong, lọc children bằng buildMoveTreeData để chỉ giữ lại node hợp lệ
            if (node.children && node.children.length > 0 && this.validParentTypesForMove.length > 0 && this.nodeToMove) {
                // Sử dụng buildMoveTreeData để lọc children (tự động loại bỏ node không hợp lệ)
                const filteredChildren = this.buildMoveTreeData(node.children, this.nodeToMove, this.validParentTypesForMove)

                // Cập nhật children của node đã lọc
                Vue.set(node, 'children', filteredChildren)
            }
        },
    }
}