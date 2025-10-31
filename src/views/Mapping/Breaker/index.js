import CircuitBreakerEntity from "../../Entity/CircuitBreaker"
import CircuitBreakerDto from "../../Dto/CircuitBreaker"
import Resistance from "@/views/Cim/Resistance";
import Capacitance from "@/views/Cim/Capacitance";
/* eslint-disable */
export function mapDtoToEntity(dtoa) {
    const dto = new CircuitBreakerDto()
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
    entity.asset.country_of_origin = dto.properties.country_of_origin || null;
    entity.oldBreakerInfo.mrid = dto.assetInfoId || null;
    entity.asset.name = dto.properties.apparatus_id || null;
    entity.asset.description = dto.properties.comment || null;

    /** ---------- Lifecycle ---------- */
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturing_year || null;
    entity.asset.lifecycle_date = dto.lifecycleDateId || null;

    /** ---------- assetPsr ---------- */
    entity.assetPsr.mrid = dto.assetPsrId || null;
    entity.assetPsr.asset_id = dto.properties.mrid || null;
    entity.assetPsr.psr_id = dto.psrId || null;

    /** ---------- attachment ---------- */
    entity.attachment.mrid = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    entity.oldBreakerInfo.phase_number = dto.circuitBreaker.numberOfPhases
    entity.oldBreakerInfo.number_of_interrupters_per_phase = dto.circuitBreaker.interruptersPerPhase
    entity.oldBreakerInfo.pole_operation = dto.circuitBreaker.poleOperation
    entity.oldBreakerInfo.pir = dto.circuitBreaker.hasPIR

    const resistance = new Resistance()
    mappingUnit(resistance, dto.circuitBreaker.pirValue);
    entity.resistance.push(resistance);

    entity.oldBreakerInfo.grading_capacitors = dto.circuitBreaker.hasGradingCapacitors
    
    const capacitance = new Capacitance()
    mappingUnit(capacitance, dto.circuitBreaker.capacitorValue);
    entity.capacitance.push(capacitance);

    entity.oldBreakerInfo.interrupting_medium = dto.circuitBreaker.interruptingMedium
    entity.oldBreakerInfo.tank_type = dto.circuitBreaker.tankType

    //rating
    entity.breakerRatingInfo.mrid = dto.breakerRatingInfoId
    if(dto.ratings.rated_frequency == '')

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