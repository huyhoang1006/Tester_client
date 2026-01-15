import Vue from "vue"
export default {
    methods: {
        async handleVoltageLevelConfirm() {
            try {
                const voltageLevel = this.$refs.voltageLevel
                if (voltageLevel) {
                    const { success, data } = await voltageLevel.saveVoltageLevel()
                    if (success) {
                        this.$message.success('Voltage Level saved successfully')
                        this.signVoltageLevel = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.voltageLevel.mrid,
                                name: data.voltageLevel.name,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'voltageLevel'
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
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        async handleVoltageLevelCancel() {
            this.signVoltageLevel = false
        },
    }
}