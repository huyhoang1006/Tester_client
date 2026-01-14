export default {
    methods: {
        async showAddCircuitBreaker(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid)
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signCircuit = true
                this.$nextTick(() => {
                    const circuitBreaker = this.$refs.circuitBreaker
                    if (circuitBreaker) {
                        circuitBreaker.resetForm()
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