export default {
    methods: {
        async showAddTransformer(node) {
            try {
                this.locationId = null
                let psrId = null
                if (node.parentArr && node.parentArr.length >= 2) {
                    psrId = node.parentArr[1].mrid
                } else {
                    psrId = node.mrid
                }
                const dataLoction = await window.electronAPI.getLocationByPowerSystemResourceMrid(psrId)
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