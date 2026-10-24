export default {
    methods: {
        async handleShowEquipment() {
            if (this.clientSlide) this.clientEquipmentOpened = true
            else this.serverEquipmentOpened = true
            this.activeWorkspaceTab = 'testingEquipment'
            if (this.clientSlide) this.clientWorkspaceTab = 'testingEquipment'
            else this.serverWorkspaceTab = 'testingEquipment'
            if (this.$refs.treeToolBar) this.$refs.treeToolBar.activeTab = 'testingEquipment'
            this.openImportDialog = false
            this.openExportDialog = false
        },
        openTestingEquipment(equipment = null) {
            this.activeWorkspaceTab = 'testingEquipment'
            if (this.clientSlide) this.clientWorkspaceTab = 'testingEquipment'
            else this.serverWorkspaceTab = 'testingEquipment'
            this.selectedTestingEquipment = equipment
            this.selectedEquipmentMrid = equipment && equipment.mrid ? equipment.mrid : null
            this.testingEquipmentDetailVisible = true
        },
        closeTestingEquipmentDetail() {
            this.testingEquipmentDetailVisible = false
            this.selectedTestingEquipment = null
            this.selectedEquipmentMrid = null
        },
        handleTestingEquipmentSaved() {
            const list = this.clientSlide
                ? this.$refs.testingEquipmentClientList
                : this.$refs.testingEquipmentServerList
            if (list && list.reload) {
                list.reload()
            }
        },
    }
}
