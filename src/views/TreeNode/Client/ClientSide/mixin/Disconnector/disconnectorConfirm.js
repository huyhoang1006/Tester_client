import Vue from "vue"
export default {
    methods: {
        async handleDisconnectorConfirm() {
            try {
                const dialogRef = this.$refs.disconnectorDialog
                const disconnector = dialogRef ? dialogRef.getDisconnectorRef() : null
                if (disconnector) {
                    const { success, data } = await disconnector.saveAsset()
                    if (success) {
                        this.$message.success('Disconnector saved successfully')
                        this.signDisconnector = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(disconnector)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            // Handle different data structures - check for asset property or direct access
                            const assetData = data.asset || data
                            const newRow = {
                                mrid: assetData.mrid,
                                name: assetData.name || assetData.serial_number || 'Unnamed Disconnector',
                                serial_number: assetData.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Disconnector'
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
                        this.$message.error('Failed to save Disconnector')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        handleDisconnectorCancel() {
            this.signDisconnector = false
        },
    }
}