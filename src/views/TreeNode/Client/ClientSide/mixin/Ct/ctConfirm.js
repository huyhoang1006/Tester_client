import Vue from "vue"
export default {
    methods: {
        async handleCtConfirm() {
            try {
                const dialogRef = this.$refs.currentTransformerDialog
                const ct = dialogRef ? dialogRef.getCurrentTransformerRef() : null
                if (ct) {
                    const { success, data } = await ct.saveAsset()
                    if (success) {
                        this.$message.success('Current Transformer saved successfully')
                        this.signCt = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(ct)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            // Handle different data structures - check for asset property or direct access
                            const assetData = data.asset || data
                            const newRow = {
                                mrid: assetData.mrid,
                                name: assetData.name || assetData.serial_number || 'Unnamed Current Transformer',
                                serial_number: assetData.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Current transformer'
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
                        this.$message.error('Failed to save Current Transformer')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        handleCtCancel() {
            this.signCt = false
        },
    }
}