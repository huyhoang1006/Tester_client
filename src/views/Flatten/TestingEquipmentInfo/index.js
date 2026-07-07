// Bảng testing_equipment (mở rộng của asset qua mrid)
class TestingEquipmentInfo {
    constructor() {
        this.mrid = '';
        this.work_id = null;
        this.asset_tag = '';
        this.is_accessory = 0;         // 1 = là phụ kiện (accessory), 0 = máy chính
    }
}

export default TestingEquipmentInfo;
