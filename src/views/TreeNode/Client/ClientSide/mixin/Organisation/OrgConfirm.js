import Vue from "vue"
export default {
    methods: {
        async handleOrgConfirm() {
            try {
                const dialogRef = this.$refs.organisationDialog
                const org = dialogRef ? dialogRef.getOrganisationRef() : null
                if (org) {
                    const { success, data } = await org.saveOrganisation()
                    if (success) {
                        this.$message.success('Organisation saved successfully')
                        this.signOrg = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(org)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.organisation.mrid,
                                name: data.organisation.name || 'Unnamed Organisation',
                                parentId: this.parentOrganization ? this.parentOrganization.mrid : null,
                                parentName: this.parentOrganization ? this.parentOrganization.name : null,
                                parentArr: this.parentOrganization ? (this.parentOrganization.parentArr || []) : [],
                                mode: 'organisation'
                            }
                            newRows.push(newRow)
                            if (this.parentOrganization) {
                                const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList)
                                if (node) {
                                    const children = Array.isArray(node.children) ? node.children : []
                                    Vue.set(node, 'children', [...children, ...newRows])
                                } else {
                                    this.$message.error('Parent node not found in tree')
                                }
                            } else {
                                // Root level organisation
                                this.organisationClientList.push(newRow)
                            }
                        }
                    } else {
                        this.$message.error('Failed to save organisation')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        async handleOrgCancel() {
            this.signOrg = false
        },
    }
}