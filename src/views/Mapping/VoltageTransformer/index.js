import VoltageTransformerEntity from "@/views/Entity/VoltageTransformer";
import VoltageTransformerDto from "@/views/Dto/VoltageTransformer";
import Frequency from "@/views/Cim/Frequency";
import Voltage from "@/views/Cim/Voltage";
import PotentialTransformerTable from "@/views/Cim/PotentialTransformerTable";
import ApparentPower from "@/views/Cim/ApparentPower";

const mappingUnit = (map, unitDto) => {
    if (!map || !unitDto) return;

    map.mrid = unitDto.mrid || null;
    map.value = unitDto.value || null;

    const unitParts = (unitDto.unit || '').split('|'); // ví dụ: "k|V"
    map.multiplier = unitParts.length > 1 ? unitParts[0] : null;
    map.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
};

export function mapDtoToEntity(dto) {
    const entity = new VoltageTransformerEntity();

    /** ================== properties ================== */
    entity.asset.mrid = dto.properties.mrid || null;
    entity.asset.kind = dto.properties.kind || null;
    entity.asset.type = dto.properties.asset_type || null;
    entity.asset.serial_number = dto.properties.serial_no || null;
    entity.asset.asset_info = dto.assetInfoId || null;
    entity.assetInfo.mrid = dto.assetInfoId || null;
    entity.productAssetModel.manufacturer = dto.properties.manufacturer || null;
    entity.assetInfo.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.asset.country_of_origin = dto.properties.country_of_origin || null;
    entity.asset.name = dto.properties.apparatus_id || null;
    entity.asset.description = dto.properties.comment || null;
    entity.productAssetModel.mrid = dto.productAssetModelId || null;
    entity.asset.location = dto.locationId || null;
    entity.asset.product_asset_model = dto.productAssetModelId || null;
    entity.assetInfo.product_asset_model = dto.productAssetModelId || null

    /** ================== attachment ================== */
    entity.attachment.mrid = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    //Ratings
    entity.OldPotentialTransformerInfo.mrid = dto.assetInfoId;
    entity.OldPotentialTransformerInfo.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.OldPotentialTransformerInfo.standard = dto.ratings.standard.value || '';
    entity.OldPotentialTransformerInfo.rated_frequency = dto.ratings.rated_frequency.mrid || '';
    const newRatedFrequency = new Frequency();
    mappingUnit(newRatedFrequency, dto.ratings.rated_frequency);
    entity.frequency.push(newRatedFrequency);
    entity.OldPotentialTransformerInfo.rated_voltage = dto.ratings.rated_voltage.mrid || '';
    const newRatedVoltage = new Voltage();
    mappingUnit(newRatedVoltage, dto.ratings.rated_voltage);
    entity.voltage.push(newRatedVoltage);
    entity.OldPotentialTransformerInfo.windings = dto.vt_Configuration.windings || '';
    // entity.OldPotentialTransformerInfo.c1 = dto.ratings.c1.value || '';
    // const newC1 = new Voltage();
    // mappingUnit(newC1, dto.ratings.c1);
    // entity.voltage.push(newC1);
    // entity.OldPotentialTransformerInfo.c2 = dto.ratings.c2.value || '';
    // const newC2 = new Voltage();
    // mappingUnit(newC2, dto.ratings.c2);
    // entity.voltage.push(newC2);
    entity.OldPotentialTransformerInfo.upr_formula = dto.ratings.upr || '';

    mapDataVTtoArrayPotentialTransformerTable(dto, entity)

    //lifecycleDate
    entity.asset.lifecycle_date = dto.lifecycleDateId || null;
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturing_year || null;

    //assetPsr
    entity.assetPsr.mrid = dto.assetPsrId || null;
    entity.assetPsr.asset_id = dto.properties.mrid || null;
    entity.assetPsr.psr_id = dto.psrId || null;

    return entity;
}

