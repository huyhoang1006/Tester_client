import CurrentTransformerDto from "@/views/Dto/CurrentTransformer";
import FullTapDto from "@/views/Dto/CurrentTransformer/CTConfiguration/FullTapDto";
import uuid from "@/utils/uuid";

// ─── Download maps (server → client) ─────────────────────────────────────────

const ASSET_TYPE_MAP = {
    'INDUCTIVE': 'inductive',
    'ROGOWSKI':  'rogowski',
}

// ─── Reverse maps (client → server) ──────────────────────────────────────────

const ASSET_TYPE_TO_SERVER = {
    'inductive': 'INDUCTIVE',
    'rogowski':  'ROGOWSKI',
}

const STANDARD_TO_SERVER = {
    'IEC60044':  'IEC_60044',
    'IEC61869':  'IEC_61869',
    'IEEEC5713': 'IEEE_C57_13',
}

const TAP_TYPE_TO_SERVER = {
    fulltap:  'FULL__TAP',
    maintap:  'MAIN__TAP',
    intertap: 'INTER__TAP',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// flat number + unit → DTO object {mrid, value, unit}
const mapFlat = (value, unit, mrid) => ({
    mrid:  mrid || uuid.newUuid(),
    value: value ?? null,
    unit:  unit  || null,
})

// DTO object → server payload {mrid, value, unit}
const mapBurden = (obj) => ({
    mrid:  obj?.mrid  || null,
    value: num(obj?.value),
    unit:  obj?.unit  || null,
})

const mapTapTable = (table) => ({
    mrid:   table?.mrid   || null,
    isShow: table?.isShow ?? false,
    name:   table?.name   || null,
    ipn: {
        mrid:  table?.ipn?.mrid  || null,
        value: num(table?.ipn?.value),
        unit:  table?.ipn?.unit  || null,
    },
    isn: {
        mrid:  table?.isn?.mrid  || null,
        value: num(table?.isn?.value),
        unit:  table?.isn?.unit  || null,
    },
    inUse: table?.inUse ?? false,
    type:  TAP_TYPE_TO_SERVER[table?.type] || table?.type || null,
})

const mapSmallClassRating = (cr) => ({
    mrid:               cr?.mrid || null,
    rated_burden:       mapBurden(cr?.rated_burden),
    extended_burden:    cr?.extended_burden ?? false,
    burden:             mapBurden(cr?.burden),
    burdenCos:          str(cr?.burdenCos),
    operatingBurden:    mapBurden(cr?.operatingBurden),
    operatingBurdenCos: str(cr?.operatingBurdenCos),
})

// ─── Mapper: server response → DTO (download) ────────────────────────────────

export const mapServerToDto = (serverData) => {
    const dto = new CurrentTransformerDto();
    if (!serverData) return dto;

    const assetInfo = serverData.assetInfo || serverData.assetInfoResponseDTO || {};
    const core      = serverData.currentTransformerCoreResponse || serverData.currentTransformerCore || {};
    const taps      = serverData.currentTransformerTapsResponses || serverData.currentTransformerTaps || [];

    // ─── IDs ─────────────────────────────────────────────────────────────────
    // Tất cả IDs phải có giá trị hợp lệ — nếu server không trả về thì tạo UUID mới
    // tránh FK constraint violation khi insert vào DB
    const ctMrid            = core.id      ? String(core.id)      : uuid.newUuid()
    // FIX: assetInfo.id có thể null → fallback sang core.assetInfoId
    dto.assetInfoId         = assetInfo.id
        ? String(assetInfo.id)
        : (core.assetInfoId ? String(core.assetInfoId) : uuid.newUuid())
    dto.psrId               = assetInfo.ownerId ? String(assetInfo.ownerId) : null
    dto.productAssetModelId = uuid.newUuid()
    dto.lifecycleDateId     = uuid.newUuid()
    dto.assetPsrId          = uuid.newUuid()

    // ─── Properties ──────────────────────────────────────────────────────────
    // mrid dùng làm PK cho asset — phải có giá trị, không được null
    dto.properties.mrid               = ctMrid
    dto.properties.asset_type         = ASSET_TYPE_MAP[core.assetType] || (core.assetType || '').toLowerCase()
    dto.properties.type               = dto.properties.asset_type
    dto.properties.kind               = 'Current transformer'
    dto.properties.serial_no          = assetInfo.serialNo         || ''
    dto.properties.manufacturer       = assetInfo.manufacturer || assetInfo.manufacturerName || ''
    dto.properties.manufacturer_type  = assetInfo.manufacturerType || ''
    dto.properties.country_of_origin  = assetInfo.country || assetInfo.countryName || ''
    dto.properties.apparatus_id       = assetInfo.apparatusId      || ''
    dto.properties.comment            = assetInfo.description      || ''
    dto.properties.manufacturing_year = assetInfo.manufacturingYear
        ? String(assetInfo.manufacturingYear)
        : ''
    dto.config.phase = assetInfo.phase || ''
    dto.config.number_of_phase = assetInfo.numberOfPhase ?? ''

    // ─── Ratings ─────────────────────────────────────────────────────────────
    dto.ratings.standard = {
        mrid:  uuid.newUuid(),
        // FIX: strip underscore để match View options: "IEC_61869" → "IEC61869"
        value: core.standard ? core.standard.replace(/_/g, '') : null,
        unit:  null,
    }

    dto.ratings.rated_frequency = {
        mrid:  uuid.newUuid(),
        value: str(core.ratedFrequency),
        unit:  core.ratedFrequencyUnit || 'Hz',
    }

    dto.ratings.primary_winding_count = str(core.primaryWinding)

    // FIX: server dùng lowercase prefix cho unit fields (uwithstandUnit, ulightningUnit)
    // um không có unit field riêng → default kV
    dto.ratings.um_rms           = mapFlat(core.um,          core.umUnit || 'kV')
    dto.ratings.u_withstand_rms  = mapFlat(core.uWithstand,  core.uwithstandUnit || core.uWithstandUnit || 'kV')
    dto.ratings.u_lightning_peak = mapFlat(core.uLightning,  core.ulightningUnit || core.uLightningUnit || 'kV')
    dto.ratings.icth             = mapFlat(core.icth,         core.icthUnit)
    dto.ratings.idyn_peak        = mapFlat(core.idyn,         core.idynUnit)
    dto.ratings.ith_rms          = mapFlat(core.ith,          core.ithUnit)
    dto.ratings.ith_duration     = mapFlat(core.duration,     core.durationUnit)
    dto.ratings.system_voltage   = mapFlat(core.systemVoltage, core.systemVoltageUnit)

    dto.ratings.system_voltage_type = {
        mrid:  uuid.newUuid(),
        value: core.systemVoltageType || null,
        unit:  null,
    }

    dto.ratings.bil                = mapFlat(core.ratedInsulationlevel, core.ratedInsulationlevelUnit)
    dto.ratings.rating_factor      = str(core.ratingFactor)
    dto.ratings.rating_factor_temp = mapFlat(core.ratingFactorTemp, core.ratingFactorTempUnit)

    // ─── CT Configuration ─────────────────────────────────────────────────────
    const numberCore = core.numberCore || 0
    dto.ctConfiguration.cores = str(numberCore)
    dto.ctConfiguration.dataCT = []

    // Group taps by core index
    // FIX: nếu tất cả taps có core=null → phân bổ đều theo numberCore
    // hoặc gom hết vào core 0 nếu chỉ có 1 core
    const allTapsHaveNoCore = taps.every(t => t.core === null || t.core === undefined)

    for (let coreIdx = 0; coreIdx < numberCore; coreIdx++) {
        const coreNumber = coreIdx + 1
        let coreTaps
        if (allTapsHaveNoCore) {
            // Server không phân core → gom tất cả vào core đầu tiên
            coreTaps = coreIdx === 0 ? taps : []
        } else {
            coreTaps = taps.filter(t => t.core === coreNumber)
        }

        const fullTap  = coreTaps.find(t => t.type === 'Full tap'  || t.type === 'fulltap')
        const mainTaps = coreTaps.filter(t => t.type === 'Main tap' || t.type === 'maintap')
        const interTaps = coreTaps.filter(t => t.type === 'Inter tap' || t.type === 'intertap')

        const mapTableFromTap = (tap) => ({
            mrid:   uuid.newUuid(),
            isShow: false,
            name:   tap.name   || null,
            // View dùng ipn.value và isn.value → cần object, unit default 'A'
            ipn: { mrid: uuid.newUuid(), value: tap.ipn != null ? String(tap.ipn) : '', unit: tap.ipnUnit || 'A' },
            isn: { mrid: uuid.newUuid(), value: tap.isn != null ? String(tap.isn) : '', unit: tap.isnUnit || 'A' },
            inUse: tap.inUse ?? false,
            type:  tap.type || null,
        })

        const mapFullClassRating = (tap) => ({
            mrid:               uuid.newUuid(),
            app:                tap.application ? tap.application.toLowerCase() : null,
            class:              (() => {
                // Server format: "_0_5" → "0.5", "_5P" → "5P", "_0_5S" → "0.5S"
                const raw = tap.class_ || ''
                if (!raw) return null
                // Remove leading underscore, replace remaining _ with .
                return raw.replace(/^_/, '').replace(/_/g, '.')
            })(),
            wr:                 mapFlat(tap.windingResistance, tap.windingResistanceUnit),
            kx:                 str(tap.kx),
            k:                  str(tap.k),
            fs:                 str(tap.fs),
            kssc:               str(tap.kssc),
            ktd:                str(tap.ktd),
            duty:               tap.duty          || null,
            vb:                 str(tap.vb),  // View bind trực tiếp string, không phải object
            alf:                str(tap.alf),
            ts:                 str(tap.ts),
            ek:                 str(tap.ek),
            e1:                 str(tap.e1),
            le:                 str(tap.le),
            le1:                str(tap.le1),
            re20lsn:            null,      // View field, server chưa có
            val:                null,
            lal:                null,
            t1:                 str(tap.t1),
            tal1:               str(tap.tal1),
            tp:                 str(tap.tp),
            tpts:               str(tap.tpts),
            vk:                 str(tap.vk),
            lk:                 str(tap.lk),
            vk1:                str(tap.vk1),
            lk1:                str(tap.lk1),
            rated_burden:       mapFlat(tap.ratedBurden,      tap.burdenUnit),
            extended_burden:    tap.extendedBurden ?? false,
            burden:             mapFlat(tap.burden,           tap.burdenUnit),
            burdenCos:          str(tap.burdenCos),
            operatingBurden:    mapFlat(tap.operatingBurden,  tap.burdenUnit),
            operatingBurdenCos: str(tap.operatingBurdenCos),
            core_index:         coreNumber,
            ratio_error:        mapFlat(tap.re, tap.reUnit),
        })

        const mapSmallClassRatingFromTap = (tap) => ({
            mrid:               uuid.newUuid(),
            rated_burden:       mapFlat(tap.ratedBurden,     tap.burdenUnit),
            extended_burden:    tap.extendedBurden ?? false,
            burden:             mapFlat(tap.burden,          tap.burdenUnit),
            burdenCos:          str(tap.burdenCos),
            operatingBurden:    mapFlat(tap.operatingBurden, tap.burdenUnit),
            operatingBurdenCos: str(tap.operatingBurdenCos),
        })

        dto.ctConfiguration.dataCT.push({
            mrid:      uuid.newUuid(),
            taps:      str(fullTap?.numberTap || mainTaps.length + 1),
            commonTap: str(fullTap?.commonTap),

            fullTap: {
                // FIX: fallback FullTapDto() thay vì {} để tránh crash View khi fullTap null
                table:       fullTap ? mapTableFromTap(fullTap)    : new FullTapDto().table,
                classRating: fullTap ? mapFullClassRating(fullTap) : new FullTapDto().classRating,
            },

            mainTap: {
                data: mainTaps.map(tap => ({
                    table:       mapTableFromTap(tap),
                    classRating: mapSmallClassRatingFromTap(tap),
                })),
            },

            interTap: {
                data: interTaps.map(tap => ({
                    table:       mapTableFromTap(tap),
                    classRating: mapSmallClassRatingFromTap(tap),
                })),
            },
        })
    }

    return dto;
}

// ─── Mapper: DTO → server JSON (push) ────────────────────────────────────────

export const mapDtoToServer = (dto, ownerType) => {
    if (!dto) return null
    void ownerType

    const ctConfig = dto.ctConfiguration || {}
    const ratings  = dto.ratings         || {}
    const p = dto.properties || {}
    const ratedFrequencyValue = ratings.rated_frequency?.value === 'Custom'
        ? ratings.rated_frequency_custom
        : ratings.rated_frequency?.value
    const taps = []
    ;(ctConfig.dataCT || []).forEach((core, coreIndex) => {
        const coreNumber = coreIndex + 1
        const numberTap = toNumberOrNull(core.taps)
        const commonTap = toNumberOrNull(core.commonTap)
        const pushTap = (table, classRating, type) => {
            const t = table || {}
            const cr = classRating || {}
            const burdenUnit = joinUnit(cr.rated_burden?.unit) || joinUnit(cr.burden?.unit) || joinUnit(cr.operatingBurden?.unit)
            taps.push({
                id: idT(t.mrid),
                core: coreNumber,
                name: textT(t.name),
                type,
                commonTap,
                numberTap,
                ipn: num(t.ipn?.value),
                ipnUnit: joinUnit(t.ipn?.unit),
                isn: num(t.isn?.value),
                isnUnit: joinUnit(t.isn?.unit),
                inUse: !!t.inUse,
                application: textT(cr.app),
                class_: classToServer(cr.class),
                windingResistance: num(cr.wr?.value),
                windingResistanceUnit: joinUnit(cr.wr?.unit),
                kx: num(cr.kx),
                k: num(cr.k),
                fs: num(cr.fs),
                kssc: num(cr.kssc),
                ktd: num(cr.ktd),
                duty: textT(cr.duty),
                vb: num(typeof cr.vb === 'object' ? cr.vb?.value : cr.vb),
                vbUnit: joinUnit(cr.vb?.unit),
                alf: num(cr.alf),
                ts: num(cr.ts),
                ek: num(cr.ek),
                e1: num(cr.e1),
                le: num(cr.le),
                le1: num(cr.le1),
                val: num(cr.val),
                lal: num(cr.lal),
                t1: num(cr.t1),
                tal1: num(cr.tal1),
                tp: num(cr.tp),
                tpts: num(cr.tpts),
                vk: num(cr.vk),
                lk: num(cr.lk),
                vk1: num(cr.vk1),
                lk1: num(cr.lk1),
                ratedBurden: num(cr.rated_burden?.value),
                extendedBurden: cr.extended_burden ?? false,
                burden: num(cr.burden?.value),
                burdenUnit,
                burdenCos: num(cr.burdenCos),
                operatingBurden: num(cr.operatingBurden?.value),
                operatingBurdenCos: num(cr.operatingBurdenCos),
                re: num(cr.ratio_error?.value),
                reUnit: joinUnit(cr.ratio_error?.unit)
            })
        }
        pushTap(core.fullTap?.table, core.fullTap?.classRating, 'Full tap')
        ;(core.mainTap?.data || []).forEach(tap => pushTap(tap.table, tap.classRating, 'Main tap'))
        ;(core.interTap?.data || []).forEach(tap => pushTap(tap.table, tap.classRating, 'Inter tap'))
    })

    void taps
    if (dto) return {
        CurrentTransformer: {
            properties: {
                mrid:              p.mrid || null,
                type:              ASSET_TYPE_TO_SERVER[p.asset_type] || ASSET_TYPE_TO_SERVER[p.type] || p.asset_type || p.type || null,
                kind:              p.kind || null,
                serial_no:         p.serial_no || null,
                manufacturer:      p.manufacturer || null,
                manufacturer_type: p.manufacturer_type || null,
                manufacturer_year: p.manufacturing_year || p.manufacturer_year || null,
                country_of_origin: p.country_of_origin || null,
                apparatus_id:      p.apparatus_id || null,
                comment:           p.comment || null,
            },
            ratings: {
                standard: {
                    mrid:  ratings.standard?.mrid || null,
                    value: (() => {
                        const raw = typeof ratings.standard === 'string' ? ratings.standard : ratings.standard?.value
                        return STANDARD_TO_SERVER[raw] || raw || null
                    })(),
                    unit: null,
                },
                rated_frequency_custom: ratings.rated_frequency_custom || null,
                rated_frequency: {
                    mrid:  ratings.rated_frequency?.mrid || null,
                    value: num(ratedFrequencyValue),
                    unit:  ratings.rated_frequency?.unit || null,
                },
                primary_winding_count: str(ratings.primary_winding_count),
                um_rms:           mapBurden(ratings.um_rms),
                u_withstand_rms:  mapBurden(ratings.u_withstand_rms),
                u_lightning_peak: mapBurden(ratings.u_lightning_peak),
                icth:             mapBurden(ratings.icth),
                idyn_peak:        mapBurden(ratings.idyn_peak),
                ith_rms:          mapBurden(ratings.ith_rms),
                ith_duration:     mapBurden(ratings.ith_duration),
                system_voltage:   mapBurden(ratings.system_voltage),
                system_voltage_type: ratings.system_voltage_type?.value || ratings.system_voltage_type || null,
                bil:               mapBurden(ratings.bil),
                rating_factor:     str(ratings.rating_factor),
                rating_factor_temp: mapBurden(ratings.rating_factor_temp),
            },
            ctConfiguration: {
                cores: str(ctConfig.cores),
                dataCT: (ctConfig.dataCT || []).map(core => {
                    const ft   = core.fullTap?.table       || {}
                    const ftCR = core.fullTap?.classRating || {}
                    return {
                        mrid:      core.mrid || null,
                        taps:      str(core.taps),
                        commonTap: str(core.commonTap),
                        fullTap: {
                            table: mapTapTable(ft),
                            classRating: {
                                mrid:               ftCR.mrid || null,
                                app:                ftCR.app === 'chooseApp' ? null : (ftCR.app || null),
                                class:              ftCR.class || null,
                                wr:                 mapBurden(ftCR.wr),
                                kx:                 str(ftCR.kx),
                                k:                  str(ftCR.k),
                                fs:                 str(ftCR.fs),
                                kssc:               str(ftCR.kssc),
                                ktd:                str(ftCR.ktd),
                                duty:               ftCR.duty || null,
                                vb:                 mapVb(ftCR.vb),
                                alf:                str(ftCR.alf),
                                ts:                 str(ftCR.ts),
                                ek:                 str(ftCR.ek),
                                le:                 str(ftCR.le),
                                e1:                 str(ftCR.e1),
                                le1:                str(ftCR.le1),
                                val:                str(ftCR.val),
                                lal:                str(ftCR.lal),
                                t1:                 str(ftCR.t1),
                                tal1:               str(ftCR.tal1),
                                tp:                 str(ftCR.tp),
                                tpts:               str(ftCR.tpts),
                                vk:                 str(ftCR.vk),
                                lk:                 str(ftCR.lk),
                                vk1:                str(ftCR.vk1),
                                lk1:                str(ftCR.lk1),
                                rated_burden:       mapBurden(ftCR.rated_burden),
                                extended_burden:    ftCR.extended_burden ?? false,
                                burden:             mapBurden(ftCR.burden),
                                burdenCos:          str(ftCR.burdenCos),
                                operatingBurden:    mapBurden(ftCR.operatingBurden),
                                operatingBurdenCos: str(ftCR.operatingBurdenCos),
                                core_index:         toNumberOrNull(ftCR.core_index),
                                ratio_error:        mapBurden(ftCR.ratio_error),
                            },
                        },
                        mainTap: {
                            data: (core.mainTap?.data || []).map(mt => ({
                                table:       mapTapTable(mt.table),
                                classRating: mapSmallClassRating(mt.classRating),
                            })),
                        },
                        interTap: {
                            data: (core.interTap?.data || []).map(it => ({
                                table:       mapTapTable(it.table),
                                classRating: mapSmallClassRating(it.classRating),
                            })),
                        },
                    }
                }),
            },
            locationId:          dto.locationId          || null,
            psrId:               dto.psrId               || null,
            assetPsrId:          dto.assetPsrId          || null,
            assetInfoId:         dto.assetInfoId         || null,
            productAssetModelId: dto.productAssetModelId || null,
            lifecycleDateId:     dto.lifecycleDateId     || null,
            attachmentId:        dto.attachmentId        || null,
        },
    }

    // Đảm bảo FK entity phụ không null (tránh lỗi NOT NULL / FK phía server)
    const assetInfoId         = dto.assetInfoId         || uuid.newUuid()
    const productAssetModelId = dto.productAssetModelId || uuid.newUuid()
    const lifecycleDateId     = dto.lifecycleDateId     || uuid.newUuid()
    const assetPsrId          = dto.assetPsrId          || uuid.newUuid()

    return {
        CurrentTransformer: {
            properties: {
                mrid:              dto.properties?.mrid              || null,
                type:              ASSET_TYPE_TO_SERVER[dto.properties?.asset_type]
                    || dto.properties?.type
                    || null,
                kind:              dto.properties?.kind              || null,
                serial_no:         dto.properties?.serial_no         || null,
                manufacturer:      dto.properties?.manufacturer      || null,
                manufacturer_type: dto.properties?.manufacturer_type || null,
                manufacturer_year: dto.properties?.manufacturing_year
                    || dto.properties?.manufacturer_year
                    || null,
                country_of_origin: dto.properties?.country_of_origin || null,
                apparatus_id:      dto.properties?.apparatus_id      || null,
                comment:           dto.properties?.comment           || null,
                phase:             dto.config?.phase                 || null,
                numberOfPhase:     toNumberOrNull(dto.config?.number_of_phase),
            },

            ratings: {
                standard: {
                    mrid:  ratings.standard?.mrid || null,
                    value: (() => {
                        const raw = typeof ratings.standard === 'string'
                            ? ratings.standard
                            : (ratings.standard?.value || null)
                        return STANDARD_TO_SERVER[raw] || raw || null
                    })(),
                    unit: null,
                },

                rated_frequency_custom: ratings.rated_frequency_custom || null,

                rated_frequency: {
                    mrid:  ratings.rated_frequency?.mrid || null,
                    value: num(ratings.rated_frequency?.value),
                    unit:  ratings.rated_frequency?.unit || null,
                },

                primary_winding_count: str(ratings.primary_winding_count),

                um_rms:           mapBurden(ratings.um_rms),
                u_withstand_rms:  mapBurden(ratings.u_withstand_rms),
                u_lightning_peak: mapBurden(ratings.u_lightning_peak),
                icth:             mapBurden(ratings.icth),
                idyn_peak:        mapBurden(ratings.idyn_peak),
                ith_rms:          mapBurden(ratings.ith_rms),
                ith_duration:     mapBurden(ratings.ith_duration),
                system_voltage:   mapBurden(ratings.system_voltage),

                system_voltage_type: ratings.system_voltage_type?.value
                    || ratings.system_voltage_type
                    || null,

                bil:               mapBurden(ratings.bil),
                rating_factor:     str(ratings.rating_factor),
                rating_factor_temp: mapBurden(ratings.rating_factor_temp),
            },

            ctConfiguration: {
                cores: str(ctConfig.cores),
                dataCT: (ctConfig.dataCT || []).map(core => {
                    const ft   = core.fullTap?.table       || {}
                    const ftCR = core.fullTap?.classRating || {}

                    return {
                        mrid:      core.mrid      || null,
                        taps:      str(core.taps),
                        commonTap: str(core.commonTap),

                        fullTap: {
                            table: mapTapTable(ft),
                            classRating: {
                                mrid:               ftCR.mrid  || null,
                                app:                ftCR.app   || null,
                                class:              ftCR.class || null,
                                wr:                 mapBurden(ftCR.wr),
                                kx:                 str(ftCR.kx),
                                k:                  str(ftCR.k),
                                fs:                 str(ftCR.fs),
                                kssc:               str(ftCR.kssc),
                                ktd:                str(ftCR.ktd),
                                duty:               ftCR.duty  || null,
                                vb: (() => {
                                    const v = ftCR.vb
                                    if (v && typeof v === 'object') {
                                        return { mrid: v.mrid || null, value: num(v.value), unit: v.unit || null }
                                    }
                                    return { mrid: null, value: num(v), unit: null }
                                })(),
                                alf:                str(ftCR.alf),
                                ts:                 str(ftCR.ts),
                                ek:                 str(ftCR.ek),
                                e1:                 str(ftCR.e1),
                                le:                 str(ftCR.le),
                                le1:                str(ftCR.le1),
                                val:                str(ftCR.val),
                                lal:                str(ftCR.lal),
                                t1:                 str(ftCR.t1),
                                tal1:               str(ftCR.tal1),
                                tp:                 str(ftCR.tp),
                                tpts:               str(ftCR.tpts),
                                vk:                 str(ftCR.vk),
                                lk:                 str(ftCR.lk),
                                vk1:                str(ftCR.vk1),
                                lk1:                str(ftCR.lk1),
                                rated_burden:       mapBurden(ftCR.rated_burden),
                                extended_burden:    ftCR.extended_burden ?? false,
                                burden:             mapBurden(ftCR.burden),
                                burdenCos:          str(ftCR.burdenCos),
                                operatingBurden:    mapBurden(ftCR.operatingBurden),
                                operatingBurdenCos: str(ftCR.operatingBurdenCos),
                                core_index:         ftCR.core_index ?? null,
                                ratio_error:        mapBurden(ftCR.ratio_error),
                            },
                        },

                        mainTap: {
                            data: (core.mainTap?.data || []).map(mt => ({
                                table:       mapTapTable(mt.table),
                                classRating: mapSmallClassRating(mt.classRating),
                            })),
                        },

                        interTap: {
                            data: (core.interTap?.data || []).map(it => ({
                                table:       mapTapTable(it.table),
                                classRating: mapSmallClassRating(it.classRating),
                            })),
                        },
                    }
                }),
            },

            locationId:          dto.locationId          || null,
            psrId:               dto.psrId               || null,
            assetPsrId:          assetPsrId,
            assetInfoId:         assetInfoId,
            productAssetModelId: productAssetModelId,
            lifecycleDateId:     lifecycleDateId,
            attachmentId:        dto.attachmentId        || null,
        },
    }
}

const isBlank = (v) => v === null || v === undefined || v === ''
    || v === 'null' || v === 'undefined' || v === 'NaN'
 
const num = (val) => {
    if (isBlank(val)) return null
    const n = parseFloat(val)
    return Number.isNaN(n) ? null : n
}
 
const str = (val) => {
    if (isBlank(val)) return null
    return String(val)
}

const mapVb = (vb) => {
    if (vb && typeof vb === 'object') {
        return {
            mrid:  vb.mrid || null,
            value: mapBurden(vb),
            unit:  vb.unit || null,
        }
    }

    return {
        mrid:  null,
        value: {
            mrid:  null,
            value: num(vb),
            unit:  null,
        },
        unit:  null,
    }
}

const toNumberOrNull = (val) => {
    if (isBlank(val)) return null
    const n = Number(val)
    return Number.isNaN(n) ? null : n
}

const textT = (val) => {
    if (isBlank(val)) return null
    const text = String(val).trim()
    return text ? text : null
}

const idT = (val) => {
    const text = textT(val)
    return text && /^\d+$/.test(text) ? Number(text) : null
}

const joinUnit = (unit) => {
    const text = textT(unit)
    return text ? text.replace('|', '') : null
}

const classToServer = (value) => {
    const text = textT(value)
    if (!text) return null
    return '_' + text.replace(/\./g, '_').replace(/^_+/, '')
}
