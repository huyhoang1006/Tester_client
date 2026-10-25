import * as TestingEquipmentAPI from '@/api/demo/TestingEquipment'
import * as TestingEquipmentMapper from '@/views/Mapping/TestingEquipment'
import { toServerId } from '@/utils/serverId'

export const resolveServerEquipmentList = async equipmentList => {
    const resolved = []
    for (const equipment of equipmentList || []) {
        const localId = equipment.mrid
        const candidateId = toServerId(localId)
        let serverEquipment = null
        try {
            serverEquipment = await TestingEquipmentAPI.getTestingEquipmentById(candidateId)
        } catch (error) {
            if (!error.response || error.response.status !== 404) throw error
        }

        let serverId = serverEquipment && (serverEquipment.mrid || (serverEquipment.properties && serverEquipment.properties.mrid))
        if (!serverId) {
            const local = await window.electronAPI.getTestingEquipmentEntityByMrid(localId)
            if (!local || !local.success || !local.data) {
                throw new Error(`Cannot read local testing equipment ${localId}`)
            }
            const properties = TestingEquipmentMapper.mapEntityToDto(local.data).properties
            const serial = properties.serial_no || equipment.serial_number
            const manufacturer = properties.manufacturer
            if (serial && manufacturer) {
                const match = await TestingEquipmentAPI.findMatchingTestingEquipment(serial, manufacturer)
                serverId = match && match.mrid
            }
        }
        if (!serverId) {
            throw new Error(`Testing equipment ${equipment.model || equipment.serial_number || localId} is not on the server. Push it from Testing equipment first.`)
        }
        resolved.push({ ...equipment, mrid: String(serverId) })
    }
    return resolved
}
