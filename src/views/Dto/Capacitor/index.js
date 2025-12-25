import { UnitSymbol } from '@/views/Enum/UnitSymbol'
import { UnitMultiplier } from '@/views/Enum/UnitMultiplier'
import Attachment from '@/views/Flatten/Attachment'
import PropertiesDto from './Properties'
import CapacitanceDto from './Capacitance'
import DissipationFactorDto from './DissipationFactor'

class CapacitorsDTO {
    constructor() {
        this.mrid = null

        // Properties
        this.properties = new PropertiesDto()
        // Attachments
        this.attachment = new Attachment()
        this.lifecycleDateId = ''
        this.productAssetModelId = ''
        this.attachmentId = ''
        this.assetInfoId = ''
        this.assetPsrId = ''
        this.psrId = ''
        this.locationId = '';

        this.configsData = {
            phase: '1',
            phase_name: '',
        };
        // Ratings
        this.ratings = {
            rated_voltage: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V }, // kV
            rated_frequency: { mrid: '', value: '', unit: UnitSymbol.Hz }, // Hz
            rated_current: { mrid: '', value: '', unit: UnitSymbol.A }, // A
            rated_power: { mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.VAr }, // kVAr
        }
        this.capacitance = new CapacitanceDto()
        this.dissipationFactor = new DissipationFactorDto()

        this.othersData = {
            insulation_type: '',
            weight: { mrid: '', value: '', unit: UnitSymbol.kg },
        }
    }
}

export default CapacitorsDTO;
