export default {
    methods: {
        async showOwnerServerRoot() {
            const ownerRootServer = this.$refs.ownerRootServer
            if (ownerRootServer) {
                ownerRootServer.style.borderBottom = '2px #aba7a7 solid'
                ownerRootServer.style.color = 'rgba(0, 0, 0, 1)'
            }

            this.$nextTick(async () => {
                // 1. Lấy node gốc (Organization)
                await this.getOwnerLocation()

                // 2. Nếu có dữ liệu, tiến hành tải con và mở rộng (Cấp 2)
                if (this.ownerServerList && this.ownerServerList.length > 0) {
                    const rootNode = this.ownerServerList[0]

                    // Gọi fetchChildrenServer để tải các node cấp 2 (Substation, v.v.)
                    await this.fetchChildrenServer(rootNode)

                    // Đặt trạng thái expanded thành true để hiển thị trên UI
                    this.$set(rootNode, 'expanded', true)
                }
            })
        }
    }
}