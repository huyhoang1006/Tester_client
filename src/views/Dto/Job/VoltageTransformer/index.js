import Attachment from "@/views/Flatten/Attachment";

import TestStandard from "@/views/Cim/TestStandard";
class VoltageTransformerJobDto {
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
        this.procedureAsset = []
        this.attachmentData = [];
        this.attachmentId = '';
        this.testList = [];
        this.testingEquipmentData = [];
        this.listHealth = [];
        this.attachment = new Attachment();
        this.voltageTransformerTestingEquipmentTestType = [];
        this.testStandard = new TestStandard()
    }
}

export default VoltageTransformerJobDto;