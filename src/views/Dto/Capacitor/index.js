import { UnitSymbol } from '@/views/Enum/UnitSymbol'
import { UnitMultiplier } from '@/views/Enum/UnitMultiplier'
import Attachment from '@/views/Entity/Attachment'
import PropertiesDto from './Properties'

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
            capacitace: { mrid: '', value: '', unit: UnitMultiplier.n + '|' + UnitSymbol.F }, // nF
            dissipation_factor: { mrid: '', value: '', unit: UnitSymbol.percent }, // %
            capacitace_phase_A: { mrid: '', value: '', unit: UnitMultiplier.n + '|' + UnitSymbol.F }, // nF
            capacitace_phase_B: { mrid: '', value: '', unit: UnitMultiplier.n + '|' + UnitSymbol.F }, // nF
            capacitace_phase_C: { mrid: '', value: '', unit: UnitMultiplier.n + '|' + UnitSymbol.F }, // nF
            dissipation_factor_A: { mrid: '', value: '', unit: UnitSymbol.percent }, // %
            dissipation_factor_B: { mrid: '', value: '', unit: UnitSymbol.percent }, // %
            dissipation_factor_C: { mrid: '', value: '', unit: UnitSymbol.percent }, // %
        }

        this.othersData = {
            insulation_type: '',
            weight: { mrid: '', value: '', unit: UnitSymbol.kg },
        }
    }
}

export default CapacitorsDTO;
