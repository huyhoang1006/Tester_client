export default {
    methods: {
        async showLocationRoot() {
            this.loadingClientTree = true
            try {
                let rs = await window.electronAPI.getParentOrganizationByMrid(this.$constant.ROOT)
                if (rs.success && rs.data) {
                    // Set flag _hasFullProperties cho root node vì đã có đầy đủ thông tin
                    rs.data._hasFullProperties = true
                    this.organisationClientList = [rs.data]
                    if (this.organisationClientList.length > 0) {
                        const rootNode = this.organisationClientList[0];
                        await this.fetchChildren(rootNode);
                        this.$set(rootNode, 'expanded', true);
                        if (this.applySyncStatesToTree) {
                            await this.applySyncStatesToTree(this.organisationClientList)
                        }
                    }
                } else {
                    this.organisationClientList = []
                    this.$message.error('Cannot load root organisation')
                }
            } catch (error) {
                this.$message.error('Error fetching root data')
                console.error('Error fetching data:', error)
            } finally {
                this.loadingClientTree = false
            }
        },
    }
}
