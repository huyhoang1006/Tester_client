import Vue from "vue"
export default {
    methods: {
        async handleVoltageLevelConfirm() {
            try {
                const dialogRef = this.$refs.voltageLevelDialog
                const voltageLevel = dialogRef ? dialogRef.getVoltageLevelRef() : null
                if (voltageLevel) {
                    const { success, data } = await voltageLevel.saveVoltageLevel()
                    console.log('VoltageLevel save response:', data) // Debug log
                    if (success) {
                        this.$message.success('Voltage Level saved successfully')
                        this.signVoltageLevel = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(voltageLevel)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            // Handle different possible data structures
                            const mrid = data.mrid || data.voltageLevel?.mrid || data.data?.voltageLevel?.mrid
                            const name = data.name || data.voltageLevel?.name || data.data?.voltageLevel?.name || 'Unnamed Voltage Level'
                            
                            console.log('Extracted mrid:', mrid, 'name:', name) // Debug log
                            
                            const newRow = {
                                mrid: mrid,
                                name: name,
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
                    } else {
                        this.$message.error('Failed to save voltage level')
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