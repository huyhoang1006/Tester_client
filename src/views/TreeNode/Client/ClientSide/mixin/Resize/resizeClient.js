export default {
    methods: {
        startResizeClient() {
            document.addEventListener('mousemove', this.resizeClient)
            document.addEventListener('mouseup', this.stopResizeClient)
        },
        resizeClient(event) {
        const sidebarElement = this.$refs.clientPanel 
                             ? this.$refs.clientPanel.$refs.sidebarClient 
                             : null;

        // Nếu không tìm thấy thì dừng lại để tránh lỗi
        if (!sidebarElement) return;

        // BƯỚC 2: Tính toán (Giữ nguyên logic cũ của bạn)
        let newWidth = (event.clientX / window.innerWidth) * 100;
        let finalWidth = Math.max(10, Math.min(40, newWidth));

        // BƯỚC 3: Gán Width (Sửa lại đối tượng gán)
        sidebarElement.style.width = finalWidth + 'vw';
        
        // Phần content bên phải (nằm ở Cha) thì giữ nguyên
        const contextDataClient = this.getContextDataClientRef ? this.getContextDataClientRef() : this.$refs.contextDataClient;
        if (contextDataClient) {
            contextDataClient.style.width = 100 - finalWidth + 'vw';
        }
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
            const propertiesClient = this.getPropertiesClientRef ? this.getPropertiesClientRef() : this.$refs.propertiesClient;
            const contentDataClient = this.getContentDataClientRef ? this.getContentDataClientRef() : this.$refs.contentDataClient;
            const contextDataClient = this.getContextDataClientRef ? this.getContextDataClientRef() : this.$refs.contextDataClient;
            const contentClient = this.getContentClientRef ? this.getContentClientRef() : this.$refs.contentClient;
            
            if (!propertiesClient || !contentDataClient) return
            const parentWidth = contextDataClient.clientWidth
            let newWidth = parentWidth - event.clientX + contextDataClient.getBoundingClientRect().left
            const minWidth = parentWidth * 0.1
            const maxWidth = parentWidth * 0.4
            newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth))
            newWidth = (newWidth / parentWidth) * 100
            // Cập nhật width của sidebar và context-data
            propertiesClient.style.width = `${newWidth}%`
            contentClient.style.width = `${100 - newWidth}%`
        },
        stopResizeContentClient() {
            document.removeEventListener('mousemove', this.resizeContentClient)
            document.removeEventListener('mouseup', this.stopResizeContentClient)
        },
    }
}