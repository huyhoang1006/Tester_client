import Vue from "vue"
export default {
    methods: {
        async handlePowerConfirm() {
            try {
                const dialogRef = this.$refs.powerCableDialog
                const powerCable = dialogRef ? dialogRef.getPowerCableRef() : null
                if (powerCable) {
                    const { success, data } = await powerCable.saveAsset()
                    if (success) {
                        this.$message.success('Power Cable saved successfully')
                        this.signPower = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(powerCable)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            // Handle different data structures - check for asset property or direct access
                            const assetData = data.asset || data
                            const newRow = {
                                mrid: assetData.mrid,
                                name: assetData.name || assetData.serial_number || 'Unnamed Power Cable',
                                serial_number: assetData.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Power cable'
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
                        this.$message.error('Failed to save Power Cable')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        handlePowerCancel() {
            this.signPower = false
        },
    }
}