export default {
    methods: {
        async showAddVt(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid)
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signVt = true
                this.$nextTick(() => {
                    const voltageTransformer = this.$refs.voltageTransformer
                    if (voltageTransformer) {
                        voltageTransformer.resetForm()
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