export function mapEntityToDto(entity) {
    const dto = new VoltageTransformerDto();

    //properties
    dto.properties.mrid = entity.asset.mrid;
    dto.properties.kind = entity.asset.kind;
    dto.properties.asset_type = entity.asset.type;
    dto.properties.serial_no = entity.asset.serial_number;
    dto.assetInfoId = entity.asset.asset_info;
    dto.properties.manufacturer = entity.productAssetModel.manufacturer;
    dto.properties.manufacturer_type = entity.assetInfo.manufacturer_type;
    dto.properties.country_of_origin = entity.asset.country_of_origin;
    dto.properties.apparatus_id = entity.asset.name;
    dto.properties.comment = entity.asset.description;
    dto.productAssetModelId = entity.assetInfo.product_asset_model;
    dto.locationId = entity.asset.location;

    // lifecycle date
    dto.lifecycleDateId = entity.lifecycleDate.mrid || null;
    dto.properties.manufacturing_year = entity.lifecycleDate.manufactured_date || null;
    dto.lifecycleDateId = entity.lifecycleDate.mrid || null;

    //assetPsr
    dto.assetPsrId = entity.assetPsr.mrid || '';
    dto.psrId = entity.assetPsr.psr_id || '';

    //attachment
    dto.attachmentId = entity.attachment.mrid || '';
    dto.attachment = entity.attachment;

    //ratings
    dto.properties.manufacturer_type = entity.OldPotentialTransformerInfo.manufacturer_type || null;
    for (let i = 0; i < entity.frequency.length; i++) {
        if (entity.frequency[i].mrid === entity.OldPotentialTransformerInfo.rated_frequency) {
            dto.ratings.rated_frequency.value = entity.frequency[i].value || '';
        }
    }

    for (let i = 0; i < entity.voltage.length; i++) {
        if (entity.voltage[i].mrid === entity.OldPotentialTransformerInfo.rated_voltage) {
            dto.ratings.rated_voltage.value = entity.voltage[i].value || '';
        }
    }


    return dto;
}


const mapDataVTtoArrayPotentialTransformerTable = (dto, entity) => {
    dto.vt_Configuration.dataVT.forEach(item => {
        const table = item.table;
        const newTable = new PotentialTransformerTable();

        // mrid của bảng
        newTable.mrid = table.mrid || null;

        // usr_formula: lấy value trực tiếp
        newTable.usr_formula = table.usr_formula?.value || null;

        // rated_power_factor: số thực
        newTable.rated_power_factor = table.rated_power_factor?.value
            ? parseFloat(table.rated_power_factor.value)
            : null;

        // rated_burden: ApparentPower
        if (table.rated_burden) {
            const newBurden = new ApparentPower();
            mappingUnit(newBurden, table.rated_burden);
            newTable.rated_burden = newBurden.mrid;

            // push vào entity.apparentPower
            if (!entity.apparentPower) entity.apparentPower = [];
            entity.apparentPower.push(newBurden);
        }

        // usr_rated_voltage: Voltage
        if (table.usr_rated_voltage) {
            const newVoltage = new Voltage();
            mappingUnit(newVoltage, table.usr_rated_voltage);
            newTable.usr_rated_voltage = newVoltage.mrid;

            // push vào entity.voltage
            if (!entity.voltage) entity.voltage = [];
            entity.voltage.push(newVoltage);
        }

        // nếu sau này có thêm length/frequency cũng làm tương tự:
        // const newLen = new Length(); mappingUnit(newLen, table.someLength); entity.length.push(newLen);

        // FK potential_transformer_info
        newTable.potential_transformer_info_id = entity.OldPotentialTransformerInfo.mrid;

        // cuối cùng push table vào entity.potentialTransformerTable
        if (!entity.potentialTransformerTable) entity.potentialTransformerTable = [];
        entity.potentialTransformerTable.push(newTable);
    });
}




