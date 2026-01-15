import Vue from "vue"
export default {
    methods: {
        async handleBayConfirm() {
            try {
                const bay = this.$refs.bay
                if (bay) {
                    const { success, data } = await bay.saveBay()
                    if (success) {
                        this.$message.success('Bay saved successfully')
                        this.signBay = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.mrid,
                                name: data.name,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'bay'
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
                        this.$message.error('Failed to save bay')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        async handleBayCancel() {
            this.signBay = false
        },

    }
}