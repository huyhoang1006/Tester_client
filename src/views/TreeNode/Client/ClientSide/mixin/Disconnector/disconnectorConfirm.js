import Vue from "vue"
export default {
    methods: {
        handleDisconnectorCancel() {
            this.signDisconnector = false
        },

        async handleDisconnectorConfirm() {
            try {
                const disconnector = this.$refs.disconnector
                if (disconnector) {
                    const { success, data } = await disconnector.saveAsset()
                    if (success) {
                        this.$message.success('Disconnector saved successfully')
                        this.signDisconnector = false
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
                        this.$message.error('Failed to save Voltage transformer')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },

    }
}