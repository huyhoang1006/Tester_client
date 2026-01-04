import uuid from '@/utils/uuid'

export const importSurgeArrester = async (dto, parentNode, {electronAPI, mappings}) => {
    try {
        if (parentNode?.mode && parentNode.mode !== 'substation' && parentNode.mode !== 'bay' && parentNode.mode !== 'surgeArrester') {
            return {
                success: false,
                message: 'SurgeArrester can only be imported under Substation, Bay or SurgeArrester'
            }
        }

        const entity = mappings.SurgeArresterMapping.mapDtoToEntity(dto) || {}
        entity.surgeArrester ??= {}

        // Tạo mrid mới cho surgeArrester
        const newMrid = uuid.newUuid()
        entity.surgeArrester.mrid = newMrid

        const newLifecycleDateMrid = uuid.newUuid()
        entity.lifecycleDate ??= {}
        entity.lifecycleDate.mrid = newLifecycleDateMrid
        entity.surgeArrester.lifecycle_date = newLifecycleDateMrid

        // Tạo mrid mới cho productAssetModel
        const newProductAssetModelMrid = uuid.newUuid()
        entity.productAssetModel ??= {}
        entity.productAssetModel.mrid = newProductAssetModelMrid
        entity.surgeArrester.product_asset_model = newProductAssetModelMrid

        entity.surgeArrester.location = null

        if (parentNode?.mrid) {
            entity.assetPsr = {
                mrid: uuid.newUuid(),
                asset_id: newMrid,
                psr_id: parentNode.mrid
            }
        } else {
            entity.assetPsr = {
                mrid: uuid.newUuid(),
                asset_id: newMrid,
                psr_id: null
            }
        }

        const ensureArray = (obj, key) => {
            if (!Array.isArray(obj[key])) obj[key] = []
        }

        ensureArray(entity, 'voltage')
        ensureArray(entity, 'seconds')
        ensureArray(entity, 'currentFlow')
        ensureArray(entity, 'oldSurgeArresterInfo')

        for (const voltage of entity.voltage) {
            voltage.mrid = uuid.newUuid()
        }

        for (const second of entity.seconds) {
            second.mrid = uuid.newUuid()
        }

        for (const current of entity.currentFlow) {
            current.mrid = uuid.newUuid()
        }

        // Tạo mrid mới cho oldSurgeArresterInfo và cập nhật references
        let voltageIndex = 0
        let secondsIndex = 0
        let currentFlowIndex = 0

        for (const info of entity.oldSurgeArresterInfo) {
            info.mrid = uuid.newUuid()
            info.surge_arrester_id = newMrid
            info.product_asset_model = newProductAssetModelMrid

            // Cập nhật reference đến voltage mới (5 voltage per info)
            if (entity.voltage[voltageIndex]) {
                info.rated_voltage = entity.voltage[voltageIndex].mrid
                voltageIndex++
            }
            if (entity.voltage[voltageIndex]) {
                info.maximum_system_voltage = entity.voltage[voltageIndex].mrid
                voltageIndex++
            }
            if (entity.voltage[voltageIndex]) {
                info.continuous_operating_voltage = entity.voltage[voltageIndex].mrid
                voltageIndex++
            }
            if (entity.voltage[voltageIndex]) {
                info.pf_with_stand_voltage_earth_between_pole = entity.voltage[voltageIndex].mrid
                voltageIndex++
            }
            if (entity.voltage[voltageIndex]) {
                info.pf_with_stand_voltage_isolated_distance = entity.voltage[voltageIndex].mrid
                voltageIndex++
            }

            // Cập nhật reference đến currentFlow mới (1 per info)
            if (entity.currentFlow[currentFlowIndex]) {
                info.short_time_with_stand_current = entity.currentFlow[currentFlowIndex].mrid
                currentFlowIndex++
            }

            // Cập nhật reference đến seconds mới (1 per info)
            if (entity.seconds[secondsIndex]) {
                info.rated_duration_of_short_circuit = entity.seconds[secondsIndex].mrid
                secondsIndex++
            }
        }

        // Khởi tạo attachment rỗng (import không copy file attachment)
        entity.attachment = {
            id: null,
            name: null,
            path: '[]',
            type: 'asset',
            id_foreign: newMrid
        }

        // Tạo old_entity rỗng để insertSurgeArresterEntity hoạt động đúng
        const old_entity = {
            voltage: [],
            seconds: [],
            currentFlow: [],
            oldSurgeArresterInfo: []
        }

        const result = await electronAPI.insertSurgeArresterEntity(old_entity, entity)
        return {
            ...result,
            entity
        }
    } catch (error) {
        console.error('Error importing surge arrester:', error)
        return {success: false, message: error?.message || 'Import Surge Arrester failed'}
    }
}

export const deleteSurgeArrester = async (mrid, psrId, {electronAPI}) => {
    try {
        if (!mrid) {
            return {success: false, message: 'MRID is required'}
        }

        // Lấy entity đầy đủ để xóa
        const entityRes = await electronAPI.getSurgeArresterEntityByMrid(mrid, psrId)
        if (!entityRes.success || !entityRes.data) {
            return {success: false, message: 'SurgeArrester not found'}
        }

        const result = await electronAPI.deleteSurgeArresterEntity(entityRes.data)
        return result
    } catch (error) {
        console.error('Error deleting surge arrester:', error)
        return {success: false, message: error?.message || 'Delete Surge Arrester failed'}
    }
}
