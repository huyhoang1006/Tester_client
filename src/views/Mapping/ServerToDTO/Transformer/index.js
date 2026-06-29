/* eslint-disable */
import TransformerDataDto from '@/views/Dto/Transformer'
import uuid from '@/utils/uuid'

// ─── Lookup maps ─────────────────────────────────────────────────────────────

const ASSET_TYPE_MAP = {
    TWO_WINDING: 'Two-winding',
    THREE_WINDING: 'Three-winding',
    AUTO_WITH_TERT: 'Auto w/ tert',
    AUTO_WITHOUT_TERT: 'Auto w/o tert'
}

const PHASES_MAP = {
    THREE: '3',
    ONE: '1'
}

const WINDING_MAP = {
    PRIM: 'Prim',
    SEC: 'Sec',
    TERT: 'Tert'
}

const TAP_TYPE_MAP = {
    OLTC: 'oltc',
    DETC: 'detc'
}

const TAP_SCHEME_MAP = {
    ONE_TO_THIRTYTHREE: '1...33',
    THIRTYTHREE_TO_ONE: '33...1',
    FREE: 'Free',
    ONE_TO_N: '1...N',
    N_TO_ONE: 'N...1'
}

const IMPEDANCE_TYPE_MAP = {
    PRIM_SEC: 'prim_sec',
    PRIM_TERT: 'prim_tert',
    SEC_TERT: 'sec_tert'
}

// Bushing asset type: server enum → View option
const BUSHING_TYPE_MAP = {
    WITH_POTENTIAL_TAP: 'With potential tap',
    WITH_TEST_TAP: 'With test tap',
    WITHOUT_TAP: 'Without tap'
}

// Bushing insulation type
const BUSHING_INSUL_MAP = {
    COMPOUND: 'compound',
    OIL_IMPREGNATED_PAPER: 'oilImpregnatedPaper',
    OTHER: 'other',
    RESIN_BONDED_PAPER: 'resinBondedPaper',
    RESIN_IMPREGNATED_PAPER: 'resinImpregnatedPaper',
    SOLID_PORCELAIN: 'solidPorcelain',
    PORCELAIN_DRY_TYPE: 'porcelainDryType',
    COMPOSITE_DRY_TYPE: 'compositeDryType'
}

const TERT_ACCESSIBILITY_MAP = {
    ACCESSIBLE4: '4 Accessible',
    ACCESSIBLE3: '3 Accessible',
    ACCESSIBLE2: '2 Accessible',
    ACCESSIBLE1: '1 Accessible',
    BURIED: 'Buried',
    BURIED_WITH_GROUNDING: 'Buried /w grounding'
}

const OTHERS_STATUS_MAP = {
    IN_OPERATION: 'In operation',
    SPARE: 'Spare',
    REPAIR: 'Repair',
    OUT_OF_OPERATION: 'Out of operation',
    SCRAP: 'Scrap'
}

const OTHERS_CATEGORY_MAP = {
    DISTRIBUTION: 'Distribution',
    GENERATION: 'Generation',
    HVDC_TRANSFORMER: 'HVDC transformer',
    POWER: 'Power',
    TRANSMISSION: 'Transmission',
    WIN_GEN_TRANS: 'Win gen. trans.',
    OTHER: 'Other'
}

const OTHERS_TANK_TYPE_MAP = {
    FREE_BREATHING: 'Free breathing',
    NITROGEN_BLANKETED: 'Nitrogen blanketed',
    SEALED: 'Sealed',
    SEALED_CONSERVATOR: 'Sealed conservator',
    OTHER: 'Other'
}

const OTHERS_INSULATION_MEDIUM_MAP = {
    ASKAREL: 'Askarel',
    DRY_TYPE: 'Dry type',
    GAS: 'Gas',
    NATURAL_ESTER: 'Natural ester',
    MINERAL_OIL: 'Mineral oil',
    SILICONE: 'Silicone',
    LFH: 'LFH',
    OTHER: 'Other'
}

const OTHERS_INSULATION_KEY_MAP = {
    WEIGHT: 'Weight',
    VOLUME: 'Volume'
}

const OTHERS_WINDING_MAP = {
    COPPER: 'Copper',
    AlUMINUM: 'Aluminum'
}

// "kV" → "k|V", "pF" → "p|F", giữ nguyên nếu không có multiplier
const splitUnit = (raw, defaultUnit) => {
    const u = raw || defaultUnit
    if (!u) return defaultUnit
    if (u.includes('|')) return u
    const multipliers = ['k', 'M', 'G', 'm', 'µ', 'n', 'p']
    for (const mult of multipliers) {
        if (u.length > 1 && u.startsWith(mult)) return mult + '|' + u.slice(mult.length)
    }
    return u
}
const unitLabel = (raw, def) => raw || def

const WINDING_KEY_MAP = {PRIM: 'prim', SEC: 'sec', TERT: 'tert'}

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
    if (u === 'v') return 'V'
    return 'k|V'
}

