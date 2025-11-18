import PropertiesDto from "./Properties";
import Attachment from "@/views/Entity/Attachment";
import WindingConfigurationDto from "./WindingConfiguration";
import RatingsDto from "./Ratings/index";
import ImpedancesDto from "./Impedances";
import OthersDto from "./Others";
import BushingDto from "./Bushing";
import SurgeArresterDto from "./SurgeArrester";
import TapChangersDto from "./Tapchanger"

class TransformerDataDto {
    constructor() {
        this.properties = new PropertiesDto();
        this.attachment = new Attachment();
        this.winding_configuration = new WindingConfigurationDto();
        this.ratings = new RatingsDto();
        this.impedances = new ImpedancesDto();
        this.others = new OthersDto();
        this.tap_changers = new TapChangersDto(),
        this.productAssetModelId = '';
        this.lifecycleDateId = '';2
        this.assetPsrId = '';
        this.psrId = '';
        this.oldPowerTransformerInfoId = '';
        this.locationId = '';
        this.attachmentId = '';
        this.oldTransformerEndInfo = []
        this.shortCircuitTestTransformerEndInfo = []
        this.bushing_data = new BushingDto()
        this.surge_arrester = new SurgeArresterDto()
    }
}

export default TransformerDataDto;