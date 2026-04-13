/* eslint-disable */
import TransformerDataDto from "@/views/Dto/Transformer";
import uuid from "@/utils/uuid";

// ─── Lookup maps ─────────────────────────────────────────────────────────────

const ASSET_TYPE_MAP = {
    'TWO_WINDING':       'Two-winding',
    'THREE_WINDING':     'Three-winding',
    'AUTO_WITH_TERT':    'Auto w/ tert',
    'AUTO_WITHOUT_TERT': 'Auto w/o tert',
}

const PHASES_MAP = {
    'THREE': '3',
    'ONE':   '1',
}

const WINDING_MAP = {
    'PRIM': 'Prim',
    'SEC':  'Sec',
    'TERT': 'Tert',
}

const TAP_TYPE_MAP = {
    'OLTC': 'oltc',
    'DETC': 'detc',
}

const TAP_SCHEME_MAP = {
    'ONE_TO_THIRTYTHREE':    '1...33',
    'THIRTYTHREE_TO_ONE':    '33...1',
    'FREE':                  'Free',
    'ONE_TO_N':              '1...N',
    'N_TO_ONE':              'N...1',
}

const IMPEDANCE_TYPE_MAP = {
    'PRIM_SEC':  'prim_sec',
    'PRIM_TERT': 'prim_tert',
    'SEC_TERT':  'sec_tert',
}

// "mVA" → "M|VA", "kVA" → "k|VA", "VA" → "VA"
const mapPowerUnit = (unit) => {
    if (!unit) return 'M|VA'
    const u = unit.toLowerCase()
    if (u === 'mva' || u === 'mva' || u === 'mvа') return 'M|VA'
    if (u === 'kva') return 'k|VA'
    return 'M|VA'
}

const mapVoltageUnit = (unit) => {
    if (!unit) return 'k|V'
    const u = unit.toLowerCase()
    if (u === 'kv') return 'k|V'
    if (u === 'v')  return 'V'
    return 'k|V'
}

const str = (val) => (val !== null && val !== undefined) ? String(val) : ''

