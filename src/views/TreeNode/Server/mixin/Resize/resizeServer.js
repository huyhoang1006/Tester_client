export default {
    methods: {
        startResizeServer() {
            document.addEventListener('mousemove', this.resizeServer)
            document.addEventListener('mouseup', this.stopResizeServer)
        },
        resizeServer(event) {
            // Tìm sidebar trong component con Server
            let sidebarElement = null;
            if (this.$refs.serverPanel && this.$refs.serverPanel.$refs.sidebarServer) {
                sidebarElement = this.$refs.serverPanel.$refs.sidebarServer;
            }

            if (!sidebarElement) return;

            // Logic tính toán
            let newWidth = (event.clientX / window.innerWidth) * 100
            let finalWidth = Math.max(10, Math.min(40, newWidth))

            // Gán style
            sidebarElement.style.width = finalWidth + 'vw'

            // Gán style cho content bên phải (nếu có)
            if (this.$refs.contextDataServer) {
                this.$refs.contextDataServer.style.width = 100 - finalWidth + 'vw'
            }
        },
        stopResizeServer() {
            document.removeEventListener('mousemove', this.resizeServer)
            document.removeEventListener('mouseup', this.stopResizeServer)
        },
        startResizeContentServer() {
            document.addEventListener('mousemove', this.resizeContentServer)
            document.addEventListener('mouseup', this.stopResizeContentServer)
        },
        resizeContentServer(event) {
            if (!this.$refs.properties || !this.$refs.contentData) return
            const parentWidth = this.$refs.contextDataServer.clientWidth
            let newWidth = parentWidth - event.clientX + this.$refs.contextDataServer.getBoundingClientRect().left
            const minWidth = parentWidth * 0.1
            const maxWidth = parentWidth * 0.4
            newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth))
            newWidth = (newWidth / parentWidth) * 100
            // Cập nhật width của sidebar và context-data
            this.$refs.properties.style.width = `${newWidth}%`
            this.$refs.content.style.width = `${100 - newWidth}%`
        },
        stopResizeContentServer() {
            document.removeEventListener('mousemove', this.resizeContentServer)
            document.removeEventListener('mouseup', this.stopResizeContentServer)
        },
    }
}