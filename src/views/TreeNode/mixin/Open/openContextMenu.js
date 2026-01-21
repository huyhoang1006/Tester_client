export default {
    methods: {
        async openContextMenu(event, node) {
            // 1. Lấy element của menu Server (ref="contextMenu")
            // Lưu ý: Đảm bảo ref bên HTML là 'contextMenu'
            const menu = this.$refs.contextMenu.$el

            const menuHeight = menu.offsetHeight || 320
            const menuWidth = menu.offsetWidth || 180

            // 2. Lấy vị trí click từ event
            const clickX = event.clientX
            const clickY = event.clientY
            const windowHeight = window.innerHeight
            const windowWidth = window.innerWidth

            // 3. Tính toán vị trí hiển thị (Logic y hệt bên Client)
            let top = clickY
            let left = clickX

            // Xử lý tràn mép dưới
            if (clickY + menuHeight > windowHeight) {
                top = clickY - menuHeight
                if (top < 0) top = 0
            }

            // Xử lý tràn mép phải
            if (clickX + menuWidth > windowWidth) {
                left = clickX - menuWidth
                if (left < 0) left = 0
            }

            // 4. Gọi hàm mở menu và TRUYỀN THÊM object { top, left }
            this.$refs.contextMenu.openContextMenu(event, node, { top, left })
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