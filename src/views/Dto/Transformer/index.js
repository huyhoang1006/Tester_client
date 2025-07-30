import PropertiesDto from "./Properties";
import WindingConfigurationDto from "./WindingConfiguration";
import RatingsDto from "./Ratings/index";
import ImpedancesDto from "./Impedances";
import OthersDto from "./Others";

class TransformerDto {
    constructor() {
        this.properties = new PropertiesDto();
        this.winding_configuration = new WindingConfigurationDto();
        this.ratings = new RatingsDto();
        this.impedances = new ImpedancesDto();
        this.others = new OthersDto();
        this.assetInfoId = ''
        this.productAssetModelId = '';
        this.lifecycleDateId = '';
        this.assetPsrId = '';
        this.psrId = '';
        this.oldPowerTransformerInfoId = '';
        this.oldTransformerEndInfo = []
    }
}

export default TransformerDto;