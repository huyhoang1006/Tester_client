export default {
    methods: {
        async showAddSubs(organisationId) {
            try {
                const [dataLocation, dataPerson, parentOrganization] = await Promise.all([
                    window.electronAPI.getLocationByOrganisationId(organisationId),
                    window.electronAPI.getPersonByOrganisationId(organisationId),
                    window.electronAPI.getParentOrganizationByMrid(organisationId)
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

                if (parentOrganization.success) {
                    this.parentOrganization = parentOrganization.data
                } else {
                    this.parentOrganization = null
                }

                this.organisationId = organisationId
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