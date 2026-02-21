export default {
    methods: {
        async showOwnerServerRoot() {
            await this.getOwnerLocation()
            if (this.ownerServerList && this.ownerServerList.length > 0) {
                for (const node of this.ownerServerList) {
                    await this.fetchChildrenServer(node);
                    this.$set(node, 'expanded', true);
                }
            }
        },
    }
}