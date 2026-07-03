import PropertiesDto from "./Properties";
import RatingsDto from "./Ratings";
import Attachment from "@/views/Flatten/Attachment";
import ConfigurationDto from "./Configuration";
class SurgeArresterDto {
    constructor() {
        this.properties = new PropertiesDto();
        this.ratings = new RatingsDto();
        this.config = new ConfigurationDto();
        this.assetInfoId = ''
        this.productAssetModelId = '';
        this.lifecycleDateId = '';
        this.assetPsrId = '';
        this.psrId = '';
        this.attachmentId = '';
        this.attachment = new Attachment();
        this.locationId = '';
    }
}

export default SurgeArresterDto;