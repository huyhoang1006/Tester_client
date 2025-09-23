import ApparentPower from "@/views/Cim/ApparentPower";
import CurrentFlow from "@/views/Cim/CurrentFlow";
import Frequency from "@/views/Cim/Frequency";
import Voltage from "@/views/Cim/Voltage";
import RotatingMachineEntity from "@/views/Entity/RotatingMachine";
import RotatingMachineDTO from "@/views/Dto/RotatingMachine";

const mappingUnit = (map, unitDto) => {
    if (!map || !unitDto) return;

    map.mrid = unitDto.mrid || null;
    map.value = unitDto.value || null;

    const unitParts = (unitDto.unit || '').split('|'); // ví dụ: "k|V"
    map.multiplier = unitParts.length > 1 ? unitParts[0] : null;
    map.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
};

export function mapDtoToEntity(dto) {
    const entity = new RotatingMachineEntity();

    //properties
    entity.asset.mrid = dto.properties.mrid || null;
    entity.asset.kind = dto.properties.kind || null;
    entity.asset.type = dto.properties.type || null;
    entity.asset.serial_number = dto.properties.serial_no || null;
    entity.asset.asset_info = dto.assetInfoId || null;
    entity.productAssetModel.manufacturer = dto.properties.manufacturer || null;
    entity.productAssetModel.mrid = dto.productAssetModelId || null;
    entity.rotatingMachine.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.rotatingMachine.country_of_origin = dto.properties.country_of_origin || null;
    entity.rotatingMachine.mrid = dto.assetInfoId || null;
    entity.asset.name = dto.properties.apparatus_id || null;
    entity.asset.description = dto.properties.comment || null;

    /** ================== lifecycle date ================== */
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturing_year || null;
    entity.asset.lifecycle_date = dto.lifecycleDateId || null;

    //assetPsr
    entity.assetPsr.mrid = dto.assetPsrId || null;
    entity.assetPsr.asset_id = dto.properties.mrid || null;
    entity.assetPsr.psr_id = dto.psrId || null;

    /** ================== attachment ================== */
    entity.attachment.mrid = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;


    entity.rotatingMachine.star_point = dto.configsData.star_point || null;

    entity.rotatingMachine.rated_frequency = dto.ratingsData.rated_frequency.mrid || null;
    const newRatedFrequency = new Frequency();
    mappingUnit(newRatedFrequency, dto.ratingsData.rated_frequency);
    entity.frequency.push(newRatedFrequency);

    entity.rotatingMachine.rated_current = dto.ratingsData.rated_current.mrid || null;
    const newRatedCurrent = new CurrentFlow();
    mappingUnit(newRatedCurrent, dto.ratingsData.rated_current);
    entity.currentFlow.push(newRatedCurrent);

    entity.rotatingMachine.rated_u = dto.ratingsData.rated_u.mrid || null;
    const newRatedU = new Voltage();
    mappingUnit(newRatedU, dto.ratingsData.rated_u);
    entity.voltage.push(newRatedU);

    entity.rotatingMachine.rated_speed = dto.ratingsData.rated_speed || null;


    entity.rotatingMachine.rated_power = dto.ratingsData.rated_power.mrid || null;
    const newRatedPower = new ApparentPower();
    mappingUnit(newRatedPower, dto.ratingsData.rated_power);
    entity.apparentPower.push(newRatedPower);

    entity.rotatingMachine.rated_power_factor = dto.ratingsData.rated_power_factor || null;
    entity.rotatingMachine.rated_thermal_class = dto.ratingsData.rated_thermal_class || null;
    entity.rotatingMachine.rated_ifd = dto.ratingsData.rated_ifd.mrid || null;
    const newRatedIfd = new CurrentFlow();
    mappingUnit(newRatedIfd, dto.ratingsData.rated_ifd);
    entity.currentFlow.push(newRatedIfd);

    entity.rotatingMachine.rated_ufd = dto.ratingsData.rated_ufd.mrid || null;
    const newRatedUfd = new Voltage();
    mappingUnit(newRatedUfd, dto.ratingsData.rated_ufd);
    entity.voltage.push(newRatedUfd);

    return entity;

}

