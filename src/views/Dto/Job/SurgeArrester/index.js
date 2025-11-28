import Attachment from "@/views/Flatten/Attachment";

class SurgeArresterJobDto {
    constructor() {
        this.properties = {
            mrid: '',
            name: '',
            type: '',
            creation_date: '',
            execution_date: '',
            tested_by: '',
            approved_by: '',
            approval_date: '',
            test_method: '',
            ref_standard: '',
            summary: '',
            asset_id : '',
        }
        this.attachmentData = [];
        this.attachmentId = '';
        this.testList = [];
        this.testingEquipmentData = [];
        this.listHealth = [];
        this.attachment = new Attachment();
        this.surgeArresterTestingEquipmentTestType = [];    }
}

export default SurgeArresterJobDto;