const extractYear = (dateStr) => {
    if (!dateStr) return ''
    const match = String(dateStr).match(/^(\d{4})/)
    return match ? match[1] : ''
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

export const mapServerToDto = (serverData) => {
    const dto = new TransformerDataDto();
    if (!serverData) return dto;

    const assetInfo  = serverData.assetInfo          || {};
    const tr         = serverData.transformer        || {};
    const voltageRatings       = serverData.voltageRatings        || [];
    const powerRatings         = serverData.powerRatings          || [];
    const shortCircuitImpedances = serverData.shortCircuitImpedances || [];
    const tapChanger           = serverData.tapChanger             || {};
    const tapChangerVoltage    = serverData.tapChangerVoltage      || [];

    // ─── 1. IDs ───────────────────────────────────────────────────────────────
    dto.oldPowerTransformerInfoId = uuid.newUuid()
    dto.productAssetModelId       = uuid.newUuid()
    dto.lifecycleDateId           = uuid.newUuid()
    dto.assetPsrId                = uuid.newUuid()

    // ─── 2. Properties ────────────────────────────────────────────────────────
    dto.properties.mrid              = null
    dto.properties.kind              = 'Transformer'
    dto.properties.type              = ASSET_TYPE_MAP[tr.assetType] || tr.assetType || ''
    dto.properties.serial_no         = assetInfo.serialNo          || ''
    dto.properties.manufacturer      = assetInfo.manufacturerName  || ''
    dto.properties.manufacturer_type = ''
    dto.properties.manufacturer_year = assetInfo.manufacturingYear
        ? String(assetInfo.manufacturingYear)
        : ''
    dto.properties.country_of_origin = assetInfo.countryName  || ''
    dto.properties.apparatus_id      = assetInfo.apparatusId  || ''
    dto.properties.comment           = assetInfo.description  || ''

    // ─── 3. Winding configuration ─────────────────────────────────────────────
    dto.winding_configuration.phases = PHASES_MAP[tr.phases] || ''

    // Server trả về vector group dạng string "Yna0d11"
    // Không thể parse tự động → để vào unsupported_vector_group
    if (tr.vectorGroup) {
        dto.winding_configuration.unsupported_vector_group = tr.vectorGroup
    }

    // ─── 4. Ratings ───────────────────────────────────────────────────────────

    // Rated frequency
    const freqVal = str(tr.ratedFrequency)
    dto.ratings.rated_frequency.mrid  = uuid.newUuid()
    dto.ratings.rated_frequency.value = ['50', '60', '16.7'].includes(freqVal) ? freqVal : 'Custom'
    dto.ratings.rated_frequency.unit  = tr.ratedFrequencyUnit || 'Hz'
    if (!['50', '60', '16.7'].includes(freqVal)) {
        dto.ratings.rated_frequency.custom_value = freqVal
    }

    // Voltage ratings
    dto.ratings.voltage_ratings = voltageRatings.map(vr => ({
        mrid:       uuid.newUuid(),
        winding:    WINDING_MAP[vr.winding] || vr.winding || '',
        voltage_ll: {
            mrid:  uuid.newUuid(),
            value: str(vr.voltageLL),
            unit:  mapVoltageUnit(vr.voltageLLUnit),
        },
        voltage_ln: {
            mrid:  uuid.newUuid(),
            value: str(vr.voltageLN),
            unit:  mapVoltageUnit(vr.voltageLNUnit),
        },
        insul_level_ll: {
            mrid:  uuid.newUuid(),
            value: str(vr.insulLevelLL),
            unit:  mapVoltageUnit(vr.insulLevelLLUnit),
        },
        insulation_class:   vr.insulationClass  || '',
        voltage_regulation: str(vr.regulation),
    }))

    // Power ratings
    dto.ratings.power_ratings = powerRatings.map(pr => ({
        mrid:         uuid.newUuid(),
        rated_power: {
            mrid:  uuid.newUuid(),
            value: str(pr.ratedPower),
            unit:  mapPowerUnit(pr.ratedPowerUnit),
        },
        cooling_class: pr.coolingClass  || '',
        temp_rise_wind: {
            mrid:  uuid.newUuid(),
            value: str(pr.tempRiseWind),
            unit:  '°C',
        },
    }))

    // Current ratings — từ powerRatings.currentRatingPrim / currentRatingSec
    dto.ratings.current_ratings = powerRatings.map(pr => ({
        mrid: uuid.newUuid(),
        prim: {
            mrid: uuid.newUuid(),
            data: {
                mrid:  uuid.newUuid(),
                value: str(pr.currentRatingPrim),
                unit:  pr.currentRatingPrimUnit || 'A',
            },
        },
        sec: {
            mrid: uuid.newUuid(),
            data: {
                mrid:  uuid.newUuid(),
                value: str(pr.currentRatingSec),
                unit:  pr.currentRatingSecUnit || 'A',
            },
        },
        tert: {
            mrid: uuid.newUuid(),
            data: { mrid: uuid.newUuid(), value: '', unit: 'A' },
        },
    }))

    // Short circuit rating
    dto.ratings.short_circuit.mrid    = uuid.newUuid()
    dto.ratings.short_circuit.ka.mrid = uuid.newUuid()
    dto.ratings.short_circuit.ka.value = str(tr.maxShortCircuitCurrent)
    dto.ratings.short_circuit.ka.unit  = tr.maxShortCircuitCurrentUnit
        ? (tr.maxShortCircuitCurrentUnit === 'kA' ? 'k|A' : tr.maxShortCircuitCurrentUnit)
        : 'k|A'
    dto.ratings.short_circuit.s.mrid  = uuid.newUuid()
    dto.ratings.short_circuit.s.value = str(tr.duration)
    dto.ratings.short_circuit.s.unit  = tr.durationUnit || 's'

    // ─── 5. Impedances ────────────────────────────────────────────────────────

    // Ref temperature
    dto.impedances.ref_temp.mrid  = uuid.newUuid()
    dto.impedances.ref_temp.value = str(tr.refTemp)
    dto.impedances.ref_temp.unit  = tr.refTempUnit || '°C'

    // Build tap position lookup: tapChangerVoltage.id → tap number
    const tapPosMap = {}
    tapChangerVoltage.forEach(tv => {
        tapPosMap[tv.id] = tv.tap
    })

    // Short circuit impedances → prim_sec / prim_tert / sec_tert
    const mapImpedance = (sci) => ({
        mrid: uuid.newUuid(),
        short_circuit_impedances_uk: {
            mrid:  uuid.newUuid(),
            value: str(sci.impedance),
            unit:  '%',
        },
        base_power: {
            mrid: uuid.newUuid(),
            data: {
                mrid:  uuid.newUuid(),
                value: str(sci.basePower),
                unit:  mapPowerUnit(sci.basePowerUnit),
            },
        },
        base_voltage: {
            mrid: uuid.newUuid(),
            data: {
                mrid:  uuid.newUuid(),
                value: str(sci.baseVoltage),
                unit:  mapVoltageUnit(sci.baseVoltageUnit),
            },
        },
        load_losses_pk: {
            mrid:  uuid.newUuid(),
            value: str(sci.loadLoss),
            unit:  'W',
        },
        oltc_position: tapPosMap[sci.tapChangerVoltageId] ?? '',
        detc_position: '',
    })

    shortCircuitImpedances.forEach(sci => {
        const key = IMPEDANCE_TYPE_MAP[sci.type]
        if (key && dto.impedances[key]) {
            dto.impedances[key].push(mapImpedance(sci))
        }
    })

    // Zero sequence impedance
    dto.impedances.zero_sequence_impedance.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.base_power.mrid      = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.base_power.data.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.base_power.data.value = str(tr.basePower)
    dto.impedances.zero_sequence_impedance.base_power.data.unit  = mapPowerUnit(tr.basePowerUnit)

    dto.impedances.zero_sequence_impedance.base_voltage.mrid      = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.base_voltage.data.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.base_voltage.data.value = str(tr.baseVoltage)
    dto.impedances.zero_sequence_impedance.base_voltage.data.unit  = mapVoltageUnit(tr.baseVoltageUnit)

    // Zero percent
    dto.impedances.zero_sequence_impedance.zero_percent.zero.mrid      = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.zero_percent.zero.data.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.zero_percent.zero.data.value = str(tr.zeroSequence)
    dto.impedances.zero_sequence_impedance.zero_percent.zero.data.unit  = tr.zeroSequenceUnit || '%'

    dto.impedances.zero_sequence_impedance.zero_percent.prim.mrid      = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.zero_percent.prim.data.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.zero_percent.prim.data.value = str(tr.primaryZeroSequence)
    dto.impedances.zero_sequence_impedance.zero_percent.prim.data.unit  = tr.zeroSequenceUnit || '%'

    dto.impedances.zero_sequence_impedance.zero_percent.sec.mrid      = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.zero_percent.sec.data.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.zero_percent.sec.data.value = str(tr.secondaryZeroSequence)
    dto.impedances.zero_sequence_impedance.zero_percent.sec.data.unit  = tr.zeroSequenceUnit || '%'

    // ─── 6. Tap changer ───────────────────────────────────────────────────────
    if (tapChanger.type) {
        dto.tap_changers.mrid             = uuid.newUuid()
        dto.tap_changers.assetInfoId      = uuid.newUuid()
        dto.tap_changers.productAssetModelId = uuid.newUuid()
        dto.tap_changers.mode             = TAP_TYPE_MAP[tapChanger.type] || tapChanger.type?.toLowerCase() || ''
        dto.tap_changers.serial_no        = tapChanger.serialNo           || ''
        dto.tap_changers.winding          = WINDING_MAP[tapChanger.winding] || tapChanger.winding || ''
        dto.tap_changers.tap_scheme       = TAP_SCHEME_MAP[tapChanger.tabScheme] || tapChanger.tabScheme || ''
        dto.tap_changers.no_of_taps       = String(tapChangerVoltage.length || 0)

        dto.tap_changers.voltage_table = tapChangerVoltage.map(tv => ({
            id:  String(tv.id),
            tap: tv.tap,
            voltage: {
                mrid:  uuid.newUuid(),
                value: tv.voltage !== null && tv.voltage !== undefined ? String(tv.voltage) : '0',
                unit:  tv.voltageUnit || 'V',
            },
        }))
    }

    // ─── 7. Others — server không trả về → giữ default ───────────────────────
    dto.others.mrid = uuid.newUuid()

    return dto;
};