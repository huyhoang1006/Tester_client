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
import { UnitSymbol } from "@/views/Enum/UnitSymbol";

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
    entity.attachment.id = dto.attachmentId || null;
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

    // CT Configuration - validate cores (must be 1-9)
    const validCores = parseInt(dto.ctConfiguration.cores);
    entity.oldCurrentTransformerInfo.core_count = (validCores >= 1 && validCores <= 9) ? validCores : 1;
    
    dto.ctConfiguration.dataCT.forEach((coreDto, index) => {
        const coreInfo = new CtCoreInfo();
        coreInfo.mrid = coreDto.mrid || '';
        coreInfo.core_index = index + 1;
        
        // Validate taps (must be 2-6)
        const validTaps = parseInt(coreDto.taps);
        coreInfo.tap_count = (validTaps >= 2 && validTaps <= 6) ? validTaps : 2;
        
        // Validate commonTap (must be 1 to taps)
        const validCommonTap = parseInt(coreDto.commonTap);
        coreInfo.common_tap = (validCommonTap >= 1 && validCommonTap <= coreInfo.tap_count) ? validCommonTap : 1;
        
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
            // Kiểm tra xem có bất kỳ dữ liệu nào được điền không
            // Cho phép lưu cả khi chỉ điền các trường phụ (Burden, Class...) mà không điền Ipn/Isn
            const hasData = tapTableData.ipn.value ||
                tapTableData.isn.value ||
                tapClassRatingData.rated_burden.value ||
                tapClassRatingData.burden.value ||
                tapClassRatingData.operatingBurden.value ||
                (tapClassRatingData.class && tapClassRatingData.class !== '') ||
                tapTableData.inUse;

            if (!hasData) return;

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
    dto.attachmentId = entity.attachment.id || '';
    dto.attachment = entity.attachment;

    //ratings 
    dto.ratings.standard.value = entity.oldCurrentTransformerInfo.standard || '';
    const findUnitValue = (collection, mrid) => (collection.find(item => item && item.mrid === mrid) || {}).value;

    dto.ratings.rated_frequency.mrid = entity.oldCurrentTransformerInfo.rated_frequency || '';
    const frequencyValue = findUnitValue(entity.frequency, dto.ratings.rated_frequency.mrid);

    // Xử lý rated_frequency_custom
    if (frequencyValue && !['60', '50', '16.7'].includes(frequencyValue.toString())) {
        // Nếu không phải preset value thì là custom
        dto.ratings.rated_frequency.value = 'Custom';
        dto.ratings.rated_frequency_custom = frequencyValue.toString();
    } else {
        // Nếu là preset value
        dto.ratings.rated_frequency.value = frequencyValue || '';
        dto.ratings.rated_frequency_custom = '';
    }

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

    // CT Configuration - validate cores (must be 1-9)
    const validCoreCount = parseInt(entity.oldCurrentTransformerInfo.core_count);
    dto.ctConfiguration.cores = ((validCoreCount >= 1 && validCoreCount <= 9) ? validCoreCount : 1).toString();
    dto.ctConfiguration.dataCT = [];

    const dataCT = (entity.CtCoreInfo || []).sort((a, b) => a.core_index - b.core_index);
    dataCT.forEach(coreInfo => {
        const core = new CoreDto();
        core.mrid = coreInfo.mrid;
        
        // Validate taps (must be 2-6)
        const validTapCount = parseInt(coreInfo.tap_count);
        core.taps = ((validTapCount >= 2 && validTapCount <= 6) ? validTapCount : 2).toString();
        
        // Validate commonTap (must be 1 to taps)
        const validCommonTap = parseInt(coreInfo.common_tap);
        const maxCommonTap = parseInt(core.taps);
        core.commonTap = ((validCommonTap >= 1 && validCommonTap <= maxCommonTap) ? validCommonTap : 1).toString();

        // Xóa dữ liệu giữ chỗ
        core.mainTap.data = [];
        core.interTap.data = [];

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
                    inUse: tapInfo.in_use === 1 || tapInfo.in_use === "1" || tapInfo.in_use === true,
                    type: tapInfo.type,
                    isShow: false,
                    ipn: findAndMapUnit(tapInfo.ipn, entity.currentFlow),
                    isn: findAndMapUnit(tapInfo.isn, entity.currentFlow),
                },
                classRating: {
                    rated_burden: findAndMapUnit(tapInfo.rated_burden, entity.apparentPower),
                    burden: findAndMapUnit(tapInfo.burden, entity.apparentPower),
                    operatingBurden: findAndMapUnit(tapInfo.operating_burden, entity.apparentPower),
                    extended_burden: tapInfo.extended_burden === 1 || tapInfo.extended_burden === "1" || tapInfo.extended_burden === true,
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

        // --- FIX START: Tự động điền (Fill gaps) và SINH TÊN cho Main/Inter Taps ---
        const tapsCount = parseInt(core.taps);
        const coreIndex = coreInfo.core_index;
        const totalCores = parseInt(dto.ctConfiguration.cores);

        // 1. Luôn sinh lại tên cho Full Tap để đảm bảo đúng format
        // Logic: Nếu chỉ có 1 core -> "S1 - S[Taps]", nếu nhiều core -> "1S1 - 1S[Taps]"
        if (core.fullTap && core.fullTap.table) {
            if (totalCores === 1) {
                core.fullTap.table.name = `S1 - S${tapsCount}`;
            } else {
                core.fullTap.table.name = `${coreIndex}S1 - ${coreIndex}S${tapsCount}`;
            }
        }

        // 2. Logic sinh tên Main Tap (giả sử Common Tap = 1 như UI mặc định)
        const expectedMainNames = [];
        for (let i = 0; i < tapsCount - 2; i++) {
            // Logic: Nếu 1 core -> S1 - S2, S1 - S3..., nếu nhiều core -> 1S1 - 1S2, 1S1 - 1S3...
            // i=0 -> S2, i=1 -> S3...
            if (totalCores === 1) {
                expectedMainNames.push(`S1 - S${i + 2}`);
            } else {
                expectedMainNames.push(`${coreIndex}S1 - ${coreIndex}S${i + 2}`);
            }
        }

        const requiredMainTaps = tapsCount > 2 ? tapsCount - 2 : 0;
        while (core.mainTap.data.length < requiredMainTaps) {
            const idx = core.mainTap.data.length;
            core.mainTap.data.push({
                table: {
                    mrid: '',
                    name: expectedMainNames[idx] || '', // Gán tên tự động
                    isShow: false,
                    ipn: { mrid: '', value: '', unit: UnitSymbol.A },
                    isn: { mrid: '', value: '', unit: UnitSymbol.A },
                    inUse: false, type: 'maintap'
                },
                classRating: {
                    mrid: '',
                    rated_burden: { mrid: '', value: '', unit: UnitSymbol.VA },
                    extended_burden: false,
                    burden: { mrid: '', value: '', unit: UnitSymbol.VA },
                    burdenCos: '',
                    operatingBurden: { mrid: '', value: '', unit: UnitSymbol.VA },
                    operatingBurdenCos: '',
                    core_index: coreInfo.core_index
                }
            });
        }

        // 3. Logic sinh tên Inter Tap
        const expectedInterNames = [];
        // Logic loop giống hệt UI: chosenCommonTap
        for (let i = 2; i <= tapsCount; i++) {
            for (let j = i + 1; j <= tapsCount; j++) {
                // Name: Nếu 1 core -> S2 - S3, S2 - S4..., nếu nhiều core -> 1S2 - 1S3, 1S2 - 1S4...
                if (totalCores === 1) {
                    expectedInterNames.push(`S${i} - S${j}`);
                } else {
                    expectedInterNames.push(`${coreIndex}S${i} - ${coreIndex}S${j}`);
                }
            }
        }

        let requiredInterTaps = 0;
        if (tapsCount > 2) {
            const totalCombinations = (tapsCount * (tapsCount - 1)) / 2;
            requiredInterTaps = totalCombinations - 1 - (tapsCount - 2);
        }

        while (core.interTap.data.length < requiredInterTaps) {
            const idx = core.interTap.data.length;
            core.interTap.data.push({
                table: {
                    mrid: '',
                    name: expectedInterNames[idx] || '', // Gán tên tự động
                    isShow: false,
                    ipn: { mrid: '', value: '', unit: UnitSymbol.A },
                    isn: { mrid: '', value: '', unit: UnitSymbol.A },
                    inUse: false, type: 'intertap'
                },
                classRating: {
                    mrid: '',
                    rated_burden: { mrid: '', value: '', unit: UnitSymbol.VA },
                    extended_burden: false,
                    burden: { mrid: '', value: '', unit: UnitSymbol.VA },
                    burdenCos: '',
                    operatingBurden: { mrid: '', value: '', unit: UnitSymbol.VA },
                    operatingBurdenCos: '',
                    core_index: coreInfo.core_index
                }
            });
        }
        // --- FIX END ---

        dto.ctConfiguration.dataCT.push(core);
    });

    return dto;
}

// Aliases for treeNavigation.vue (which expects asset-specific function names)
export const currentTransformerDtoToEntity = mapDtoToEntity;
export const currentTransformerEntityToDto = mapEntityToDto;