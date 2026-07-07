export default {
    methods: {
        async handleShowEquipment() {
            this.openTestingEquipmentDialog = true
        },
        openTestingEquipment(mrid = null) {
            this.selectedEquipmentMrid = mrid
            this.openTestingEquipmentDialog = true
        },
        handleTestingEquipmentSaved() {
            this.openTestingEquipmentDialog = false
            // sau này: reload danh sách thiết bị nếu cần
        },
    }
}