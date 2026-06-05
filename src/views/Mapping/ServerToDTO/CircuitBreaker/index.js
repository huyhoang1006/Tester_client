/* eslint-disable */
import CircuitBreakerDto from "@/views/Dto/CircuitBreaker";
import uuid from "@/utils/uuid";

// ─── Lookup maps ─────────────────────────────────────────────────────────────
const ASSET_TYPE_MAP = {
    'Live tank SF6 breaker':           'LiveSF6',
    'Minimum oil breaker':             'MiniOil',
    'Air-blast breaker':               'AirBlast',
    'Dead tank SF6 breaker':           'DeadTankSF6',
    'Dead tank oil breaker (OCB)':     'DeadTankOCB',
    'Vacuum breaker':                  'Vacuum',
    'Generator circuit breaker (GCB)': 'GenCirGCB',
    'Gas insulated switchgear (GIS)':  'GasInsuGIS',
    'Miscellaneous':                   'Miscell',
}

const OPERATING_TYPE_MAP = {
    'Spring':    'Spring',
    'Hydraulic': 'hydraulic',
    'Pneumatic': 'Pneumatic',
    'Motor':     'Motor',
    'Magnetic':  'magnetic',
}

const extractYear = (dateStr) => {
    if (!dateStr) return ''
    const match = String(dateStr).match(/^(\d{4})/)
    return match ? match[1] : ''
}

const str = (val) => (val !== null && val !== undefined) ? String(val) : ''

// flat value object: { mrid, value, unit }
// serverUnit (nếu có) override defaultUnit để dùng đúng đơn vị server trả
const flat = (value, defaultUnit, serverUnit) => ({
    mrid:  uuid.newUuid(),
    value: str(value),
    unit:  serverUnit || defaultUnit,
})

