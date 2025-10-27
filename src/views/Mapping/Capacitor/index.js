import ReactivePower from "@/views/Cim/ReactivePower";
import Capacitance from "@/views/Cim/Capacitance";
import CurrentFlow from "@/views/Cim/CurrentFlow";
import Frequency from "@/views/Cim/Frequency";
import Voltage from "@/views/Cim/Voltage";
import CapacitorEntity from "@/views/Entity/Capacitor";
import CapacitorsDTO from "@/views/Dto/Capacitor";
import Percent from "@/views/Cim/Percent";
import Mass from "@/views/Cim/Mass";
import CapacitanceCapacitorInfo from "@/views/Cim/CapacitanceCapacitorInfo";
import DissipationFactorCapacitorInfo from "@/views/Cim/DissipationFactorCapacitorInfo";


/** ============================
 * Helper: Map Unit
 * ============================ */
const mappingUnit = (map, unitDto) => {
    if (!map || !unitDto) return;
    map.mrid = unitDto.mrid || null;
    map.value = unitDto.value || null;
    const unitParts = (unitDto.unit || '').split('|'); // ví dụ "k|V"
    map.multiplier = unitParts.length > 1 ? unitParts[0] : null;
    map.unit = unitParts.length > 1 ? unitParts[1] : unitParts[0] || null;
};


/** ============================
 * DTO → ENTITY
 * ============================ */
