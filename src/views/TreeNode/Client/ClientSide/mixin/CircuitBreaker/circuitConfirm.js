import Vue from "vue"
export default {
    methods: {
        async handleCircuitConfirm() {
            try {
                const dialogRef = this.$refs.circuitBreakerDialog
                const breaker = dialogRef ? dialogRef.getCircuitBreakerRef() : null
                if (breaker) {
                    const { success, data } = await breaker.saveAsset()
                    if (success) {
                        this.$message.success('Circuit breaker saved successfully')
                        this.signCircuit = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(breaker)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            // Handle different data structures - check for asset property or direct access
                            const assetData = data.asset || data
                            const newRow = {
                                mrid: assetData.mrid,
                                name: assetData.name || assetData.serial_number || 'Unnamed Circuit Breaker',
                                serial_number: assetData.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Circuit breaker'
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
                        this.$message.error('Failed to save Circuit breaker')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        handleCircuitCancel() {
            this.signCircuit = false
        },
    }
}