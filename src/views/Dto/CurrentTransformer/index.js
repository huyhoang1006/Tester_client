import PropertiesDto from "./Properties";
import RatingsDto from "./Ratings";
import CTConfigurationDto from "./CTConfiguration";
import Attachment from "@/views/Flatten/Attachment";
import ConfigurationDto from "./Configuration";
class CurrentTransformerDto {
    constructor() {
        this.properties = new PropertiesDto();
        this.ratings = new RatingsDto();
        this.config = new ConfigurationDto();
        this.ctConfiguration = new CTConfigurationDto();
        this.attachment = new Attachment();

        this.assetInfoId = ''
        this.productAssetModelId = ''
        this.lifecycleDateId = ''
        this.assetPsrId = ''
        this.psrId = ''
        this.attachmentId = ''
        this.locationId = '';

    }
}

export default CurrentTransformerDto;