const str = (val) => (val !== null && val !== undefined ? String(val) : '')

const extractYear = (dateStr) => {
    if (!dateStr) return ''
    const match = String(dateStr).match(/^(\d{4})/)
    return match ? match[1] : ''
}

const reversed = (obj) => Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]))

// ─── Mapper ──────────────────────────────────────────────────────────────────

export const mapServerToDto = (serverData) => {
    console.log('mapServerToDto: serverData', serverData)
    const dto = new TransformerDataDto()
    if (!serverData) return dto

    const assetInfo = serverData.assetInfo || {}
    const tr = serverData.transformer || {}
    const voltageRatings = serverData.voltageRatings || []
    const powerRatings = serverData.powerRatings || []
    const shortCircuitImpedances = serverData.shortCircuitImpedances || []
    const tapChanger = serverData.tapChanger || {}
    const tapChangerVoltage = serverData.tapChangerVoltage || []
    const others = serverData.others || {}

    // ─── 1. IDs ───────────────────────────────────────────────────────────────
    dto.oldPowerTransformerInfoId = uuid.newUuid()
    dto.productAssetModelId = uuid.newUuid()
    dto.lifecycleDateId = uuid.newUuid()
    dto.assetPsrId = uuid.newUuid()

    // ─── 2. Properties ────────────────────────────────────────────────────────
    dto.properties.mrid = null
    dto.properties.kind = 'Transformer'
    dto.properties.type = ASSET_TYPE_MAP[tr.assetType] || tr.assetType || ''
    dto.properties.serial_no = assetInfo.serialNo || ''
    dto.properties.manufacturer = assetInfo.manufacturer || ''
    dto.properties.manufacturer_type = assetInfo.manufacturerType || ''
    dto.properties.manufacturer_year = assetInfo.manufacturingYear ? String(assetInfo.manufacturingYear) : ''
    dto.properties.country_of_origin = assetInfo.country || ''
    dto.properties.apparatus_id = assetInfo.apparatusId || ''
    dto.properties.comment = assetInfo.description || ''

    // ─── 3. Winding configuration ─────────────────────────────────────────────
    dto.winding_configuration.phases = PHASES_MAP[tr.phases] || ''

    // Vector group:
    // Ưu tiên dùng các field tách sẵn server trả (vectorGroupPrim/Sec/Tert...)
    // Nếu server chỉ trả string "Yna0d11" (không tách) → để unsupported_vector_group
    const hasSplitVG = tr.vectorGroupPrim || tr.vectorGroupSec || tr.vectorGroupTertiary
    if (hasSplitVG) {
        // Server đã tách sẵn các thành phần → build vector_group object + vector_group_data
        dto.winding_configuration.vector_group.prim = tr.vectorGroupPrim || ''
        dto.winding_configuration.vector_group.sec.i = tr.vectorGroupSec || ''
        dto.winding_configuration.vector_group.sec.value = str(tr.vectorGroupSecVal)
        dto.winding_configuration.vector_group.tert.i = tr.vectorGroupTertiary || ''
        dto.winding_configuration.vector_group.tert.value = str(tr.vectorGroupTertiaryVal)
        dto.winding_configuration.vector_group.tert.accessible = TERT_ACCESSIBILITY_MAP[tr.vectorGroupTertiaryAccessibility] || ''
        // vector_group_data = string đầy đủ để View biết đây là dạng parsed (type null)
        dto.winding_configuration.vector_group_data = tr.vectorGroup || ''
    } else if (tr.vectorGroup) {
        // Chỉ có string, không tách được → unsupported
        dto.winding_configuration.unsupported_vector_group = tr.vectorGroup
    }

    // ─── 4. Ratings ───────────────────────────────────────────────────────────

    // Rated frequency
    const freqVal = str(tr.ratedFrequency)
    dto.ratings.rated_frequency.mrid = uuid.newUuid()
    dto.ratings.rated_frequency.value = ['50', '60', '16.7'].includes(freqVal) ? freqVal : 'Custom'
    dto.ratings.rated_frequency.unit = tr.ratedFrequencyUnit || 'Hz'
    if (!['50', '60', '16.7'].includes(freqVal)) {
        dto.ratings.rated_frequency.custom_value = freqVal
    }

    // Voltage ratings
    dto.ratings.voltage_ratings = voltageRatings.map((vr) => ({
        mrid: uuid.newUuid(),
        winding: WINDING_MAP[vr.winding] || vr.winding || '',
        voltage_ll: {
            mrid: uuid.newUuid(),
            value: str(vr.voltageLL),
            unit: mapVoltageUnit(vr.voltageLLUnit)
        },
        voltage_ln: {
            mrid: uuid.newUuid(),
            value: str(vr.voltageLN),
            unit: mapVoltageUnit(vr.voltageLNUnit)
        },
        insul_level_ll: {
            mrid: uuid.newUuid(),
            value: str(vr.insulLevelLL),
            unit: mapVoltageUnit(vr.insulLevelLLUnit)
        },
        insulation_class: vr.insulationClass || '',
        voltage_regulation: str(vr.regulation)
    }))

    // Power ratings
    dto.ratings.power_ratings = powerRatings.map((pr) => ({
        mrid: uuid.newUuid(),
        rated_power: {
            mrid: uuid.newUuid(),
            value: str(pr.ratedPower),
            unit: mapPowerUnit(pr.ratedPowerUnit)
        },
        cooling_class: pr.coolingClass || '',
        temp_rise_wind: {
            mrid: uuid.newUuid(),
            value: str(pr.tempRiseWind),
            unit: '°C'
        }
    }))

    // Current ratings — từ powerRatings.currentRatingPrim / currentRatingSec
    dto.ratings.current_ratings = powerRatings.map((pr) => ({
        mrid: uuid.newUuid(),
        prim: {
            mrid: uuid.newUuid(),
            data: {
                mrid: uuid.newUuid(),
                value: str(pr.currentRatingPrim),
                unit: pr.currentRatingPrimUnit || 'A'
            }
        },
        sec: {
            mrid: uuid.newUuid(),
            data: {
                mrid: uuid.newUuid(),
                value: str(pr.currentRatingSec),
                unit: pr.currentRatingSecUnit || 'A'
            }
        },
        tert: {
            mrid: uuid.newUuid(),
            data: {
                mrid: uuid.newUuid(),
                value: str(pr.currentRatingTert),
                unit: pr.currentRatingTertUnit || 'A'
            }
        }
    }))

    // Short circuit rating
    dto.ratings.short_circuit.mrid = uuid.newUuid()
    dto.ratings.short_circuit.ka.mrid = uuid.newUuid()
    dto.ratings.short_circuit.ka.value = str(tr.maxShortCircuitCurrent)
    dto.ratings.short_circuit.ka.unit = tr.maxShortCircuitCurrentUnit ? (tr.maxShortCircuitCurrentUnit === 'kA' ? 'k|A' : tr.maxShortCircuitCurrentUnit) : 'k|A'
    dto.ratings.short_circuit.s.mrid = uuid.newUuid()
    dto.ratings.short_circuit.s.value = str(tr.duration)
    dto.ratings.short_circuit.s.unit = tr.durationUnit || 's'

    // ─── 5. Impedances ────────────────────────────────────────────────────────

    // Ref temperature
    dto.impedances.ref_temp.mrid = uuid.newUuid()
    dto.impedances.ref_temp.value = str(tr.refTemp)
    dto.impedances.ref_temp.unit = tr.refTempUnit || '°C'

    // Build tap position lookup: tapChangerVoltage.id → tap number
    const tapPosMap = {}
    tapChangerVoltage.forEach((tv) => {
        tapPosMap[tv.id] = tv.tap
    })

    // tap changer mode: 'oltc' | 'detc' → quyết định set oltc_position hay detc_position
    const tapMode = TAP_TYPE_MAP[tapChanger.type] || (tapChanger.type ? tapChanger.type.toLowerCase() : '')

    // Short circuit impedances → prim_sec / prim_tert / sec_tert
    const mapImpedance = (sci) => {
        const tapPos = tapPosMap[sci.tapChangerVoltageId] ?? ''
        return {
            mrid: uuid.newUuid(),
            short_circuit_impedances_uk: {
                mrid: uuid.newUuid(),
                value: str(sci.impedance),
                // impedanceUnit server = "PERCENT" → '%'
                unit: sci.impedanceUnit === 'PERCENT' || !sci.impedanceUnit ? '%' : sci.impedanceUnit
            },
            base_power: {
                mrid: uuid.newUuid(),
                data: {
                    mrid: uuid.newUuid(),
                    value: str(sci.basePower),
                    unit: mapPowerUnit(sci.basePowerUnit)
                }
            },
            base_voltage: {
                mrid: uuid.newUuid(),
                data: {
                    mrid: uuid.newUuid(),
                    value: str(sci.baseVoltage),
                    unit: mapVoltageUnit(sci.baseVoltageUnit)
                }
            },
            load_losses_pk: {
                mrid: uuid.newUuid(),
                value: str(sci.loadLoss),
                unit: sci.loadLossUnit || 'W'
            },
            // set đúng field theo mode tap changer
            oltc_position: tapMode === 'oltc' ? tapPos : '',
            detc_position: tapMode === 'detc' ? tapPos : ''
        }
    }

    shortCircuitImpedances.forEach((sci) => {
        const key = IMPEDANCE_TYPE_MAP[sci.type]
        if (key && dto.impedances[key]) {
            dto.impedances[key].push(mapImpedance(sci))
        }
    })

    // Zero sequence impedance
    dto.impedances.zero_sequence_impedance.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.base_power.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.base_power.data.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.base_power.data.value = str(tr.basePower)
    dto.impedances.zero_sequence_impedance.base_power.data.unit = mapPowerUnit(tr.basePowerUnit)

    dto.impedances.zero_sequence_impedance.base_voltage.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.base_voltage.data.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.base_voltage.data.value = str(tr.baseVoltage)
    dto.impedances.zero_sequence_impedance.base_voltage.data.unit = mapVoltageUnit(tr.baseVoltageUnit)

    // Zero percent
    dto.impedances.zero_sequence_impedance.zero_percent.zero.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.zero_percent.zero.data.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.zero_percent.zero.data.value = str(tr.zeroSequence)
    dto.impedances.zero_sequence_impedance.zero_percent.zero.data.unit = tr.zeroSequenceUnit || '%'

    dto.impedances.zero_sequence_impedance.zero_percent.prim.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.zero_percent.prim.data.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.zero_percent.prim.data.value = str(tr.primaryZeroSequence)
    dto.impedances.zero_sequence_impedance.zero_percent.prim.data.unit = tr.zeroSequenceUnit || '%'

    dto.impedances.zero_sequence_impedance.zero_percent.sec.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.zero_percent.sec.data.mrid = uuid.newUuid()
    dto.impedances.zero_sequence_impedance.zero_percent.sec.data.value = str(tr.secondaryZeroSequence)
    dto.impedances.zero_sequence_impedance.zero_percent.sec.data.unit = tr.zeroSequenceUnit || '%'

    // ─── 6. Tap changer ───────────────────────────────────────────────────────
    if (tapChanger.type) {
        dto.tap_changers.mrid = uuid.newUuid()
        dto.tap_changers.assetInfoId = uuid.newUuid()
        dto.tap_changers.productAssetModelId = uuid.newUuid()
        dto.tap_changers.mode = TAP_TYPE_MAP[tapChanger.type] || tapChanger.type?.toLowerCase() || ''
        dto.tap_changers.serial_no = tapChanger.serialNo || ''
        dto.tap_changers.manufacturer = tapChanger.manufacturer || ''
        dto.tap_changers.manufacturer_type = tapChanger.manufacturerType || ''
        dto.tap_changers.winding = WINDING_MAP[tapChanger.winding] || tapChanger.winding || ''
        dto.tap_changers.tap_scheme = TAP_SCHEME_MAP[tapChanger.tabScheme] || tapChanger.tabScheme || ''
        dto.tap_changers.no_of_taps = String(tapChanger.noTaps || 0)

        dto.tap_changers.voltage_table = tapChangerVoltage.map((tv) => ({
            id: String(tv.id),
            tap: tv.tap,
            voltage: {
                mrid: uuid.newUuid(),
                value: tv.voltage !== null && tv.voltage !== undefined ? String(tv.voltage) : '0',
                unit: unitLabel(tv.voltageUnit, 'V')
            }
        }))
    }

    console.log('mapServerToDto: dto', others)
    // ─── 7. Others — server không trả về → giữ default ───────────────────────
    dto.others.mrid = others.mrid || uuid.newUuid()
    dto.others.category = OTHERS_CATEGORY_MAP[others.category] || ''
    dto.others.status = OTHERS_STATUS_MAP[others.status] || ''
    dto.others.tank_type = OTHERS_TANK_TYPE_MAP[others.tankType] || ''
    dto.others.insulation_medium = OTHERS_INSULATION_MEDIUM_MAP[others.insulationMedium] || ''
    dto.others.insulation.key = OTHERS_INSULATION_KEY_MAP[others.insulationKey] || ''
    dto.others.insulation.weight.mrid = others.insulationWeightId || uuid.newUuid()
    dto.others.insulation.weight.value = others.insulationWeight || ''
    dto.others.insulation.weight.unit = others.insulationWeightUnit || 'kg'
    dto.others.total_weight.mrid = others.totalWeightId || uuid.newUuid()
    dto.others.total_weight.value = others.totalWeight || ''
    dto.others.total_weight.unit = others.totalWeightUnit || 'kg'
    dto.others.winding.prim = OTHERS_WINDING_MAP[others.windingPrim] || 'Copper'
    dto.others.winding.sec = OTHERS_WINDING_MAP[others.windingSec] || 'Copper'
    dto.others.winding.tert = OTHERS_WINDING_MAP[others.windingTert] || 'Copper'
    dto.others.insulation.volume.mrid = others.insulationVolumeId || uuid.newUuid()
    dto.others.insulation.volume.value = others.insulationVolume || ''
    dto.others.insulation.volume.unit = others.insulationVolumeUnit || 'l'

    // ─── 8. Bushing data ──────────────────────────────────────────────────────
    // Server trả serverData.bushings = [{ winding, position, assetType, serialNo,
    //   manufacturerName, manufacturerType, manufacturingYear, insulLevelLL(+Unit),
    //   voltageLGround(+Unit), maxSystemVoltage(+Unit), ratedCurrent(+Unit),
    //   dfC1(+Unit), capC1(+Unit), dfC2(+Unit), capC2(+Unit), insulType }, ...]
    const bushings = serverData.bushings || []
    const mapBushingItem = (b) => ({
        mrid: uuid.newUuid(),
        assetInfoId: uuid.newUuid(),
        productAssetModelId: uuid.newUuid(),
        lifecycleDateId: uuid.newUuid(),
        pos: b.position || '',
        asset_type: BUSHING_TYPE_MAP[b.assetType] || b.assetType || '',
        serial_no: b.serialNo || '',
        manufacturer: b.manufacturer || '',
        manufacturer_type: b.manufacturerType || '',
        manufacturer_year: b.manufacturingYear ? String(b.manufacturingYear) : '',
        insulation_level: {
            mrid: '',
            value: str(b.insulationLevel),
            label: unitLabel(b.insulationLevelUnit, 'kV')
        },
        voltage_l_ground: {mrid: '', value: str(b.voltageLGround), label: unitLabel(b.voltageLGroundUnit, 'kV')},
        max_system_voltage: {
            mrid: '',
            value: str(b.maxSystemVoltage),
            label: unitLabel(b.maxSystemVoltageUnit, 'kV')
        },
        rate_current: {mrid: '', value: str(b.ratedCurrent), label: unitLabel(b.ratedCurrentUnit, 'A')},
        df_c1: {
            mrid: '',
            value: str(b.dfC1),
            label: b.dfC1Unit === 'PERCENT' || !b.dfC1Unit ? '%' : b.dfC1Unit
        },
        cap_c1: {
            mrid: '',
            value: str(b.capC1),
            label: unitLabel(b.capC1Unit, 'pF')
        },
        df_c2: {
            mrid: '',
            value: str(b.dfC2),
            label: b.dfC2Unit === 'PERCENT' || !b.dfC2Unit ? '%' : b.dfC2Unit
        },
        cap_c2: {
            mrid: '',
            value: str(b.capC2),
            label: unitLabel(b.capC2Unit, 'pF')
        },
        insulation_type: BUSHING_INSUL_MAP[b.insulationType] || b.insulType || ''
    })
    bushings.forEach((b) => {
        const key = WINDING_KEY_MAP[b.winding]
        if (key && dto.bushing_data[key]) {
            dto.bushing_data[key].push(mapBushingItem(b))
        }
    })

    // ─── 9. Surge arrester data ───────────────────────────────────────────────
    // Server trả serverData.surgeArresters = [{ winding, position, serialNo,
    //   manufacturerName, manufacturingYear, assetSystemCode, unitStack,
    //   ratings: [{ position, serial, voltageLL(+Unit), voltageLN(+Unit), mcov(+Unit) }] }]
    const surgeArresters = serverData.surgeArresters || []
    const mapSurgeItem = (sa) => ({
        sign: true,
        properties: {
            mrid: uuid.newUuid(),
            serial_no: sa.serialNo || '',
            manufacturer: sa.manufacturer || '',
            manufacturer_year: sa.manufacturingYear ? String(sa.manufacturingYear) : '',
            asset_system_code: sa.assetSystemCode || '',
            assetInfoId: uuid.newUuid(),
            productAssetModelId: uuid.newUuid(),
            lifecycleDateId: uuid.newUuid()
        },
        ratings: {
            pos: sa.position || '',
            unit: sa.unitCount !== null && sa.unitCount !== undefined ? String(sa.unitCount) : '',
            table: (sa.ratingList || []).map((r, idx) => ({
                mrid: uuid.newUuid(),
                assetInfoId: uuid.newUuid(),
                position: r.position ?? idx + 1,
                serial: r.serialNo || '',
                voltageLl: {
                    mrid: '',
                    value: str(r.voltageLL),
                    unit: splitUnit(r.voltageLLUnit, 'k|V')
                },
                voltageLn: {
                    mrid: '',
                    value: str(r.voltageLN),
                    unit: splitUnit(r.voltageLNUnit, 'k|V')
                },
                mcovRating: {
                    mrid: '',
                    value: str(r.mcovRating),
                    unit: splitUnit(r.mcovRatingUnit, 'k|V')
                }
            }))
        }
    })
    surgeArresters.forEach((sa) => {
        const key = WINDING_KEY_MAP[sa.winding]
        if (key && dto.surge_arrester[key]) {
            dto.surge_arrester[key].push(mapSurgeItem(sa))
        }
    })

    return dto
}

