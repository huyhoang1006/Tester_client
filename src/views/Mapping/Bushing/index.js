/* eslint-disable */
import BushingingEntity from "@/views/Flatten/Bushing";
import BushingDto from "@/views/Dto/BushingAsset";
import Voltage from "@/views/Cim/Voltage";
import CurrentFlow from "@/views/Cim/CurrentFlow";
import Frequency from "@/views/Cim/Frequency";
import Percent from "@/views/Cim/Percent";
import Capacitance from '@/views/Cim/Capacitance'
export function mapDtoToEntity(dto) {
    const entity = new BushingingEntity();

    //properties
    entity.bushing.mrid = dto.properties.mrid || null;
    entity.bushing.kind = dto.properties.kind || null;
    entity.bushing.type = dto.properties.type || null;
    entity.bushing.serial_number = dto.properties.serial_no || null;
    entity.bushing.asset_info = dto.assetInfoId || null;
    entity.productAssetModel.manufacturer = dto.properties.manufacturer || null;
    entity.oldBushingInfo.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.bushing.country_of_origin = dto.properties.country_of_origin || null;
    entity.bushing.name = dto.properties.apparatus_id || null;
    entity.bushing.description = dto.properties.comment || null;
    entity.productAssetModel.mrid = dto.productAssetModelId || null;
    entity.bushing.location = dto.locationId || null;
    entity.bushing.product_asset_model = dto.productAssetModelId || null;
    entity.oldBushingInfo.product_asset_model = dto.productAssetModelId || null;    

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
    entity.oldBushingInfo.manufacturer_type = dto.properties.manufacturer_type

    //rated current
    entity.oldBushingInfo.rated_current = dto.bushing.rated_current.mrid || null
    let unitPartsRatedCurrent = (dto.bushing.rated_current.unit || '').split('|');
    const currentFlow = new CurrentFlow();
    currentFlow.mrid = dto.bushing.rated_current.mrid || null;
    currentFlow.multiplier = unitPartsRatedCurrent.length > 1 ? unitPartsRatedCurrent[0] : null;
    currentFlow.unit = unitPartsRatedCurrent.length > 1 ? unitPartsRatedCurrent[1] : unitPartsRatedCurrent[0] || null;
    currentFlow.value = dto.bushing.rated_current.value || null;
    entity.currentFlow.push(currentFlow);

    //rated frequency
    entity.oldBushingInfo.rated_frequency = dto.bushing.rated_frequency.mrid || null
    let unitPartsRatedFrequency = (dto.bushing.rated_frequency.unit || '').split('|');
    const frequency = new Frequency();
    frequency.mrid = dto.bushing.rated_frequency.mrid || null;
    frequency.multiplier = unitPartsRatedFrequency.length > 1 ? unitPartsRatedFrequency[0] : null;
    frequency.unit = unitPartsRatedFrequency.length > 1 ? unitPartsRatedFrequency[1] : unitPartsRatedFrequency[0] || null;
    frequency.value = dto.bushing.rated_frequency.value || null;
    entity.frequency.push(frequency);

    //Insulation level BIL
    entity.oldBushingInfo.rated_impulse_withstand_voltage = dto.bushing.insulation_level.mrid || null
    let unitPartsBil = (dto.bushing.insulation_level.unit || '').split('|');
    const voltage = new Voltage();
    voltage.mrid = dto.bushing.insulation_level.mrid || null;
    voltage.multiplier = unitPartsBil.length > 1 ? unitPartsBil[0] : null;
    voltage.unit = unitPartsBil.length > 1 ? unitPartsBil[1] : unitPartsBil[0] || null;
    voltage.value = dto.bushing.insulation_level.value || null;
    entity.voltage.push(voltage);

    //Voltage L-ground
    entity.oldBushingInfo.rated_line_to_ground_voltage = dto.bushing.voltage_l_ground.mrid || null
    let unitPartsVolGround = (dto.bushing.voltage_l_ground.unit || '').split('|');
    const voltageVolGround = new Voltage();
    voltageVolGround.mrid = dto.bushing.voltage_l_ground.mrid || null;
    voltageVolGround.multiplier = unitPartsVolGround.length > 1 ? unitPartsVolGround[0] : null;
    voltageVolGround.unit = unitPartsVolGround.length > 1 ? unitPartsVolGround[1] : unitPartsVolGround[0] || null;
    voltageVolGround.value = dto.bushing.voltage_l_ground.value || null;
    entity.voltage.push(voltageVolGround);

    //max system voltage
    entity.oldBushingInfo.high_voltage_limit = dto.bushing.max_system_voltage.mrid || null
    let unitPartsHighVoLlimit = (dto.bushing.max_system_voltage.unit || '').split('|');
    const HighVoLlimit = new Voltage();
    HighVoLlimit.mrid = dto.bushing.max_system_voltage.mrid || null;
    HighVoLlimit.multiplier = unitPartsHighVoLlimit.length > 1 ? unitPartsHighVoLlimit[0] : null;
    HighVoLlimit.unit = unitPartsHighVoLlimit.length > 1 ? unitPartsHighVoLlimit[1] : unitPartsHighVoLlimit[0] || null;
    HighVoLlimit.value = dto.bushing.max_system_voltage.value || null;
    entity.voltage.push(HighVoLlimit);

    //DF(C1)
    entity.oldBushingInfo.c_power_factor = dto.bushing.df_c1.mrid || null
    let unitDfC1 = (dto.bushing.df_c1.unit || '').split('|');
    const dfC1 = new Percent();
    dfC1.mrid = dto.bushing.df_c1.mrid || null;
    dfC1.multiplier = unitDfC1.length > 1 ? unitDfC1[0] : null;
    dfC1.unit = unitDfC1.length > 1 ? unitDfC1[1] : unitDfC1[0] || null;
    dfC1.value = dto.bushing.df_c1.value || null;
    entity.percent.push(dfC1);

    //DF(C2)
    entity.oldBushingInfo.c2_power_factor = dto.bushing.df_c2.mrid || null
    let unitDfC2 = (dto.bushing.df_c2.unit || '').split('|');
    const dfC2 = new Percent();
    dfC2.mrid = dto.bushing.df_c2.mrid || null;
    dfC2.multiplier = unitDfC2.length > 1 ? unitDfC2[0] : null;
    dfC2.unit = unitDfC2.length > 1 ? unitDfC2[1] : unitDfC2[0] || null;
    dfC2.value = dto.bushing.df_c1.value || null;
    entity.percent.push(dfC2);

    //Cap. (C1)
    entity.oldBushingInfo.c_capacitance = dto.bushing.cap_c1.mrid || null
    let unitCapC1 = (dto.bushing.cap_c1.unit || '').split('|');
    const capC1 = new Capacitance();
    capC1.mrid = dto.bushing.cap_c1.mrid || null;
    capC1.multiplier = unitCapC1.length > 1 ? unitCapC1[0] : null;
    capC1.unit = unitCapC1.length > 1 ? unitCapC1[1] : unitCapC1[0] || null;
    capC1.value = dto.bushing.cap_c1.value || null;
    entity.capacitance.push(capC1);

    //Cap. (C2)
    entity.oldBushingInfo.c2_capacitance = dto.bushing.cap_c2.mrid || null
    let unitCapC2 = (dto.bushing.cap_c2.unit || '').split('|');
    const capC2 = new Capacitance();
    capC2.mrid = dto.bushing.cap_c2.mrid || null;
    capC2.multiplier = unitCapC2.length > 1 ? unitCapC2[0] : null;
    capC2.unit = unitCapC2.length > 1 ? unitCapC2[1] : unitCapC2[0] || null;
    capC2.value = dto.bushing.cap_c2.value || null;
    entity.capacitance.push(capC2);

    //attachment
    entity.attachment.mrid = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    return entity;

}