export function mapDtoToEntity(dto) {
    const entity = new CapacitorEntity();

    /** ---------- Properties ---------- */
    entity.asset.mrid = dto.properties.mrid || null;
    entity.asset.kind = dto.properties.kind || null;
    entity.asset.type = dto.properties.type || null;
    entity.asset.serial_number = dto.properties.serial_no || null;
    entity.asset.asset_info = dto.assetInfoId || null;
    entity.asset.product_asset_model = dto.productAssetModelId || null;
    entity.productAssetModel.manufacturer = dto.properties.manufacturer || null;
    entity.productAssetModel.mrid = dto.productAssetModelId || null;
    entity.capacitor.manufacturer_type = dto.properties.manufacturer_type || null;
    entity.asset.country_of_origin = dto.properties.country_of_origin || null;
    entity.capacitor.mrid = dto.assetInfoId || null;
    entity.asset.name = dto.properties.apparatus_id || null;
    entity.asset.description = dto.properties.comment || null;

    /** ---------- Lifecycle ---------- */
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.lifecycleDate.manufactured_date = dto.properties.manufacturing_year || null;
    entity.asset.lifecycle_date = dto.lifecycleDateId || null;

    /** ---------- assetPsr ---------- */
    entity.assetPsr.mrid = dto.assetPsrId || null;
    entity.assetPsr.asset_id = dto.properties.mrid || null;
    entity.assetPsr.psr_id = dto.psrId || null;

    /** ---------- attachment ---------- */
    entity.attachment.mrid = dto.attachmentId || null;
    entity.attachment = dto.attachment || null;

    /** ---------- configsData ---------- */
    entity.capacitor.phase_number = dto.configsData.phase ? parseInt(dto.configsData.phase) : null;
    // Chỉ lưu phase_name nếu phase = 1 (single phase)
    console.log('=== Mapping ConfigsData ===');
    console.log('dto.configsData:', JSON.stringify(dto.configsData, null, 2));
    console.log('phase:', dto.configsData.phase);
    console.log('phase_name in DTO:', dto.configsData.phase_name);

    if (dto.configsData.phase === '1') {
        entity.capacitor.phase_name = dto.configsData.phase_name || null;
        console.log('Setting phase_name to:', entity.capacitor.phase_name);
    } else {
        entity.capacitor.phase_name = null;
        console.log('Phase is 3, setting phase_name to null');
    }
    console.log('Final entity.capacitor.phase_name:', entity.capacitor.phase_name);

    /** ---------- Rated values ---------- */
    entity.capacitor.rated_voltage = dto.ratings.rated_voltage.mrid || null;
    const ratedVoltage = new Voltage();
    mappingUnit(ratedVoltage, dto.ratings.rated_voltage);
    entity.voltage.push(ratedVoltage);

    entity.capacitor.rated_frequency = dto.ratings.rated_frequency.mrid || null;
    const ratedFreq = new Frequency();
    mappingUnit(ratedFreq, dto.ratings.rated_frequency);
    entity.frequency.push(ratedFreq);

    entity.capacitor.rated_current = dto.ratings.rated_current.mrid || null;
    const ratedCurrent = new CurrentFlow();
    mappingUnit(ratedCurrent, dto.ratings.rated_current);
    entity.currentFlow.push(ratedCurrent);

    entity.capacitor.rated_power = dto.ratings.rated_power.mrid || null;
    const ratedPower = new ReactivePower();
    mappingUnit(ratedPower, dto.ratings.rated_power);
    entity.reactivePower.push(ratedPower);

    /** ---------- Capacitance (Phase-based) ---------- */
    if (dto.configsData.phase == '1') {
        // Chỉ lưu nếu có giá trị
        if (dto.capacitance.capacitance && dto.capacitance.capacitance.value && dto.capacitance.capacitance.value.value) {
            const capacitanceCapacitorInfo = new CapacitanceCapacitorInfo();
            capacitanceCapacitorInfo.mrid = dto.capacitance.capacitance.mrid || null;
            capacitanceCapacitorInfo.value = dto.capacitance.capacitance.value.mrid || null;
            const capacitance = new Capacitance();
            mappingUnit(capacitance, dto.capacitance.capacitance.value);
            entity.capacitance.push(capacitance);
            capacitanceCapacitorInfo.phase = dto.capacitance.capacitance.phase || null;
            capacitanceCapacitorInfo.capacitor_info_id = dto.assetInfoId;
            entity.capacitanceCapacitorInfo.push(capacitanceCapacitorInfo);
        }
    }
    else {
        // Phase 3: Chỉ lưu các phase có giá trị
        ['A', 'B', 'C'].forEach(phase => {
            const phaseField = `capacitance_${phase}`;
            const phaseData = dto.capacitance[phaseField];
            if (phaseData && phaseData.value && phaseData.value.value) {
                const capacitanceCapacitorInfo = new CapacitanceCapacitorInfo();
                capacitanceCapacitorInfo.mrid = phaseData.mrid || null;
                capacitanceCapacitorInfo.value = phaseData.value.mrid || null;
                const capacitance = new Capacitance();
                mappingUnit(capacitance, phaseData.value);
                entity.capacitance.push(capacitance);
                capacitanceCapacitorInfo.phase = phase;
                capacitanceCapacitorInfo.capacitor_info_id = dto.assetInfoId;
                entity.capacitanceCapacitorInfo.push(capacitanceCapacitorInfo);
            }
        });
    }

    /** ---------- Dissipation Factor (Phase-based) ---------- */
    // Note: dissipationFactorCapacitorInfo is an array, not a single object


    if (dto.configsData.phase == '1') {
        // Chỉ lưu nếu có giá trị
        const phase1Value = dto.dissipationFactor.dissipation_factor?.value?.value || '';
        const phase1ValueStr = String(phase1Value || '');

        if (dto.dissipationFactor.dissipation_factor && dto.dissipationFactor.dissipation_factor.value && phase1ValueStr && phase1ValueStr.trim() !== '') {
            const dissipationFactorCapacitorInfo = new DissipationFactorCapacitorInfo();
            dissipationFactorCapacitorInfo.mrid = dto.dissipationFactor.dissipation_factor.mrid || null;
            dissipationFactorCapacitorInfo.value = dto.dissipationFactor.dissipation_factor.value.mrid || null;
            const dissipationFactor = new Percent();
            mappingUnit(dissipationFactor, dto.dissipationFactor.dissipation_factor.value);
            entity.percent.push(dissipationFactor);
            dissipationFactorCapacitorInfo.phase = dto.dissipationFactor.dissipation_factor.phase || null;
            dissipationFactorCapacitorInfo.capacitor_info_id = dto.assetInfoId;
            entity.dissipationFactorCapacitorInfo.push(dissipationFactorCapacitorInfo);
        }
    }
    else {
        // Phase 3: Chỉ lưu các phase có giá trị
        ['A', 'B', 'C'].forEach(phase => {
            const phaseField = `dissipation_factor_${phase}`;
            const phaseData = dto.dissipationFactor[phaseField];
            const actualValue = phaseData?.value?.value || '';
            const actualValueStr = String(actualValue || '');

            if (phaseData && phaseData.value && actualValueStr && actualValueStr.trim() !== '') {
                const dissipationFactorCapacitorInfo = new DissipationFactorCapacitorInfo();
                dissipationFactorCapacitorInfo.mrid = phaseData.mrid || null;
                dissipationFactorCapacitorInfo.value = phaseData.value.mrid || null;
                const dissipationFactor = new Percent();
                mappingUnit(dissipationFactor, phaseData.value);
                entity.percent.push(dissipationFactor);
                dissipationFactorCapacitorInfo.phase = phase;
                dissipationFactorCapacitorInfo.capacitor_info_id = dto.assetInfoId;
                entity.dissipationFactorCapacitorInfo.push(dissipationFactorCapacitorInfo);
            }
        });
    }

    /** ---------- Others ---------- */
    entity.capacitor.insulation_type = dto.othersData.insulation_type || null;
    entity.capacitor.weight = dto.othersData.weight.mrid || null;
    const mass = new Mass();
    mappingUnit(mass, dto.othersData.weight);
    entity.mass.push(mass);

    return entity;
}


