import Attachment from "@/views/Flatten/Attachment";

class PowerCableJobDto {
    constructor() {
        this.properties = {
            mrid: '',
            name: '',
            work_order: '',
            creation_date: '',
            execution_date: '',
            tested_by: '',
            approved_by: '',
            approval_date: '',
            ambient_conditions: '',
            test_method: '',
            standard: '',
            summary: '',
            asset_id: '',
        }
        this.attachmentData = [];
        this.attachmentId = '';
        this.testList = [];
        this.testingEquipmentData = [];
        this.listHealth = [];
        this.attachment = new Attachment();
        this.powerCableTestingEquipmentTestType = [];
    }
}

export default PowerCableJobDto;