// ═══════════════════════════════════════════════════════════════════════════════
// Mapper: DTO → server JSON (push/upload)
// ═══════════════════════════════════════════════════════════════════════════════

// Reverse enum maps
const ASSET_TYPE_TO_SERVER = {
    'Two-winding': 'TWO_WINDING',
    'Three-winding': 'THREE_WINDING',
    'Auto w/ tert': 'AUTO_WITH_TERT',
    'Auto w/o tert': 'AUTO_WITHOUT_TERT'
}
const PHASES_TO_SERVER = {3: 'THREE', 1: 'ONE'}
const WINDING_TO_SERVER = {Prim: 'PRIM', Sec: 'SEC', Tert: 'TERT'}
const TAP_TYPE_TO_SERVER = {oltc: 'OLTC', detc: 'DETC'}
const TAP_SCHEME_TO_SERVER = {
    '1...33': 'ONE_TO_THIRTYTHREE',
    '33...1': 'THIRTYTHREE_TO_ONE',
    Free: 'FREE',
    '1...N': 'ONE_TO_N',
    'N...1': 'N_TO_ONE'
}
const IMPEDANCE_TYPE_TO_SERVER = {
    prim_sec: 'PRIM_SEC',
    prim_tert: 'PRIM_TERT',
    sec_tert: 'SEC_TERT'
}

