/* eslint-disable */
import * as surgeArresterAPI from '@/api/demo/SurgeArrester.js'
import * as SurgeArresterServerMapper from '@/views/Mapping/ServerToDTO/SurgeArrester/index.js'
import * as SurgeArresterMapper from '@/views/Mapping/SurgeArrester/index.js'
import SurgeArresterEntity from '@/views/Flatten/SurgeArrester'
import { fetchWithRetry } from './core-utils.js'

// SurgeArrester không có conflict dialog vì tableRating là array phức tạp
// Server wins nếu client rỗng, giữ client nếu đã có data

// ─── Step 1: fetch full info từ server ───────────────────────────────────────

export async function getSurgeArresterChain(id, parentId) {
    try {
        const data = await fetchWithRetry(() => surgeArresterAPI.getSurgeArresterById(id))
        return {
            surgeArrester: {
                id:          id,
                mrid:        String(id),
                name:        data?.assetInfo?.apparatusId || '',
                parentId:    String(parentId),
                _type:       'asset',
                asset:       'Surge arrester',
                _serverData: data || {},
            },
            _type:       'asset',
            asset:       'Surge arrester',
            parentBayId: String(parentId),
        }
    } catch (error) {
        console.error(`Error fetching surgeArrester with id ${id}:`, error)
        throw new Error(`Error fetching surgeArrester with id ${id}: ${error.message}`)
    }
}

// ─── Step 2: save to DB ───────────────────────────────────────────────────────

export async function downloadSurgeArresterChain(data, ctx) {
    const sa         = data.surgeArrester
    const serverData = { ...sa._serverData, mRID: sa.mrid }

    // 1. Map server → serverDto
    const serverDto       = SurgeArresterServerMapper.mapServerToDto(serverData)
    serverDto.psrId       = data.parentBayId
    serverDto.properties.mrid = sa.mrid

    // 2. Lấy client data cũ nếu đã tồn tại
    const existingResult = await window.electronAPI.getSurgeArresterEntityByMrid(
        sa.mrid, data.parentBayId
    )
    const clientEntity = existingResult.success ? existingResult.data : null
    const clientDto    = clientEntity
        ? SurgeArresterMapper.mapEntityToDto(clientEntity)
        : null

    // 3. Merge — surge arrester dùng simple merge
    let mergedDto

    if (!clientDto) {
        mergedDto = serverDto
    } else {
        // Giữ client, cập nhật những field server có mà client rỗng
        mergedDto = { ...clientDto }

        // Properties — server wins nếu client rỗng
        const propsToMerge = [
            'serial_no', 'manufacturer', 'manufacturer_type',
            'manufacturer_year', 'country_of_origin', 'apparatus_id', 'comment'
        ]
        for (const key of propsToMerge) {
            if (!clientDto.properties[key] && serverDto.properties[key]) {
                mergedDto.properties = { ...mergedDto.properties }
                mergedDto.properties[key] = serverDto.properties[key]
            }
        }

        // tableRating — giữ lại mrid cũ nếu trùng position
        const clientRatings = clientDto.ratings?.tableRating || []
        mergedDto.ratings = { ...clientDto.ratings }
        mergedDto.ratings.tableRating = serverDto.ratings.tableRating.map(serverRow => {
            const clientRow = clientRatings.find(r => r.position === serverRow.position)
            if (!clientRow) return serverRow

            // Giữ lại mrid cũ để tránh orphan
            return {
                ...serverRow,
                mrid:        clientRow.mrid        || serverRow.mrid,
                assetInfoId: clientRow.assetInfoId || serverRow.assetInfoId,
                // Giữ giá trị client nếu đã nhập, lấy server nếu client rỗng
                serial:      clientRow.serial || serverRow.serial,
                ratedVoltage: {
                    ...serverRow.ratedVoltage,
                    mrid: clientRow.ratedVoltage?.mrid || serverRow.ratedVoltage.mrid,
                },
                maximumVoltage: {
                    ...serverRow.maximumVoltage,
                    mrid: clientRow.maximumVoltage?.mrid || serverRow.maximumVoltage.mrid,
                },
                continousVoltage: {
                    ...serverRow.continousVoltage,
                    mrid: clientRow.continousVoltage?.mrid || serverRow.continousVoltage.mrid,
                },
                shortCurrent: {
                    ...serverRow.shortCurrent,
                    mrid: clientRow.shortCurrent?.mrid || serverRow.shortCurrent.mrid,
                },
                ratedCircuit: {
                    ...serverRow.ratedCircuit,
                    mrid: clientRow.ratedCircuit?.mrid || serverRow.ratedCircuit.mrid,
                },
                polesVoltage: {
                    ...serverRow.polesVoltage,
                    mrid: clientRow.polesVoltage?.mrid || serverRow.polesVoltage.mrid,
                },
                isoVoltage: {
                    ...serverRow.isoVoltage,
                    mrid: clientRow.isoVoltage?.mrid || serverRow.isoVoltage.mrid,
                },
            }
        })
        mergedDto.ratings.unitStack = serverDto.ratings.unitStack

        // Giữ lại các mrid cũ để tránh orphan records
        mergedDto.assetInfoId         = clientDto.assetInfoId         || serverDto.assetInfoId
        mergedDto.productAssetModelId = clientDto.productAssetModelId || serverDto.productAssetModelId
        mergedDto.lifecycleDateId     = clientDto.lifecycleDateId     || serverDto.lifecycleDateId
        mergedDto.assetPsrId          = clientDto.assetPsrId          || serverDto.assetPsrId
        mergedDto.locationId          = clientDto.locationId          || serverDto.locationId
    }

    // 4. Set context IDs
    mergedDto.properties.mrid = sa.mrid
    mergedDto.psrId           = data.parentBayId

    // 5. Build entity từ mergedDto
    const oldEntity = clientEntity || new SurgeArresterEntity()
    const newEntity = SurgeArresterMapper.mapDtoToEntity(mergedDto)

    console.log('New SurgeArrester Entity:', newEntity)

    // 6. Insert DB + snapshot trong cùng 1 transaction
    const insertResult = await fetchWithRetry(
        () => window.electronAPI.insertSurgeArresterEntity(oldEntity, newEntity, serverDto)
    )
    if (!insertResult.success) throw new Error(`Database Insert SurgeArrester Error: ${insertResult.message}`)

    // 7. Update UI — chỉ sau khi DB thành công
    // const parentNode = ctx.findNodeById(data.parentBayId, ctx.organisationClientList)
    // if (parentNode) {
    //     const newNode = {
    //         mrid:     sa.mrid,
    //         name:     sa.name,
    //         parentId: data.parentBayId,
    //         _type:    'asset',
    //         asset:    'Surge Arrester',
    //         mode:     'asset',
    //     }

    //     if (!parentNode.children) {
    //         ctx.$set(parentNode, 'children', [newNode])
    //     } else {
    //         const idx = parentNode.children.findIndex(c => c.mrid === sa.mrid)
    //         if (idx >= 0) parentNode.children.splice(idx, 1, newNode)
    //         else parentNode.children.push(newNode)
    //     }

    //     if (!parentNode.expanded) ctx.$set(parentNode, 'expanded', true)
    // }
}