import Vue from "vue"
export default {
    methods: {
        async handleBushingConfirm() {
            try {
                const bushing = this.$refs.bushing
                if (bushing) {
                    const { success, data } = await bushing.saveAsset()
                    if (success) {
                        this.$message.success('Bushing saved successfully')
                        this.signBushing = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.bushing.mrid,
                                name: data.bushing.name,
                                serial_number: data.bushing.serial_number,
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