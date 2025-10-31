import CircuitBreakerEntity from "../../Entity/CircuitBreaker"
import CircuitBreakerDto from "../../Dto/CircuitBreaker"
/* eslint-disable */
export function mapDtoToEntity(dto) {
    const entity = new CircuitBreakerEntity()
    entity.asset.mrid = dto.properties.mrid || null;
    entity.asset.kind = dto.properties.kind || null;
    entity.asset.type = dto.properties.type || null;
    entity.asset.serial_number = dto.properties.serial_no || null;
    entity.asset.asset_info = dto.assetInfoId || null;
    entity.asset.product_asset_model = dto.productAssetModelId || null;
    entity.productAssetModel.manufacturer = dto.properties.manufacturer || null;
    entity.productAssetModel.mrid = dto.productAssetModelId || null;
    entity.oldBreakerInfo.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.oldBreakerInfo.product_asset_model = dto.productAssetModelId || null;
    return entity
}

export function mapEntityToDto(entity) {
    const dto = new CircuitBreakerDto()
    return dto
}

const mappingUnit = (map, unitDto) => {
    if (!map || !unitDto) return;
    map.mrid = unitDto.mrid || null;
    map.value = unitDto.value || null;
    const unitParts = (unitDto.unit || '').split('|'); // ví dụ "k|V"
    map.multiplier = unitParts.length > 1 ? unitParts[0] : null;
    map.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
};