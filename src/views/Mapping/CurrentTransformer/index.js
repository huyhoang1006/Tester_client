import CurrentTransformerEntity from "@/views/Entity/CurrentTransformer";
import Frequency from "@/views/Cim/Frequency";
import Voltage from "@/views/Cim/Voltage";
import CurrentFlow from "@/views/Cim/CurrentFlow";
import Seconds from "@/views/Cim/Seconds";
import Temperature from "@/views/Cim/Temperature";
import CurrentTransformerDto from "@/views/Dto/CurrentTransformer";
import CtCoreInfo from "@/views/Cim/CtCoreInfo";
import Resistance from "@/views/Cim/Resistance";
import CtTapInfo from "@/views/Cim/CtTapInfo";
import ApparentPower from "@/views/Cim/ApparentPower";
import CoreDto from "@/views/Dto/CurrentTransformer/CTConfiguration/CoreDto";
const mappingUnit = (map, unitDto) => {
    if (!map || !unitDto) return;

    map.mrid = unitDto.mrid || null;
    map.value = unitDto.value || null;

    const unitParts = (unitDto.unit || '').split('|'); // ví dụ: "k|V"
    map.multiplier = unitParts.length > 1 ? unitParts[0] : null;
    map.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
};
export const mapDtoToEntity = (dto) => {
    const entity = new CurrentTransformerEntity();

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

    //lifecycleDate
    entity.asset.lifecycle_date = dto.lifecycleDateId || null;
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturing_year || null;

    //assetPsr
    entity.assetPsr.mrid = dto.assetPsrId || null;
    entity.assetPsr.asset_id = dto.properties.mrid || null;
    entity.assetPsr.psr_id = dto.psrId || null;

    //ratings
    entity.oldCurrentTransformerInfo.mrid = dto.assetInfoId || null;
    entity.oldCurrentTransformerInfo.standard = dto.ratings.standard.value || null;
    entity.oldCurrentTransformerInfo.rated_frequency = dto.ratings.rated_frequency.mrid || null;
    const newRatedFrequency = new Frequency();
    mappingUnit(newRatedFrequency, dto.ratings.rated_frequency);
    entity.frequency.push(newRatedFrequency);
    entity.oldCurrentTransformerInfo.primary_winding_count = dto.ratings.primary_winding_count || null;
    entity.oldCurrentTransformerInfo.um_rms = dto.ratings.um_rms.mrid || null;
    const newUmRms = new Voltage();
    mappingUnit(newUmRms, dto.ratings.um_rms);
    entity.voltage.push(newUmRms);
    entity.oldCurrentTransformerInfo.u_withstand_rms = dto.ratings.u_withstand_rms.mrid || null;
    const newUWithstandRms = new Voltage();
    mappingUnit(newUWithstandRms, dto.ratings.u_withstand_rms);
    entity.voltage.push(newUWithstandRms);
    entity.oldCurrentTransformerInfo.u_lightning_peak = dto.ratings.u_lightning_peak.mrid || null;
    const newULightningPeak = new Voltage();
    mappingUnit(newULightningPeak, dto.ratings.u_lightning_peak);
    entity.voltage.push(newULightningPeak);
    entity.oldCurrentTransformerInfo.i_cth = dto.ratings.icth.mrid || null;
    const newIcth = new CurrentFlow();
    mappingUnit(newIcth, dto.ratings.icth);
    entity.currentFlow.push(newIcth);
    entity.oldCurrentTransformerInfo.i_dynamic_peak = dto.ratings.idyn_peak.mrid || null;
    const newIdynPeak = new CurrentFlow();
    mappingUnit(newIdynPeak, dto.ratings.idyn_peak);
    entity.currentFlow.push(newIdynPeak);
    entity.oldCurrentTransformerInfo.ith_rms = dto.ratings.ith_rms.mrid || null;
    const newIthRms = new CurrentFlow();
    mappingUnit(newIthRms, dto.ratings.ith_rms);
    entity.currentFlow.push(newIthRms);
    entity.oldCurrentTransformerInfo.ith_duration = dto.ratings.ith_duration.mrid || null;
    const newIthDuration = new Seconds();
    mappingUnit(newIthDuration, dto.ratings.ith_duration);
    entity.seconds.push(newIthDuration);
    entity.oldCurrentTransformerInfo.system_voltage = dto.ratings.system_voltage.mrid || null;
    const newSystemVoltage = new Voltage();
    mappingUnit(newSystemVoltage, dto.ratings.system_voltage);
    entity.voltage.push(newSystemVoltage);
    entity.oldCurrentTransformerInfo.system_voltage_type = dto.ratings.system_voltage_type.value || null;
    entity.oldCurrentTransformerInfo.bil = dto.ratings.bil.mrid || null;
    const newBil = new Voltage();
    mappingUnit(newBil, dto.ratings.bil);
    entity.voltage.push(newBil);
    entity.oldCurrentTransformerInfo.rating_factor = dto.ratings.rating_factor || null;
    entity.oldCurrentTransformerInfo.rating_factor_temp = dto.ratings.rating_factor_temp.mrid || null;
    const newRatingFactorTemp = new Temperature();
    mappingUnit(newRatingFactorTemp, dto.ratings.rating_factor_temp);
    entity.temperature.push(newRatingFactorTemp);

    //core
    entity.oldCurrentTransformerInfo.core_count = dto.ctConfiguration.cores || null;
    //ctConfiguration
    dto.ctConfiguration.dataCT.forEach((item, index) => {
        const core = new CtCoreInfo();
        const fullTap = new CtTapInfo();
        //mrid
        core.mrid = item.mrid || null;
        //tap_count
        core.tap_count = item.taps || null;
        //common_tap
        core.common_tap = item.commonTap || null;
        //core_application
        core.core_application = item.fullTap.classRating.app || null;
        //core_class
        core.core_class = item.fullTap.classRating.class || null;
        //fs
        core.fs = item.fullTap.classRating.fs || null;
        //alf
        core.alf = item.fullTap.classRating.alf || null;
        //winding_resistance
        core.winding_resistance = item.fullTap.classRating.wr.mrid || null;
        const newWindingResistance = new Resistance();
        mappingUnit(newWindingResistance, item.fullTap.classRating.wr);
        entity.resistance.push(newWindingResistance);
        //ts
        core.ts = item.fullTap.classRating.ts || null;
        //ek
        core.ek = item.fullTap.classRating.ek || null;
        //e1
        core.e1 = item.fullTap.classRating.e1 || null;
        //ie
        core.ie = item.fullTap.classRating.ie || null;
        //ie1
        core.ie1 = item.fullTap.classRating.ie1 || null;
        //kssc
        core.kssc = item.fullTap.classRating.kssc || null;
        //val
        core.val = item.fullTap.classRating.val || null;
        //tp
        core.tp = item.fullTap.classRating.tp || null;
        //iai
        core.iai = item.fullTap.classRating.iai || null;
        //k
        core.k = item.fullTap.classRating.k || null;
        //ktd
        core.ktd = item.fullTap.classRating.ktd || null;
        //duty
        core.duty = item.fullTap.classRating.duty || null;
        //kx
        core.kx = item.fullTap.classRating.kx || null;
        //current_transformer_info_id
        core.current_transformer_info_id = entity.assetInfo.mrid || null;
        //ex
        core.ex = item.fullTap.classRating.ex || null;
        //vb
        core.vb = item.fullTap.classRating.vb || null;
        //vk
        core.vk = item.fullTap.classRating.vk || null;
        //vk1
        core.vk1 = item.fullTap.classRating.vk1 || null;
        //ik
        core.ik = item.fullTap.classRating.ik || null;
        //ik1
        core.ik1 = item.fullTap.classRating.ik1 || null;
        //ratio_error
        core.ratio_error = item.fullTap.classRating.ratio_error || null;
        //core_index
        core.core_index = index + 1 || null;
        //mrid
        fullTap.mrid = item.fullTap.classRating.mrid || null;
        //tap_name
        fullTap.tap_name = item.fullTap.table.name || null;
        //type
        fullTap.type = item.fullTap.table.type || null;
        //ipn
        fullTap.ipn = item.fullTap.table.ipn.mrid || null;
        const newIpn = new CurrentFlow();
        mappingUnit(newIpn, item.fullTap.table.ipn);
        entity.currentFlow.push(newIpn);
        //isn
        fullTap.isn = item.fullTap.table.isn.mrid || null;
        const newIsn = new CurrentFlow();
        mappingUnit(newIsn, item.fullTap.table.isn);
        entity.currentFlow.push(newIsn);
        //in_use
        fullTap.in_use = item.fullTap.table.inUse || null;
        //rated_burden
        fullTap.rated_burden = item.fullTap.classRating.rated_burden.mrid || null;
        const newRatedBurden = new ApparentPower();
        mappingUnit(newRatedBurden, item.fullTap.classRating.rated_burden);
        entity.apparentPower.push(newRatedBurden);
        //burden
        fullTap.burden = item.fullTap.classRating.burden.mrid || null;
        const newBurden = new ApparentPower();
        mappingUnit(newBurden, item.fullTap.classRating.burden);
        entity.apparentPower.push(newBurden);
        //extended_burden
        fullTap.extended_burden = item.fullTap.classRating.extended_burden || null;
        //burden_power_factor
        fullTap.burden_power_factor = item.fullTap.classRating.burdenCos || null;
        //operating_burden
        fullTap.operating_burden = item.fullTap.classRating.operatingBurden.mrid || null;
        const newOperatingBurden = new ApparentPower();
        mappingUnit(newOperatingBurden, item.fullTap.classRating.operatingBurden);
        entity.apparentPower.push(newOperatingBurden);
        //operating_burden_power_factor
        fullTap.operating_burden_power_factor = item.fullTap.classRating.operatingBurdenCos || null;
        //ct_core_info_id
        fullTap.ct_core_info_id = core.mrid || null;
        entity.CtTapInfo.push(fullTap);
        entity.CtCoreInfo.push(core);

        /** ================== mainTap ================== */
        item.mainTap.data.forEach(item => {
            const mainTap = new CtTapInfo();
            //mrid
            mainTap.mrid = item.classRating.mrid || null;
            //tap_name
            mainTap.tap_name = item.table.name || null;
            //type
            mainTap.type = item.table.type || null;
            //ipn
            mainTap.ipn = item.table.ipn.mrid || null;
            const newIpn = new CurrentFlow();
            mappingUnit(newIpn, item.table.ipn);
            entity.currentFlow.push(newIpn);
            //isn
            mainTap.isn = item.table.isn.mrid || null;
            const newIsn = new CurrentFlow();
            mappingUnit(newIsn, item.table.isn);
            entity.currentFlow.push(newIsn);
            //in_use
            mainTap.in_use = item.table.inUse || null;
            //rated_burden
            mainTap.rated_burden = item.classRating.rated_burden.mrid || null;
            const newRatedBurden = new ApparentPower();
            mappingUnit(newRatedBurden, item.classRating.rated_burden);
            entity.apparentPower.push(newRatedBurden);
            //burden
            mainTap.burden = item.classRating.burden.mrid || null;
            const newBurden = new ApparentPower();
            mappingUnit(newBurden, item.classRating.burden);
            entity.apparentPower.push(newBurden);
            //extended_burden
            mainTap.extended_burden = item.classRating.extended_burden || null;
            //burden_power_factor
            mainTap.burden_power_factor = item.classRating.burdenCos || null;
            //operating_burden
            mainTap.operating_burden = item.classRating.operatingBurden.mrid || null;
            const newOperatingBurden = new ApparentPower();
            mappingUnit(newOperatingBurden, item.classRating.operatingBurden);
            entity.apparentPower.push(newOperatingBurden);
            //operating_burden_power_factor
            mainTap.operating_burden_power_factor = item.classRating.operatingBurdenCos || null;
            //ct_core_info_id
            mainTap.ct_core_info_id = core.mrid || null;
            entity.CtTapInfo.push(mainTap);
        })

        /** ================== interTap ================== */
        item.interTap.data.forEach(item => {
            const interTap = new CtTapInfo();
            //mrid
            interTap.mrid = item.classRating.mrid || null;
            //tap_name
            interTap.tap_name = item.table.name || null;
            //type
            interTap.type = item.table.type || null;
            //ipn
            interTap.ipn = item.table.ipn.mrid || null;
            const newIpn = new CurrentFlow();
            mappingUnit(newIpn, item.table.ipn);
            entity.currentFlow.push(newIpn);
            //isn
            interTap.isn = item.table.isn.mrid || null;
            const newIsn = new CurrentFlow();
            mappingUnit(newIsn, item.table.isn);
            entity.currentFlow.push(newIsn);
            //in_use
            interTap.in_use = item.table.inUse || null;
            //rated_burden
            interTap.rated_burden = item.classRating.rated_burden.mrid || null;
            const newRatedBurden = new ApparentPower();
            mappingUnit(newRatedBurden, item.classRating.rated_burden);
            entity.apparentPower.push(newRatedBurden);
            //burden
            interTap.burden = item.classRating.burden.mrid || null;
            const newBurden = new ApparentPower();
            mappingUnit(newBurden, item.classRating.burden);
            entity.apparentPower.push(newBurden);
            //extended_burden
            interTap.extended_burden = item.classRating.extended_burden || null;
            //burden_power_factor
            interTap.burden_power_factor = item.classRating.burdenCos || null;
            //operating_burden
            interTap.operating_burden = item.classRating.operatingBurden.mrid || null;
            const newOperatingBurden = new ApparentPower();
            mappingUnit(newOperatingBurden, item.classRating.operatingBurden);
            entity.apparentPower.push(newOperatingBurden);
            //operating_burden_power_factor
            interTap.operating_burden_power_factor = item.classRating.operatingBurdenCos || null;
            //ct_core_info_id
            interTap.ct_core_info_id = core.mrid || null;
            entity.CtTapInfo.push(interTap);
        })
    })
    return entity;

}

