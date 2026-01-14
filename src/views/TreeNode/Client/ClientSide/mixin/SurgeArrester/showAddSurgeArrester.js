export default {
    methods: {
        async showAddSurgeArrester(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid)
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signSurge = true
                this.$nextTick(() => {
                    const surgeArrester = this.$refs.surgeArrester
                    if (surgeArrester) {
                        surgeArrester.resetForm()
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