export function mapEntityToDto(entity) {
    console.log(entity)
    const dto = new BushingDto();
    console.log(dto)
    //properties
    dto.properties.mrid = entity.bushing.mrid || '';
    dto.properties.kind = entity.bushing.kind || '';
    dto.properties.type = entity.bushing.type || '';
    dto.properties.serial_no = entity.bushing.serial_number || '';
    dto.assetInfoId = entity.bushing.asset_info || '';
    dto.properties.manufacturer = entity.productAssetModel.manufacturer || '';
    dto.productAssetModelId = entity.productAssetModel.mrid || '';
    dto.properties.manufacturer_type = entity.oldBushingInfo.manufacturer_type || '';
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

    //attachment
    dto.attachmentId = entity.attachment.mrid || '';
    dto.attachment = entity.attachment;

    //rated frequency
    dto.bushing.rated_frequency.mrid = entity.oldBushingInfo.rated_frequency || '';
    for(let frequency of entity.frequency) {
        if(frequency.mrid == entity.oldBushingInfo.rated_frequency) {
            dto.bushing.rated_frequency.value = frequency.value
        }
    }

    //bil
    dto.bushing.insulation_level.mrid = entity.oldBushingInfo.rated_impulse_withstand_voltage || '';
    for(let voltage of entity.voltage) {
        if(voltage.mrid == entity.oldBushingInfo.rated_impulse_withstand_voltage) {
            dto.bushing.insulation_level.value = voltage.value
        }
    }

    //L-ground
    dto.bushing.voltage_l_ground.mrid = entity.oldBushingInfo.rated_line_to_ground_voltage || '';
    for(let voltage of entity.voltage) {
        if(voltage.mrid == entity.oldBushingInfo.rated_line_to_ground_voltage) {
           dto.bushing.voltage_l_ground.value = voltage.value
        }
    }

    //L-ground
    dto.bushing.max_system_voltage.mrid = entity.oldBushingInfo.high_voltage_limit || '';
    for(let voltage of entity.voltage) {
        if(voltage.mrid == entity.oldBushingInfo.high_voltage_limit) {
            dto.bushing.max_system_voltage.value = voltage.value
        }
    }

    //Rated current
    dto.bushing.rated_current.mrid = entity.oldBushingInfo.rated_current || '';
    for(let currentFlow of entity.currentFlow) {
        if(currentFlow.mrid == entity.oldBushingInfo.rated_current) {
            dto.bushing.rated_current.value = currentFlow.value
        }
    }

    //df c1
    dto.bushing.df_c1.mrid = entity.oldBushingInfo.c_power_factor || '';
    for(let percent of entity.percent) {
        if(percent.mrid == entity.oldBushingInfo.c_power_factor) {
            dto.bushing.df_c1.value = percent.value
        }
    }
    
    //df c2
    dto.bushing.df_c2.mrid = entity.oldBushingInfo.c2_power_factor || '';
    for(let percent of entity.percent) {
        if(percent.mrid == entity.oldBushingInfo.c2_power_factor) {
            dto.bushing.df_c2.value = percent.value
        }
    }

    //cap c1
    dto.bushing.cap_c1.mrid = entity.oldBushingInfo.c_capacitance || '';
    for(let capacitance of entity.capacitance) {
        if(capacitance.mrid == entity.oldBushingInfo.c_capacitance) {
           dto.bushing.cap_c1.value = capacitance.value
        }
    }

    // cap c2
    dto.bushing.cap_c2.mrid = entity.oldBushingInfo.c2_capacitance || '';
    for(let capacitance of entity.capacitance) {
        if(capacitance.mrid == entity.oldBushingInfo.c2_capacitance) {
            dto.bushing.cap_c2.value = capacitance.value
        }
    }

    dto.bushing.insulation_type = entity.oldBushingInfo.insulation_kind

    return dto;

}