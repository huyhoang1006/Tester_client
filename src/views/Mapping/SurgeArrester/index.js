import SurgeArresterEntity from "@/views/Entity/SurgeArrester";
import OldSurgeArresterInfo from "@/views/Cim/OldSurgeArresterInfo";
import SurgeArresterDto from "@/views/Dto/SurgeAsset";
import Voltage from "@/views/Cim/Voltage";
import CurrentFlow from "@/views/Cim/CurrentFlow";
import Seconds from "@/views/Cim/Seconds";
import { UnitMultiplier } from "@/views/Enum/UnitMultiplier";
import { UnitSymbol } from "@/views/Enum/UnitSymbol";
export function mapDtoToEntity(dto) {
    const entity = new SurgeArresterEntity();

    //properties
    entity.surgeArrester.mrid = dto.properties.mrid || null;
    entity.surgeArrester.kind = dto.properties.kind || null;
    entity.surgeArrester.type = dto.properties.type || null;
    entity.surgeArrester.serial_number = dto.properties.serial_no || null;
    entity.surgeArrester.asset_info = dto.oldSurgeArresterInfoId || null;
    entity.productAssetModel.manufacturer = dto.properties.manufacturer || null;
    entity.surgeArrester.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.surgeArrester.country_of_origin = dto.properties.country_of_origin || null;
    entity.surgeArrester.name = dto.properties.apparatus_id || null;
    entity.surgeArrester.description = dto.properties.comment || null;
    entity.surgeArrester.unit_count = dto.ratings.unitStack || null;
    entity.productAssetModel.mrid = dto.productAssetModelId || null;

    // lifecycle date
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturer_year || null;
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.surgeArrester.lifecycle_date = dto.lifecycleDateId || null;

    //assetPsr
    entity.assetPsr.mrid = dto.assetPsrId || null;
    entity.assetPsr.asset_id = dto.properties.mrid || null;
    entity.assetPsr.psr_id = dto.psrId || null;

    //tableRating
    for(let data of dto.ratings.tableRating) {
        const newData = new OldSurgeArresterInfo();
        newData.mrid = data.mrid || null;
        newData.product_asset_model = dto.productAssetModelId || null;

        //serial number
        newData.serial_number = data.serial || null;

        newData.surge_arrester_id = dto.properties.mrid || null;

        //Rated voltage Ur
        newData.rated_voltage = data.ratedVoltage.mrid || null;
        let unitPartsRatedV = (data.ratedVoltage.unit || '').split('|');
        const newRatedVoltage = new Voltage();
        newRatedVoltage.mrid = data.ratedVoltage.mrid || null;
        newRatedVoltage.multiplier = unitPartsRatedV.length > 1 ? unitPartsRatedV[0] : null;
        newRatedVoltage.unit = unitPartsRatedV.length > 1 ? unitPartsRatedV[1] : unitPartsRatedV[0] || null;
        newRatedVoltage.value = data.ratedVoltage.value || null;
        entity.voltage.push(newRatedVoltage);

        //Maximun system voltages
        newData.maximum_system_voltage = data.maximumVoltage.mrid || null;
        let unitPartsMaxSysV = (data.maximumVoltage.unit || '').split('|');
        const newMaxSystemVoltage = new Voltage();
        newMaxSystemVoltage.mrid = data.maximumVoltage.mrid || null;
        newMaxSystemVoltage.multiplier = unitPartsMaxSysV.length > 1 ? unitPartsMaxSysV[0] : null;
        newMaxSystemVoltage.unit = unitPartsMaxSysV.length > 1 ? unitPartsMaxSysV[1] : unitPartsMaxSysV[0] || null;
        newMaxSystemVoltage.value = data.maximumVoltage.value || null;
        entity.voltage.push(newMaxSystemVoltage);

        //Continous operating voltage Uc
        newData.continuous_operating_voltage = data.continousVoltage.mrid || null;
        let unitParts = (data.continousVoltage.unit || '').split('|');
        const newContinousVoltage = new Voltage();
        newContinousVoltage.mrid = data.continousVoltage.mrid || null;
        newContinousVoltage.multiplier = unitParts.length > 1 ? unitParts[0] : null;
        newContinousVoltage.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
        newContinousVoltage.value = data.continousVoltage.value || null;
        entity.voltage.push(newContinousVoltage);

        //Short time withstand current
        newData.short_time_with_stand_current = data.shortCurrent.mrid || null;
        let unitPartsShortTime = (data.shortCurrent.unit || '').split('|');
        const newShortCurrent = new CurrentFlow();
        newShortCurrent.mrid = data.shortCurrent.mrid || null;
        newShortCurrent.multiplier = unitPartsShortTime.length > 1 ? unitPartsShortTime[0] : null;
        newShortCurrent.unit = unitPartsShortTime.length > 1 ? unitPartsShortTime[1] : unitPartsShortTime[0] || null;
        newShortCurrent.value = data.shortCurrent.value || null;
        entity.currentFlow.push(newShortCurrent);
        
        //Rated duration of short circuit
        newData.rated_duration_of_short_circuit = data.ratedCircuit.mrid || null;
        let unitPartsRatedDuration = (data.ratedCircuit.unit || '').split('|');
        const newRatedDuration = new Seconds();
        newRatedDuration.mrid = data.ratedCircuit.mrid || null;
        newRatedDuration.multiplier = unitPartsRatedDuration.length > 1 ? unitPartsRatedDuration[0] : null;
        newRatedDuration.unit = unitPartsRatedDuration.length > 1 ? unitPartsRatedDuration[1] : unitPartsRatedDuration[0] || null;
        newRatedDuration.value = data.ratedCircuit.value || null;
        entity.seconds.push(newRatedDuration);

        //Power frequency withstand voltage (to earth and between poles)
        newData.pf_with_stand_voltage_earth_between_pole = data.polesVoltage.mrid || null;
        let unitPartsPolesVoltage = (data.polesVoltage.unit || '').split('|');
        const newPolesVoltage = new Voltage();
        newPolesVoltage.mrid = data.polesVoltage.mrid || null;
        newPolesVoltage.multiplier = unitPartsPolesVoltage.length > 1 ? unitPartsPolesVoltage[0] : null;
        newPolesVoltage.unit = unitPartsPolesVoltage.length > 1 ? unitPartsPolesVoltage[1] : unitPartsPolesVoltage[0] || null;
        newPolesVoltage.value = data.polesVoltage.value || null;
        entity.voltage.push(newPolesVoltage);

        //Power frequency withstand voltage (across the isolating distance)
        newData.pf_with_stand_voltage_isolated_distance = data.isoVoltage.mrid || null;
        let unitPartsIsoVoltage = (data.isoVoltage.unit || '').split('|');
        const newIsoVoltage = new Voltage();
        newIsoVoltage.mrid = data.isoVoltage.mrid || null;
        newIsoVoltage.multiplier = unitPartsIsoVoltage.length > 1 ? unitPartsIsoVoltage[0] : null;
        newIsoVoltage.unit = unitPartsIsoVoltage.length > 1 ? unitPartsIsoVoltage[1] : unitPartsIsoVoltage[0] || null;
        newIsoVoltage.value = data.isoVoltage.value || null;
        entity.voltage.push(newIsoVoltage);

        entity.oldSurgeArresterInfo.push(newData);
    }

    //attachment
    entity.attachment.mrid = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    return entity;

}

