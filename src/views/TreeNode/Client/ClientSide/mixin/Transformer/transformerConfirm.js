import Vue from "vue"
export default {
    methods: {
        async handleTransformerConfirm() {
            try {
                const transformer = this.$refs.transformer
                if (transformer) {
                    const { success, data } = await transformer.saveAsset()
                    if (success) {
                        this.$message.success('Transformer saved successfully')
                        this.signTransformer = false
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
                                asset: 'Transformer'
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
                        this.$message.error('Failed to save transformer')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },

        async handleTransformerCancel() {
            this.signTransformer = false
        },
    }
}