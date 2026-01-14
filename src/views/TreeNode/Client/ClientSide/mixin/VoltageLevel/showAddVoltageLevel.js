export default {
    methods: {
        async showAddVoltageLevel(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid)
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signVoltageLevel = true
                this.$nextTick(() => {
                    const voltageLevel = this.$refs.voltageLevel
                    if (voltageLevel) {
                        voltageLevel.resetForm()
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