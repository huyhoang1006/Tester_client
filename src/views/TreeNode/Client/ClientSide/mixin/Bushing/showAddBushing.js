export default {
    methods: {
        async showAddBushing(node) {
            try {
                const dataLocation = await window.electronAPI.getLocationByPowerSystemResourceMrid(node.mrid)
                if (dataLocation.success) {
                    this.locationId = dataLocation.data.mrid
                } else {
                    this.locationId = null
                }
                this.parentOrganization = node
                this.signBushing = true
                this.$nextTick(() => {
                    const dialogRef = this.$refs.bushingDialog
                    const bushing = dialogRef ? dialogRef.getBushingRef() : null
                    if (bushing) {
                        bushing.resetForm()
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