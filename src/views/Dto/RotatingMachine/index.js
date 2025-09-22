import { UnitSymbol } from "@/views/Enum/UnitSymbol";
import { UnitMultiplier } from "@/views/Enum/UnitMultiplier";
import Attachment from "@/views/Entity/Attachment";
import PropertiesDto from "./Properties";


class RotatingMachineDTO {
    constructor() {
        this.mrid = '21';
        this.properties = new PropertiesDto();
        this.attachment = new Attachment();
        this.lifecycleDateId = '12'
        this.productAssetModelId = '12'
        this.attachmentId = '21'
        this.assetInfoId = '21'
        this.assetPsrId = '21'

        this.configsData = {
            star_point: '',
        };

        this.ratingsData = {
            rated_u: { mrid: '', value: '3', unit: UnitSymbol.V },
            rated_current: { mrid: '', value: '32', unit: UnitSymbol.A },
            rated_speed: '23',
            rated_frequency: { mrid: '', value: '342', unit: UnitSymbol.Hz },
            rated_power: { mrid: '', value: '42', unit: UnitMultiplier.k + '|' + UnitSymbol.VA },
            rated_power_factor: '66',
            rated_thermal_class: '4',
            rated_ifd: { mrid: '', value: '3', unit: UnitSymbol.A },
            rated_ufd: { mrid: '', value: '3', unit: UnitSymbol.V }
        }

    }
}

export default RotatingMachineDTO;