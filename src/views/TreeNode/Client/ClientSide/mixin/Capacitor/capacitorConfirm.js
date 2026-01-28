import Vue from "vue"
export default {
    methods: {
        async handleCapacitorConfirm() {
            try {
                const dialogRef = this.$refs.capacitorDialog
                const capacitor = dialogRef ? dialogRef.getCapacitorRef() : null
                if (capacitor) {
                    const { success, data } = await capacitor.saveAsset()
                    if (success) {
                        this.$message.success('Capacitor saved successfully')
                        this.signCapacitor = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(capacitor)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            // Handle different data structures - check for asset property or direct access
                            const assetData = data.asset || data
                            const newRow = {
                                mrid: assetData.mrid,
                                name: assetData.name || assetData.serial_number || 'Unnamed Capacitor',
                                serial_number: assetData.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Capacitor'
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
                        this.$message.error('Failed to save Capacitor')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        handleCapacitorCancel() {
            this.signCapacitor = false
        },
    }
}