// ─── Mapper ──────────────────────────────────────────────────────────────────
export const mapServerToDto = (serverData) => {
    const dto = new CircuitBreakerDto();
    if (!serverData) return dto;

    const assetInfo   = serverData.assetInfo          || {};
    const lifecycle   = serverData.lifecycleDate      || {};
    const opMech      = serverData.operatingMechanism || {};
    const opAssetInfo = opMech.assetInfo              || {};
    const opLifecycle = opMech.lifeCycleDate || opMech.lifecycleDate || {};

    // server sections (chưa có trong response hiện tại — sẽ map khi server bổ sung)
    const ratings     = serverData.ratings           || {};
    const cbCore      = serverData.circuitBreaker     || serverData.breaker || {};
    const contactSys  = serverData.contactSystem      || {};
    const others      = serverData.others             || {};
    const opDetail    = opMech.detail || opMech.ratings || {};

    // 1. IDs — luôn sinh UUID
    dto.assetInfoId                           = uuid.newUuid()
    dto.productAssetModelId                   = uuid.newUuid()
    dto.lifecycleDateId                       = uuid.newUuid()
    dto.assetPsrId                            = uuid.newUuid()
    dto.breakerRatingInfoId                   = uuid.newUuid()
    dto.breakerContactSystemInfoId            = uuid.newUuid()
    dto.breakerOtherInfoId                    = uuid.newUuid()
    dto.operatingMechanismId                  = uuid.newUuid()
    dto.operatingMechanismInfoId              = uuid.newUuid()
    dto.operatingMechanismLifecycleDateId     = uuid.newUuid()
    dto.operatingMechanismProductAssetModelId = uuid.newUuid()
    dto.assessmentLimitBreakerInfoId          = uuid.newUuid()

    // 2. Properties
    dto.properties.mrid              = null
    dto.properties.kind              = 'Circuit breaker'
    dto.properties.type              = ASSET_TYPE_MAP[serverData.type] || serverData.type || ''
    dto.properties.serial_no         = serverData.serialNumber || ''

    const mfgName = assetInfo.manufacturerType || opAssetInfo.manufacturerType || ''
    dto.properties.manufacturer      = mfgName
    dto.properties.manufacturer_type = (assetInfo.productAssetModel && assetInfo.productAssetModel !== mfgName)
        ? assetInfo.productAssetModel
        : ''
    dto.properties.manufacturer_year = extractYear(lifecycle.manufacturedDate)
    dto.properties.country_of_origin = serverData.countryOfOrigin || ''
    dto.properties.apparatus_id      = serverData.lotNumber
        || assetInfo.productAssetModel
        || serverData.position
        || ''
    dto.properties.comment           = serverData.description || ''

    // 3. Ratings
    dto.ratings.rated_voltage_ll                     = flat(ratings.ratedVoltage,                  'k|V', ratings.ratedVoltageUnit)
    dto.ratings.rated_current                        = flat(ratings.ratedCurrent,                  'A',   ratings.ratedCurrentUnit)
    dto.ratings.rated_short_circuit_breaking_current = flat(ratings.ratedShortCircuitBreakingCurrent, 'k|A', ratings.ratedShortCircuitBreakingCurrentUnit)
    dto.ratings.short_circuit_nominal_duration       = flat(ratings.shortCircuitNominalDuration,   's',   ratings.shortCircuitNominalDurationUnit)
    dto.ratings.rated_insulation_level               = flat(ratings.ratedInsulationLevel,          'k|V', ratings.ratedInsulationLevelUnit)
    dto.ratings.rated_interrupting_time              = flat(ratings.ratedInterruptingTime,         'm|s', ratings.ratedInterruptingTimeUnit)
    dto.ratings.interrupting_duty_cycle              = str(ratings.interruptingDutyCycle)
    dto.ratings.rated_power_at_closing               = flat(ratings.ratedPowerAtClosing,           'W',   ratings.ratedPowerAtClosingUnit)
    dto.ratings.rated_power_at_opening               = flat(ratings.ratedPowerAtOpening,           'W',   ratings.ratedPowerAtOpeningUnit)
    dto.ratings.rated_power_at_motor_charge          = flat(ratings.ratedPowerAtMotorCharge,       'W',   ratings.ratedPowerAtMotorChargeUnit)
    dto.ratings.rated_frequency                      = flat(ratings.ratedFrequency,                'Hz',  ratings.ratedFrequencyUnit)
    dto.ratings.rated_frequency_custom               = flat(ratings.ratedFrequencyCustom,          'Hz',  ratings.ratedFrequencyCustomUnit)

    // 4. CircuitBreaker section
    dto.circuitBreaker.numberOfPhases        = str(cbCore.numberOfPhases)
    dto.circuitBreaker.interruptersPerPhase  = str(cbCore.interruptersPerPhase)
    dto.circuitBreaker.poleOperation         = cbCore.poleOperation       || ''
    dto.circuitBreaker.hasPIR                = cbCore.hasPIR ?? ''
    dto.circuitBreaker.pirValue              = flat(cbCore.pirValue, '', cbCore.pirValueUnit)
    dto.circuitBreaker.hasGradingCapacitors  = cbCore.hasGradingCapacitors ?? ''
    dto.circuitBreaker.capacitorValue        = flat(cbCore.capacitorValue, '', cbCore.capacitorValueUnit)
    dto.circuitBreaker.interruptingMedium    = cbCore.interruptingMedium  || ''
    dto.circuitBreaker.tankType              = cbCore.tankType            || ''

    // 5. ContactSystem
    dto.contactSystem.nominal_total_travel = flat(contactSys.nominalTotalTravel, 'mm',  contactSys.nominalTotalTravelUnit)
    dto.contactSystem.damping_time         = flat(contactSys.dampingTime,        'm|s', contactSys.dampingTimeUnit)
    dto.contactSystem.nozzle_length        = flat(contactSys.nozzleLength,       'mm',  contactSys.nozzleLengthUnit)

    // 6. Others
    dto.others.total_weight_with_gas = flat(others.totalWeightWithGas, 'kg',  others.totalWeightWithGasUnit)
    dto.others.weight_of_gas         = flat(others.weightOfGas,        'kg',  others.weightOfGasUnit)
    dto.others.volume_of_gas         = flat(others.volumeOfGas,        'l',   others.volumeOfGasUnit)
    dto.others.rated_gas_pressure    = flat(others.ratedGasPressure,   'Pa',  others.ratedGasPressureUnit)
    dto.others.rated_gas_temperature = flat(others.ratedGasTemperature,'°C',  others.ratedGasTemperatureUnit)

    // 7. Operating mechanism
    dto.operating.type              = OPERATING_TYPE_MAP[opMech.type] || ''
    dto.operating.serial_no         = opMech.serialNumber             || ''
    dto.operating.comment           = opMech.description              || ''
    dto.operating.manufacturer_year = extractYear(opLifecycle.manufacturedDate)
    dto.operating.manufacturer_type = opAssetInfo.manufacturerType    || ''
    dto.operating.manufacturer      = opAssetInfo.manufacturerType    || ''
    dto.operating.number_of_trip_coil  = str(opDetail.numberOfTripCoil)
    dto.operating.number_of_close_coil = str(opDetail.numberOfCloseCoil)
    dto.operating.rated_operating_pressure             = flat(opDetail.ratedOperatingPressure,            'Pa',  opDetail.ratedOperatingPressureUnit)
    dto.operating.rated_operating_pressure_temperature = flat(opDetail.ratedOperatingPressureTemperature, '°C',  opDetail.ratedOperatingPressureTemperatureUnit)

    // Operating motor
    const motor = opDetail.motor || {}
    dto.operating.motor.rated_current = flat(motor.ratedCurrent, 'A',  motor.ratedCurrentUnit)
    dto.operating.motor.rated_voltage = flat(motor.ratedVoltage, 'V',  motor.ratedVoltageUnit)
    dto.operating.motor.power         = str(motor.power)
    dto.operating.motor.frequency     = flat(motor.frequency, 'Hz', motor.frequencyUnit)

    // Operating auxiliary circuits
    const aux = opDetail.auxiliaryCircuits || {}
    dto.operating.auxiliary_circuits.rated_current = flat(aux.ratedCurrent, 'A',  aux.ratedCurrentUnit)
    dto.operating.auxiliary_circuits.rated_voltage = flat(aux.ratedVoltage, 'V',  aux.ratedVoltageUnit)
    dto.operating.auxiliary_circuits.power         = str(aux.power)
    dto.operating.auxiliary_circuits.frequency     = flat(aux.frequency, 'Hz', aux.frequencyUnit)

    // Trip/Close coil components (arrays)
    if (Array.isArray(opDetail.tripCoilComponents)) {
        dto.operating.trip_coil_component = opDetail.tripCoilComponents.map(c => ({
            component:     c.name || 'Trip coil',
            rated_current: flat(c.ratedCurrent, 'A',  c.ratedCurrentUnit),
            rated_voltage: flat(c.ratedVoltage, 'V',  c.ratedVoltageUnit),
            power:         str(c.power),
            frequency:     flat(c.frequency, 'Hz', c.frequencyUnit),
        }))
    }
    if (Array.isArray(opDetail.closeCoilComponents)) {
        dto.operating.close_coil_component = opDetail.closeCoilComponents.map(c => ({
            component:     c.name || 'Close coil',
            rated_current: flat(c.ratedCurrent, 'A'),
            rated_voltage: flat(c.ratedVoltage, 'V'),
            power:         str(c.power),
            frequency:     flat(c.frequency, 'Hz'),
        }))
    }


    // 8. AssessmentLimits — tự define spec, server theo cấu trúc abs/rel
    // Server trả serverData.assessmentLimits với cùng cấu trúc nested DTO
    const al = serverData.assessmentLimits || {}
    if (al && Object.keys(al).length > 0) {
        const A = dto.assessmentLimits

        // limits mode: 'Absolute' | 'Relative'
        A.limits = al.limits || 'Absolute'

        // helper: set value + unit (nếu server trả) vào leaf {mrid,value,unit}
        // val = số; unit = đơn vị server trả (giữ nguyên unit mặc định nếu server null)
        const setLeaf = (target, val, unit) => {
            if (!target) return
            if (val !== null && val !== undefined) target.value = str(val)
            if (unit) target.unit = unit
        }

        // 8.1 contact_resistance (abs: r_min/r_max | rel: r_ref/r_dev)
        if (al.contactResistance) {
            const cr = al.contactResistance
            if (cr.abs) {
                setLeaf(A.contact_resistance.abs.r_min, cr.abs.rMin, cr.unit)
                setLeaf(A.contact_resistance.abs.r_max, cr.abs.rMax, cr.unit)
            }
            if (cr.rel) {
                setLeaf(A.contact_resistance.rel.r_ref, cr.rel.rRef, cr.unit)
                setLeaf(A.contact_resistance.rel.r_dev, cr.rel.rDev, cr.unit)
            }
        }

        // 8.2 operating_time — abs[key].{t_min,t_max} | rel[key].{t_ref,plus_t_dev,minus_t_dev}
        // keys: opening_time, opening_sync_within_phase, opening_sync_breaker_phase,
        //       closing_time, closing_sync_within_phase, closing_sync_breaker_phase,
        //       reclosing_time, close_open_time, open_close_time
        if (al.operatingTime) {
            const ot = al.operatingTime
            Object.keys(A.operating_time.abs).forEach(key => {
                const srcAbs = ot.abs && ot.abs[key]
                if (srcAbs) {
                    setLeaf(A.operating_time.abs[key].t_min, srcAbs.tMin, srcAbs.unit || ot.unit)
                    setLeaf(A.operating_time.abs[key].t_max, srcAbs.tMax, srcAbs.unit || ot.unit)
                }
            })
            Object.keys(A.operating_time.rel).forEach(key => {
                const srcRel = ot.rel && ot.rel[key]
                if (srcRel) {
                    setLeaf(A.operating_time.rel[key].t_ref,       srcRel.tRef,     srcRel.unit || ot.unit)
                    setLeaf(A.operating_time.rel[key].plus_t_dev,  srcRel.plusTDev, srcRel.unit || ot.unit)
                    setLeaf(A.operating_time.rel[key].minus_t_dev, srcRel.minusTDev,srcRel.unit || ot.unit)
                }
            })
        }

        // 8.3 contact_travel — abs[key].{d_min,d_max} | rel[key].{d_ref,d_dev}
        // keys: total_travel, over_travel_trip, over_travel_close, rebound_trip,
        //       rebound_close, contact_wipe_trip, contact_wipe_close, damping_distance
        if (al.contactTravel) {
            const ct = al.contactTravel
            Object.keys(A.contact_travel.abs).forEach(key => {
                const s = ct.abs && ct.abs[key]
                if (s) {
                    setLeaf(A.contact_travel.abs[key].d_min, s.dMin, s.unit || ct.unit)
                    setLeaf(A.contact_travel.abs[key].d_max, s.dMax, s.unit || ct.unit)
                }
            })
            Object.keys(A.contact_travel.rel).forEach(key => {
                const s = ct.rel && ct.rel[key]
                if (s) {
                    setLeaf(A.contact_travel.rel[key].d_ref, s.dRef, s.unit || ct.unit)
                    setLeaf(A.contact_travel.rel[key].d_dev, s.dDev, s.unit || ct.unit)
                }
            })
        }

        // 8.4 auxiliary_contacts — trip_operation & close_operation
        // abs[key].{t_min,t_max} | rel[key].{t_ref,t_dev}
        // keys: switching_time_type_a, diff_to_main_type_a, switching_time_type_b,
        //       diff_to_main_type_b, switching_time_wiper, duration
        if (al.auxiliaryContacts) {
            const ac = al.auxiliaryContacts
            ;['trip_operation', 'close_operation'].forEach(op => {
                const opCamel = op === 'trip_operation' ? 'tripOperation' : 'closeOperation'
                const srcOp = ac[opCamel]
                if (!srcOp) return
                Object.keys(A.auxiliary_contacts[op].abs).forEach(key => {
                    const s = srcOp.abs && srcOp.abs[key]
                    if (s) {
                        setLeaf(A.auxiliary_contacts[op].abs[key].t_min, s.tMin, s.unit || ac.unit)
                        setLeaf(A.auxiliary_contacts[op].abs[key].t_max, s.tMax, s.unit || ac.unit)
                    }
                })
                Object.keys(A.auxiliary_contacts[op].rel).forEach(key => {
                    const s = srcOp.rel && srcOp.rel[key]
                    if (s) {
                        setLeaf(A.auxiliary_contacts[op].rel[key].t_ref, s.tRef, s.unit || ac.unit)
                        setLeaf(A.auxiliary_contacts[op].rel[key].t_dev, s.tDev, s.unit || ac.unit)
                    }
                })
            })
        }

        // 8.5 miscellaneous — abs[key].{min,max} | rel[key].{ref,dev}
        // keys: bounce_time, bounce_count, pir_close_time, reaction_time
        if (al.miscellaneous) {
            const ms = al.miscellaneous
            Object.keys(A.miscellaneous.abs).forEach(key => {
                const s = ms.abs && ms.abs[key]
                if (s) {
                    setLeaf(A.miscellaneous.abs[key].min, s.min, s.unit)
                    setLeaf(A.miscellaneous.abs[key].max, s.max, s.unit)
                }
            })
            Object.keys(A.miscellaneous.rel).forEach(key => {
                const s = ms.rel && ms.rel[key]
                if (s) {
                    setLeaf(A.miscellaneous.rel[key].ref, s.ref, s.unit)
                    setLeaf(A.miscellaneous.rel[key].dev, s.dev, s.unit)
                }
            })
        }

        // 8.6 coil_characteristics — abs[key].{min,max} | rel[key].{ref,minus_dev,plus_dev}
        // keys: peak_close_coil_current, peak_trip_coil_current, average_close_coil_current,
        //       average_trip_coil_current, average_close_coil_voltage, average_trip_coil_voltage,
        //       close_coil_resistance, trip_coil_resistance
        if (al.coilCharacteristics) {
            const cc = al.coilCharacteristics
            Object.keys(A.coil_characteristics.abs).forEach(key => {
                const s = cc.abs && cc.abs[key]
                if (s) {
                    setLeaf(A.coil_characteristics.abs[key].min, s.min, s.unit)
                    setLeaf(A.coil_characteristics.abs[key].max, s.max, s.unit)
                }
            })
            Object.keys(A.coil_characteristics.rel).forEach(key => {
                const s = cc.rel && cc.rel[key]
                if (s) {
                    setLeaf(A.coil_characteristics.rel[key].ref,       s.ref,      s.unit)
                    setLeaf(A.coil_characteristics.rel[key].minus_dev, s.minusDev, s.unit)
                    setLeaf(A.coil_characteristics.rel[key].plus_dev,  s.plusDev,  s.unit)
                }
            })
        }

        // 8.7 pickup_voltage — abs[key].{v_min,v_max} | rel[key].{v_ref,v_dev}
        // keys: min_pickup_voltage_close, min_pickup_voltage_trip
        if (al.pickupVoltage) {
            const pv = al.pickupVoltage
            Object.keys(A.pickup_voltage.abs).forEach(key => {
                const s = pv.abs && pv.abs[key]
                if (s) {
                    setLeaf(A.pickup_voltage.abs[key].v_min, s.vMin, s.unit)
                    setLeaf(A.pickup_voltage.abs[key].v_max, s.vMax, s.unit)
                }
            })
            Object.keys(A.pickup_voltage.rel).forEach(key => {
                const s = pv.rel && pv.rel[key]
                if (s) {
                    setLeaf(A.pickup_voltage.rel[key].v_ref, s.vRef, s.unit)
                    setLeaf(A.pickup_voltage.rel[key].v_dev, s.vDev, s.unit)
                }
            })
        }

        // 8.8 motor_characteristics — abs[key].{min,max} | rel[key].{ref,dev}
        // keys: inrush_current, charging_time, charging_current, minimum_voltage
        if (al.motorCharacteristics) {
            const mc = al.motorCharacteristics
            Object.keys(A.motor_characteristics.abs).forEach(key => {
                const s = mc.abs && mc.abs[key]
                if (s) {
                    setLeaf(A.motor_characteristics.abs[key].min, s.min, s.unit)
                    setLeaf(A.motor_characteristics.abs[key].max, s.max, s.unit)
                }
            })
            Object.keys(A.motor_characteristics.rel).forEach(key => {
                const s = mc.rel && mc.rel[key]
                if (s) {
                    setLeaf(A.motor_characteristics.rel[key].ref, s.ref, s.unit)
                    setLeaf(A.motor_characteristics.rel[key].dev, s.dev, s.unit)
                }
            })
        }

        // 8.9 under_voltage_release — abs.uv_coil_trip_voltage.{min,max} | rel.{ref,dev}
        if (al.underVoltageRelease) {
            const uv = al.underVoltageRelease
            if (uv.abs?.uvCoilTripVoltage) {
                setLeaf(A.under_voltage_release.abs.uv_coil_trip_voltage.min, uv.abs.uvCoilTripVoltage.min, uv.abs.uvCoilTripVoltage.unit || uv.unit)
                setLeaf(A.under_voltage_release.abs.uv_coil_trip_voltage.max, uv.abs.uvCoilTripVoltage.max, uv.abs.uvCoilTripVoltage.unit || uv.unit)
            }
            if (uv.rel?.uvCoilTripVoltage) {
                setLeaf(A.under_voltage_release.rel.uv_coil_trip_voltage.ref, uv.rel.uvCoilTripVoltage.ref, uv.rel.uvCoilTripVoltage.unit || uv.unit)
                setLeaf(A.under_voltage_release.rel.uv_coil_trip_voltage.dev, uv.rel.uvCoilTripVoltage.dev, uv.rel.uvCoilTripVoltage.unit || uv.unit)
            }
        }

        // 8.10 overcurrent_release — abs.oc_replay_trip_current.{min,max} | rel.{ref,dev}
        if (al.overcurrentRelease) {
            const oc = al.overcurrentRelease
            if (oc.abs?.ocRelayTripCurrent) {
                setLeaf(A.overcurrent_release.abs.oc_replay_trip_current.min, oc.abs.ocRelayTripCurrent.min, oc.abs.ocRelayTripCurrent.unit || oc.unit)
                setLeaf(A.overcurrent_release.abs.oc_replay_trip_current.max, oc.abs.ocRelayTripCurrent.max, oc.abs.ocRelayTripCurrent.unit || oc.unit)
            }
            if (oc.rel?.ocRelayTripCurrent) {
                setLeaf(A.overcurrent_release.rel.oc_replay_trip_current.ref, oc.rel.ocRelayTripCurrent.ref, oc.rel.ocRelayTripCurrent.unit || oc.unit)
                setLeaf(A.overcurrent_release.rel.oc_replay_trip_current.dev, oc.rel.ocRelayTripCurrent.dev, oc.rel.ocRelayTripCurrent.unit || oc.unit)
            }
        }
    }

    return dto;
};


