import Attachment from "@/views/Entity/Attachment";

class TransformerJobDto {
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
        this.currentTransformerTestType = [];
    }
}

export default TransformerJobDto;