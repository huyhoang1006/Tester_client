import OldWork from "@/views/Cim/OldWork/index";
import Attachment from "../../Attachment";
import TestStandard from "@/views/Cim/TestStandard"
class SurgeArresterJobEntity {
    constructor() {
        this.oldWork = new OldWork();
        this.attachment = new Attachment();
        this.workTasks = [];
        this.testingEquipment = [];
        this.testDataSet = [];
        this.analogValues = [];
        this.stringMeasurementValues = [];
        this.discreteValues = [];
        this.attachmentTest = []
        this.surgeArresterTestingEquipmentTestType = []
        this.procedureAsset = []
        this.procedureDataSetMeasurementValue = []
        this.testStandard = new TestStandard()
    }
}

export default SurgeArresterJobEntity;