export function mapEntityToDto(entity) {
    const dto = new CapacitorsDTO();

    /** ---------- Properties ---------- */
    dto.properties.mrid = entity.asset.mrid || null;
    dto.properties.kind = entity.asset.kind || null;
    dto.properties.type = entity.asset.type || null;
    dto.properties.serial_no = entity.asset.serial_number || null;
    dto.assetInfoId = entity.asset.asset_info || null;
    dto.productAssetModelId = entity.asset.product_asset_model || null;
    dto.properties.manufacturer = entity.productAssetModel.manufacturer || null;
    dto.productAssetModelId = entity.productAssetModel.mrid || null;
    dto.properties.manufacturer_type = entity.capacitor.manufacturer_type || null;
    dto.properties.country_of_origin = entity.asset.country_of_origin || null;
    dto.assetInfoId = entity.capacitor.mrid || null;
    dto.properties.apparatus_id = entity.asset.name || null;
    dto.properties.comment = entity.asset.description || null;

    /** ---------- Lifecycle ---------- */
    dto.lifecycleDateId = entity.lifecycleDate.mrid || null;
    dto.properties.manufacturing_year = entity.lifecycleDate.manufactured_date || null;

    /** ---------- assetPsr ---------- */
    dto.assetPsrId = entity.assetPsr.mrid || null;
    dto.properties.mrid = entity.assetPsr.asset_id || null;
    dto.psrId = entity.assetPsr.psr_id || null;

    /** ---------- attachment ---------- */
    dto.attachmentId = entity.attachment.mrid || null;
    dto.attachment = entity.attachment || null;

    /** ---------- configsData ---------- */
    dto.configsData.phase = entity.capacitor.phase_number > 0 ? String(entity.capacitor.phase_number) : '';
    dto.configsData.phase_name = entity.capacitor.phase_name || null;

    console.log('=== Mapping Entity to DTO (ConfigsData) ===');
    console.log('entity.capacitor.phase_number:', entity.capacitor.phase_number);
    console.log('entity.capacitor.phase_name:', entity.capacitor.phase_name);
    console.log('Mapped to dto.configsData:', JSON.stringify(dto.configsData, null, 2));

    /** ---------- Rated values ---------- */
    if (entity.voltage.length > 0) {
        const v = entity.voltage[0];
        dto.ratings.rated_voltage.mrid = v.mrid;
        dto.ratings.rated_voltage.value = v.value;
        dto.ratings.rated_voltage.unit = v.multiplier ? `${v.multiplier}|${v.unit}` : v.unit;
    }

    if (entity.frequency.length > 0) {
        const f = entity.frequency[0];
        dto.ratings.rated_frequency.mrid = f.mrid;
        dto.ratings.rated_frequency.value = f.value;
        dto.ratings.rated_frequency.unit = f.unit;
    }

    if (entity.currentFlow.length > 0) {
        const c = entity.currentFlow[0];
        dto.ratings.rated_current.mrid = c.mrid;
        dto.ratings.rated_current.value = c.value;
        dto.ratings.rated_current.unit = c.unit;
    }

    if (entity.reactivePower.length > 0) {
        const p = entity.reactivePower[0];
        dto.ratings.rated_power.mrid = p.mrid;
        dto.ratings.rated_power.value = p.value;
        dto.ratings.rated_power.unit = p.multiplier ? `${p.multiplier}|${p.unit}` : p.unit;
    }

    /** ---------- Capacitance ---------- */
    // Map capacitance using capacitanceCapacitorInfo which links to capacitance values
    for (const capInfo of entity.capacitanceCapacitorInfo) {
        // Find the corresponding capacitance value
        const capacitanceValue = entity.capacitance.find(c => c.mrid === capInfo.value);
        if (capacitanceValue) {
            const phaseKey = capInfo.phase && capInfo.phase !== '1' ? `capacitance_${capInfo.phase}` : 'capacitance';
            if (dto.capacitance[phaseKey]) {
                dto.capacitance[phaseKey].mrid = capInfo.mrid || null;
                dto.capacitance[phaseKey].value.mrid = capacitanceValue.mrid || null;
                dto.capacitance[phaseKey].value.value = capacitanceValue.value || null;
                dto.capacitance[phaseKey].value.unit = capacitanceValue.multiplier ? `${capacitanceValue.multiplier}|${capacitanceValue.unit}` : capacitanceValue.unit;
                dto.capacitance[phaseKey].phase = capInfo.phase || null;
                dto.capacitance[phaseKey].capacitor_info_id = capInfo.capacitor_info_id || null;
            }
        }
    }

    /** ---------- Dissipation Factor ---------- */
    // Map dissipation factor using dissipationFactorCapacitorInfo which links to percent values
    for (const dfInfo of entity.dissipationFactorCapacitorInfo) {
        // Find the corresponding percent value
        const percentValue = entity.percent.find(p => p.mrid === dfInfo.value);
        if (percentValue) {
            const phaseKey = dfInfo.phase && dfInfo.phase !== '1' ? `dissipation_factor_${dfInfo.phase}` : 'dissipation_factor';
            if (dto.dissipationFactor[phaseKey]) {
                dto.dissipationFactor[phaseKey].mrid = dfInfo.mrid || null;
                dto.dissipationFactor[phaseKey].value.mrid = percentValue.mrid || null;
                dto.dissipationFactor[phaseKey].value.value = percentValue.value || null;
                dto.dissipationFactor[phaseKey].value.unit = percentValue.multiplier ? `${percentValue.multiplier}|${percentValue.unit}` : percentValue.unit;
                dto.dissipationFactor[phaseKey].phase = dfInfo.phase || null;
                dto.dissipationFactor[phaseKey].capacitor_info_id = dfInfo.capacitor_info_id || null;
            }
        }
    }

    /** ---------- Others ---------- */
    dto.othersData.insulation_type = entity.capacitor.insulation_type || null;
    if (entity.mass.length > 0) {
        const w = entity.mass[0];
        dto.othersData.weight.mrid = w.mrid;
        dto.othersData.weight.value = w.value;
        dto.othersData.weight.unit = w.multiplier ? `${w.multiplier}|${w.unit}` : w.unit;
    }

    return dto;
}