const numT = (val) => (val !== null && val !== undefined && val !== '' ? parseFloat(val) : null)
const intT = (val) => (val !== null && val !== undefined && val !== '' ? parseInt(val, 10) : null)
// unit DTO 'k|V'/'M|VA' → server 'kV'/'mVA' (gộp, bỏ pipe). '%' → server giữ hoặc 'PERCENT'
const joinUnitT = (u) => {
    if (!u) return null
    return u.includes('|') ? u.replace('|', '') : u
}

export const mapDtoToServer = (dto, ownerType) => {
    if (!dto) return null

    const p = dto.properties || {}
    const wc = dto.winding_configuration || {}
    const rt = dto.ratings || {}
    const im = dto.impedances || {}
    const tc = dto.tap_changers || {}
    const ot = dto.others || {}

    // ─── assetInfo ────────────────────────────────────────────────────────────
    const assetInfo = {
        ownerId: dto.psrId || null,
        ownerType: ownerType || null,
        serialNo: p.serial_no || null,
        manufacturer: p.manufacturer || null,
        manufacturerType: p.manufacturer_type || null,
        manufacturingYear: numT(p.manufacturer_year),
        country: p.country_of_origin || null,
        apparatusId: p.apparatus_id || null,
        description: p.comment || null
    }

    // ─── transformer core ──────────────────────────────────────────────────────
    const vg = wc.vector_group || {}
    const transformer = {
        assetType: ASSET_TYPE_TO_SERVER[p.type] || p.type || null,
        phases: PHASES_TO_SERVER[wc.phases] || wc.phases || null,

        // vector group: ưu tiên data parsed, fallback custom/unsupported
        vectorGroup: wc.vector_group_data || wc.vector_group_custom || wc.unsupported_vector_group || null,
        vectorGroupPrim: vg.prim || null,
        vectorGroupSec: vg.sec?.i || null,
        vectorGroupSecVal: intT(vg.sec?.value),
        vectorGroupTertiary: vg.tert?.i || null,
        vectorGroupTertiaryVal: intT(vg.tert?.value),
        vectorGroupTertiaryAccessibility: reversed(TERT_ACCESSIBILITY_MAP)[vg.tert?.accessible] || null,

        // tần số: nếu Custom thì dùng custom_value
        ratedFrequency: numT(rt.rated_frequency?.value === 'Custom' ? rt.rated_frequency?.custom_value : rt.rated_frequency?.value),
        ratedFrequencyUnit: rt.rated_frequency?.unit || 'Hz',

        refTemp: numT(im.ref_temp?.value),
        refTempUnit: im.ref_temp?.unit || '°C',

        maxShortCircuitCurrent: numT(rt.short_circuit?.ka?.value),
        maxShortCircuitCurrentUnit: joinUnitT(rt.short_circuit?.ka?.unit),
        duration: numT(rt.short_circuit?.s?.value),
        durationUnit: rt.short_circuit?.s?.unit || 's',

        // zero sequence
        basePower: numT(im.zero_sequence_impedance?.base_power?.data?.value),
        basePowerUnit: joinUnitT(im.zero_sequence_impedance?.base_power?.data?.unit),
        baseVoltage: numT(im.zero_sequence_impedance?.base_voltage?.data?.value),
        baseVoltageUnit: joinUnitT(im.zero_sequence_impedance?.base_voltage?.data?.unit),
        zeroSequenceUnit: im.zero_sequence_impedance?.zero_percent?.zero?.data?.unit || '%',
        primaryZeroSequence: numT(im.zero_sequence_impedance?.zero_percent?.prim?.data?.value),
        secondaryZeroSequence: numT(im.zero_sequence_impedance?.zero_percent?.sec?.data?.value)
    }

    // ─── voltageRatings ──────────────────────────────────────────────────────
    const voltageRatings = (rt.voltage_ratings || []).map((vr) => ({
        winding: WINDING_TO_SERVER[vr.winding] || vr.winding || null,
        voltageLL: numT(vr.voltage_ll?.value),
        voltageLLUnit: joinUnitT(vr.voltage_ll?.unit),
        voltageLN: numT(vr.voltage_ln?.value),
        voltageLNUnit: joinUnitT(vr.voltage_ln?.unit),
        insulLevelLL: numT(vr.insul_level_ll?.value),
        insulLevelLLUnit: joinUnitT(vr.insul_level_ll?.unit),
        insulationClass: vr.insulation_class || null,
        regulation: vr.voltage_regulation || null
    }))

    // ─── powerRatings (gộp current_ratings theo index) ───────────────────────
    const currentRatings = rt.current_ratings || []
    const powerRatings = (rt.power_ratings || []).map((pr, idx) => {
        const cr = currentRatings[idx] || {}
        return {
            ratedPower: numT(pr.rated_power?.value),
            ratedPowerUnit: joinUnitT(pr.rated_power?.unit),
            coolingClass: pr.cooling_class || null,
            tempRiseWind: pr.temp_rise_wind?.value || null,
            currentRatingPrim: numT(cr.prim?.data?.value),
            currentRatingPrimUnit: cr.prim?.data?.unit || null,
            currentRatingSec: numT(cr.sec?.data?.value),
            currentRatingSecUnit: cr.sec?.data?.unit || null,
            currentRatingTert: numT(cr.tert?.data?.value),
            currentRatingTertUnit: cr.tert?.data?.unit || null
        }
    })

    // ─── shortCircuitImpedances (flatten prim_sec/prim_tert/sec_tert) ─────────
    const voltageTable = tc.voltage_table || []
    const tapNumToId = {}
    voltageTable.forEach((tv, idx) => {
        tapNumToId[tv.tap] = tv.id || idx + 1
    })

    const shortCircuitImpedances = []
    ;['prim_sec', 'prim_tert', 'sec_tert'].forEach((key) => {
        ;(im[key] || []).forEach((imp) => {
            const tapPos = imp.oltc_position || imp.detc_position || null
            shortCircuitImpedances.push({
                impedance: numT(imp.short_circuit_impedances_uk?.value),
                impedanceUnit: imp.short_circuit_impedances_uk?.unit === '%' ? 'PERCENT' : joinUnitT(imp.short_circuit_impedances_uk?.unit),
                basePower: numT(imp.base_power?.data?.value),
                basePowerUnit: joinUnitT(imp.base_power?.data?.unit),
                baseVoltage: numT(imp.base_voltage?.data?.value),
                baseVoltageUnit: joinUnitT(imp.base_voltage?.data?.unit),
                loadLoss: numT(imp.load_losses_pk?.value),
                loadLossUnit: joinUnitT(imp.load_losses_pk?.unit),
                tapChangerVoltageId: tapPos != null ? intT(tapNumToId[tapPos]) : null,
                type: IMPEDANCE_TYPE_TO_SERVER[key]
            })
        })
    })

    // ─── tapChanger + tapChangerVoltage ──────────────────────────────────────
    let tapChanger = null
    let tapChangerVoltage = []
    if (tc.mode) {
        tapChanger = {
            type: TAP_TYPE_TO_SERVER[tc.mode] || (tc.mode ? tc.mode.toUpperCase() : null),
            serialNo: tc.serial_no || null,
            manufacturer: tc.manufacturer || null,
            manufacturerType: tc.manufacturer_type || null,
            noTaps: intT(tc.no_of_taps) || voltageTable.length || null,
            winding: WINDING_TO_SERVER[tc.winding] || tc.winding || null,
            tabScheme: TAP_SCHEME_TO_SERVER[tc.tap_scheme] || tc.tap_scheme || null
        }
        tapChangerVoltage = voltageTable.map((tv) => ({
            tap: intT(tv.tap),
            voltage: numT(tv.voltage?.value),
            voltageUnit: joinUnitT(tv.voltage?.unit)
        }))
    }

    // ─── others ──────────────────────────────────────────────────────────────
    const ins = ot.insulation || {}
    const wd = ot.winding || {}
    const others = {
        category: ot.category || null,
        status: ot.status || null,
        tankType: ot.tank_type || null,
        insulationMedium: ot.insulation_medium || null,
        insulationKey: ins.key || null,
        insulationWeight: numT(ins.weight?.value),
        insulationWeightUnit: joinUnitT(ins.weight?.unit),
        insulationVolume: numT(ins.volume?.value),
        insulationVolumeUnit: joinUnitT(ins.volume?.unit),
        totalWeight: numT(ot.total_weight?.value),
        totalWeightUnit: joinUnitT(ot.total_weight?.unit),
        windingPrim: wd.prim || null,
        windingSec: wd.sec || null,
        windingTert: wd.tert || null
    }

    // ─── bushing_data (prim/sec/tert) ─────────────────────────────────────────
    const mapBushing = (b, winding) => {
        const item = {
            winding: winding,
            pos: b.pos || null,
            assetType: b.asset_type || null,
            serialNo: b.serial_no || null,
            manufacturer: b.manufacturer || null,
            manufacturerType: b.manufacturer_type || null,
            manufacturingYear: numT(b.manufacturer_year),
            insulationLevel: numT(b.insulation_level?.value),
            insulationLevelUnit: joinUnitT(b.insulation_level?.unit),
            voltageLGround: numT(b.voltage_l_ground?.value),
            voltageLGroundUnit: joinUnitT(b.voltage_l_ground?.unit),
            maxSystemVoltage: numT(b.max_system_voltage?.value),
            maxSystemVoltageUnit: joinUnitT(b.max_system_voltage?.unit),
            ratedCurrent: numT(b.rate_current?.value),
            ratedCurrentUnit: joinUnitT(b.rate_current?.unit),
            dfC1: numT(b.df_c1?.value),
            dfC1Unit: joinUnitT(b.df_c1?.unit),
            capC1: numT(b.cap_c1?.value),
            capC1Unit: joinUnitT(b.cap_c1?.unit),
            dfC2: numT(b.df_c2?.value),
            dfC2Unit: joinUnitT(b.df_c2?.unit),
            capC2: numT(b.cap_c2?.value),
            capC2Unit: joinUnitT(b.cap_c2?.unit),
            insulationType: b.insulation_type || null
        }
        // FK chỉ đẩy khi có
        if (b.mrid) item.mRID = b.mrid
        if (b.assetInfoId) item.assetInfoId = b.assetInfoId
        if (b.productAssetModelId) item.productAssetModelId = b.productAssetModelId
        if (b.lifecycleDateId) item.lifecycleDateId = b.lifecycleDateId
        return item
    }
    const bd = dto.bushing_data || {}
    const bushings = [
        ...(bd.prim || []).map((b) => mapBushing(b, 'PRIM')),
        ...(bd.sec || []).map((b) => mapBushing(b, 'SEC')),
        ...(bd.tert || []).map((b) => mapBushing(b, 'TERT'))
    ]

    // ─── surge_arrester (prim/sec/tert) ───────────────────────────────────────
    const mapSurge = (s, winding) => {
        const sp = s.properties || {}
        const sr = s.ratings || {}
        const item = {
            winding: winding,
            position: sr.pos || null,
            unitCount: sr.unit || null,
            serialNo: sp.serial_no || null,
            manufacturer: sp.manufacturer || null,
            manufacturingYear: numT(sp.manufacturer_year),
            assetSystemCode: sp.asset_system_code || null,
            ratingList: (sr.table || []).map((t) => ({
                serialNo: t.serial || null,
                voltageLL: numT(t.voltageLl?.value),
                voltageLLUnit: joinUnitT(t.voltageLl?.unit),
                voltageLN: numT(t.voltageLn?.value),
                voltageLNUnit: joinUnitT(t.voltageLn?.unit),
                mcovRating: numT(t.mcovRating?.value),
                mcovRatingUnit: joinUnitT(t.mcovRating?.unit)
            }))
        }
        if (sp.mrid) item.mRID = sp.mrid
        if (sp.assetInfoId) item.assetInfoId = sp.assetInfoId
        if (sp.productAssetModelId) item.productAssetModelId = sp.productAssetModelId
        if (sp.lifecycleDateId) item.lifecycleDateId = sp.lifecycleDateId
        return item
    }
    const sa = dto.surge_arrester || {}
    const surgeArresters = [
        ...(sa.prim || []).map((s) => mapSurge(s, 'PRIM')),
        ...(sa.sec || []).map((s) => mapSurge(s, 'SEC')),
        ...(sa.tert || []).map((s) => mapSurge(s, 'TERT'))
    ]

    const payload = {
        assetInfo,
        transformer,
        voltageRatings,
        powerRatings,
        shortCircuitImpedances,
        tapChanger,
        tapChangerVoltage,
        others,
        bushings,
        surgeArresters
    }

    // FK top-level chỉ đẩy khi DTO có
    const fk = {
        mRID: dto.mrid || p.mrid,
        oldPowerTransformerInfoId: dto.oldPowerTransformerInfoId,
        productAssetModelId: dto.productAssetModelId,
        lifecycleDateId: dto.lifecycleDateId,
        assetPsrId: dto.assetPsrId,
        locationId: dto.locationId,
        attachmentId: dto.attachmentId,
        tapChangerAssetInfoId: tc.assetInfoId,
        tapChangerProductAssetModelId: tc.productAssetModelId
    }
    for (const [k, v] of Object.entries(fk)) {
        if (v !== null && v !== undefined && v !== '') payload[k] = v
    }

    return payload
}
