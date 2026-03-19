import TransformerDto from "@/views/Dto/Transformer";

export const mapServerToDto = (serverData) => {
    const dto = new TransformerDto();
    if (!serverData) return dto;

    // Tự động bóc tách lớp "data" nếu API có bọc theo chuẩn Restful
    const actualData = serverData.data && serverData.success !== undefined ? serverData.data : serverData;

    const info = actualData.assetInfo || {};
    const trans = actualData.transformer || {};
    const vRatings = actualData.voltageRatings || [];
    const pRatings = actualData.powerRatings || [];
    const impedances = actualData.shortCircuitImpedances || [];
    const tapChanger = actualData.tapChanger || {};
    const tapTable = actualData.tapChangerVoltage || [];

    // 1. Properties
    dto.properties.mrid = trans.id ? String(trans.id) : '';
    dto.properties.serial_no = info.serialNo || '';
    dto.properties.apparatus_id = info.apparatusId || '';
    dto.properties.manufacturer = info.manufacturerName || '';
    dto.properties.manufacturer_type = info.manufacturerType || info.manufacturerName || '';
    dto.properties.manufacturer_year = info.manufacturingYear || '';
    dto.properties.country_of_origin = info.countryName || '';
    dto.properties.type = trans.assetType || '';
    dto.properties.kind = 'Transformer';

    // 2. Winding Configuration
    dto.winding_configuration.phases = trans.phases || '';
    // FIX LỖI 1: Gán vào vector_group_data, không ghi đè object vector_group
    dto.winding_configuration.vector_group_data = trans.vectorGroup || '';

    // 3. Ratings - Frequency & Short Circuit
    dto.ratings.rated_frequency.value = trans.ratedFrequency !== null ? trans.ratedFrequency : '';
    dto.ratings.rated_frequency.unit = trans.ratedFrequencyUnit || 'Hz';

    dto.ratings.short_circuit.ka.value = trans.maxShortCircuitCurrent !== null ? trans.maxShortCircuitCurrent : '';
    dto.ratings.short_circuit.ka.unit = trans.maxShortCircuitCurrentUnit || 'kA';

    dto.ratings.short_circuit.s.value = trans.duration !== null ? trans.duration : '';
    dto.ratings.short_circuit.s.unit = trans.durationUnit || 's';

    // 4. Voltage Ratings
    dto.ratings.voltage_ratings = vRatings.map(v => ({
        mrid: String(v.id || ''),
        winding: v.winding === 'PRIM' ? 'Prim' : (v.winding === 'SEC' ? 'Sec' : 'Tert'),
        voltage_ll: { mrid: '', value: v.voltageLL !== null ? v.voltageLL : '', unit: v.voltageLLUnit || 'k|V' },
        voltage_ln: { mrid: '', value: v.voltageLN !== null ? v.voltageLN : '', unit: v.voltageLNUnit || 'k|V' },
        insul_level_ll: { mrid: '', value: v.insulLevelLL !== null ? v.insulLevelLL : '', unit: v.insulLevelLLUnit || 'k|V' },
        voltage_regulation: v.regulation || '',
        insulation_class: v.insulationClass || ''
    }));

    // 5. Power Ratings & Current Ratings
    dto.ratings.power_ratings = pRatings.map(p => ({
        mrid: String(p.id || ''),
        rated_power: { mrid: '', value: p.ratedPower !== null ? p.ratedPower : '', unit: p.ratedPowerUnit || 'M|VA' },
        cooling_class: p.coolingClass || '',
        temp_rise_wind: { mrid: '', value: p.tempRiseWind !== null ? p.tempRiseWind : '', unit: '°C' }
    }));

    dto.ratings.current_ratings = pRatings.map(p => ({
        mrid: String(p.id || ''),
        prim: { mrid: '', data: { mrid: '', value: p.currentRatingPrim !== null ? p.currentRatingPrim : '', unit: p.currentRatingPrimUnit || 'A' } },
        sec: { mrid: '', data: { mrid: '', value: p.currentRatingSec !== null ? p.currentRatingSec : '', unit: p.currentRatingSecUnit || 'A' } },
        tert: { mrid: '', data: { mrid: '', value: '', unit: 'A' } }
    }));

    // 6. Short Circuit Impedances
    // FIX LỖI 2: Thêm lớp .data bên trong base_power và base_voltage
    const mapImp = (imp) => ({
        mrid: String(imp.id || ''),
        base_power: {
            mrid: '',
            data: { mrid: '', value: imp.basePower !== null ? imp.basePower : '', unit: imp.basePowerUnit || 'M|VA' }
        },
        base_voltage: {
            mrid: '',
            data: { mrid: '', value: imp.baseVoltage !== null ? imp.baseVoltage : '', unit: imp.baseVoltageUnit || 'k|V' }
        },
        short_circuit_impedances_uk: { mrid: '', value: imp.impedance !== null ? imp.impedance : '', unit: imp.impedanceUnit || '%' },
        load_losses_pk: { mrid: '', value: imp.loadLoss !== null ? imp.loadLoss : '', unit: imp.loadLossUnit || 'kW' },
        oltc_position: '',
        detc_position: ''
    });

    dto.impedances.prim_sec = impedances.filter(i => i.type === 'PRIM_SEC').map(mapImp);
    dto.impedances.prim_tert = impedances.filter(i => i.type === 'PRIM_TERT').map(mapImp);
    dto.impedances.sec_tert = impedances.filter(i => i.type === 'SEC_TERT').map(mapImp);

    // Set Zero Sequence Impedance if available in transformer root
    dto.impedances.zero_sequence_impedance.base_power.data.value = trans.basePower !== null ? trans.basePower : '';
    dto.impedances.zero_sequence_impedance.base_power.data.unit = trans.basePowerUnit || 'M|VA';

    dto.impedances.zero_sequence_impedance.base_voltage.data.value = trans.baseVoltage !== null ? trans.baseVoltage : '';
    dto.impedances.zero_sequence_impedance.base_voltage.data.unit = trans.baseVoltageUnit || 'k|V';

    dto.impedances.zero_sequence_impedance.zero_percent.prim.data.value = trans.primaryZeroSequence !== null ? trans.primaryZeroSequence : '';
    dto.impedances.zero_sequence_impedance.zero_percent.prim.data.unit = trans.zeroSequenceUnit || '%';

    dto.impedances.zero_sequence_impedance.zero_percent.sec.data.value = trans.secondaryZeroSequence !== null ? trans.secondaryZeroSequence : '';
    dto.impedances.zero_sequence_impedance.zero_percent.sec.data.unit = trans.zeroSequenceUnit || '%';

    // Reference Temperature
    dto.impedances.ref_temp.value = trans.refTemp !== null ? trans.refTemp : '';
    dto.impedances.ref_temp.unit = trans.refTempUnit || '°C';

    // 7. Tap Changer
    if (tapChanger.id) {
        dto.tap_changers.mrid = String(tapChanger.id);
        dto.tap_changers.mode = tapChanger.type || '';
        dto.tap_changers.serial_no = tapChanger.serialNo || '';
        dto.tap_changers.winding = tapChanger.winding === 'PRIM' ? 'Prim' : (tapChanger.winding === 'SEC' ? 'Sec' : 'Tert');
        dto.tap_changers.tap_scheme = tapChanger.tabScheme || ''; // JSON trả về tabScheme
        dto.tap_changers.no_of_taps = tapTable.length;

        dto.tap_changers.voltage_table = tapTable.map(t => ({
            id: String(t.id || ''),
            tap: t.tap,
            voltage: { mrid: '', value: t.voltage !== null ? t.voltage : '', unit: t.voltageUnit || 'V' }
        }));
    }

    return dto;
};