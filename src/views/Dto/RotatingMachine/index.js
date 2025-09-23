import { UnitSymbol } from "@/views/Enum/UnitSymbol";
import { UnitMultiplier } from "@/views/Enum/UnitMultiplier";
import Attachment from "@/views/Entity/Attachment";
import PropertiesDto from "./Properties";


class RotatingMachineDTO {
    constructor() {
        this.mrid = '';
        this.properties = new PropertiesDto();
        this.attachment = new Attachment();
        this.lifecycleDateId = ''
        this.productAssetModelId = ''
        this.attachmentId = ''
        this.assetInfoId = ''
        this.assetPsrId = ''

        this.configsData = {
            star_point: '',
        };

        this.ratingsData = {
            rated_u: { mrid: '', value: '', unit: UnitSymbol.V },
            rated_current: { mrid: '', value: '', unit: UnitSymbol.A },
            rated_speed: '',
            rated_frequency: { mrid: '', value: '', unit: UnitSymbol.Hz },
            rated_power: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.VA },
            rated_power_factor: '',
            rated_thermal_class: '',
            rated_ifd: { mrid: '', value: '', unit: UnitSymbol.A },
            rated_ufd: { mrid: '', value: '', unit: UnitSymbol.V }
        }

    }
}

export default RotatingMachineDTO;