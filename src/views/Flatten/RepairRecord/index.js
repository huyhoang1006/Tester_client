// DTO phẳng kết hợp activity_record (cha) và activity_record_ticket (con).
class RepairRecord {
    constructor() {
        this.mrid = '';
        this.type = 'Repair';
        this.created_date_time = '';   // ngày sửa
        this.reason = '';              // mô tả lỗi
        this.status = null;             // CIM status FK; ticket workflow is stored below
        this.severity = '';             // UI compatibility alias for ticket_severity
        this.ticket_severity = '';
        this.ticket_id = '';
        this.ticket_status = 'Open';
        this.repair_location = '';
        this.action_note = '';
        this.created_by = null;
        this.updated_at = '';
        this.components = [];
        this.asset = '';               // = testing_equipment.mrid
        this.provider = '';            // đơn vị sửa (text tự do)
        this.cost = '';
    }
}

export default RepairRecord;
