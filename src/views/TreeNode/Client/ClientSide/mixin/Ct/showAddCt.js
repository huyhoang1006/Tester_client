export default {
    methods: {
        async showAddCt(node) {
            try {
                if (!this.clientSlide) {
                    this.locationId = null
                    this.parentOrganization = node
                    this.signCt = true
                    return
                }
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid)
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signCt = true
                this.$nextTick(() => {
                    const currentTransformer = this.$refs.currentTransformer
                    if (currentTransformer) {
                        currentTransformer.resetForm()
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
