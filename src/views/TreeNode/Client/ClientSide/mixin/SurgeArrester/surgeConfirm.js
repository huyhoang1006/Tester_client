import Vue from "vue"
export default {
    methods: {
        async handleSurgeConfirm() {
            try {
                const dialogRef = this.$refs.surgeArresterDialog
                const surgeArrester = dialogRef ? dialogRef.getSurgeArresterRef() : null
                if (surgeArrester) {
                    const { success, data } = await surgeArrester.saveAsset()
                    if (success) {
                        this.$message.success('Surge Arrester saved successfully')
                        this.signSurge = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(surgeArrester)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            // Handle different data structures - check for asset property or direct access
                            const assetData = data.asset || data.surgeArrester || data
                            const newRow = {
                                mrid: assetData.mrid,
                                name: assetData.name || assetData.serial_number || 'Unnamed Surge Arrester',
                                serial_number: assetData.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Surge arrester'
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
                        this.$message.error('Failed to save Surge Arrester')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        handleSurgeCancel() {
            this.signSurge = false
        },
    }
}