export default {
    methods: {
        async showAddRotatingMachine(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid)
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signRotating = true
                this.$nextTick(() => {
                    const rotatingMachine = this.$refs.rotatingMachine
                    if (rotatingMachine) {
                        rotatingMachine.resetForm()
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