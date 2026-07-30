export default {
    methods: {
        /**
         * Kiểm tra 1 node còn nằm trong children của node cha hay không.
         *
         * deleteDataClient không trả về trạng thái, nhưng mọi nhánh xóa thành công đều
         * splice node khỏi parentNode.children, nên đây là cách xác định kết quả mà
         * không phải sửa toàn bộ hàm đó.
         */
        isNodeStillInClientTree(node) {
            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
            if (!parentNode || !Array.isArray(parentNode.children)) return false
            return parentNode.children.some((child) => child.mrid === node.mrid)
        },

        /**
         * Xóa toàn bộ con cháu của node, từ dưới lên.
         *
         * Node có thể chưa từng được expand nên phải fetchChildren trước để nạp cây con
         * vào tree. Mỗi child được xóa với cờ cascade = true để tự đệ quy xuống cháu.
         *
         * @returns {Promise<{success: boolean, failedNode?: object}>}
         */
        async deleteDescendantsClient(node) {
            if (this.fetchChildren) {
                try {
                    await this.fetchChildren(node)
                } catch (error) {
                    console.error('Fetch children failed while deleting descendants:', error)
                    return { success: false, failedNode: node }
                }
            }

            // Clone vì deleteDataClient sẽ splice trực tiếp trên mảng children
            const children = Array.isArray(node.children) ? [...node.children] : []
            if (children.length === 0) return { success: true }

            // Mỗi node con xóa xong đều gọi $message.success nên xóa cả cây sẽ nổ ra
            // hàng loạt toast. Nuốt hết message của con cháu, chỉ để node gốc báo 1 lần.
            const originalMessage = this.$message
            const silentMessage = {
                success: () => {},
                error: () => {},
                warning: () => {},
                info: () => {}
            }

            try {
                for (const child of children) {
                    this.$message = silentMessage
                    try {
                        await this.deleteDataClient(child, true)
                    } finally {
                        this.$message = originalMessage
                    }
                    if (this.isNodeStillInClientTree(child)) {
                        return { success: false, failedNode: child }
                    }
                }
            } finally {
                this.$message = originalMessage
            }

            return { success: true }
        }
    }
}
