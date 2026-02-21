export default {
    methods: {
        async showLocationRoot() {
            try {
                let rs = await window.electronAPI.getParentOrganizationByMrid(this.$constant.ROOT)
                if (rs.success) {
                    this.organisationClientList = [rs.data] || []
                    if (this.organisationClientList.length > 0) {
                        const rootNode = this.organisationClientList[0];
                        await this.fetchChildren(rootNode);
                        this.$set(rootNode, 'expanded', true);
                    }
                } else {
                    this.$message.error('Cannot load root organisation')
                }
            } catch (error) {
                this.$message.error('Error fetching root data')
                console.error('Error fetching data:', error)
            }
        },
    }
}