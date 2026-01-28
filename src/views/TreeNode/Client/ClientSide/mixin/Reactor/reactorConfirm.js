import Vue from "vue"
export default {
    methods: {
        async handleReactorConfirm() {
            try {
                const dialogRef = this.$refs.reactorDialog
                const reactor = dialogRef ? dialogRef.getReactorRef() : null
                if (reactor) {
                    const { success, data } = await reactor.saveAsset()
                    if (success) {
                        this.$message.success('Reactor saved successfully')
                        this.signReactor = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(reactor)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            // Handle different data structures - check for asset property or direct access
                            const assetData = data.asset || data
                            const newRow = {
                                mrid: assetData.mrid,
                                name: assetData.name || assetData.serial_number || 'Unnamed Reactor',
                                serial_number: assetData.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Reactor'
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
                        this.$message.error('Failed to save Reactor')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        handleReactorCancel() {
            this.signReactor = false
        },
    }
}