import PropertiesDto from './Properties';
import Attachment from "@/views/Flatten/Attachment";
import circuitBreakerDto from "./CircuitBreaker";
import ratingsDto from  "./Ratings"
import ContactSystemDto from "./ContactSystem";
import OtherDto from "./Other";
import OperatingDto from "./Operating/index";
import AssessmentDto from "./AsssessmentLimits";

class CircuitBreakerDto {
    constructor() {
        this.properties = new PropertiesDto();
        this.attachment = new Attachment();
        this.lifecycleDateId = ''
        this.productAssetModelId = ''
        this.attachmentId = ''
        this.assetInfoId = ''
        this.assetPsrId = ''
        this.psrId = ''
        this.locationId = ''

        this.circuitBreaker = new circuitBreakerDto();

        this.breakerRatingInfoId = ''
        this.ratings = new ratingsDto();

        this.breakerContactSystemInfoId = ''
        this.contactSystem = new ContactSystemDto();

        this.breakerOtherInfoId = ''
        this.others = new OtherDto();

        this.operatingMechanismId = ''
        this.operatingMechanismInfoId = ''
        this.operatingMechanismLifecycleDateId = ''
        this.operatingMechanismProductAssetModelId = ''

        this.operating = new OperatingDto();

        this.assessmentLimitBreakerInfoId = ''
        this.assessmentLimits = new AssessmentDto();
    }
}

export default CircuitBreakerDto;