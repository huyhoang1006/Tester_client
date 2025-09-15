import PropertiesDto from "./Properties";
import Attachment from "@/views/Entity/Attachment";
import RatingDto from "./Rating";
import VTConfigurationDto from "./VTConfiguration";

class VoltageTransformerDto {
    constructor() {
        this.mrid = null;
        this.properties = new PropertiesDto();
        this.attachment = new Attachment();

        this.assetInfoId = ''
        this.productAssetModelId = ''
        this.lifecycleDateId = ''
        this.assetPsrId = ''
        this.psrId = ''

        this.ratings = new RatingDto();
        this.vt_Configuration = new VTConfigurationDto();

    }
}

export default VoltageTransformerDto;