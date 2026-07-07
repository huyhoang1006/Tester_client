// Bảng calibration_record (1-n với testing_equipment)
class CalibrationRecord {
    constructor() {
        this.mrid = '';
        this.testing_equipment = null;
        this.calibration_date = '';
        this.due_date = '';
        this.interval_months = null;
        this.provider = '';
        this.certificate_number = '';
        this.result = '';
        this.notes = '';
    }
}

export default CalibrationRecord;
