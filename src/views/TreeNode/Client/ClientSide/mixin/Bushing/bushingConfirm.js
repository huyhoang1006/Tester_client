import Vue from "vue"
export default {
    methods: {
        async handleBushingConfirm() {
            try {
                const dialogRef = this.$refs.bushingDialog
                const bushing = dialogRef ? dialogRef.getBushingRef() : null
                if (bushing) {
                    const { success, data } = await bushing.saveAsset()
                    if (success) {
                        this.$message.success('Bushing saved successfully')
                        this.signBushing = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(bushing)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            // data contains the full entity, bushing info is in data.bushing
                            const bushingData = data.bushing
                            const newRow = {
                                mrid: bushingData.mrid,
                                name: bushingData.name || bushingData.serial_number || 'Unnamed Bushing',
                                serial_number: bushingData.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Bushing'
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
                        this.$message.error('Failed to save bushing')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        handleBushingCancel() {
            this.signBushing = false
        },

    }
}