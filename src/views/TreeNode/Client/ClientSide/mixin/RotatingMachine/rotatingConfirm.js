import Vue from "vue"
export default {
    methods: {
        async handleRotatingConfirm() {
            try {
                const dialogRef = this.$refs.rotatingMachineDialog
                const rotatingMachine = dialogRef ? dialogRef.getRotatingMachineRef() : null
                if (rotatingMachine) {
                    const { success, data } = await rotatingMachine.saveAsset()
                    if (success) {
                        this.$message.success('Rotating Machine saved successfully')
                        this.signRotating = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(rotatingMachine)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            // Handle different data structures - check for asset property or direct access
                            const assetData = data.asset || data
                            const newRow = {
                                mrid: assetData.mrid,
                                name: assetData.name || assetData.serial_number || 'Unnamed Rotating Machine',
                                serial_number: assetData.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Rotating machine'
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
                        this.$message.error('Failed to save Rotating Machine')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        handleRotatingCancel() {
            this.signRotating = false
        },
    }
}