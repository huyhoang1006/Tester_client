import CurrentTransformerEntity from "@/views/Flatten/CurrentTransformer";
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
import Percent from "@/views/Cim/Percent";

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

    // Xử lý CT Configuration
    entity.oldCurrentTransformerInfo.core_count = dto.ctConfiguration.cores;
    dto.ctConfiguration.dataCT.forEach((coreDto, index) => {
        const coreInfo = new CtCoreInfo();
        coreInfo.mrid = coreDto.mrid || '';
        coreInfo.core_index = index + 1;
        coreInfo.tap_count = coreDto.taps;
        coreInfo.common_tap = coreDto.commonTap;
        coreInfo.current_transformer_info_id = entity.oldCurrentTransformerInfo.mrid;

        const fullTapClassRating = coreDto.fullTap.classRating;
        coreInfo.core_application = fullTapClassRating.app;
        coreInfo.core_class = fullTapClassRating.class;
        coreInfo.fs = fullTapClassRating.fs;
        coreInfo.alf = fullTapClassRating.alf;

        coreInfo.winding_resistance = fullTapClassRating.wr.mrid;
        const newResistance = new Resistance();
        mappingUnit(newResistance, fullTapClassRating.wr);
        entity.resistance.push(newResistance);

        coreInfo.kx = fullTapClassRating.kx;
        coreInfo.k = fullTapClassRating.k;
        coreInfo.kssc = fullTapClassRating.kssc;
        coreInfo.ktd = fullTapClassRating.ktd;
        coreInfo.duty = fullTapClassRating.duty;


        coreInfo.ts = fullTapClassRating.ts;
        coreInfo.ek = fullTapClassRating.ek;
        coreInfo.ie = fullTapClassRating.le;
        coreInfo.e1 = fullTapClassRating.e1;
        coreInfo.ie1 = fullTapClassRating.le1;
        coreInfo.val = fullTapClassRating.val;
        coreInfo.iai = fullTapClassRating.lal;
        coreInfo.tp = fullTapClassRating.tp;
        coreInfo.vk = fullTapClassRating.vk;
        coreInfo.ik = fullTapClassRating.lk;
        coreInfo.vk1 = fullTapClassRating.vk1;
        coreInfo.ik1 = fullTapClassRating.lk1;
        coreInfo.vb = fullTapClassRating.vb.mrid;
        const newVb = new Voltage();
        mappingUnit(newVb, fullTapClassRating.vb);
        entity.voltage.push(newVb);
        coreInfo.ratio_error = fullTapClassRating.ratio_error.mrid;
        const newRatioError = new Percent();
        mappingUnit(newRatioError, fullTapClassRating.ratio_error);
        entity.percent.push(newRatioError);

        entity.CtCoreInfo.push(coreInfo);

        const createTapInfo = (tapTableData, tapClassRatingData, type) => {
            // Chỉ tạo tap info nếu có dữ liệu ipn hoặc isn
            if (!tapTableData.ipn.value && !tapTableData.isn.value) return;

            const tapInfo = new CtTapInfo();
            tapInfo.mrid = tapTableData.mrid || '';
            tapInfo.tap_name = tapTableData.name;
            tapInfo.in_use = tapTableData.inUse;
            tapInfo.type = type;
            tapInfo.ct_core_info_id = coreInfo.mrid;

            // Xử lý các đối tượng đơn vị
            tapInfo.ipn = tapTableData.ipn.mrid;
            const newIpn = new CurrentFlow();
            mappingUnit(newIpn, tapTableData.ipn);
            entity.currentFlow.push(newIpn);

            tapInfo.isn = tapTableData.isn.mrid;
            const newIsn = new CurrentFlow();
            mappingUnit(newIsn, tapTableData.isn);
            entity.currentFlow.push(newIsn);

            tapInfo.rated_burden = tapClassRatingData.rated_burden.mrid;
            const newRatedBurden = new ApparentPower();
            mappingUnit(newRatedBurden, tapClassRatingData.rated_burden);
            entity.apparentPower.push(newRatedBurden);

            tapInfo.burden = tapClassRatingData.burden.mrid;
            const newBurden = new ApparentPower();
            mappingUnit(newBurden, tapClassRatingData.burden);
            entity.apparentPower.push(newBurden);

            tapInfo.operating_burden = tapClassRatingData.operatingBurden.mrid;
            const newOpBurden = new ApparentPower();
            mappingUnit(newOpBurden, tapClassRatingData.operatingBurden);
            entity.apparentPower.push(newOpBurden);

            tapInfo.extended_burden = tapClassRatingData.extended_burden;
            tapInfo.burden_power_factor = tapClassRatingData.burdenCos;
            tapInfo.operating_burden_power_factor = tapClassRatingData.operatingBurdenCos;

            entity.CtTapInfo.push(tapInfo);
        };

        createTapInfo(coreDto.fullTap.table, coreDto.fullTap.classRating, 'fulltap');
        coreDto.mainTap.data.forEach(tap => createTapInfo(tap.table, tap.classRating, 'maintap'));
        coreDto.interTap.data.forEach(tap => createTapInfo(tap.table, tap.classRating, 'intertap'));
    });

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

    //assetPsr
    dto.assetPsrId = entity.assetPsr.mrid || '';
    dto.psrId = entity.assetPsr.psr_id || '';

    //attachment
    dto.attachmentId = entity.attachment.mrid || '';
    dto.attachment = entity.attachment;

    //ratings 
    dto.ratings.standard.value = entity.oldCurrentTransformerInfo.standard || '';
    const findUnitValue = (collection, mrid) => (collection.find(item => item && item.mrid === mrid) || {}).value;

    dto.ratings.rated_frequency.mrid = entity.oldCurrentTransformerInfo.rated_frequency || '';
    dto.ratings.rated_frequency.value = findUnitValue(entity.frequency, dto.ratings.rated_frequency.mrid);

    dto.ratings.primary_winding_count = entity.oldCurrentTransformerInfo.primary_winding_count || '';

    dto.ratings.um_rms.mrid = entity.oldCurrentTransformerInfo.um_rms || '';
    dto.ratings.um_rms.value = findUnitValue(entity.voltage, dto.ratings.um_rms.mrid);

    dto.ratings.u_withstand_rms.mrid = entity.oldCurrentTransformerInfo.u_withstand_rms || '';
    dto.ratings.u_withstand_rms.value = findUnitValue(entity.voltage, dto.ratings.u_withstand_rms.mrid);

    dto.ratings.u_lightning_peak.mrid = entity.oldCurrentTransformerInfo.u_lightning_peak || '';
    dto.ratings.u_lightning_peak.value = findUnitValue(entity.voltage, dto.ratings.u_lightning_peak.mrid);

    dto.ratings.icth.mrid = entity.oldCurrentTransformerInfo.i_cth || '';
    dto.ratings.icth.value = findUnitValue(entity.currentFlow, dto.ratings.icth.mrid);

    dto.ratings.idyn_peak.mrid = entity.oldCurrentTransformerInfo.i_dynamic_peak || '';
    dto.ratings.idyn_peak.value = findUnitValue(entity.currentFlow, dto.ratings.idyn_peak.mrid);

    dto.ratings.ith_rms.mrid = entity.oldCurrentTransformerInfo.ith_rms || '';
    dto.ratings.ith_rms.value = findUnitValue(entity.currentFlow, dto.ratings.ith_rms.mrid);

    dto.ratings.ith_duration.mrid = entity.oldCurrentTransformerInfo.ith_duration || '';
    dto.ratings.ith_duration.value = findUnitValue(entity.seconds, dto.ratings.ith_duration.mrid);

    dto.ratings.system_voltage.mrid = entity.oldCurrentTransformerInfo.system_voltage || '';
    dto.ratings.system_voltage.value = findUnitValue(entity.voltage, dto.ratings.system_voltage.mrid);

    dto.ratings.system_voltage_type.value = entity.oldCurrentTransformerInfo.system_voltage_type || '';

    dto.ratings.bil.mrid = entity.oldCurrentTransformerInfo.bil || '';
    dto.ratings.bil.value = findUnitValue(entity.voltage, dto.ratings.bil.mrid);

    dto.ratings.rating_factor = entity.oldCurrentTransformerInfo.rating_factor || '';

    dto.ratings.rating_factor_temp.mrid = entity.oldCurrentTransformerInfo.rating_factor_temp || '';
    dto.ratings.rating_factor_temp.value = findUnitValue(entity.temperature, dto.ratings.rating_factor_temp.mrid);

    // CT Configuration
    dto.ctConfiguration.cores = entity.oldCurrentTransformerInfo.core_count || '1';
    dto.ctConfiguration.dataCT = [];

    const dataCT = (entity.CtCoreInfo || []).sort((a, b) => a.core_index - b.core_index);
    dataCT.forEach(coreInfo => {
        const core = new CoreDto();
        core.mrid = coreInfo.mrid;
        core.taps = (coreInfo.tap_count || '2').toString();
        core.commonTap = (coreInfo.common_tap || '1').toString();

        // === FIX START ===
        // Xóa dữ liệu giữ chỗ được tạo bởi constructor
        core.mainTap.data = [];
        core.interTap.data = [];
        // === FIX END ===

        const tapsForThisCore = (entity.CtTapInfo || []).filter(t => t.ct_core_info_id === coreInfo.mrid);

        const findAndMapUnit = (mrid, collection) => {
            const item = collection.find(u => u && u.mrid === mrid);
            if (!item) return { mrid: mrid, value: '', unit: '' };
            return {
                mrid: item.mrid,
                value: item.value,
                unit: (item.multiplier ? item.multiplier + '|' : '') + (item.unit || '')
            };
        };

        tapsForThisCore.forEach(tapInfo => {
            const tapObject = {
                table: {
                    mrid: tapInfo.mrid,
                    name: tapInfo.tap_name,
                    inUse: tapInfo.in_use,
                    type: tapInfo.type,
                    isShow: false,
                    ipn: findAndMapUnit(tapInfo.ipn, entity.currentFlow),
                    isn: findAndMapUnit(tapInfo.isn, entity.currentFlow),
                },
                classRating: {
                    rated_burden: findAndMapUnit(tapInfo.rated_burden, entity.apparentPower),
                    burden: findAndMapUnit(tapInfo.burden, entity.apparentPower),
                    operatingBurden: findAndMapUnit(tapInfo.operating_burden, entity.apparentPower),
                    extended_burden: tapInfo.extended_burden,
                    burdenCos: tapInfo.burden_power_factor,
                    operatingBurdenCos: tapInfo.operating_burden_power_factor,
                }
            };

            if (tapInfo.type === 'fulltap') {
                core.fullTap = tapObject;
                core.fullTap.classRating.app = coreInfo.core_application;
                core.fullTap.classRating.class = coreInfo.core_class;
                core.fullTap.classRating.fs = coreInfo.fs;
                core.fullTap.classRating.alf = coreInfo.alf;
                core.fullTap.classRating.wr = findAndMapUnit(coreInfo.winding_resistance, entity.resistance);
                core.fullTap.classRating.vb = findAndMapUnit(coreInfo.vb, entity.voltage);
                core.fullTap.classRating.kx = coreInfo.kx;
                core.fullTap.classRating.k = coreInfo.k;
                core.fullTap.classRating.kssc = coreInfo.kssc;
                core.fullTap.classRating.ktd = coreInfo.ktd;
                core.fullTap.classRating.duty = coreInfo.duty;
                core.fullTap.classRating.ts = coreInfo.ts;
                core.fullTap.classRating.ek = coreInfo.ek;
                core.fullTap.classRating.le = coreInfo.ie;
                core.fullTap.classRating.e1 = coreInfo.e1;
                core.fullTap.classRating.le1 = coreInfo.ie1;
                core.fullTap.classRating.val = coreInfo.val;
                core.fullTap.classRating.lal = coreInfo.iai;
                core.fullTap.classRating.tp = coreInfo.tp;
                core.fullTap.classRating.vk = coreInfo.vk;
                core.fullTap.classRating.lk = coreInfo.ik;
                core.fullTap.classRating.vk1 = coreInfo.vk1;
                core.fullTap.classRating.lk1 = coreInfo.ik1;
                core.fullTap.classRating.ratio_error = findAndMapUnit(coreInfo.ratio_error, entity.percent);
                core.fullTap.classRating.core_index = coreInfo.core_index;
            } else if (tapInfo.type === 'maintap') {
                core.mainTap.data.push(tapObject);
            } else if (tapInfo.type === 'intertap') {
                core.interTap.data.push(tapObject);
            }
        });

        dto.ctConfiguration.dataCT.push(core);
    });

    return dto;
}