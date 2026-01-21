export default {
    methods: {
        async showOwnerServerRoot() {
            const ownerRootServer = this.$refs.ownerRootServer
            if (ownerRootServer) {
                ownerRootServer.style.borderBottom = '2px #aba7a7 solid' // Thêm viền màu đen dày 2px
                ownerRootServer.style.color = 'rgba(0, 0, 0, 1)' // Chữ rõ nét
            }
            this.$nextTick(async () => {
                await this.getOwnerLocation()
            })
        },
    }
}