class TestingEquipment {
    constructor() {
        this.mrid = '';
        this.model = '';
        this.serial_number = '';
        this.work_id = null;
        this.calibration_date = '';
        // mảng work_task.mrid mà thiết bị này được dùng để đo.
        // Khai ở đây để Vue 2 theo dõi được (v-model bind thẳng vào field này).
        this.work_task_ids = [];
    }
}

export default TestingEquipment;