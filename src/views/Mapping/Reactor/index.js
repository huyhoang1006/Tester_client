import ReactivePower from "@/views/Cim/ReactivePower";
import CurrentFlow from "@/views/Cim/CurrentFlow";
import Frequency from "@/views/Cim/Frequency";
import Voltage from "@/views/Cim/Voltage";
import ReactorEntity from "@/views/Entity/Reactor";
import ReactorDTO from "@/views/Dto/Reactor";
import Mass from "@/views/Cim/Mass";
import Inductance from "@/views/Cim/Inductance";



/** ============================
 * Helper: Map Unit
 * ============================ */
const mappingUnit = (map, unitDto) => {
    if (!map || !unitDto) return;
    map.mrid = unitDto.mrid || null;
    map.value = unitDto.value || null;
    const unitParts = (unitDto.unit || '').split('|'); // ví dụ "k|V"
    map.multiplier = unitParts.length > 1 ? unitParts[0] : null;
    map.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
};


/** ============================
 * DTO → ENTITY
 * ============================ */
export function mapDtoToEntity(dto) {
    const entity = new ReactorEntity();

    /** ---------- Properties ---------- */
    entity.asset.mrid = dto.properties.mrid || null;
    entity.asset.kind = dto.properties.kind || null;
    entity.asset.type = dto.properties.type || null;
    entity.asset.serial_number = dto.properties.serial_no || null;
    entity.asset.asset_info = dto.assetInfoId || null;
    entity.asset.product_asset_model = dto.productAssetModelId || null;
    entity.productAssetModel.manufacturer = dto.properties.manufacturer || null;
    entity.productAssetModel.mrid = dto.productAssetModelId || null;

    entity.productAssetModel.weight_total = dto.reactorOther.weight.mrid || null;
    const weight = new Mass();
    mappingUnit(weight, dto.reactorOther.weight);
    entity.mass.push(weight);

    entity.reactor.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.asset.country_of_origin = dto.properties.country_of_origin || null;
    entity.reactor.mrid = dto.assetInfoId || null;
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

    /** ---------- Rated values ---------- */
    entity.reactor.rated_voltage = dto.reactorRating.rated_voltage.mrid || null;
    const ratedVoltage = new Voltage();
    mappingUnit(ratedVoltage, dto.reactorRating.rated_voltage);
    entity.voltage.push(ratedVoltage);

    entity.reactor.rated_frequency = dto.reactorRating.rated_frequency.mrid || null;
    const ratedFreq = new Frequency();
    mappingUnit(ratedFreq, dto.reactorRating.rated_frequency);
    entity.frequency.push(ratedFreq);

    entity.reactor.rated_current = dto.reactorRating.rated_current.mrid || null;
    const ratedCurrent = new CurrentFlow();
    mappingUnit(ratedCurrent, dto.reactorRating.rated_current);
    entity.currentFlow.push(ratedCurrent);

    entity.reactor.rated_power = dto.reactorRating.rated_power.mrid || null;
    const ratedPower = new ReactivePower();
    mappingUnit(ratedPower, dto.reactorRating.rated_power);
    entity.reactivePower.push(ratedPower);

    entity.reactor.inductance = dto.reactorRating.inductance.mrid || null;
    const inductance = new Inductance();
    mappingUnit(inductance, dto.reactorRating.inductance);
    entity.inductance.push(inductance);

    /** ---------- Others ---------- */
    entity.reactor.insulation_type = dto.reactorOther.insulation_type || null;

    return entity;
}


export function mapEntityToDto(entity) {
    const dto = new ReactorDTO();
    console.log('Mapping Entity to DTO:', entity);

    /** ---------- Properties ---------- */
    dto.properties.mrid = entity.asset.mrid || null;
    dto.properties.kind = entity.asset.kind || null;
    dto.properties.type = entity.asset.type || null;
    dto.properties.serial_no = entity.asset.serial_number || null;
    dto.properties.manufacturer = entity.productAssetModel.manufacturer || null;
    dto.properties.manufacturer_type = entity.reactor.manufacturer_type || null;
    dto.properties.country_of_origin = entity.asset.country_of_origin || null;
    dto.properties.apparatus_id = entity.asset.name || null;
    dto.properties.comment = entity.asset.description || null;
    dto.properties.manufacturing_year = entity.lifecycleDate.manufactured_date || null;

    /** ---------- Asset Info & Product Asset Model ---------- */
    dto.assetInfoId = entity.reactor.mrid || null;
    dto.productAssetModelId = entity.productAssetModel.mrid || null;

    /** ---------- Lifecycle ---------- */
    dto.lifecycleDateId = entity.lifecycleDate.mrid || null;

    /** ---------- assetPsr ---------- */
    dto.assetPsrId = entity.assetPsr.mrid || null;
    dto.psrId = entity.assetPsr.psr_id || null;

    /** ---------- Attachment ---------- */
    dto.attachmentId = entity.attachment.mrid || null;
    dto.attachment = entity.attachment || null;

    /** ---------- Rated values ---------- */
    if (entity.voltage && entity.voltage.length > 0) {
        dto.reactorRating.rated_voltage.mrid = entity.reactor.rated_voltage || null;
        dto.reactorRating.rated_voltage.value = entity.voltage[0].value || null;
        dto.reactorRating.rated_voltage.unit = entity.voltage[0].multiplier && entity.voltage[0].unit
            ? `${entity.voltage[0].multiplier}|${entity.voltage[0].unit}`
            : entity.voltage[0].unit || null;
    }

    if (entity.frequency && entity.frequency.length > 0) {
        dto.reactorRating.rated_frequency.mrid = entity.reactor.rated_frequency || null;
        dto.reactorRating.rated_frequency.value = entity.frequency[0].value || null;
        dto.reactorRating.rated_frequency.unit = entity.frequency[0].unit || null;
    }

    if (entity.currentFlow && entity.currentFlow.length > 0) {
        dto.reactorRating.rated_current.mrid = entity.reactor.rated_current || null;
        dto.reactorRating.rated_current.value = entity.currentFlow[0].value || null;
        dto.reactorRating.rated_current.unit = entity.currentFlow[0].unit || null;
    }

    if (entity.reactivePower && entity.reactivePower.length > 0) {
        dto.reactorRating.rated_power.mrid = entity.reactor.rated_power || null;
        dto.reactorRating.rated_power.value = entity.reactivePower[0].value || null;
        dto.reactorRating.rated_power.unit = entity.reactivePower[0].multiplier && entity.reactivePower[0].unit
            ? `${entity.reactivePower[0].multiplier}|${entity.reactivePower[0].unit}`
            : entity.reactivePower[0].unit || null;
    }

    if (entity.inductance && entity.inductance.length > 0) {
        dto.reactorRating.inductance.mrid = entity.reactor.inductance || null;
        dto.reactorRating.inductance.value = entity.inductance[0].value || null;
        dto.reactorRating.inductance.unit = entity.inductance[0].unit || null;
    }

    /** ---------- Mass/Weight ---------- */
    if (entity.mass && entity.mass.length > 0) {
        dto.reactorOther.weight.mrid = entity.productAssetModel.weight_total || null;
        dto.reactorOther.weight.value = entity.mass[0].value || null;
        dto.reactorOther.weight.unit = entity.mass[0].unit || null;
    }
    console.log('Mapped DTO so far:', dto);

    /** ---------- Others ---------- */
    dto.reactorOther.insulation_type = entity.reactor.insulation_type || null;

    return dto;
}