// ═══════════════════════════════════════════════════════════════════════════════
// Mapper: DTO → server JSON (push/upload)
// Hướng B: map phần khung CIM server có + BỔ SUNG section nghiệp vụ theo style server
// ═══════════════════════════════════════════════════════════════════════════════

const ASSET_TYPE_TO_SERVER = {
    'LiveSF6':     'Live tank SF6 breaker',
    'MiniOil':     'Minimum oil breaker',
    'AirBlast':    'Air-blast breaker',
    'DeadTankSF6': 'Dead tank SF6 breaker',
    'DeadTankOCB': 'Dead tank oil breaker (OCB)',
    'Vacuum':      'Vacuum breaker',
    'GenCirGCB':   'Generator circuit breaker (GCB)',
    'GasInsuGIS':  'Gas insulated switchgear (GIS)',
    'Miscell':     'Miscellaneous',
}

const OPERATING_TYPE_TO_SERVER = {
    'Spring':    'Spring',
    'hydraulic': 'Hydraulic',
    'Pneumatic': 'Pneumatic',
    'Motor':     'Motor',
    'magnetic':  'Magnetic',
}

// số: '' / null → null, còn lại parseFloat
const numU = (val) => (val !== null && val !== undefined && val !== '') ? parseFloat(val) : null
// string: '' → null
const strU = (val) => (val !== null && val !== undefined && val !== '') ? String(val) : null

