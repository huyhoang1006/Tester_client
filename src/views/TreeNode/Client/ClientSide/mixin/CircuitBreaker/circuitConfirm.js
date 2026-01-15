import Vue from "vue"
export default {
    methods: {
        async handleCircuitConfirm() {
            try {
                const breaker = this.$refs.circuitBreaker
                if (breaker) {
                    const { success, data } = await breaker.saveAsset()
                    if (success) {
                        this.$message.success('Circuit breaker saved successfully')
                        this.signCircuit = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.asset.mrid,
                                name: data.asset.name,
                                serial_number: data.asset.serial_number,
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