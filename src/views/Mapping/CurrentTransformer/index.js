import CurrentTransformerEntity from "@/views/Entity/CurrentTransformer";
import Frequency from "@/views/Cim/Frequency";
import Voltage from "@/views/Cim/Voltage";
import CurrentFlow from "@/views/Cim/CurrentFlow";
import Seconds from "@/views/Cim/Seconds";
import Temperature from "@/views/Cim/Temperature";
import CtCoreInfo from "@/views/Cim/CtCoreInfo";
import Resistance from "@/views/Cim/Resistance";
import Percent from "@/views/Cim/Percent";
import CtTapInfo from "@/views/Cim/CtTapInfo";
import ApparentPower from "@/views/Cim/ApparentPower";
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
    entity.oldCurrentTransformerInfo.icth = dto.ratings.icth.mrid || null;
    const newIcth = new CurrentFlow();
    mappingUnit(newIcth, dto.ratings.icth);
    entity.currentFlow.push(newIcth);
    entity.oldCurrentTransformerInfo.idyn_peak = dto.ratings.idyn_peak.mrid || null;
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

    //ct_Configuration
    dto.ctConfiguration.dataCT.forEach(item => {
        const fullTap = new CtTapInfo();
        const fullTapCore = new CtCoreInfo();

        // fullTap
        fullTapCore.mrid = item.fullTap.classRating.mrid || null;
        fullTap.mrid = item.fullTap.table.mrid || null;
        fullTapCore.core_application = item.fullTap.classRating.app || null;
        fullTapCore.core_class = item.fullTap.classRating.class || null;
        fullTapCore.fs = item.fullTap.classRating.fs || null;
        fullTapCore.alf = item.fullTap.classRating.alf || null;
        fullTapCore.ts = item.fullTap.classRating.ts || null;
        fullTapCore.ek = item.fullTap.classRating.ek || null;
        fullTapCore.e1 = item.fullTap.classRating.e1 || null;
        fullTapCore.ie = item.fullTap.classRating.ie || null;
        fullTapCore.ie1 = item.fullTap.classRating.ie1 || null;
        fullTapCore.kssc = item.fullTap.classRating.kssc || null;
        fullTapCore.val = item.fullTap.classRating.val || null;
        fullTapCore.tp = item.fullTap.classRating.tp || null;
        fullTapCore.iai = item.fullTap.classRating.iai || null;
        fullTapCore.k = item.fullTap.classRating.k || null;
        fullTapCore.ktd = item.fullTap.classRating.ktd || null;
        fullTapCore.duty = item.fullTap.classRating.duty || null;
        fullTapCore.kx = item.fullTap.classRating.kx || null;
        fullTapCore.current_transformer_info_id = entity.assetInfo.mrid || null;
        fullTapCore.ex = item.fullTap.classRating.ex || null;
        fullTapCore.vb = item.fullTap.classRating.vb || null;
        fullTapCore.vk = item.fullTap.classRating.vk || null;
        fullTapCore.vk1 = item.fullTap.classRating.vk1 || null;
        fullTapCore.ik = item.fullTap.classRating.ik || null;
        fullTapCore.ik1 = item.fullTap.classRating.ik1 || null;
        fullTapCore.ratio_error = item.fullTap.classRating.ratio_error || null;
        const newRatioError = new Percent();
        mappingUnit(newRatioError, item.fullTap.classRating.ratio_error);
        entity.percent.push(newRatioError);
        fullTapCore.vb = item.fullTap.classRating.vb || null;
        const newVb = new Voltage();
        mappingUnit(newVb, item.fullTap.classRating.vb);
        entity.voltage.push(newVb);
        fullTapCore.winding_resistance = item.fullTap.classRating.wr.mrid || null;
        const newWindingResistance = new Resistance();
        mappingUnit(newWindingResistance, item.fullTap.classRating.wr);
        entity.resistance.push(newWindingResistance);
        fullTapCore.ts = item.fullTap.classRating.ts || null;
        const newTs = new Seconds();
        mappingUnit(newTs, item.fullTap.classRating.ts);
        entity.seconds.push(newTs);
        fullTapCore.ek = item.fullTap.classRating.ek || null;
        const newEk = new Voltage();
        mappingUnit(newEk, item.fullTap.classRating.ek);
        entity.voltage.push(newEk);
        fullTapCore.e1 = item.fullTap.classRating.e1 || null;
        const newE1 = new Voltage();
        mappingUnit(newE1, item.fullTap.classRating.e1);
        entity.voltage.push(newE1);
        fullTap.tap_name = item.fullTap.table.name || null;
        fullTap.ipn = item.fullTap.table.ipn.mrid || null;
        const newIpn = new CurrentFlow();
        mappingUnit(newIpn, item.fullTap.table.ipn);
        entity.currentFlow.push(newIpn);
        fullTap.isn = item.fullTap.table.isn.mrid || null;
        const newIsn = new CurrentFlow();
        mappingUnit(newIsn, item.fullTap.table.isn);
        entity.currentFlow.push(newIsn);
        fullTap.in_use = item.fullTap.table.inUse || null;
        fullTap.rated_burden = item.fullTap.classRating.rated_burden.mrid || null;
        const newRatedBurden = new ApparentPower();
        mappingUnit(newRatedBurden, item.fullTap.classRating.rated_burden);
        entity.apparentPower.push(newRatedBurden);
        fullTap.burden = item.fullTap.classRating.burden.mrid || null;
        const newBurden = new ApparentPower();
        mappingUnit(newBurden, item.fullTap.classRating.burden);
        entity.apparentPower.push(newBurden);
        fullTap.extended_burden = item.fullTap.classRating.extended_burden || null;
        fullTap.burden_power_factor = item.fullTap.classRating.burdenCos || null;
        fullTap.operating_burden = item.fullTap.classRating.operatingBurden.mrid || null;
        const newOperatingBurden = new ApparentPower();
        mappingUnit(newOperatingBurden, item.fullTap.classRating.operatingBurden);
        entity.apparentPower.push(newOperatingBurden);
        fullTap.operating_burden_power_factor = item.fullTap.classRating.operatingBurdenCos || null;
        fullTap.ct_core_info_id = fullTapCore.mrid || null;
        entity.CtCoreInfo.push(fullTapCore);
        entity.CtTapInfo.push(fullTap);

        // mainTap
        item.mainTap.data.forEach(item => {
            const mainTap = new CtTapInfo();
            const mainTapCore = new CtCoreInfo();

            mainTapCore.mrid = item.classRating.mrid || null;
            mainTap.mrid = item.table.mrid || null;
       
            mainTapCore.rated_burden = item.classRating.rated_burden.mrid || null;
            const newRatedBurden = new ApparentPower();
            mappingUnit(newRatedBurden, item.classRating.rated_burden);
            entity.apparentPower.push(newRatedBurden);
            mainTapCore.extended_burden = item.classRating.extended_burden || null;
            mainTapCore.burden = item.classRating.burden.mrid || null;
            const newBurden = new ApparentPower();
            mappingUnit(newBurden, item.classRating.burden);
            entity.apparentPower.push(newBurden);
            mainTapCore.burdenCos = item.classRating.burdenCos || null;
            mainTapCore.operatingBurden = item.classRating.operatingBurden.mrid || null;
            const newOperatingBurden = new ApparentPower();
            mappingUnit(newOperatingBurden, item.classRating.operatingBurden);
            entity.apparentPower.push(newOperatingBurden);
            mainTapCore.operatingBurdenCos = item.classRating.operatingBurdenCos || null;
            mainTapCore.current_transformer_info_id = entity.assetInfo.mrid || null;
       
            mainTap.isShow = item.table.isShow || null;
            mainTap.name = item.table.name || null;
            mainTap.ipn = item.table.ipn.mrid || null;
            const newIpn = new CurrentFlow();
            mappingUnit(newIpn, item.table.ipn);
            entity.currentFlow.push(newIpn);
            mainTap.isn = item.table.isn.mrid || null;
            const newIsn = new CurrentFlow();
            mappingUnit(newIsn, item.table.isn);
            entity.currentFlow.push(newIsn);
            mainTap.in_use = item.table.inUse || null;
            mainTap.ct_core_info_id = mainTapCore.mrid || null;
            entity.CtCoreInfo.push(mainTapCore);
            entity.CtTapInfo.push(mainTap);
        });

        // interTap
        item.interTap.data.forEach(item => {
            const interTap = new CtTapInfo();
            const interTapCore = new CtCoreInfo();

            interTapCore.mrid = item.classRating.mrid || null;
            interTap.mrid = item.table.mrid || null;
      
            interTapCore.rated_burden = item.classRating.rated_burden.mrid || null;
            const newRatedBurden = new ApparentPower();
            mappingUnit(newRatedBurden, item.classRating.rated_burden);
            entity.apparentPower.push(newRatedBurden);
            interTapCore.extended_burden = item.classRating.extended_burden || null;
            interTapCore.burden = item.classRating.burden.mrid || null;
            const newBurden = new ApparentPower();
            mappingUnit(newBurden, item.classRating.burden);
            entity.apparentPower.push(newBurden);
            interTapCore.burdenCos = item.classRating.burdenCos || null;
            interTapCore.operatingBurden = item.classRating.operatingBurden.mrid || null;
            const newOperatingBurden = new ApparentPower();
            mappingUnit(newOperatingBurden, item.classRating.operatingBurden);
            entity.apparentPower.push(newOperatingBurden);
            interTapCore.operatingBurdenCos = item.classRating.operatingBurdenCos || null;
            interTapCore.current_transformer_info_id = entity.assetInfo.mrid || null;
          
            interTap.isShow = item.table.isShow || null;
            interTap.name = item.table.name || null;
            interTap.ipn = item.table.ipn.mrid || null;
            const newIpn = new CurrentFlow();
            mappingUnit(newIpn, item.table.ipn);
            entity.currentFlow.push(newIpn);
            interTap.isn = item.table.isn.mrid || null;
            const newIsn = new CurrentFlow();
            mappingUnit(newIsn, item.table.isn);
            entity.currentFlow.push(newIsn);
            interTap.in_use = item.table.inUse || null;
            interTap.ct_core_info_id = interTapCore.mrid || null;
            entity.CtCoreInfo.push(interTapCore);
            entity.CtTapInfo.push(interTap);
        });

    });
    return entity;
}