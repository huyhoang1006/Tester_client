export default {
    methods: {
        async handleOpenNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node first')
                return
            }

            try {
                // Mở tất cả các node được chọn
                for (const node of this.selectedNodes) {
                    // Nếu là client side, mở tab client
                    if (this.clientSlide) {
                        await this.showDataClient(node)
                        await this.showPropertiesDataClient(node)
                    } else {
                        // Nếu là server side, mở tab server
                        await this.showData(node)
                        await this.showPropertiesData(node)
                    }
                }
            } catch (error) {
                this.$message.error('Error opening node')
                console.error(error)
            }
        },
    }
}