export function mapEntityToDto(entity) {
    const dto = new SurgeArresterDto();

    //properties
    dto.properties.mrid = entity.surgeArrester.mrid || '';
    dto.properties.kind = entity.surgeArrester.kind || '';
    dto.properties.type = entity.surgeArrester.type || '';
    dto.properties.serial_no = entity.surgeArrester.serial_number || '';
    dto.oldSurgeArresterInfoId = entity.surgeArrester.asset_info || '';
    dto.properties.manufacturer = entity.productAssetModel.manufacturer || '';
    dto.productAssetModelId = entity.productAssetModel.mrid || '';
    dto.properties.manufacturer_type = entity.surgeArrester.manufacturer_type || '';
    dto.properties.country_of_origin = entity.surgeArrester.country_of_origin || '';
    dto.properties.apparatus_id = entity.surgeArrester.name || '';
    dto.properties.comment = entity.surgeArrester.description || '';

    // lifecycle date
    dto.lifecycleDateId = entity.surgeArrester.lifecycle_date || '';
    dto.properties.manufacturer_year = entity.lifecycleDate.manufactured_date || '';

    //unit count
    dto.ratings.unitStack = entity.surgeArrester.unit_count || '';

    //assetPsr
    dto.assetPsrId = entity.assetPsr.mrid || '';
    dto.psrId = entity.assetPsr.psr_id || '';
    dto.assetInfoId = entity.assetPsr.asset_id || '';

    //attachment
    dto.attachmentId = entity.attachment.mrid || '';
    dto.attachment = entity.attachment;

    //ratings
    for(let i=0; i<entity.oldSurgeArresterInfo.length; i++) {
        const data = {
            mrid: '',
            position : '',
            serial : '',
            ratedVoltage : {
                mrid : '',
                value: '',
                unit: UnitMultiplier.k + '|' + UnitSymbol.V
            },
            maximumVoltage : {
                mrid : '',
                value: '',
                unit: UnitMultiplier.k + '|' + UnitSymbol.V
            },
            continousVoltage : {
                mrid : '',
                value: '',
                unit: UnitMultiplier.k + '|' + UnitSymbol.V
            },
            shortCurrent : {
                mrid : '',
                value: '',
                unit: UnitMultiplier.k + '|' + UnitSymbol.A
            },
            ratedCircuit : {
                mrid : '',
                value: '',
                unit: UnitSymbol.s
            },
            polesVoltage : {
                mrid : '',
                value: '',
                unit: UnitMultiplier.k + '|' + UnitSymbol.V
            },
            isoVoltage : {
                mrid : '',
                value: '',
                unit: UnitMultiplier.k + '|' + UnitSymbol.V
            }
        }
        data.mrid = entity.oldSurgeArresterInfo[i].mrid || '';
        data.serial = entity.oldSurgeArresterInfo[i].serial_number || '';
        data.position = i + 1;
        
        //Rated voltage Ur
        data.ratedVoltage.mrid = entity.oldSurgeArresterInfo[i].rated_voltage || '';
        for(let voltage of entity.voltage) {
            if(voltage.mrid === data.ratedVoltage.mrid) {
                data.ratedVoltage.value = voltage.value || '';
                data.ratedVoltage.unit = voltage.multiplier + '|' + voltage.unit || '';
            }
        }
        //maximum_system_voltage
        data.maximumVoltage.mrid = entity.oldSurgeArresterInfo[i].maximum_system_voltage || '';
        for(let voltage of entity.voltage) {
            if(voltage.mrid === data.maximumVoltage.mrid) {
                data.maximumVoltage.value = voltage.value || '';
                data.maximumVoltage.unit = voltage.multiplier + '|' + voltage.unit || '';
            }
        }

        //continuous_operating_voltage
        data.continousVoltage.mrid = entity.oldSurgeArresterInfo[i].continuous_operating_voltage || '';
        for(let voltage of entity.voltage) {
            if(voltage.mrid === data.continousVoltage.mrid) {
                data.continousVoltage.value = voltage.value || '';
                data.continousVoltage.unit = voltage.multiplier + '|' + voltage.unit || '';
            }
        }

        //short_time_with_stand_current
        data.shortCurrent.mrid = entity.oldSurgeArresterInfo[i].short_time_with_stand_current || '';
        for(let currentFlow of entity.currentFlow) {
            if(currentFlow.mrid === data.shortCurrent.mrid) {
                data.shortCurrent.value = currentFlow.value || '';
                data.shortCurrent.unit = currentFlow.multiplier + '|' + currentFlow.unit || '';
            }
        }

        //rated_duration_of_short_circuit
        data.ratedCircuit.mrid = entity.oldSurgeArresterInfo[i].rated_duration_of_short_circuit || '';
        for(let seconds of entity.seconds) {
            if(seconds.mrid === data.ratedCircuit.mrid) {
                data.ratedCircuit.value = seconds.value || '';
                data.ratedCircuit.unit = seconds.multiplier + '|' + seconds.unit || '';
            }
        }

        //pf_with_stand_voltage_earth_between_pole
        data.polesVoltage.mrid = entity.oldSurgeArresterInfo[i].pf_with_stand_voltage_earth_between_pole || '';
        for(let voltage of entity.voltage) {
            if(voltage.mrid === data.polesVoltage.mrid) {
                data.polesVoltage.value = voltage.value || '';
                data.polesVoltage.unit = voltage.multiplier + '|' + voltage.unit || '';
            }
        }

        //pf_with_stand_voltage_isolated_distance
        data.isoVoltage.mrid = entity.oldSurgeArresterInfo[i].pf_with_stand_voltage_isolated_distance || '';
        for(let voltage of entity.voltage) {
            if(voltage.mrid === data.isoVoltage.mrid) {
                data.isoVoltage.value = voltage.value || '';
                data.isoVoltage.unit = voltage.multiplier + '|' + voltage.unit || '';
            }
        }

        dto.ratings.tableRating.push(data);
    }

    return dto;

}