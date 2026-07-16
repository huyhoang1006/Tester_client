export default {
    methods: {
        async handleShowEquipment() {
            this.activeWorkspaceTab = 'testingEquipment'
            this.clientWorkspaceTab = 'testingEquipment'
            this.signFmeca = false
            this.openImportDialog = false
            this.openExportDialog = false
            this.$nextTick(() => {
                if (this.$refs.testingEquipmentList && this.$refs.testingEquipmentList.reload) {
                    this.$refs.testingEquipmentList.reload()
                }
            })
        },
        openTestingEquipment(equipment = null) {
            this.activeWorkspaceTab = 'testingEquipment'
            this.clientWorkspaceTab = 'testingEquipment'
            this.selectedTestingEquipment = equipment
            this.selectedEquipmentMrid = equipment && equipment.mrid ? equipment.mrid : null
            this.testingEquipmentDetailVisible = true
        },
        closeTestingEquipmentDetail() {
            this.testingEquipmentDetailVisible = false
            this.selectedTestingEquipment = null
            this.selectedEquipmentMrid = null
            this.$nextTick(() => {
                if (this.$refs.testingEquipmentList && this.$refs.testingEquipmentList.reload) {
                    this.$refs.testingEquipmentList.reload()
                }
            })
        },
        handleTestingEquipmentSaved() {
            if (this.$refs.testingEquipmentList && this.$refs.testingEquipmentList.reload) {
                this.$refs.testingEquipmentList.reload()
            }
        },
    }
}
