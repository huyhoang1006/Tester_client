import {UnitSymbol} from '@/views/Enum/UnitSymbol'
import {UnitMultiplier} from '@/views/Enum/UnitMultiplier'
import Attachment from '@/views/Flatten/Attachment'
import PropertiesDto from './Properties'

class DisconnectorDTO {
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

        // Ratings
        this.ratings = {
            rated_voltage: {mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V}, // kV
            rated_frequency: {mrid: '', value: '', unit: UnitSymbol.Hz}, // Hz
            rated_current: {mrid: '', value: '', unit: UnitSymbol.A}, // A
            short_time_withstand_current: {mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.A}, // kA
            rated_duration_of_short_circuit: {mrid: '', value: '', unit: UnitSymbol.s}, // s

            // Power frequency withstand voltage
            power_freq_withstand_voltage_earth_poles: {mrid: '', value: '', unit: UnitMultiplier.k + '|' + UnitSymbol.V}, // kV
            power_freq_withstand_voltage_isolating_distance: {mrid: '', value: '', unit: UnitSymbol.Hz} // Hz
        }
    }
}

export default DisconnectorDTO