export function mapEntityToDto(entity) {
    const dto = new RotatingMachineDTO();

    // properties
    dto.properties.mrid = entity.asset.mrid || null;
    dto.properties.kind = entity.asset.kind || null;
    dto.properties.type = entity.asset.type || null;
    dto.properties.serial_no = entity.asset.serial_number || null;
    dto.assetInfoId = entity.asset.asset_info || null;
    dto.properties.manufacturer = entity.productAssetModel.manufacturer || null;
    dto.productAssetModelId = entity.productAssetModel.mrid || null;
    dto.properties.manufacturer_type = entity.rotatingMachine.manufacturer_type || null;
    dto.properties.country_of_origin = entity.rotatingMachine.country_of_origin || null;
    dto.assetInfoId = entity.rotatingMachine.mrid || null;
    dto.properties.apparatus_id = entity.asset.name || null;
    dto.properties.comment = entity.asset.description || null;

    // lifecycle date
    dto.lifecycleDateId = entity.lifecycleDate.mrid || null;
    dto.properties.manufacturing_year = entity.lifecycleDate.manufactured_date || null;
    dto.lifecycleDateId = entity.asset.lifecycle_date || null;

    // assetPsr
    dto.assetPsrId = entity.assetPsr.mrid || null;
    dto.properties.mrid = entity.assetPsr.asset_id || dto.properties.mrid;
    dto.psrId = entity.assetPsr.psr_id || null;

    // attachment
    dto.attachmentId = entity.attachment?.mrid || null;
    dto.attachment = entity.attachment || null;

    // configsData
    dto.configsData.star_point = entity.rotatingMachine.star_point || null;

    // ratingsData
    // Helper to find first by mrid
    const findByMrid = (arr, mrid) => arr?.find(x => x.mrid === mrid) || {};

    // rated_frequency
    const freq = findByMrid(entity.frequency, entity.rotatingMachine.rated_frequency);
    dto.ratingsData.rated_frequency = {
        mrid: freq.mrid || null,
        value: freq.value || null,
        unit: (freq.multiplier ? freq.multiplier + "|" : "") + (freq.unit || "")
    };

    // rated_current
    const cur = findByMrid(entity.currentFlow, entity.rotatingMachine.rated_current);
    dto.ratingsData.rated_current = {
        mrid: cur.mrid || null,
        value: cur.value || null,
        unit: (cur.multiplier ? cur.multiplier + "|" : "") + (cur.unit || "")
    };

    // rated_u
    const volt = findByMrid(entity.voltage, entity.rotatingMachine.rated_u);
    dto.ratingsData.rated_u = {
        mrid: volt.mrid || null,
        value: volt.value || null,
        unit: (volt.multiplier ? volt.multiplier + "|" : "") + (volt.unit || "")
    };

    dto.ratingsData.rated_speed = entity.rotatingMachine.rated_speed || null;

    // rated_power
    const pow = findByMrid(entity.apparentPower, entity.rotatingMachine.rated_power);
    dto.ratingsData.rated_power = {
        mrid: pow.mrid || null,
        value: pow.value || null,
        unit: (pow.multiplier ? pow.multiplier + "|" : "") + (pow.unit || "")
    };

    dto.ratingsData.rated_power_factor = entity.rotatingMachine.rated_power_factor || null;
    dto.ratingsData.rated_thermal_class = entity.rotatingMachine.rated_thermal_class || null;

    // rated_ifd
    const ifd = findByMrid(entity.currentFlow, entity.rotatingMachine.rated_ifd);
    dto.ratingsData.rated_ifd = {
        mrid: ifd.mrid || null,
        value: ifd.value || null,
        unit: (ifd.multiplier ? ifd.multiplier + "|" : "") + (ifd.unit || "")
    };

    // rated_ufd
    const ufd = findByMrid(entity.voltage, entity.rotatingMachine.rated_ufd);
    dto.ratingsData.rated_ufd = {
        mrid: ufd.mrid || null,
        value: ufd.value || null,
        unit: (ufd.multiplier ? ufd.multiplier + "|" : "") + (ufd.unit || "")
    };

    return dto;
}