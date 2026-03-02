import OldWork from "@/views/Cim/OldWork/index";
import Attachment from "../../Attachment";
class VoltageTransformerJobEntity {
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
        this.voltageTransformerTestingEquipmentTestType = []
        this.procedureAsset = []
        this.procedureDataSetMeasurementValue = []
    }
}

export default VoltageTransformerJobEntity;