// Hàm mapping ngược từ entity sang DTO
export const mapEntityToDto = (entity) => {
    const dto = new CurrentTransformerDto();
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

    //rattings 
    dto.ratings.standard.value = entity.oldCurrentTransformerInfo.standard || '';
    for (let frequency of entity.frequency) {
        if (frequency.mrid == entity.oldCurrentTransformerInfo.rated_frequency) {
            dto.ratings.rated_frequency.mrid = frequency.mrid || '';
            dto.ratings.rated_frequency.value = frequency.value || '';
            dto.ratings.rated_frequency.unit = frequency.multiplier + '|' + frequency.unit || '';
        }

    }

    dto.ratings.primary_winding_count = entity.oldCurrentTransformerInfo.primary_winding_count || '';
    for (let voltage of entity.voltage) {
        if (voltage.mrid == entity.oldCurrentTransformerInfo.um_rms) {
            dto.ratings.um_rms.mrid = voltage.mrid || '';
            dto.ratings.um_rms.value = voltage.value || '';
            dto.ratings.um_rms.unit = voltage.multiplier + '|' + voltage.unit || '';
        }
        if (voltage.mrid == entity.oldCurrentTransformerInfo.u_withstand_rms) {
            dto.ratings.u_withstand_rms.mrid = voltage.mrid || '';
            dto.ratings.u_withstand_rms.value = voltage.value || '';
            dto.ratings.u_withstand_rms.unit = voltage.multiplier + '|' + voltage.unit || '';
        }
        if (voltage.mrid == entity.oldCurrentTransformerInfo.u_lightning_peak) {
            dto.ratings.u_lightning_peak.mrid = voltage.mrid || '';
            dto.ratings.u_lightning_peak.value = voltage.value || '';
            dto.ratings.u_lightning_peak.unit = voltage.multiplier + '|' + voltage.unit || '';
        }
        if (voltage.mrid == entity.oldCurrentTransformerInfo.system_voltage) {
            dto.ratings.system_voltage.mrid = voltage.mrid || '';
            dto.ratings.system_voltage.value = voltage.value || '';
            dto.ratings.system_voltage.unit = voltage.multiplier + '|' + voltage.unit || '';
        }
        if (voltage.mrid == entity.oldCurrentTransformerInfo.bil) {
            dto.ratings.bil.mrid = voltage.mrid || '';
            dto.ratings.bil.value = voltage.value || '';
            dto.ratings.bil.unit = voltage.multiplier + '|' + voltage.unit || '';
        }
    }

    for (let currentFlow of entity.currentFlow) {
        if (currentFlow.mrid == entity.oldCurrentTransformerInfo.i_cth) {
            dto.ratings.icth.mrid = currentFlow.mrid || '';
            dto.ratings.icth.value = currentFlow.value || '';
            dto.ratings.icth.unit = currentFlow.multiplier + '|' + currentFlow.unit || '';
        }
        if (currentFlow.mrid == entity.oldCurrentTransformerInfo.i_dynamic_peak) {
            dto.ratings.idyn_peak.mrid = currentFlow.mrid || '';
            dto.ratings.idyn_peak.value = currentFlow.value || '';
            dto.ratings.idyn_peak.unit = currentFlow.multiplier + '|' + currentFlow.unit || '';
        }
        if (currentFlow.mrid == entity.oldCurrentTransformerInfo.ith_rms) {
            dto.ratings.ith_rms.mrid = currentFlow.mrid || '';
            dto.ratings.ith_rms.value = currentFlow.value || '';
            dto.ratings.ith_rms.unit = currentFlow.multiplier + '|' + currentFlow.unit || '';
        }
    }

    for (let seconds of entity.seconds) {
        if (seconds.mrid == entity.oldCurrentTransformerInfo.ith_duration) {
            dto.ratings.ith_duration.mrid = seconds.mrid || '';
            dto.ratings.ith_duration.value = seconds.value || '';
            dto.ratings.ith_duration.unit = seconds.multiplier + '|' + seconds.unit || '';
        }
    }

    dto.ratings.system_voltage_type.value = entity.oldCurrentTransformerInfo.system_voltage_type || '';

    dto.ratings.rating_factor = entity.oldCurrentTransformerInfo.rating_factor || '';

    for (let temperature of entity.temperature) {
        if (temperature.mrid == entity.oldCurrentTransformerInfo.rating_factor_temp) {
            dto.ratings.rating_factor_temp.mrid = temperature.mrid || '';
            dto.ratings.rating_factor_temp.value = temperature.value || '';
            dto.ratings.rating_factor_temp.unit = temperature.multiplier + '|' + temperature.unit || '';
        }
    }

    //cores
    dto.ctConfiguration.cores = entity.CtCoreInfo.length || '1';

    // dataCT
    const dataCT = entity.CtCoreInfo.sort((a, b) => a.core_index - b.core_index);
    dataCT.forEach(item => {
        const core = new CoreDto();
        //mrid
        core.mrid = item.mrid || '';
        //taps
        core.taps = item.tap_count || '2';
        //commonTap
        core.commonTap = item.common_tap || '1';
        //fullTap
        entity.CtTapInfo.filter(item => item.ct_core_info_id == item.mrid).forEach(item => {
            if (item.type == 'fulltap') {
                //mrid
                core.fullTap.table.mrid = item.mrid || '';
                //inUse
                core.fullTap.table.inUse = item.in_use || '';
                //name
                core.fullTap.table.name = item.tap_name || '';
                //type
                core.fullTap.table.type = item.type || '';
                //ipn
                for (let currentFlow of entity.currentFlow) {
                    if (currentFlow.mrid == item.ipn) {
                        core.fullTap.table.ipn.mrid = currentFlow.mrid || '';
                        core.fullTap.table.ipn.value = currentFlow.value || '';
                        core.fullTap.table.ipn.unit = currentFlow.multiplier + '|' + currentFlow.unit || '';
                    }
                }
                //isn
                for (let currentFlow of entity.currentFlow) {
                    if (currentFlow.mrid == item.isn) {
                        core.fullTap.table.isn.mrid = currentFlow.mrid || '';
                        core.fullTap.table.isn.value = currentFlow.value || '';
                        core.fullTap.table.isn.unit = currentFlow.multiplier + '|' + currentFlow.unit || '';
                    }
                }
                //rated_burden
                core.fullTap.classRating.rated_burden.mrid = item.rated_burden || '';
                for (let apparentPower of entity.apparentPower) {
                    if (apparentPower.mrid == item.rated_burden) {
                        core.fullTap.classRating.rated_burden.value = apparentPower.value || '';
                        core.fullTap.classRating.rated_burden.unit = apparentPower.multiplier + '|' + apparentPower.unit || '';
                    }
                }
                //burden
                core.fullTap.classRating.burden.mrid = item.burden || '';
                for (let apparentPower of entity.apparentPower) {
                    if (apparentPower.mrid == item.burden) {
                        core.fullTap.classRating.burden.value = apparentPower.value || '';
                        core.fullTap.classRating.burden.unit = apparentPower.multiplier + '|' + apparentPower.unit || '';
                    }
                }
                //extended_burden
                core.fullTap.classRating.extended_burden = item.extended_burden || '';
                //burden_power_factor
                core.fullTap.classRating.burdenCos = item.burden_power_factor || '';
                //operating_burden
                core.fullTap.classRating.operatingBurden.mrid = item.operating_burden || '';
                for (let apparentPower of entity.apparentPower) {
                    if (apparentPower.mrid == item.operating_burden) {
                        core.fullTap.classRating.operatingBurden.value = apparentPower.value || '';
                        core.fullTap.classRating.operatingBurden.unit = apparentPower.multiplier + '|' + apparentPower.unit || '';
                    }
                }
                //operating_burden_power_factor
                core.fullTap.classRating.operatingBurdenCos = item.operating_burden_power_factor || '';

            }

           
        })
    })

    return dto;
}
