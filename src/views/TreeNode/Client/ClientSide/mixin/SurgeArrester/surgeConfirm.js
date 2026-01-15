import Vue from "vue"
export default {
    methods: {
        async handleSurgeConfirm() {
            try {
                const surgeArrester = this.$refs.surgeArrester
                if (surgeArrester) {
                    const { success, data } = await surgeArrester.saveAsset()
                    if (success) {
                        this.$message.success('Surge Arrester saved successfully')
                        this.signSurge = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.surgeArrester.mrid,
                                name: data.surgeArrester.name,
                                serial_number: data.surgeArrester.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Surge arrester'
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
                        this.$message.error('Failed to save Surge Arrester')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        handleSurgeCancel() {
            this.signSurge = false
        },
    }
}