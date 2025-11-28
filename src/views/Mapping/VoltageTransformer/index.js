import VoltageTransformerEntity from "@/views/Flatten/VoltageTransformer";
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
    entity.OldPotentialTransformerInfo.standard = dto.ratings.standard || '';
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
    dto.ratings.standard = entity.OldPotentialTransformerInfo.standard || null;

    for (let frequency of entity.frequency) {
        if (frequency.mrid === entity.OldPotentialTransformerInfo.rated_frequency) {
            dto.ratings.rated_frequency.mrid = frequency.mrid || '';
            dto.ratings.rated_frequency.value = frequency.value || '';
            dto.ratings.rated_frequency.unit = frequency.multiplier + '|' + frequency.unit || '';
        }
    }

    dto.ratings.upr = entity.OldPotentialTransformerInfo.upr_formula || '';

    for (let voltage of entity.voltage) {
        if (voltage.mrid === entity.OldPotentialTransformerInfo.rated_voltage) {
            dto.ratings.rated_voltage.mrid = voltage.mrid || '';
            dto.ratings.rated_voltage.value = voltage.value || '';
            dto.ratings.rated_voltage.unit = voltage.multiplier + '|' + voltage.unit || '';
        }
    }

    dto.vt_Configuration.windings = entity.OldPotentialTransformerInfo.windings || '';
    dto.vt_Configuration.dataVT = mapDataVTRevert(entity);

    return dto;
}

const mapDataVTRevert = (entity) => {
    if (!entity || !entity.potentialTransformerTable) return [];

    return entity.potentialTransformerTable.map(item => {
        // tìm voltage matching
        const voltage = entity.voltage?.find(v => v.mrid === item.usr_rated_voltage);
        // tìm apparentPower matching
        const burden = entity.apparentPower?.find(b => b.mrid === item.rated_burden);

        return {
            mrid: item.mrid || null,
            name: item.name || null,

            usr_formula: {
                mrid: "",
                value: item.usr_formula || null,
                unit: "",
                multiplier: ""
            },

            rated_power_factor: {
                mrid: "",
                value: item.rated_power_factor || null,
                unit: "",
                multiplier: ""
            },

            usr_rated_voltage: voltage
                ? {
                    mrid: voltage.mrid,
                    value: voltage.value,
                    unit: `${voltage.multiplier || "null"}|${voltage.unit || ""}`,
                    multiplier: voltage.multiplier || ""
                }
                : null,

            rated_burden: burden
                ? {
                    mrid: burden.mrid,
                    value: burden.value,
                    unit: `${burden.multiplier || "null"}|${burden.unit || ""}`,
                    multiplier: burden.multiplier || ""
                }
                : null
        };
    });
};

const mapDataVTtoArrayPotentialTransformerTable = (dto, entity) => {
    if (!dto?.vt_Configuration?.dataVT) return;

    dto.vt_Configuration.dataVT.forEach((item, idx) => {
        // Hỗ trợ cả 2 dạng: item.table hoặc item là chính table
        const table = item?.table ?? item;
        if (!table || typeof table !== 'object') {
            console.warn(`mapDataVTtoArrayPotentialTransformerTable: dataVT[${idx}] missing table`, item);
            return;
        }

        const newTable = new PotentialTransformerTable();

        // mrid của bảng
        newTable.mrid = table.mrid || null;

        // usr_formula: lấy value nếu là object {value:...}, hoặc raw nếu là string/number
        newTable.usr_formula = table.usr_formula?.value ?? table.usr_formula ?? null;

        // rated_power_factor: parse nếu có
        const rpfRaw = table.rated_power_factor?.value ?? table.rated_power_factor ?? null;
        newTable.rated_power_factor = (rpfRaw !== null && rpfRaw !== '' && !isNaN(Number(rpfRaw)))
            ? parseFloat(rpfRaw)
            : (rpfRaw === '' || rpfRaw === null ? null : (isNaN(Number(rpfRaw)) ? rpfRaw : parseFloat(rpfRaw)));

        // rated_burden: nếu là object (ValueWithUnit-like) => tạo ApparentPower, else nếu là string (mrid) gán trực tiếp
        if (table.rated_burden) {
            if (typeof table.rated_burden === 'object') {
                const newBurden = new ApparentPower();
                mappingUnit(newBurden, table.rated_burden);
                newTable.rated_burden = newBurden.mrid;
                entity.apparentPower = entity.apparentPower || [];
                entity.apparentPower.push(newBurden);
            } else {
                // có thể đã là mrid string
                newTable.rated_burden = table.rated_burden;
            }
        } else {
            newTable.rated_burden = null;
        }

        // usr_rated_voltage: tương tự như trên với Voltage
        if (table.usr_rated_voltage) {
            if (typeof table.usr_rated_voltage === 'object') {
                const newVoltage = new Voltage();
                mappingUnit(newVoltage, table.usr_rated_voltage);
                newTable.usr_rated_voltage = newVoltage.mrid;
                entity.voltage = entity.voltage || [];
                entity.voltage.push(newVoltage);
            } else {
                newTable.usr_rated_voltage = table.usr_rated_voltage; // mrid
            }
        } else {
            newTable.usr_rated_voltage = null;
        }

        // FK potential_transformer_info: check an toàn
        newTable.potential_transformer_info_id = entity?.OldPotentialTransformerInfo?.mrid ?? entity?.assetInfoId ?? null;

        // push
        entity.potentialTransformerTable = entity.potentialTransformerTable || [];
        entity.potentialTransformerTable.push(newTable);
    });
};




