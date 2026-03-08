import TransformerDto from "@/views/Dto/Transformer";

// Helper để map unit từ server { value, unit } sang { value, unit, multiplier } của client
const mapUnit = (val, unitStr) => {
    return {
        value: val !== null && val !== undefined ? val : '',
        unit: unitStr || '',
        multiplier: '' // Server trả về unit gộp (ví dụ "kV"), client có thể cần tách, tạm thời để trống hoặc xử lý tùy logic
    };
};

export const mapServerToDto = (serverData) => {
    const dto = new TransformerDto();
    if (!serverData) return dto;

    const info = serverData.assetInfo || {};
    const trans = serverData.transformer || {};
    const vRatings = serverData.voltageRatings || [];
    const pRatings = serverData.powerRatings || [];
    const impedances = serverData.shortCircuitImpedances || [];
    const tapChanger = serverData.tapChanger || {};
    const tapTable = serverData.tapChangerVoltage || [];

    // 1. Properties
    // Dùng ID của transformer làm mrid chính
    dto.properties.mrid = String(trans.id || ''); 
    dto.properties.serial_no = info.serialNo || '';
    dto.properties.apparatus_id = info.apparatusId || '';
    dto.properties.manufacturer = info.manufacturerName || '';
    dto.properties.manufacturing_year = info.manufacturingYear || '';
    dto.properties.country_of_origin = info.countryName || '';
    dto.properties.type = trans.assetType || '';
    dto.properties.kind = 'Transformer';

    // 2. Winding Configuration & General Specs
    dto.winding_configuration.vector_group = trans.vectorGroup || '';
    dto.others.frequency = mapUnit(trans.ratedFrequency, trans.ratedFrequencyUnit);
    dto.others.max_short_circuit_current = mapUnit(trans.maxShortCircuitCurrent, trans.maxShortCircuitCurrentUnit);
    dto.others.short_circuit_duration = mapUnit(trans.duration, trans.durationUnit);

    // 3. Voltage Ratings (Map mảng server sang các field PRIM, SEC, TERT)
    const primV = vRatings.find(v => v.winding === 'PRIM') || {};
    const secV = vRatings.find(v => v.winding === 'SEC') || {};
    const tertV = vRatings.find(v => v.winding === 'TERT') || {};

    dto.ratings.voltage = {
        prim: mapUnit(primV.insulLevelLL, primV.insulLevelLLUnit),
        sec: mapUnit(secV.insulLevelLL, secV.insulLevelLLUnit),
        tert: mapUnit(tertV.insulLevelLL, tertV.insulLevelLLUnit)
    };

    // 4. Power Ratings (Cooling Classes)
    // Client thường lưu mảng cooling, ta map trực tiếp
    if (pRatings.length > 0) {
        dto.ratings.power = pRatings.map(p => ({
            cooling_type: p.coolingClass || '',
            value: p.ratedPower || '',
            unit: p.ratedPowerUnit || 'MVA'
        }));
    }

    // 5. Short Circuit Impedances
    // Map mảng impedances từ server vào cấu trúc client
    // Server phân loại bằng field "type": "PRIM_SEC", "PRIM_TERT", "SEC_TERT"
    const mapImp = (imp) => ({
        mrid: String(imp.id || ''),
        base_power: { value: imp.basePower, unit: imp.basePowerUnit },
        base_voltage: { value: imp.baseVoltage, unit: imp.baseVoltageUnit },
        short_circuit_impedances_uk: { value: imp.impedance, unit: imp.impedanceUnit },
        load_losses_pk: { value: imp.loadLoss, unit: imp.loadLossUnit }
    });

    dto.impedances.prim_sec = impedances.filter(i => i.type === 'PRIM_SEC').map(mapImp);
    dto.impedances.prim_tert = impedances.filter(i => i.type === 'PRIM_TERT').map(mapImp);
    dto.impedances.sec_tert = impedances.filter(i => i.type === 'SEC_TERT').map(mapImp);

    // 6. Tap Changer
    if (tapChanger.id) {
        dto.tap_changers = {
            mrid: String(tapChanger.id),
            type: tapChanger.type,
            serial_no: tapChanger.serialNo,
            winding: tapChanger.winding,
            step_count: tapTable.length,
            voltage_table: tapTable.map(t => ({
                step: t.tap,
                voltage: { value: t.voltage, unit: t.voltageUnit }
            }))
        };
    }

    return dto;
};