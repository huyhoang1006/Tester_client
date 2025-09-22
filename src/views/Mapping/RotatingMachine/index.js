import ApparentPower from "@/views/Cim/ApparentPower";
import CurrentFlow from "@/views/Cim/CurrentFlow";
import Frequency from "@/views/Cim/Frequency";
import Voltage from "@/views/Cim/Voltage";
import RotatingMachineEntity from "@/views/Entity/RotatingMachine";

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
    entity.rotatingMachine.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.rotatingMachine.country_of_origin = dto.properties.country_of_origin || null;
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

    entity.rotatingMachine.rated_frequency = dto.ratingsData.rated_frequency || null;
    const newRatedFrequency = new Frequency();
    mappingUnit(newRatedFrequency, dto.ratingsData.rated_frequency);
    entity.frequency.push(newRatedFrequency);

    entity.rotatingMachine.rated_current = dto.ratingsData.rated_current || null;
    const newRatedCurrent = new CurrentFlow();
    mappingUnit(newRatedCurrent, dto.ratingsData.rated_current);
    entity.currentFlow.push(newRatedCurrent);

    entity.rotatingMachine.rated_u = dto.ratingsData.rated_u || null;
    const newRatedU = new Voltage();
    mappingUnit(newRatedU, dto.ratingsData.rated_u);
    entity.voltage.push(newRatedU);

    entity.rotatingMachine.rated_speed = dto.ratingsData.rated_speed || null;

    entity.rotatingMachine.rated_power = dto.ratingsData.rated_power || null;
    const newRatedPower = new ApparentPower();
    mappingUnit(newRatedPower, dto.ratingsData.rated_power);
    entity.apparentPower.push(newRatedPower);

    entity.rotatingMachine.rated_power_factor = dto.ratingsData.rated_power_factor || null;
    entity.rotatingMachine.rated_thermal_class = dto.ratingsData.rated_thermal_class || null;
    entity.rotatingMachine.rated_ifd = dto.ratingsData.rated_ifd || null;
    const newRatedIfd = new CurrentFlow();
    mappingUnit(newRatedIfd, dto.ratingsData.rated_ifd);
    entity.currentFlow.push(newRatedIfd);

    entity.rotatingMachine.rated_ufd = dto.ratingsData.rated_ufd || null;
    const newRatedUfd = new Voltage();
    mappingUnit(newRatedUfd, dto.ratingsData.rated_ufd);
    entity.voltage.push(newRatedUfd);

}