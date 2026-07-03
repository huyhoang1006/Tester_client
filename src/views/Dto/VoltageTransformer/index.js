import PropertiesDto from "./Properties";
import Attachment from "@/views/Flatten/Attachment";
import RatingDto from "./Rating";
import VTConfigurationDto from "./VTConfiguration";
import ConfigurationDto from "./Configuration";

class VoltageTransformerDto {
    constructor() {
        this.mrid = null;
        this.properties = new PropertiesDto();
        this.attachment = new Attachment();
        this.config = new ConfigurationDto();
        this.assetInfoId = ''
        this.productAssetModelId = ''
        this.lifecycleDateId = ''
        this.assetPsrId = ''
        this.psrId = ''
        this.attachmentId = ''
        this.locationId = '';

        this.ratings = new RatingDto();
        this.vt_Configuration = new VTConfigurationDto();

    }
}

export default VoltageTransformerDto;