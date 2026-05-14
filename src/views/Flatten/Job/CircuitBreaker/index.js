import OldWork from "@/views/Cim/OldWork/index";
import Attachment from "../../Attachment";
class CircuitBreakerJobEntity {
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
        this.circuitBreakerTestingEquipmentTestType = []
        this.procedureAsset = []
        this.procedureDataSetMeasurementValue = []
        this.testStandard = []
        this.assessment = []
        this.assessment_group = []
        this.assessment_rule = []
        this.standardCustomized = []
    }
}

export default CircuitBreakerJobEntity;
