/* eslint-disable */
import BushingingEntity from "@/views/Entity/Bushing";
import BushingDto from "@/views/Dto/BushingAsset";
import Voltage from "@/views/Cim/Voltage";
import CurrentFlow from "@/views/Cim/CurrentFlow";
import Seconds from "@/views/Cim/Seconds";
import { UnitMultiplier } from "@/views/Enum/UnitMultiplier";
import { UnitSymbol } from "@/views/Enum/UnitSymbol";
export function mapDtoToEntity(dto) {
    const entity = new BushingingEntity();

    //properties
    entity.bushing.mrid = dto.properties.mrid || null;
    entity.bushing.kind = dto.properties.kind || null;
    entity.bushing.type = dto.properties.type || null;
    entity.bushing.serial_number = dto.properties.serial_no || null;
    entity.bushing.asset_info = dto.assetInfoId || null;
    entity.productAssetModel.manufacturer = dto.properties.manufacturer || null;
    entity.bushing.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.bushing.country_of_origin = dto.properties.country_of_origin || null;
    entity.bushing.name = dto.properties.apparatus_id || null;
    entity.bushing.description = dto.properties.comment || null;
    entity.productAssetModel.mrid = dto.productAssetModelId || null;
    entity.bushing.location = dto.locationId || null;
    entity.bushing.product_asset_model = dto.productAssetModelId || null;

    // lifecycle date
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturer_year || null;
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.bushing.lifecycle_date = dto.lifecycleDateId || null;

    //assetPsr
    entity.assetPsr.mrid = dto.assetPsrId || null;
    entity.assetPsr.asset_id = dto.properties.mrid || null;
    entity.assetPsr.psr_id = dto.psrId || null;

    //oldBushing
    entity.oldBushingInfo.mrid = dto.assetInfoId || null

    //insulation type
    entity.oldBushingInfo.insulation_kind = dto.bushing.insulation_type || null

    //rated current
    entity.oldBushingInfo.rated_current = dto.bushing.rated_current.mrid || null
    let unitPartsRatedCurrent = (dto.bushing.rated_current.unit || '').split('|');
    const currentFlow = new CurrentFlow();
    currentFlow.mrid = dto.bushing.rated_current.mrid || null;
    currentFlow.multiplier = unitPartsRatedCurrent.length > 1 ? unitPartsRatedCurrent[0] : null;
    currentFlow.unit = unitPartsRatedCurrent.length > 1 ? unitPartsRatedCurrent[1] : unitPartsRatedCurrent[0] || null;
    currentFlow.value = dto.bushing.rated_current.value || null;
    entity.currentFlow.push(currentFlow);


    //attachment
    entity.attachment.mrid = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    console.log(entity)

    return entity;

}

export function mapEntityToDto(entity) {
    const dto = new BushingDto();

    //properties
    dto.properties.mrid = entity.bushing.mrid || '';
    dto.properties.kind = entity.bushing.kind || '';
    dto.properties.type = entity.bushing.type || '';
    dto.properties.serial_no = entity.bushing.serial_number || '';
    dto.oldBushingInfoId = entity.bushing.asset_info || '';
    dto.properties.manufacturer = entity.productAssetModel.manufacturer || '';
    dto.productAssetModelId = entity.productAssetModel.mrid || '';
    dto.properties.manufacturer_type = entity.bushing.manufacturer_type || '';
    dto.properties.country_of_origin = entity.bushing.country_of_origin || '';
    dto.properties.apparatus_id = entity.bushing.name || '';
    dto.properties.comment = entity.bushing.description || '';
    dto.locationId = entity.bushing.location || '';
    dto.productAssetModelId = entity.bushing.product_asset_model || '';

    // lifecycle date
    dto.lifecycleDateId = entity.bushing.lifecycle_date || '';
    dto.properties.manufacturer_year = entity.lifecycleDate.manufactured_date || '';

    //assetPsr
    dto.assetPsrId = entity.assetPsr.mrid || '';
    dto.psrId = entity.assetPsr.psr_id || '';
    dto.oldBushingInfoId = entity.assetPsr.asset_id || '';

    //attachment
    dto.attachmentId = entity.attachment.mrid || '';
    dto.attachment = entity.attachment;

    return dto;

}