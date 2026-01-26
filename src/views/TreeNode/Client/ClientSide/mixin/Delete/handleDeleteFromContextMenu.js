export default {
    methods: {
        async handleDeleteFromContextMenu(node) {
            // Đặt node được chọn từ context menu vào selectedNodes để handleDeleteNode có thể sử dụng
            this.selectedNodes = [node]
            
            // Gọi handleDeleteNode để hiển thị confirm dialog và xử lý xóa
            await this.handleDeleteNode()
        }
    }
}