// Tách unit DTO dạng 'multiplier|symbol' → { multiplier, unit }
// 'm|s' → { multiplier:'m', unit:'s' } | 'k|V' → { multiplier:'k', unit:'V' }
// 'A' (không pipe) → { multiplier:null, unit:'A' }
const splitUnitToServer = (raw) => {
    if (!raw) return { multiplier: null, unit: null }
    if (raw.includes('|')) {
        const [mult, sym] = raw.split('|')
        return { multiplier: mult || null, unit: sym || null }
    }
    return { multiplier: null, unit: raw }
}

// DTO leaf {mrid,value,unit} → server {mRID,value,multiplier,unit}
// value là number; unit tách thành multiplier + unit riêng (server không gộp)
const leafToServer = (obj) => {
    const { multiplier, unit } = splitUnitToServer(obj?.unit)
    return {
        mRID:       obj?.mrid || null,
        value:      numU(obj?.value),
        multiplier: multiplier,
        unit:       unit,
    }
}

export const mapDtoToServer = (dto) => {
    if (!dto) return null

    const p   = dto.properties   || {}
    const r   = dto.ratings      || {}
    const cb  = dto.circuitBreaker || {}
    const cs  = dto.contactSystem  || {}
    const ot  = dto.others         || {}
    const op  = dto.operating      || {}
    const al  = dto.assessmentLimits || {}

    // FK đảm bảo không null
    const assetInfoId   = dto.assetInfoId   || uuid.newUuid()
    const opMechId      = dto.operatingMechanismId || uuid.newUuid()

    // ─── Coil component array → server ───────────────────────────────────────
    const mapCoil = (c) => ({
        component:     c?.component || null,
        rated_current: leafToServer(c?.rated_current),
        rated_voltage: leafToServer(c?.rated_voltage),
        power:         strU(c?.power),
        frequency:     leafToServer(c?.frequency),
    })

    // ─── AssessmentLimits: DTO (snake abs/rel) → server (camel abs/rel) ───────
    // Helper: map 1 nhóm theo danh sách cặp [dtoLeafKey, serverLeafKey]
    // assessmentLimits: leaf chỉ giữ value+multiplier+unit (BỎ mRID — là PK/FK DB nội bộ client)
    const alLeaf = (obj) => {
        const { multiplier, unit } = splitUnitToServer(obj?.unit)
        return { value: numU(obj?.value), multiplier, unit }
    }

    // map 1 nhóm assessment — BỎ tất cả mrid (nhóm, nhóm con, leaf): chỉ dữ liệu nghiệp vụ
    const mapALGroup = (group) => {
        if (!group) return null
        const out = {}
        if (group.abs) {
            out.abs = {}
            for (const key of Object.keys(group.abs)) {
                const leaf = group.abs[key]
                if (leaf && 'value' in leaf) {
                    out.abs[key] = alLeaf(leaf)
                } else if (leaf && typeof leaf === 'object') {
                    const sub_out = {}
                    for (const sub of Object.keys(leaf)) {
                        if (sub === 'mrid') continue   // bỏ mrid nhóm con
                        sub_out[sub] = alLeaf(leaf[sub])
                    }
                    out.abs[key] = sub_out
                }
            }
        }
        if (group.rel) {
            out.rel = {}
            for (const key of Object.keys(group.rel)) {
                const leaf = group.rel[key]
                if (leaf && 'value' in leaf) {
                    out.rel[key] = alLeaf(leaf)
                } else if (leaf && typeof leaf === 'object') {
                    const sub_out = {}
                    for (const sub of Object.keys(leaf)) {
                        if (sub === 'mrid') continue   // bỏ mrid nhóm con
                        sub_out[sub] = alLeaf(leaf[sub])
                    }
                    out.rel[key] = sub_out
                }
            }
        }
        return out   // BỎ mrid cấp nhóm
    }

    // map toàn bộ assessmentLimits giữ nguyên cấu trúc abs/rel + leaf
    const mapAssessment = (a) => {
        if (!a) return null
        const result = { limits: a.limits || 'Absolute' }
        const groupKeys = [
            'contact_resistance', 'operating_time', 'contact_travel',
            'auxiliary_contacts', 'miscellaneous', 'coil_characteristics',
            'pickup_voltage', 'motor_characteristics',
            'under_voltage_release', 'overcurrent_release',
        ]
        for (const gk of groupKeys) {
            if (!a[gk]) continue
            // auxiliary_contacts có 2 cấp con (trip_operation / close_operation)
            if (gk === 'auxiliary_contacts') {
                const aux = {}
                for (const opKey of ['trip_operation', 'close_operation']) {
                    if (a[gk][opKey]) aux[opKey] = mapALGroup(a[gk][opKey])
                }
                result[gk] = aux   // BỎ mrid nhóm
            } else {
                result[gk] = mapALGroup(a[gk])
            }
        }
        return result
    }

    return {
        // ─── Khung CIM (server có) ───────────────────────────────────────────
        mRID:          p.mrid || null,
        name:          null,
        aliasName:     null,
        description:   p.comment || null,
        type:          ASSET_TYPE_TO_SERVER[p.type] || p.type || null,
        serialNumber:  p.serial_no   || null,
        lotNumber:     p.apparatus_id || null,
        position:      p.apparatus_id || null,
        countryOfOrigin: p.country_of_origin || null,
        kind:          p.kind || 'Circuit breaker',

        lifecycleDate: {
            mRID: dto.lifecycleDateId || null,
            // năm sản xuất → manufacturedDate (server lưu DateTime, ghép -01-01)
            manufacturedDate: p.manufacturer_year ? `${p.manufacturer_year}-01-01T00:00:00` : null,
            installationDate: null, purchaseDate: null,
            receivedDate: null, removalDate: null, retiredDate: null,
        },

        assetInfo: {
            mRID:              assetInfoId,
            manufacturerType:  p.manufacturer || null,   // tên hãng
            productAssetModel: p.manufacturer_type || null, // model
            name: null, aliasName: null, description: null,
        },

        operatingMechanism: {
            // ─── CIM flat (khớp payload server OK) ───────────────────────────
            mRID:         opMechId,
            name:         null,
            aliasName:    null,
            description:  op.comment    || null,
            type:         OPERATING_TYPE_TO_SERVER[op.type] || op.type || null,
            kind:         null,
            serialNumber: op.serial_no  || null,

            // ─── chi tiết operating — flatten thẳng, không bọc detail{} ───────
            operatingMechanismLifecycleDateId:     dto.operatingMechanismLifecycleDateId || null,
            operatingMechanismInfoId:              dto.operatingMechanismInfoId || null,
            operatingMechanismProductAssetModelId: dto.operatingMechanismProductAssetModelId || null,
            manufacturedDate: op.manufacturer_year ? `${op.manufacturer_year}-01-01T00:00:00` : null,
            manufacturerType: op.manufacturer || null,

            numberOfTripCoil:  strU(op.number_of_trip_coil),
            numberOfCloseCoil: strU(op.number_of_close_coil),
            ratedOperatingPressure:            leafToServer(op.rated_operating_pressure),
            ratedOperatingPressureTemperature: leafToServer(op.rated_operating_pressure_temperature),
            motor: {
                ratedCurrent: leafToServer(op.motor?.rated_current),
                ratedVoltage: leafToServer(op.motor?.rated_voltage),
                power:        strU(op.motor?.power),
                frequency:    leafToServer(op.motor?.frequency),
            },
            auxiliaryCircuits: {
                ratedCurrent: leafToServer(op.auxiliary_circuits?.rated_current),
                ratedVoltage: leafToServer(op.auxiliary_circuits?.rated_voltage),
                power:        strU(op.auxiliary_circuits?.power),
                frequency:    leafToServer(op.auxiliary_circuits?.frequency),
            },
            tripCoilComponents:  (op.trip_coil_component  || []).map(mapCoil),
            closeCoilComponents: (op.close_coil_component || []).map(mapCoil),
        },

        // ─── [SERVER THIẾU] Section nghiệp vụ — bổ sung theo style server ─────
        ratings: {
            ratedVoltage:                     leafToServer(r.rated_voltage_ll),
            ratedCurrent:                     leafToServer(r.rated_current),
            ratedShortCircuitBreakingCurrent: leafToServer(r.rated_short_circuit_breaking_current),
            shortCircuitNominalDuration:      leafToServer(r.short_circuit_nominal_duration),
            ratedInsulationLevel:             leafToServer(r.rated_insulation_level),
            ratedInterruptingTime:            leafToServer(r.rated_interrupting_time),
            interruptingDutyCycle:            strU(r.interrupting_duty_cycle),
            ratedPowerAtClosing:              leafToServer(r.rated_power_at_closing),
            ratedPowerAtOpening:              leafToServer(r.rated_power_at_opening),
            ratedPowerAtMotorCharge:          leafToServer(r.rated_power_at_motor_charge),
            ratedFrequency:                   leafToServer(r.rated_frequency),
            ratedFrequencyCustom:             leafToServer(r.rated_frequency_custom),
        },

        circuitBreaker: {
            numberOfPhases:       strU(cb.numberOfPhases),
            interruptersPerPhase: strU(cb.interruptersPerPhase),
            poleOperation:        cb.poleOperation || null,
            hasPIR:               cb.hasPIR ?? null,
            pirValue:             leafToServer(cb.pirValue),
            hasGradingCapacitors: cb.hasGradingCapacitors ?? null,
            capacitorValue:       leafToServer(cb.capacitorValue),
            interruptingMedium:   cb.interruptingMedium || null,
            tankType:             cb.tankType || null,
        },

        contactSystem: {
            nominalTotalTravel: leafToServer(cs.nominal_total_travel),
            dampingTime:        leafToServer(cs.damping_time),
            nozzleLength:       leafToServer(cs.nozzle_length),
        },

        others: {
            totalWeightWithGas:  leafToServer(ot.total_weight_with_gas),
            weightOfGas:         leafToServer(ot.weight_of_gas),
            volumeOfGas:         leafToServer(ot.volume_of_gas),
            ratedGasPressure:    leafToServer(ot.rated_gas_pressure),
            ratedGasTemperature: leafToServer(ot.rated_gas_temperature),
        },

        assessmentLimits: mapAssessment(al),

        // ─── FK ids ──────────────────────────────────────────────────────────
        assetInfoId,
        productAssetModelId:                   dto.productAssetModelId                   || uuid.newUuid(),
        lifecycleDateId:                       dto.lifecycleDateId                       || uuid.newUuid(),
        assetPsrId:                            dto.assetPsrId                            || uuid.newUuid(),
        psrId:                                 dto.psrId                                 || null,
        operatingMechanismId:                  opMechId,
        operatingMechanismInfoId:              dto.operatingMechanismInfoId              || uuid.newUuid(),
        operatingMechanismLifecycleDateId:     dto.operatingMechanismLifecycleDateId     || uuid.newUuid(),
        operatingMechanismProductAssetModelId: dto.operatingMechanismProductAssetModelId || uuid.newUuid(),
        assessmentLimitBreakerInfoId:          dto.assessmentLimitBreakerInfoId          || uuid.newUuid(),
        breakerRatingInfoId:                   dto.breakerRatingInfoId                   || uuid.newUuid(),
        breakerContactSystemInfoId:            dto.breakerContactSystemInfoId            || uuid.newUuid(),
        breakerOtherInfoId:                    dto.breakerOtherInfoId                    || uuid.newUuid(),
        attachmentId:                          dto.attachmentId                          || null,
    }
}