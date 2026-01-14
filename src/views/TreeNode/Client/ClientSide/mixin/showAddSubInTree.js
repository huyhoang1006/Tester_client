export default {
    methods: {
        async showAddSubsInTree(node) {
            try {
                this.parentOrganization = node
                const [dataLocation, dataPerson] = await Promise.all([
                    window.electronAPI.getLocationByOrganisationId(node.mrid),
                    window.electronAPI.getPersonByOrganisationId(node.mrid)
                ])
                if (dataLocation.success) {
                    this.locationList = dataLocation.data
                } else {
                    this.locationList = []
                }

                if (dataPerson.success) {
                    this.personList = dataPerson.data
                } else {
                    this.personList = []
                }
                this.organisationId = node.mrid
                this.signSubs = true
                this.$nextTick(() => {
                    const substation = this.$refs.substation
                    if (substation) {
                        substation.resetForm()
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