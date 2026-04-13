/* eslint-disable */
import CurrentTransformerDto from "@/views/Dto/CurrentTransformer";
import CoreDto from "@/views/Dto/CurrentTransformer/CTConfiguration/CoreDto";
import TableDto from "@/views/Dto/CurrentTransformer/CTConfiguration/TableDto";
import ClassRatingDto from "@/views/Dto/CurrentTransformer/CTConfiguration/ClassRatingDto";
import ClassRatingSmallDto from "@/views/Dto/CurrentTransformer/CTConfiguration/ClassRatingSmallDto";
import uuid from "@/utils/uuid";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ASSET_TYPE_MAP = {
    'INDUCTIVE': 'inductive',
    'ROGOWSKI':  'rogowski',
}

// "_0_5" → "0.5", "_5P" → "5P"
const convertClass = (classStr) => {
    if (!classStr) return ''
    return classStr.replace(/^_/, '').replace(/_(?=\d)/g, '.')
}

const str = (val) => (val !== null && val !== undefined) ? String(val) : ''

const makeVoltage = (val, unit) => ({
    mrid:  uuid.newUuid(),
    value: str(val),
    unit:  unit || 'kV',
})

const makeCurrent = (val) => ({
    mrid:  uuid.newUuid(),
    value: str(val),
    unit:  'A',
})

const makeVA = (val, unit) => ({
    mrid:  uuid.newUuid(),
    value: str(val),
    unit:  unit || 'VA',
})

// ─── Mapper ──────────────────────────────────────────────────────────────────

