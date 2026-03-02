import OldWork from "@/views/Cim/OldWork/index";
import Attachment from "../../Attachment";
class RotatingMachineJobEntity {
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
        this.rotatingMachineTestingEquipmentTestType = []
        this.procedureAsset = []
        this.procedureDataSetMeasurementValue = []
    }
}

export default RotatingMachineJobEntity;