export default {
    methods: {
        async showOwnerServerRoot() {
            const ownerRootServer = this.$refs.ownerRootServer
            if (ownerRootServer) {
                ownerRootServer.style.borderBottom = '2px #aba7a7 solid'
                ownerRootServer.style.color = 'rgba(0, 0, 0, 1)'
            }
            this.$nextTick(async () => {
                await this.getOwnerLocation()
                if (this.ownerServerList && this.ownerServerList.length > 0) {
                    const rootNode = this.ownerServerList[0]
                    await this.fetchChildrenServer(rootNode)
                    this.$set(rootNode, 'expanded', true)
                }
            })
        }
    }
}