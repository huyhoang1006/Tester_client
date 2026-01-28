import Vue from "vue"

export default {
    methods: {
        async handleSubsConfirm() {
            try {
                const dialogRef = this.$refs.substationDialog
                const subs = dialogRef ? dialogRef.getSubstationRef() : null
                if (subs) {
                    const { success, data } = await subs.saveSubstation()
                    if (success) {
                        this.$message.success('Substation saved successfully')
                        this.signSubs = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(subs)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.substation.mrid,
                                name: data.substation.name || 'Unnamed Substation',
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'substation'
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
                    } else {
                        this.$message.error('Failed to save substation')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        async handleSubsCancel() {
            this.signSubs = false
        },
    }
}