export const mapServerToDto = (serverData) => {
    const dto = new CurrentTransformerDto();
    if (!serverData) return dto;

    const assetInfo  = serverData.assetInfo                      || {};
    const core       = serverData.currentTransformerCoreResponse || {};
    const tapsList   = serverData.currentTransformerTapsResponses || [];

    // 1. IDs
    dto.assetInfoId         = assetInfo.id     ? String(assetInfo.id)       : uuid.newUuid()
    dto.psrId               = assetInfo.ownerId ? String(assetInfo.ownerId) : null
    dto.productAssetModelId = uuid.newUuid()
    dto.lifecycleDateId     = uuid.newUuid()
    dto.assetPsrId          = uuid.newUuid()

    // 2. Properties
    dto.properties.mrid               = null
    dto.properties.asset_type         = ASSET_TYPE_MAP[core.assetType] || (core.assetType || '').toLowerCase()
    dto.properties.type               = dto.properties.asset_type
    dto.properties.manufacturer_type  = ''
    dto.properties.kind               = 'Current transformer'
    dto.properties.serial_no          = assetInfo.serialNo         || ''
    dto.properties.manufacturer       = assetInfo.manufacturerName || ''
    dto.properties.country_of_origin  = assetInfo.countryName      || ''
    dto.properties.apparatus_id       = assetInfo.apparatusId      || ''
    dto.properties.comment            = assetInfo.description      || ''
    dto.properties.manufacturing_year = assetInfo.manufacturingYear ? String(assetInfo.manufacturingYear) : ''

    // 3. Ratings
    dto.ratings.standard = { mrid: '', value: (core.standard || '').replace(/_/g, ''), unit: 'string' }

    const freqValue = str(core.ratedFrequency)
    dto.ratings.rated_frequency = {
        mrid:  uuid.newUuid(),
        value: ['50', '60', '16.7'].includes(freqValue) ? freqValue : 'Custom',
        unit:  core.ratedFrequencyUnit || 'Hz',
    }
    if (!['50', '60', '16.7'].includes(freqValue)) {
        dto.ratings.rated_frequency_custom = freqValue
    }

    dto.ratings.primary_winding_count = str(core.primaryWinding)
    dto.ratings.um_rms                = makeVoltage(core.um,                core.uUnit)
    dto.ratings.u_withstand_rms       = makeVoltage(core.uWithstand,        core.uUnit)
    dto.ratings.u_lightning_peak      = makeVoltage(core.uLightning,        core.uUnit)
    dto.ratings.icth                  = { mrid: uuid.newUuid(), value: str(core.icth),   unit: core.icthUnit || 'A' }
    dto.ratings.idyn_peak             = { mrid: uuid.newUuid(), value: str(core.idyn),   unit: core.iUnit    || 'A' }
    dto.ratings.ith_rms               = { mrid: uuid.newUuid(), value: str(core.ith),    unit: core.iUnit    || 'A' }
    dto.ratings.ith_duration          = { mrid: uuid.newUuid(), value: str(core.duration), unit: core.durationUnit || 's' }
    dto.ratings.system_voltage        = makeVoltage(core.systemVoltage,     core.uUnit)
    dto.ratings.system_voltage_type   = { mrid: '', value: '', unit: 'string' }
    dto.ratings.bil                   = makeVoltage(core.ratedInsulationlevel, core.uUnit)
    dto.ratings.rating_factor         = str(core.ratingFactor)
    dto.ratings.rating_factor_temp    = { mrid: uuid.newUuid(), value: '', unit: 'degC' }

    // 4. CT Configuration
    const numberCore = core.numberCore || 1
    dto.ctConfiguration.cores  = String(numberCore)
    dto.ctConfiguration.dataCT = []

    const tapsPerCore = Math.ceil(tapsList.length / numberCore)

    for (let coreIdx = 0; coreIdx < numberCore; coreIdx++) {
        const coreTaps = tapsList.slice(coreIdx * tapsPerCore, (coreIdx + 1) * tapsPerCore)
        const coreDto  = new CoreDto()
        coreDto.mrid   = uuid.newUuid()

        const fullTaps = coreTaps.filter(t => t.type === 'Full tap')
        const mainTaps = coreTaps.filter(t => t.type === 'Main tap')

        const tapsCount   = Math.min(mainTaps.length + 2, 6)
        coreDto.taps      = String(tapsCount)
        coreDto.commonTap = '1'

        // ─── Full tap ───────────────────────────────────────────────────────
        if (fullTaps.length > 0) {
            const ft = fullTaps[0]

            // ✅ Luôn sinh UUID nếu server trả về null
            coreDto.fullTap.table.mrid  = ft.id ? String(ft.id) : uuid.newUuid()
            coreDto.fullTap.table.name  = ft.name  || ''
            coreDto.fullTap.table.inUse = ft.inUse ?? true
            coreDto.fullTap.table.type  = 'fulltap'
            coreDto.fullTap.table.ipn   = makeCurrent(ft.ipn)
            coreDto.fullTap.table.isn   = makeCurrent(ft.isn)

            // ✅ lowercase để match UI options
            coreDto.fullTap.classRating.mrid            = uuid.newUuid()
            coreDto.fullTap.classRating.app             = (ft.application || '').toLowerCase() || 'chooseApp'
            coreDto.fullTap.classRating.class           = convertClass(ft.class_)
            coreDto.fullTap.classRating.fs              = str(ft.fs)
            coreDto.fullTap.classRating.alf             = str(ft.alf)
            coreDto.fullTap.classRating.ts              = str(ft.ts)
            coreDto.fullTap.classRating.ek              = str(ft.ek)
            coreDto.fullTap.classRating.le              = str(ft.le)
            coreDto.fullTap.classRating.e1              = str(ft.e1)
            coreDto.fullTap.classRating.le1             = str(ft.le1)
            coreDto.fullTap.classRating.val             = str(ft.val)
            coreDto.fullTap.classRating.lal             = str(ft.lal)
            coreDto.fullTap.classRating.tp              = str(ft.tp)
            coreDto.fullTap.classRating.ktd             = str(ft.ktd)
            coreDto.fullTap.classRating.duty            = ft.duty     || ''
            coreDto.fullTap.classRating.kx              = str(ft.kx)
            coreDto.fullTap.classRating.k               = str(ft.k)
            coreDto.fullTap.classRating.kssc            = str(ft.kssc)
            coreDto.fullTap.classRating.vk              = str(ft.vk)
            coreDto.fullTap.classRating.lk              = str(ft.lk)
            coreDto.fullTap.classRating.vk1             = str(ft.vk1)
            coreDto.fullTap.classRating.lk1             = str(ft.lk1)
            coreDto.fullTap.classRating.t1              = str(ft.t1)
            coreDto.fullTap.classRating.tal1            = str(ft.tal1)
            coreDto.fullTap.classRating.extended_burden = ft.extendedBurden ?? false
            coreDto.fullTap.classRating.burdenCos       = str(ft.burdenCos)
            coreDto.fullTap.classRating.operatingBurdenCos = str(ft.operatingBurdenCos)
            coreDto.fullTap.classRating.core_index      = coreIdx + 1
            coreDto.fullTap.classRating.wr  = { mrid: uuid.newUuid(), value: str(ft.re),  unit: ft.reUnit   || 'Ω'  }
            coreDto.fullTap.classRating.vb  = { mrid: uuid.newUuid(), value: str(ft.vb),  unit: ft.vbUnit   || 'V'  }
            coreDto.fullTap.classRating.rated_burden     = makeVA(ft.ratedBurden,    ft.burdenUnit)
            coreDto.fullTap.classRating.burden           = makeVA(ft.burden,         ft.burdenUnit)
            coreDto.fullTap.classRating.operatingBurden  = makeVA(ft.operatingBurden, ft.burdenUnit)
        }

        // ─── Main taps ──────────────────────────────────────────────────────
        coreDto.mainTap.data = mainTaps.map(mt => {
            const table     = new TableDto()
            table.mrid      = mt.id ? String(mt.id) : uuid.newUuid()  // ✅ sinh UUID nếu null
            table.name      = mt.name  || ''
            table.inUse     = mt.inUse ?? false
            table.type      = 'maintap'
            table.ipn       = makeCurrent(mt.ipn)
            table.isn       = makeCurrent(mt.isn)

            const classRating               = new ClassRatingSmallDto()
            classRating.mrid                = uuid.newUuid()
            classRating.rated_burden        = makeVA(mt.ratedBurden,    mt.burdenUnit)
            classRating.burden              = makeVA(mt.burden,         mt.burdenUnit)
            classRating.burdenCos           = str(mt.burdenCos)
            classRating.operatingBurden     = makeVA(mt.operatingBurden, mt.burdenUnit)
            classRating.operatingBurdenCos  = str(mt.operatingBurdenCos)
            classRating.extended_burden     = mt.extendedBurden ?? false

            return { table, classRating }
        })

        // ─── Inter taps — server không trả về ──────────────────────────────
        coreDto.interTap.data = []

        dto.ctConfiguration.dataCT.push(coreDto)
    }

    return dto;
};