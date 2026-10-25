export default {
    methods: {
        async showOwnerServerRoot() {
            const loadId = ++this.serverRootLoadId
            this.loadingServerTree = true
            try {
                const ownerRootServer = this.$refs.ownerRootServer
                if (ownerRootServer) {
                    ownerRootServer.style.borderBottom = '2px #aba7a7 solid'
                    ownerRootServer.style.color = 'rgba(0, 0, 0, 1)'
                }
                await this.$nextTick()
                const loaded = await this.getOwnerLocation()
                if (!loaded || loadId !== this.serverRootLoadId) return
                if (this.ownerServerList && this.ownerServerList.length > 0) {
                    const rootNode = this.ownerServerList[0]
                    await this.fetchChildrenServer(rootNode)
                    if (loadId !== this.serverRootLoadId) return
                    this.$set(rootNode, 'expanded', true)
                }
            } finally {
                if (loadId === this.serverRootLoadId) this.loadingServerTree = false
            }
        }
    }
}
