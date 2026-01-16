import Vue from "vue"
export default {
    methods: {
        async handleOrgConfirm() {
            try {
                const org = this.$refs.organisation
                if (org) {
                    const { success, data } = await org.saveOrganisation()
                    if (success) {
                        this.$message.success('Organisation saved successfully')
                        this.signOrg = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.organisation.mrid,
                                name: data.organisation.name,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'organisation'
                            }
                            newRows.push(newRow)
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList)
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : []
                                Vue.set(node, 'children', [...children, ...newRows])
                            } else {
                                this.$message.error('Parent node not found in tree')
                            }
                        }
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