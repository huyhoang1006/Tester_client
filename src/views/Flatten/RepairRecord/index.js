// Bảng activity_record khi là bản ghi sửa chữa (type='Repair')
class RepairRecord {
    constructor() {
        this.mrid = '';
        this.type = 'Repair';
        this.created_date_time = '';   // ngày sửa
        this.reason = '';              // mô tả lỗi
        this.status = 'InProgress';    // InProgress | Completed
        this.severity = '';
        this.asset = '';               // = testing_equipment.mrid
        this.provider = '';            // đơn vị sửa (text tự do)
        this.cost = '';
    }
}

export default RepairRecord;
