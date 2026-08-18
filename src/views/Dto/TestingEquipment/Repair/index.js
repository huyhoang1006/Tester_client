class RepairDto {
    constructor() {
        this.mrid = '';
        this.type = 'Repair';
        this.created_date_time = '';
        this.reason = '';
        this.fault_description = '';
        this.provider = '';
        this.cost = '';
        this.status = 'Completed';
        this.ticket_id = '';
        this.ticket_status = 'Closed';
        this.severity = '';
        this.repair_location = '';
        this.note = '';
        this.created_by = null;
        this.updated_at = '';
        this.component = '';
        this.components = [];
    }
}

export default RepairDto;
