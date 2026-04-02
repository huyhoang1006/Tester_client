export default {
    methods: {
        async showAddOrganisation(node) {
            try {
                this.parentOrganization = node
                this.signOrg = true
                this.$nextTick(() => {
                    const dialogRef = this.$refs.organisationDialog
                    const org = dialogRef ? dialogRef.getOrganisationRef() : null
                    if (org) {
                        org.resetForm()
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