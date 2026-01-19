export default {
    methods: {
        async openContextMenu(event, node) {
            this.$refs.contextMenu.openContextMenu(event, node)
        },

        async openContextMenuClient(event, node) {
            const menu = this.$refs.contextMenuClient.$el
            const menuHeight = menu.offsetHeight || 320 // fallback nếu chưa render
            const menuWidth = menu.offsetWidth || 180
            // Lấy vị trí click
            const clickX = event.clientX
            const clickY = event.clientY
            // Lấy kích thước cửa sổ
            const windowHeight = window.innerHeight
            const windowWidth = window.innerWidth

            // Tính toán vị trí hiển thị
            let top = clickY
            let left = clickX

            // Nếu click quá gần mép dưới, hiện menu lên trên
            if (clickY + menuHeight > windowHeight) {
                top = clickY - menuHeight
                if (top < 0) top = 0
            }

            // Nếu click quá gần mép phải, hiện menu sang trái
            if (clickX + menuWidth > windowWidth) {
                left = clickX - menuWidth
                if (left < 0) left = 0
            }
            this.$refs.contextMenuClient.openContextMenu(event, node, { top, left })
        },

        async showContext(event) {
            this.$refs.contextSubstation.openContextMenuSubstation(event, this.$constant.ROOT)
        },
    }
}