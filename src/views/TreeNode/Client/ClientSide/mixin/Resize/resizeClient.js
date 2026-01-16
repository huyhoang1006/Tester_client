export default {
    methods: {
        startResizeClient() {
            document.addEventListener('mousemove', this.resizeClient)
            document.addEventListener('mouseup', this.stopResizeClient)
        },
        resizeClient(event) {
            if (!this.$refs.sidebarClient) return
            let newWidth = (event.clientX / window.innerWidth) * 100
            let finalWidth = Math.max(10, Math.min(40, newWidth))
            // Cập nhật width của sidebar và context-data
            this.$refs.sidebarClient.style.width = finalWidth + 'vw'
            this.$refs.contextDataClient.style.width = 100 - finalWidth + 'vw'
        },
        stopResizeClient() {
            document.removeEventListener('mousemove', this.resizeClient)
            document.removeEventListener('mouseup', this.stopResizeClient)
        },
        startResizeContentClient() {
            document.addEventListener('mousemove', this.resizeContentClient)
            document.addEventListener('mouseup', this.stopResizeContentClient)
        },
        resizeContentClient(event) {
            if (!this.$refs.propertiesClient || !this.$refs.contentDataClient) return
            const parentWidth = this.$refs.contextDataClient.clientWidth
            let newWidth = parentWidth - event.clientX + this.$refs.contextDataClient.getBoundingClientRect().left
            const minWidth = parentWidth * 0.1
            const maxWidth = parentWidth * 0.4
            newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth))
            newWidth = (newWidth / parentWidth) * 100
            // Cập nhật width của sidebar và context-data
            this.$refs.propertiesClient.style.width = `${newWidth}%`
            this.$refs.contentClient.style.width = `${100 - newWidth}%`
        },
        stopResizeContentClient() {
            document.removeEventListener('mousemove', this.resizeContentClient)
            document.removeEventListener('mouseup', this.stopResizeContentClient)
        },
    }
}