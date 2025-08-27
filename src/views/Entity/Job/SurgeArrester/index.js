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
        this.specimen = []
        this.transformerObservation = []
        this.temperature = []
        this.percent = []
        this.transformerObservationProcedureDataSet = []
    }
}

export default SurgeArresterJobEntity;
