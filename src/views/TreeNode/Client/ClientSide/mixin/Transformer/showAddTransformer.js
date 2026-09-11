export default {
    methods: {
        async showAddTransformer(node) {
            try {
                this.locationId = null
                if (!this.clientSlide) {
                    this.parentOrganization = node
                    this.signTransformer = true
                    return
                }
                const dataLoction = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid)
                if (dataLoction.success) {
                    this.locationId = dataLoction.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signTransformer = true
                this.$nextTick(() => {
                    const transformer = this.$refs.transformer
                    if (transformer) {
                        transformer.resetForm()
                    }
                })
            } catch (error) {
                this.parentOrganization = null
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
    }
}
