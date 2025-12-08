import OldWork from "@/views/Cim/OldWork/index";
import Attachment from "../../Attachment";
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
        this.analog = [];
        this.stringMeasurement = [];
        this.discrete = [];
        this.attachmentTest = []
        this.transformerObservation = []
        this.temperature = []
        this.percent = []
        this.transformerObservationProcedureDataSet = []
        this.surgeArresterTestingEquipmentTestType = []
        this.measurementProcedure = []
        this.valueAliasSet = []
        this.valueToAlias = []
        this.procedure = []
        this.procedureAsset = []
        this.procedureDataSetMeasurementValue = []
    }
}

export default SurgeArresterJobEntity;
