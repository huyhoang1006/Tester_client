import Vue from "vue"
export default {
    methods: {
        async handlePowerConfirm() {
            try {
                const powerCable = this.$refs.powerCable
                if (powerCable) {
                    const { success, data } = await powerCable.saveAsset()
                    if (success) {
                        this.$message.success('Power cable saved successfully')
                        this.signPower = false
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