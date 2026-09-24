/* eslint-disable */
import { ptmToCtJobDto } from '@/utils/ptm/ptmToCtJobDto'
import { ptmToCircuitBreakerJobDto } from '@/utils/ptm/ptmToCircuitBreakerJobDto'
import { ptmToTransformerJobDto } from '@/utils/ptm/ptmToTransformerJobDto'
import * as CurrentTransformerJobMapper from '@/views/Mapping/CurrentTransformerJob'
import * as CircuitBreakerJobMapper from '@/views/Mapping/CircuitBreakerJob'
import * as TransformerJobMapper from '@/views/Mapping/TransformerJob'
import {
    applyPtmToCtAssetDto,
    ensureCurrentTransformerDtoIds,
    buildCtConfigurationFromPtm,
} from '@/utils/ptm/ptmToCtAssetDto'
import CurrentTransformerDto from '@/views/Dto/CurrentTransformer'
import CTConfigurationDto from '@/views/Dto/CurrentTransformer/CTConfiguration'
import CoreDto from '@/views/Dto/CurrentTransformer/CTConfiguration/CoreDto'
import uuid from '@/utils/uuid'
import * as CurrentTransformerMapper from '@/views/Mapping/CurrentTransformer'
import CircuitBreakerDto from '@/views/Dto/CircuitBreaker'
import CircuitBreakerEntity from '@/views/Flatten/CircuitBreaker'
import * as CircuitBreakerMapper from '@/views/Mapping/Breaker'
import TransformerDto from '@/views/Dto/Transformer'
import TransformerEntity from '@/views/Flatten/Transformer'
import * as TransformerMapper from '@/views/Mapping/Transformer'
import SubstationDto from '@/views/Dto/Substation'
import { mapDtoToEntity as substationDtoToEntity } from '@/views/Mapping/Substation'
import VoltageLevelDto from '@/views/Dto/VoltageLevel'
import { volDtoToVolEntity } from '@/views/Mapping/VoltageLevel'
import BayDto from '@/views/Dto/Bay'
import {
    applyPtmToCircuitBreakerAssetDto,
    ensureCircuitBreakerDtoIds,
} from '@/utils/ptm/ptmToCircuitBreakerAssetDto'
import {
    applyPtmToTransformerAssetDto,
    ensureTransformerDtoIds,
} from '@/utils/ptm/ptmToTransformerAssetDto'
import { applyPtmTimingAssessment } from '@/utils/ptm/ptmTimingAssessment'
import { startLoading } from '@/utils/loading'

/** Node được phép import vào. Xem giải thích ở handleImportPtmFromContext. */
const PTM_TARGET_MODES = ['organisation', 'substation', 'voltageLevel', 'bay', 'asset']

const PTM_ASSET_KINDS = {
    CurrentTransformer: 'Current transformer',
    CircuitBreaker: 'Circuit breaker',
    Transformer: 'Transformer',
}

const PTM_ASSET_TYPES_BY_KIND = Object.keys(PTM_ASSET_KINDS).reduce((out, type) => {
    out[PTM_ASSET_KINDS[type].toLowerCase()] = type
    return out
}, {})

const str = (v) => (v === null || v === undefined) ? '' : String(v)

/**
 * IMPORT FILE .ptm CỦA OMICRON vào một node đã chọn trên cây.
 *
 * ─── LUẬT ĐÃ CHỐT ───────────────────────────────────────────────────────────
 *
 *   - Chọn node đích TRƯỚC khi mở file. Cấp node phải khớp cấp cao nhất trong file:
 *     Organisation -> Substation -> Voltage level -> Bay -> Asset -> Job/Test.
 *   - Nhập trọn nhánh mà job tham chiếu. Bản kho và snapshot của job trong PTM được gộp,
 *     không tạo hai Substation hoặc hai Asset cho cùng một thiết bị thực.
 *   - Chỉ nhập bài test có sẵn ở client; bài không có thì bỏ qua — nhưng LIỆT KÊ ĐỦ.
 *   - Đối chiếu trùng thiết bị theo (serial, manufacturer, manufacturer type):
 *       trùng ngay tại node đang import  -> cho chọn ghi đè hoặc bỏ qua
 *       trùng ở nhánh khác               -> báo, KHÔNG cho import
 *
 * ─── VÌ SAO ĐỌC FILE RỒI MỚI HỎI ────────────────────────────────────────────
 *
 * Đọc trước, xem trước, rồi mới ghi. Người dùng thấy được số dòng, số đường cong, bài nào
 * bị bỏ và trùng ở đâu TRƯỚC khi có gì chạm vào CSDL — thay vì bấm import rồi đọc một
 * bảng lỗi và tự đoán mình vừa mất cái gì.
 */

export default {
    data() {
        return {
            ptmDialogVisible: false,
            ptmPreview: null,
            ptmDup: null,
            /** Job trùng TÊN dưới đúng asset đích, hoặc null. */
            ptmJobDup: null,
            ptmJobDupError: '',
            ptmRaw: null,
            ptmTargetNode: null,
            ptmHierarchyPlan: null,
            ptmFileName: '',
            ptmImporting: false,
        }
    },
    methods: {
        getPtmJobAdapter(assetType) {
            if (assetType === 'CircuitBreaker') {
                return {
                    build: ptmToCircuitBreakerJobDto,
                    read: mrid => window.electronAPI.getCircuitBreakerJobByMrid(mrid),
                    entityToDto: CircuitBreakerJobMapper.JobEntityToDto,
                    dtoToEntity: CircuitBreakerJobMapper.jobDtoToEntity,
                    save: (oldEntity, entity) => window.electronAPI.insertCircuitBreakerJob(oldEntity, entity),
                    hasExcitationCurves: false,
                    hasMotorCurrentWaveforms: true,
                    hasTimingTraces: true,
                }
            }
            if (assetType === 'Transformer') {
                return {
                    build: ptmToTransformerJobDto,
                    read: mrid => window.electronAPI.getTransformerJobByMrid(mrid),
                    entityToDto: TransformerJobMapper.JobEntityToDto,
                    dtoToEntity: TransformerJobMapper.jobDtoToEntity,
                    save: (oldEntity, entity) => window.electronAPI.insertTransformerJob(oldEntity, entity),
                    hasExcitationCurves: false,
                    hasMotorCurrentWaveforms: false,
                    hasTimingTraces: false,
                }
            }
            return {
                build: ptmToCtJobDto,
                read: mrid => window.electronAPI.getCurrentTransformerJobByMrid(mrid),
                entityToDto: CurrentTransformerJobMapper.JobEntityToDto,
                dtoToEntity: CurrentTransformerJobMapper.jobDtoToEntity,
                save: (oldEntity, entity) => window.electronAPI.insertCurrentTransformerJob(oldEntity, entity),
                hasExcitationCurves: true,
                hasMotorCurrentWaveforms: false,
            }
        },

        /** Vào từ menu chuột phải hoặc thanh công cụ. */
        async handleImportPtmFromContext(node) {
            return this.handleImportMeasurementFileFromContext(node, 'importPtm', 'PTM')
        },

        async handleImportCpxpertFromContext(node) {
            return this.handleImportMeasurementFileFromContext(node, 'importCpxpert', 'CPXpert')
        },

        async handleImportMeasurementFileFromContext(node, apiMethod, sourceLabel) {
            const api = window.electronAPI
            if (!api || !api[apiMethod]) {
                this.$message.error(`${sourceLabel} import is not available in this build`)
                return
            }

            const selected = node || (this.selectedNodes && this.selectedNodes[this.selectedNodes.length - 1])
            if (!selected || !PTM_TARGET_MODES.includes(selected.mode)) {
                this.$message.warning('Select the destination node in the Client tree before importing the file')
                return
            }

            const result = await api[apiMethod]()
            if (!result || !result.success) {
                if (result && result.message !== 'Import cancelled') {
                    this.$message.error(result ? result.message : `Could not read ${sourceLabel} file`)
                }
                return
            }

            this.ptmRaw = result.data
            this.ptmFileName = String(result.data.filePath || '').split(/[\\/]/).pop()
            const plan = this.buildPtmHierarchyPlan(result.data)
            const targetError = await this.validatePtmTarget(selected, plan, sourceLabel)
            if (targetError) {
                this.$message.warning(targetError)
                this.ptmRaw = null
                this.ptmFileName = ''
                return
            }

            this.ptmHierarchyPlan = plan
            await this.preparePtmPreviewForTarget(selected)
        },

        getPtmSourceAsset(ptm, target = null) {
            const job = ptm.job || {}
            const jobAsset = (ptm.assets || []).find(asset => asset.exportId === job.jobAssetId)
            const stockAsset = (ptm.assets || []).find(asset => asset.exportId === job.assetId)
            const merged = this.mergePtmAsset(jobAsset, stockAsset)
            if (merged.type || !target || target.mode !== 'asset') return merged

            const selectedKind = str(target.asset).trim().toLowerCase()
            return {
                type: PTM_ASSET_TYPES_BY_KIND[selectedKind] || '',
                serialNumber: '',
                manufacturer: '',
                manufacturerType: '',
                raw: {},
            }
        },

        normalizePtmName(value) {
            return str(value).trim().toLowerCase()
        },

        ptmNodeName(node) {
            return node && (node.apparatus_id || node.aliasName || node.name || node.serial_no || '')
        },

        mergePtmRecord(primary, fallback) {
            const out = { ...(fallback || {}), ...(primary || {}) }
            Object.keys(out).forEach(key => {
                if ((out[key] === '' || out[key] === null || out[key] === undefined) && fallback) {
                    out[key] = fallback[key]
                }
            })
            return out
        },

        buildPtmHierarchyPlan(ptm) {
            const job = ptm.job || {}
            const assets = ptm.assets || []
            const sourceAsset = this.getPtmSourceAsset(ptm)
            const assetLocationId = sourceAsset.locationId || ''
            const locationId = job.locationId || assetLocationId
            const substations = ptm.substations || []
            const jobSubstation = substations.find(item => item.exportId === locationId)
            const globalSubstation = jobSubstation && jobSubstation.globalId
                ? substations.find(item => item.exportId === jobSubstation.globalId)
                : null
            const substation = this.mergePtmRecord(
                jobSubstation || substations.find(item => item.isRealWorldLocation) || substations[0],
                globalSubstation
            )

            const voltageLevels = ptm.voltageLevels || []
            const voltageLevel = voltageLevels.find(item =>
                item.substationId && [substation.exportId, substation.globalId].includes(item.substationId)
            ) || voltageLevels[0] || null
            const bays = ptm.bays || []
            const bay = bays.find(item =>
                (voltageLevel && item.voltageLevelId === voltageLevel.exportId) ||
                (item.substationId && [substation.exportId, substation.globalId].includes(item.substationId))
            ) || bays[0] || null
            const hasSourceAsset = !!(sourceAsset && sourceAsset.type && assets.some(item =>
                item.exportId === job.assetId || item.exportId === job.jobAssetId
            ))

            return {
                substation: substation && substation.name ? substation : null,
                voltageLevel,
                bay,
                hasSourceAsset,
                sourceAsset,
            }
        },

        ptmNamesMatch(node, item) {
            return !!(node && item && this.normalizePtmName(this.ptmNodeName(node)) === this.normalizePtmName(item.name))
        },

        async findPtmChildByName(target, plan) {
            const api = window.electronAPI
            const nameOf = item => this.normalizePtmName(item && (item.name || item.alias_name || item.aliasName))
            let result = null
            let wanted = null

            if (target.mode === 'organisation' && plan.substation && api.getSubstationsInOrganisationForUser) {
                wanted = plan.substation.name
                result = await api.getSubstationsInOrganisationForUser(target.mrid, this.$store.state.user.user_id)
            } else if (target.mode === 'substation' && plan.voltageLevel && api.getVoltageLevelBySubstationId) {
                wanted = plan.voltageLevel.name
                result = await api.getVoltageLevelBySubstationId(target.mrid)
            } else if (target.mode === 'substation' && plan.bay && !plan.voltageLevel && api.getBayByVoltageBySubstationId) {
                wanted = plan.bay.name
                result = await api.getBayByVoltageBySubstationId(null, target.mrid)
            } else if (target.mode === 'voltageLevel' && plan.bay && api.getBayByVoltageBySubstationId) {
                wanted = plan.bay.name
                result = await api.getBayByVoltageBySubstationId(target.mrid, null)
            }

            const rows = result && result.success && Array.isArray(result.data) ? result.data : []
            return wanted ? rows.find(item => nameOf(item) === this.normalizePtmName(wanted)) : null
        },

        async validatePtmTarget(target, plan, sourceLabel) {
            const label = sourceLabel || 'measurement'
            const sourceAsset = plan.sourceAsset || {}
            const assetKind = PTM_ASSET_KINDS[sourceAsset.type]

            if (target.mode === 'asset') {
                if (!plan.hasSourceAsset) return null
                if (!assetKind || this.normalizePtmName(target.asset) !== this.normalizePtmName(assetKind)) {
                    return `This ${label} file contains a ${assetKind || sourceAsset.type || 'different asset type'}; select that exact asset`
                }
                const targetSerial = str(target.serial_no || target.serial_number).trim()
                const sourceSerial = str(sourceAsset.serialNumber).trim()
                if (targetSerial && sourceSerial && this.normalizePtmName(targetSerial) !== this.normalizePtmName(sourceSerial)) {
                    return `This file belongs to asset serial "${sourceSerial}"; select that exact asset`
                }
                return null
            }
            if (!plan.hasSourceAsset) {
                return `This ${label} file contains only job/test data; select the destination asset first`
            }

            if (target.mode === 'bay') {
                if (plan.bay && this.ptmNamesMatch(target, plan.bay)) return null
                if (!plan.substation && !plan.voltageLevel && !plan.bay) return null
                return `The file contains hierarchy information; select its matching Bay or a valid parent node`
            }
            if (target.mode === 'voltageLevel') {
                if (plan.voltageLevel && this.ptmNamesMatch(target, plan.voltageLevel)) return null
                if (!plan.substation && plan.bay) return null
                return `The file contains hierarchy information; select its matching Voltage level or parent Substation`
            }
            if (target.mode === 'substation') {
                if (plan.substation && !this.ptmNamesMatch(target, plan.substation)) {
                    return `This file contains Substation "${plan.substation.name}"; select that Substation or its parent Organisation`
                }
                const existingChild = await this.findPtmChildByName(target, plan)
                if (existingChild) {
                    const childType = plan.voltageLevel ? 'Voltage level' : 'Bay'
                    return `${childType} "${existingChild.name}" already exists; select that exact node before importing`
                }
                return null
            }
            if (target.mode === 'organisation') {
                if (!plan.substation) {
                    return plan.voltageLevel || plan.bay
                        ? `This file starts below Organisation; select the destination Substation`
                        : `This file contains an asset; select the destination Substation or Bay`
                }
                const existingChild = await this.findPtmChildByName(target, plan)
                if (existingChild) {
                    return `Substation "${existingChild.name}" already exists; select that exact Substation before importing`
                }
                return null
            }
            return 'Select a valid destination node in the Client tree'
        },

        async preparePtmPreviewForTarget(target) {
            this.ptmTargetNode = target
            const ready = await this.buildPtmPreview()
            if (ready) this.ptmDialogVisible = true
        },

        /** Dựng phần xem trước + chạy đối chiếu trùng. Không ghi gì. */
        async buildPtmPreview() {
            const ptm = this.ptmRaw
            const target = this.ptmTargetNode
            const sourceLabel = ptm.sourceLabel || 'PTM'

            // Thiết bị: lấy bản của JOB làm gốc (thông số đúng lúc thử), rồi lấp field
            // rỗng bằng bản kho. Kiểm trên file mẫu: hai bản chỉ khác 3/55 thẻ, và
            // `AssetSystemCode` chỉ có ở bản kho — chọn một bản là mất nó.
            const job = ptm.job || {}
            const jobAsset = (ptm.assets || []).find(a => a.exportId === job.jobAssetId)
            const stockAsset = (ptm.assets || []).find(a => a.exportId === job.assetId)
            const asset = this.getPtmSourceAsset(ptm, target)
            const assetKind = PTM_ASSET_KINDS[asset.type]
            const hierarchy = this.ptmHierarchyPlan || this.buildPtmHierarchyPlan(ptm)

            if (!assetKind) {
                this.$message.error(`${sourceLabel} asset type "${asset.type || 'unknown'}" is not supported yet`)
                return false
            }
            if (target.mode === 'asset' && str(target.asset).trim().toLowerCase() !== assetKind.toLowerCase()) {
                this.$message.error(`This ${sourceLabel} file contains a ${assetKind}, but the selected asset is ${target.asset || 'another type'}`)
                return false
            }

            const api = window.electronAPI
            this.ptmDup = null
            this.ptmJobDup = null
            this.ptmJobDupError = ''

            // ─── BƯỚC 1: TÌM THIẾT BỊ TRÙNG ─────────────────────────────
            //
            // PHẢI làm trước mọi thứ khác. Thiết bị đích quyết định job sẽ gắn vào đâu, mà
            // "gắn vào đâu" lại quyết định phải đối chiếu job trùng ở đâu.
            //
            // Bản đầu tôi làm ngược: dựng job trước, đối chiếu job trước, tìm thiết bị sau.
            // Hệ quả là khi đứng ở BAY, job được gắn vào một mrid vừa sinh ra — chưa tồn
            // tại, dưới đó tất nhiên không có job nào — nên không bao giờ báo trùng, và
            // import hai lần ra hai job y hệt nhau.
            if (hierarchy.hasSourceAsset && api && api.findPtmDuplicateAsset) {
                const rs = await api.findPtmDuplicateAsset(
                    {
                        serialNumber: asset.serialNumber,
                        manufacturer: asset.manufacturer,
                        manufacturerType: asset.manufacturerType,
                        kind: assetKind,
                    },
                    this.$store.state.user.user_id,
                    // "Cùng nhánh" tính theo node CHỨA thiết bị: đứng ở asset thì là cha
                    // của nó, đứng ở bay/substation thì chính là node đang đứng.
                    target.mode === 'asset' ? target.parentId : target.mrid
                )
                if (rs && rs.success) this.ptmDup = rs.data
                else console.warn('[ptm] doi chieu trung thiet bi khong chay duoc:', rs && rs.message)
            }

            const duplicateAssets = []
                .concat((this.ptmDup && this.ptmDup.inTarget) || [])
                .concat((this.ptmDup && this.ptmDup.elsewhere) || [])
            if (duplicateAssets.length > 0 && target.mode !== 'asset') {
                const duplicate = duplicateAssets[0]
                this.$message.warning(
                    `Asset "${duplicate.name || duplicate.serial_number || asset.serialNumber}" already exists; ` +
                    'select that exact asset before importing'
                )
                return false
            }
            if (duplicateAssets.length > 0 && target.mode === 'asset' &&
                !duplicateAssets.some(item => item.mrid === target.mrid)) {
                this.$message.warning('The asset represented by this file already exists elsewhere; select that exact asset')
                return false
            }

            // ─── BƯỚC 2: CHỐT THIẾT BỊ ĐÍCH ─────────────────────────────
            //
            // Hai trường hợp: chọn đúng asset đã có, hoặc tạo asset mới dưới hierarchy
            // được chọn/tạo từ file. Asset trùng ở bất kỳ đâu đã bị chặn phía trên và bắt
            // người dùng chọn chính node đó.
            //
            //   đứng ở asset                  -> chính nó
            //   đứng ở node cha hợp lệ        -> tạo mới, sinh mrid ngay tại đây
            //
            // `creatingAsset` phải tính theo THỰC TẾ có tạo hay không, không phải theo chỗ
            // đứng — đó là chỗ bản đầu sai.
            let assetMrid
            let creatingAsset = false
            if (target.mode === 'asset') {
                assetMrid = target.mrid
            } else {
                assetMrid = uuid.newUuid()
                creatingAsset = true
            }

            const jobAdapter = this.getPtmJobAdapter(asset.type)
            const {
                jobDto,
                curvePoints,
                kneePoints,
                motorCurrentPoints = {},
                timingTraces = {},
                timingAssessmentImports = [],
                skipped,
            } = jobAdapter.build(ptm, assetMrid)
            const operatingMechanism = asset.type === 'CircuitBreaker'
                ? this.resolvePtmOperatingMechanism(ptm, jobAsset, stockAsset)
                : null

            // ─── BƯỚC 3: TÌM JOB TRÙNG TÊN dưới ĐÚNG thiết bị đích ──────
            //
            // Bỏ qua khi sắp tạo thiết bị mới: bên dưới một thiết bị chưa tồn tại thì không
            // thể có job nào.
            //
            // Đối chiếu theo TÊN, không xét bên trong có bài gì — đúng tiêu chí đã chốt.
            // So sánh bỏ khoảng trắng đầu cuối và không phân biệt hoa thường: cùng một job
            // mà lệch một dấu cách thì vẫn là trùng, mà đúng chỗ đó thì mắt không thấy.
            if (!creatingAsset && api && api.getOldWorkByAssetId) {
                const rs = await api.getOldWorkByAssetId(assetMrid)
                const wanted = str(ptm.job.name).trim().toLowerCase()
                if (rs && rs.success && Array.isArray(rs.data) && wanted) {
                    const matches = rs.data.filter(j => str(j && j.name).trim().toLowerCase() === wanted)
                    if (matches.length > 0) {
                        const duplicateJobs = []

                        // Cần đọc tới cấp test ngay ở bước preview. Chỉ biết "trùng job"
                        // thì không đủ để người dùng quyết định test nào giữ, test nào thay.
                        for (const j of matches) {
                            const summary = {
                                mrid: j.mrid,
                                name: j.name,
                                executionDate: j.execution_date || '',
                                testedBy: j.tested_by || '',
                                tests: [],
                                loadError: '',
                            }
                            try {
                                const detail = await jobAdapter.read(j.mrid)
                                if (!detail || !detail.success || !detail.data) {
                                    throw new Error((detail && detail.message) || 'job data not found')
                                }
                                const dto = jobAdapter.entityToDto(detail.data)
                                const occurrences = {}
                                summary.tests = (dto.testList || []).map(test => {
                                    const code = test.testTypeCode
                                    occurrences[code] = (occurrences[code] || 0) + 1
                                    return {
                                        mrid: test.mrid,
                                        name: test.name || test.testTypeName || code,
                                        testTypeCode: code,
                                        testTypeName: test.testTypeName || code,
                                        occurrence: occurrences[code],
                                    }
                                })
                            } catch (error) {
                                summary.loadError = error.message || 'could not read job tests'
                                console.error('[ptm] doc chi tiet job trung that bai:', j.mrid, error)
                            }
                            duplicateJobs.push(summary)
                        }

                        this.ptmJobDup = duplicateJobs
                    }
                } else if (rs && !rs.success) {
                    // Không đối chiếu được thì NÓI RA. Im lặng ở đây nghĩa là người dùng
                    // tưởng không trùng và tạo thêm một job trùng tên nữa.
                    console.warn('[ptm] doc job cua thiet bi that bai:', rs.message)
                    this.ptmJobDupError = rs.message || 'could not read existing jobs'
                }
            }

            // Cấu hình lõi/tap chỉ dựng khi TẠO MỚI. Ghi đè lên thiết bị đã có thì không
            // đụng vào phần này — người dùng có thể đã sửa tay, và PTM không phải nguồn
            // đầy đủ hơn.
            let coreConfig = null
            if (creatingAsset && asset.type === 'CurrentTransformer') {
                const ctTest = ptm.ctConfigurationSource ||
                    (ptm.tests || []).find(t => t.type === 'CTExcitationTest')
                coreConfig = buildCtConfigurationFromPtm(ctTest, CTConfigurationDto, CoreDto)
            }

            this.ptmPreview = {
                sourceLabel: ptm.sourceLabel || 'PTM',
                assetType: asset.type,
                assetKind,
                job: ptm.job,
                asset,
                operatingMechanism,
                jobDto,
                curvePoints,
                kneePoints,
                motorCurrentPoints,
                timingTraces,
                timingAssessmentImports,
                skipped,
                creatingAsset,
                assetMrid,
                coreConfig,
                hierarchy,
                hierarchyPath: [
                    hierarchy.substation && hierarchy.substation.name,
                    hierarchy.voltageLevel && hierarchy.voltageLevel.name,
                    hierarchy.bay && hierarchy.bay.name,
                    asset.apparatusId || asset.serialNumber,
                    ptm.job && ptm.job.name,
                ].filter(Boolean).join(' / '),
                tests: jobDto.testList.map((t, importIndex) => {
                    const tables = (t.data && t.data.table) || {}
                    const rows = Object.keys(tables).reduce((all, key) => {
                        return all.concat(Array.isArray(tables[key]) ? tables[key] : [])
                    }, [])
                    const rowIds = rows.map(r => r.mrid)
                    const curves = rowIds.filter(id => curvePoints[id]).length
                    const points = rowIds.reduce((sum, id) => sum + ((curvePoints[id] || []).length), 0)
                    const knees = rowIds.reduce((sum, id) => sum + ((kneePoints[id] || []).length), 0)
                    const waveforms = rowIds.filter(id => motorCurrentPoints[id]).length
                    const waveformPoints = rowIds.reduce(
                        (sum, id) => sum + ((motorCurrentPoints[id] || []).length), 0
                    )
                    const traces = Array.isArray(timingTraces[t.mrid]) ? timingTraces[t.mrid].length : 0
                    const tracePoints = (timingTraces[t.mrid] || []).reduce(
                        (sum, trace) => sum + ((trace.points || []).length), 0
                    )
                    const sfraSeries = rows.filter(row => {
                        const cell = row && row.points_json
                        return cell && String(cell.value || '').trim() !== ''
                    }).length
                    const sfraPoints = rows.reduce((sum, row) => {
                        const cell = row && row.points_json
                        if (!cell || !cell.value) return sum
                        try {
                            const parsed = JSON.parse(String(cell.value))
                            return sum + (Array.isArray(parsed) ? parsed.length : 0)
                        } catch (error) {
                            return sum
                        }
                    }, 0)
                    return {
                        importIndex,
                        importedMrid: t.mrid,
                        testTypeCode: t.testTypeCode,
                        name: t.name || t.testTypeName || t.testTypeCode,
                        rows: rows.length,
                        curves,
                        points,
                        knees,
                        waveforms,
                        waveformPoints,
                        traces,
                        tracePoints,
                        series: curves + waveforms + traces + sfraSeries,
                        dataPoints: points + waveformPoints + tracePoints + sfraPoints,
                    }
                }),
            }
            return true
        },

        /**
         * Bản job làm gốc, bản kho lấp chỗ trống.
         *
         * Không phải "chọn một bản": file mẫu cho thấy `AssetSystemCode` chỉ có ở bản kho,
         * nên chọn bản job đơn thuần là mất nó. Lấp chỗ trống thì không mất gì, và vẫn ưu
         * tiên thông số tại thời điểm đo khi hai bên lệch nhau.
         */
        mergePtmAsset(jobAsset, stockAsset) {
            const base = jobAsset || stockAsset || {}
            const fill = stockAsset || {}
            const out = { ...base }
            for (const key of Object.keys(fill)) {
                if (key === 'raw') continue
                if (out[key] === '' || out[key] === undefined || out[key] === null) out[key] = fill[key]
            }
            out.raw = { ...(fill.raw || {}), ...(base.raw || {}) }
            return out
        },

        resolvePtmOperatingMechanism(ptm, jobAsset, stockAsset) {
            const assets = ptm.assets || []
            const mechanismId = (asset) => {
                const field = asset && asset.raw && asset.raw.OperatingMechanismId
                return field ? str(field.value) : ''
            }
            const findById = (id) => assets.find(a => a.type === 'OperatingMechanism' && a.exportId === id)

            const jobMechanism = findById(mechanismId(jobAsset))
            const stockMechanism = findById(mechanismId(stockAsset))
            return this.mergePtmAsset(jobMechanism, stockMechanism)
        },

        handlePtmCancel() {
            this.ptmDialogVisible = false
            this.ptmTargetNode = null
            this.ptmHierarchyPlan = null
            this.ptmPreview = null
            this.ptmDup = null
            this.ptmJobDup = null
            this.ptmJobDupError = ''
            this.ptmRaw = null
            this.ptmFileName = ''
        },

        /**
         * Ghi thật.
         *
         * @param {object} actions quyết định ở cấp asset, job và từng test khi merge.
         *
         *   jobAction    chỉ có nghĩa khi có job trùng tên dưới thiết bị đích.
         */
        async handlePtmConfirm(actions) {
            const { jobAction, targetJobMrid, testDecisions } = actions || {}
            const preview = this.ptmPreview
            const target = this.ptmTargetNode
            if (!preview || !target) return
            const jobAdapter = this.getPtmJobAdapter(preview.assetType)

            // Bỏ qua job thì KHÔNG ghi gì cả — không có việc "bỏ qua job nhưng vẫn cập nhật
            // thiết bị", vì cả hộp thoại này chỉ tồn tại để đưa một job vào.
            const jobDup = this.ptmJobDup || []
            if (jobDup.length > 0 && jobAction === 'skip') {
                this.$message.info('Import cancelled — a job with the same name already exists')
                this.handlePtmCancel()
                return
            }

            this.ptmImporting = true
            const reporter = startLoading(this, {
                action: 'import',
                text: `Importing ${preview.jobDto.testList.length} test(s)...`,
                type: 'heavy',
            })

            try {
                let dto = this.clonePtmValue(preview.jobDto)
                let oldEntity = null
                let mergedTestCount = dto.testList.length
                let mergeSummary = null

                // Merge chỉ thay đổi testList. Mọi thông tin Overview, attachment, testing
                // equipment và các test không được chọn của job cũ đều được giữ nguyên.
                if (jobDup.length > 0 && jobAction === 'merge') {
                    const targetMrid = targetJobMrid || jobDup[0].mrid
                    const old = await jobAdapter.read(targetMrid)
                    if (!old || !old.success || !old.data) {
                        throw new Error(`Could not read the existing job to merge: ${(old && old.message) || 'not found'}`)
                    }

                    oldEntity = old.data
                    mergeSummary = this.mergePtmTestsIntoJob(
                        jobAdapter.entityToDto(old.data),
                        preview.jobDto,
                        testDecisions || []
                    )
                    dto = mergeSummary.dto
                    mergedTestCount = mergeSummary.importedCount
                    if (mergedTestCount === 0) {
                        throw new Error(`No ${preview.sourceLabel || 'PTM'} test was selected to add or overwrite`)
                    }
                }

                // ─── Thiết bị TRƯỚC, job SAU ────────────────────────────────
                //
                // Mọi nhánh chạm vào thiết bị đều chạy trước khi ghi job: hỏng ở bước này
                // thì chưa có job nào được tạo, người dùng thử lại từ đầu mà không để lại
                // job mồ côi trỏ vào một thiết bị không tồn tại.
                //
                // TRÙNG NGAY TRONG NHÁNH ĐANG IMPORT thì KHÔNG đẻ thiết bị thứ hai — dù
                // đang đứng ở bay. Cùng serial + hãng + mã hãng nghĩa là cùng một cái CT
                // ngoài hiện trường; tạo thêm một node nữa là tự tay dựng dữ liệu trùng mà
                // sau này phải đi gộp bằng tay.
                //
                // Thiết bị đích đã chốt ở bước xem trước (`preview.assetMrid`) và job cũng
                // đã trỏ vào đó. KHÔNG tính lại ở đây: hai nơi cùng quyết định một chuyện
                // thì sớm muộn cũng lệch, mà lệch kiểu này là job gắn sai thiết bị.
                let assetParentTarget = target

                if (preview.creatingAsset) {
                    reporter.progress('Creating hierarchy from the imported file...')
                    assetParentTarget = await this.materializePtmHierarchy(target, preview.hierarchy)
                    if (!assetParentTarget || !['substation', 'bay'].includes(assetParentTarget.mode)) {
                        throw new Error('Could not resolve a Substation or Bay for the imported asset')
                    }
                }

                let assetUpdate = null
                // Import on an asset starts at JOB level. The selected asset profile is
                // never overwritten by data from the PTM file in this mode.
                if (target.mode !== 'asset' && preview.creatingAsset) {
                    reporter.progress(`Creating asset from ${preview.sourceLabel || 'PTM'} file...`)
                    if (preview.assetType === 'CircuitBreaker') {
                        assetUpdate = await this.createCircuitBreakerAssetFromPtm(assetParentTarget, preview)
                    } else if (preview.assetType === 'Transformer') {
                        assetUpdate = await this.createTransformerAssetFromPtm(assetParentTarget, preview)
                    } else {
                        assetUpdate = await this.createCtAssetFromPtm(assetParentTarget, preview)
                    }
                }

                let timingAssessmentUpdate = { appliedCount: 0 }
                if (preview.assetType === 'CircuitBreaker') {
                    const selectedAssessmentImports = this.getSelectedPtmTimingAssessments(
                        preview,
                        mergeSummary
                    )
                    if (selectedAssessmentImports.length > 0) {
                        reporter.progress('Applying O Timing assessment settings...')
                        timingAssessmentUpdate = await this.applyPtmTimingAssessments(
                            assetParentTarget,
                            preview,
                            assetUpdate,
                            selectedAssessmentImports
                        )
                    }
                }

                // ─── GHI ĐÈ JOB TRÙNG TÊN: GIỮ NGUYÊN mrid CŨ ────────────────
                //
                // Dùng lại mrid job cũ và truyền entity cũ THẬT làm `old_entity`. Tầng lưu
                // đã so hai bên rồi thêm bản ghi mới, xoá bản ghi không còn — đúng ngữ nghĩa
                // "thêm dữ liệu phát sinh thì sinh thêm mrid, ngược lại thì bỏ bớt".
                //
                // VÌ SAO GIỮ mrid: server nhận diện job theo mrid. Xoá rồi tạo mới thì bản
                // trên server thành một job khác, và bản cũ nằm lại đó không ai cập nhật.
                //
                // Phải đọc entity cũ từ CSDL chứ không dựng khung rỗng: `old_entity` rỗng
                // nghĩa là "không có gì để xoá", nên các bài test cũ sẽ nằm lại và job có
                // hai bộ dữ liệu chồng nhau.
                let overwritingJob = null
                if (jobDup.length > 0 && jobAction === 'overwrite') {
                    reporter.progress('Reading the existing job...')
                    const overwriteMrid = targetJobMrid || jobDup[0].mrid
                    const old = await jobAdapter.read(overwriteMrid)
                    if (!old || !old.success || !old.data) {
                        throw new Error(
                            `Could not read the existing job to overwrite it: ${(old && old.message) || 'not found'}`
                        )
                    }
                    overwritingJob = old.data
                    dto.properties.mrid = overwriteMrid
                    oldEntity = overwritingJob
                }

                this.ensurePtmProcedureAssets(dto, preview.assetMrid)
                const entity = jobAdapter.dtoToEntity(dto)

                // Đường cong đi CÙNG entity, vào cùng một transaction với bảng test. Hai
                // đường ghi riêng thì bảng lưu xong mà đường cong hỏng, không ai chặn.
                if (jobAdapter.hasExcitationCurves && jobAction === 'merge' && mergeSummary) {
                    entity.ctExcitationPoints = this.mergePtmPointMaps(
                        oldEntity.ctExcitationPoints || {},
                        preview.curvePoints || {},
                        mergeSummary.finalRowIds,
                        mergeSummary.importedRowIds
                    )
                    entity.ctExcitationKneePoints = this.mergePtmPointMaps(
                        oldEntity.ctExcitationKneePoints || {},
                        preview.kneePoints || {},
                        mergeSummary.finalRowIds,
                        mergeSummary.importedRowIds
                    )
                } else if (jobAdapter.hasExcitationCurves) {
                    entity.ctExcitationPoints = preview.curvePoints
                    entity.ctExcitationKneePoints = preview.kneePoints || {}
                }

                if (jobAdapter.hasMotorCurrentWaveforms && jobAction === 'merge' && mergeSummary) {
                    entity.cbMotorCurrentPoints = this.mergePtmPointMaps(
                        oldEntity.cbMotorCurrentPoints || {},
                        preview.motorCurrentPoints || {},
                        mergeSummary.finalRowIds,
                        mergeSummary.importedRowIds
                    )
                } else if (jobAdapter.hasMotorCurrentWaveforms) {
                    entity.cbMotorCurrentPoints = preview.motorCurrentPoints || {}
                }

                if (jobAdapter.hasTimingTraces && jobAction === 'merge' && mergeSummary) {
                    entity.cbTimingTraces = this.mergePtmWorkTaskMaps(
                        oldEntity.cbTimingTraces || {},
                        preview.timingTraces || {},
                        mergeSummary.finalWorkTaskIds,
                        mergeSummary.importedWorkTaskIdMap
                    )
                } else if (jobAdapter.hasTimingTraces) {
                    entity.cbTimingTraces = preview.timingTraces || {}
                }

                reporter.progress(
                    jobAction === 'merge'
                        ? `Merging selected ${preview.sourceLabel || 'PTM'} tests into the existing job...`
                        : (overwritingJob ? 'Overwriting the existing job...' : 'Writing job and tests...')
                )

                // Job mới thì `old_entity` rỗng — không có gì để so mà xoá.
                const entityBeforeSave = oldEntity || overwritingJob || this.buildEmptyOldEntity(entity)
                const rs = await jobAdapter.save(entityBeforeSave, entity)

                if (!rs || !rs.success) {
                    throw new Error((rs && rs.message) || 'Insert job failed')
                }

                // ─── GHI QUYỀN SỞ HỮU CHO JOB ────────────────────────────────
                //
                // BẮT BUỘC, không phải bước phụ. Mọi truy vấn cây đều join
                // `user_identified_object`; job không có chủ thì nằm trong CSDL mà KHÔNG
                // hiện trên cây, và bấm refresh bao nhiêu lần cũng vô ích vì bản thân câu
                // truy vấn đã loại nó ra.
                //
                // Luồng lưu job bình thường (JobView/*/mixin) gọi đúng dòng này ngay sau
                // khi insert thành công. Import bỏ qua nó thì tạo ra job vô hình — báo
                // thành công mà không thấy đâu, đúng thứ vừa xảy ra.
                if (window.electronAPI.ensureUserOwnership) {
                    const own = await window.electronAPI.ensureUserOwnership(
                        this.$store.state.user.user_id, dto.properties.mrid
                    )
                    if (!own || !own.success) {
                        // Nói ra chứ không nuốt: job đã nằm trong CSDL rồi, nhưng sẽ không
                        // hiện ra. Im lặng ở đây là để người dùng đi import lại và tạo
                        // thêm một job vô hình nữa.
                        console.error('[ptm] ghi quyen so huu cho job that bai:', own && own.message)
                        throw new Error(
                            `Job was saved but ownership could not be recorded, so it will not appear in the tree: ${(own && own.message) || 'unknown error'}`
                        )
                    }
                }

                const importedCurvePoints = mergeSummary
                    ? this.filterPtmPointMap(preview.curvePoints || {}, mergeSummary.importedRowIds)
                    : (preview.curvePoints || {})
                const importedKneePoints = mergeSummary
                    ? this.filterPtmPointMap(preview.kneePoints || {}, mergeSummary.importedRowIds)
                    : (preview.kneePoints || {})
                const curveCount = Object.keys(importedCurvePoints).length
                const pointCount = Object.values(importedCurvePoints).reduce((s, a) => s + a.length, 0)
                const kneeCount = Object.values(importedKneePoints).reduce((s, a) => s + a.length, 0)
                const importedMotorCurrentPoints = mergeSummary
                    ? this.filterPtmPointMap(preview.motorCurrentPoints || {}, mergeSummary.importedRowIds)
                    : (preview.motorCurrentPoints || {})
                const waveformCount = Object.keys(importedMotorCurrentPoints).length
                const waveformPointCount = Object.values(importedMotorCurrentPoints)
                    .reduce((sum, points) => sum + points.length, 0)
                const importedTimingTraces = mergeSummary
                    ? this.filterPtmWorkTaskMap(
                        preview.timingTraces || {}, Object.keys(mergeSummary.importedWorkTaskIdMap)
                    )
                    : (preview.timingTraces || {})
                const timingTraceCount = Object.values(importedTimingTraces)
                    .reduce((sum, traces) => sum + traces.length, 0)
                const timingTracePointCount = Object.values(importedTimingTraces)
                    .reduce((sum, traces) => sum + traces.reduce(
                        (traceSum, trace) => traceSum + ((trace.points || []).length), 0
                    ), 0)
                let assetNote = ''
                if (assetUpdate && assetUpdate.created) {
                    if (preview.assetType === 'CurrentTransformer') {
                        const cores = ((preview.coreConfig && preview.coreConfig.config) || {}).cores || '?'
                        assetNote = `, new asset created (${assetUpdate.appliedCount} nameplate field(s), ${cores} core(s))`
                    } else {
                        assetNote = `, new asset created (${assetUpdate.appliedCount} asset field(s))`
                    }
                } else if (assetUpdate && assetUpdate.appliedCount > 0) {
                    assetNote = `, ${assetUpdate.appliedCount} asset field(s) updated`
                }
                const verb = jobAction === 'merge'
                    ? 'Merged into the existing job:'
                    : (overwritingJob ? 'Overwrote the existing job with' : 'Imported')
                const curveNote = jobAdapter.hasExcitationCurves
                    ? `, ${curveCount} curve(s), ${pointCount} points, ${kneeCount} knee point(s)`
                    : ''
                const waveformNote = jobAdapter.hasMotorCurrentWaveforms && waveformCount > 0
                    ? `, ${waveformCount} Motor Current waveform(s), ${waveformPointCount} points`
                    : ''
                const timingNote = jobAdapter.hasTimingTraces && timingTraceCount > 0
                    ? `, ${timingTraceCount} timing trace(s), ${timingTracePointCount} points`
                    : ''
                const timingAssessmentNote = timingAssessmentUpdate.appliedCount > 0
                    ? `, ${timingAssessmentUpdate.appliedCount} assessment limit value(s)`
                    : ''
                this.$message.success(
                    `${verb} ${mergedTestCount} ${preview.sourceLabel || 'PTM'} test(s)${curveNote}${waveformNote}${timingNote}${timingAssessmentNote}${assetNote}`
                )

                // Trường bị bỏ khi ghi đè (lệch đơn vị) là thứ người dùng CẦN biết — họ vừa
                // chọn "ghi đè" và có quyền tưởng là mọi thứ đã được cập nhật.
                if (assetUpdate && assetUpdate.unitMismatches.length > 0) {
                    this.$notify.warning({
                        title: 'Some asset fields were not filled in',
                        message: assetUpdate.unitMismatches.map(s => `${s.field}: ${s.reason}`).join('\n'),
                        duration: 0,
                    })
                }

                // Ghi chú về cấu hình lõi (số lõi khai báo lệch số lõi đo được, số đầu dây
                // ngoài khoảng 2-6…). Không phải lỗi, nhưng là chỗ người dùng nên nhìn lại.
                if (assetUpdate && assetUpdate.notes && assetUpdate.notes.length > 0) {
                    this.$notify.info({
                        title: 'Check the core configuration',
                        message: assetUpdate.notes.join('\n'),
                        duration: 0,
                    })
                }

                this.ptmDialogVisible = false
                this.ptmPreview = null
                this.ptmDup = null
                this.ptmJobDup = null
                this.ptmJobDupError = ''
                this.ptmRaw = null
                this.ptmHierarchyPlan = null
                this.ptmTargetNode = null
                this.ptmFileName = ''

                // Nạp lại nhánh để job mới hiện ra ngay.
                this.$set(target, '_childrenFetched', false)
                if (!target.expanded) this.$set(target, 'expanded', true)
                if (typeof this.fetchChildren === 'function') await this.fetchChildren(target)
            } catch (error) {
                console.error('[ptm] import that bai:', error)
                this.$message.error(`Import failed: ${(error && error.message) || 'unknown error'}`)
            } finally {
                this.ptmImporting = false
                await reporter.close()
            }
        },

        async ensurePtmOwnership(mrid) {
            const api = window.electronAPI
            const user = this.$store.state.user || {}
            if (!mrid || !user.user_id || !api.ensureUserOwnership) return
            const result = await api.ensureUserOwnership(user.user_id, mrid)
            if (!result || !result.success) {
                throw new Error(`The imported node was created but ownership could not be recorded: ${(result && result.message) || 'unknown error'}`)
            }
        },

        ptmMeasurementParts(measurement) {
            const rawUnit = str(measurement && measurement.unit).trim()
            const match = rawUnit.match(/^([numkMGT]?)([A-Za-z%]+)$/)
            return {
                value: str(measurement && measurement.value),
                multiplier: match ? match[1] : '',
                unit: match ? match[2] : (rawUnit || 'V'),
            }
        },

        async createPtmSubstation(parent, source) {
            const api = window.electronAPI
            const user = this.$store.state.user || {}
            const dto = new SubstationDto()
            dto.subsId = uuid.newUuid()
            dto.organisationId = parent.mrid
            dto.organisationPsrId = uuid.newUuid()
            dto.userIdentifiedObjectId = uuid.newUuid()
            dto.userId = user.user_id || ''
            dto.userName = user.username || user.user_name || ''
            dto.name = source.name || 'Imported substation'
            dto.aliasName = dto.name
            dto.type = 'Substation'
            dto.psrTypeId = uuid.newUuid()
            dto.locationName = source.name || ''
            dto.street = source.street || ''
            dto.city = source.city || ''
            dto.state_or_province = source.stateOrProvince || ''
            dto.postal_code = source.postalCode || ''
            dto.country = source.country || ''
            dto.personName = source.contactPerson || ''
            dto.phoneNumber = source.phoneNumber || ''
            dto.email = source.email || ''
            dto.comment = source.comment || ''

            const hasTown = dto.city || dto.state_or_province || dto.country
            if (dto.street) dto.streetDetailId = uuid.newUuid()
            if (hasTown) dto.townDetailId = uuid.newUuid()
            if (dto.streetDetailId || dto.townDetailId || dto.postal_code) dto.streetAddressId = uuid.newUuid()
            if (dto.streetAddressId || dto.locationName) dto.locationId = uuid.newUuid()
            if (dto.email) dto.electronicAddressId = uuid.newUuid()
            if (dto.phoneNumber) dto.telephoneNumberId = uuid.newUuid()
            if (dto.personName) {
                dto.personId = uuid.newUuid()
                dto.personSubstationId = uuid.newUuid()
            }
            if (dto.locationId) dto.organisationLocationId = uuid.newUuid()
            if (dto.personId) dto.organisationPersonId = uuid.newUuid()

            const entity = substationDtoToEntity(dto)
            const result = await api.insertSubstationEntity(entity)
            if (!result || !result.success) {
                throw new Error(`Could not create Substation "${dto.name}": ${(result && result.message) || 'unknown error'}`)
            }
            await this.ensurePtmOwnership(dto.subsId)
            return { mrid: dto.subsId, parentId: parent.mrid, mode: 'substation', name: dto.name }
        },

        async createPtmVoltageLevel(parent, source) {
            const dto = new VoltageLevelDto()
            dto.voltageLevelId = uuid.newUuid()
            dto.substationId = parent.mrid
            dto.name = source.name || 'Imported voltage level'
            dto.comment = source.comment || ''

            const base = this.ptmMeasurementParts(source.baseVoltage)
            const high = this.ptmMeasurementParts(source.highVoltageLimit)
            const low = this.ptmMeasurementParts(source.lowVoltageLimit)
            if (base.value) {
                dto.baseVoltageId = uuid.newUuid()
                dto.nominalVoltageId = uuid.newUuid()
                dto.base_voltage_value = base.value
                dto.base_voltage_multiplier = base.multiplier
                dto.base_voltage_unit = base.unit
            }
            if (high.value) {
                dto.highVoltageLimitId = uuid.newUuid()
                dto.high_voltage_limit_value = high.value
                dto.high_voltage_limit_multiplier = high.multiplier
                dto.high_voltage_limit_unit = high.unit
            }
            if (low.value) {
                dto.lowVoltageLimitId = uuid.newUuid()
                dto.low_voltage_limit_value = low.value
                dto.low_voltage_limit_multiplier = low.multiplier
                dto.low_voltage_limit_unit = low.unit
            }

            const result = await window.electronAPI.insertVoltageLevelEntity(volDtoToVolEntity(dto))
            if (!result || !result.success) {
                throw new Error(`Could not create Voltage level "${dto.name}": ${(result && result.message) || 'unknown error'}`)
            }
            await this.ensurePtmOwnership(dto.voltageLevelId)
            return { mrid: dto.voltageLevelId, parentId: parent.mrid, mode: 'voltageLevel', name: dto.name }
        },

        async createPtmBay(parent, source) {
            const dto = new BayDto()
            dto.mrid = uuid.newUuid()
            dto.bayId = dto.mrid
            dto.name = source.name || 'Imported bay'
            dto.aliasName = source.aliasName || dto.name
            dto.breaker_configuration = source.breakerConfiguration || ''
            dto.bus_bar_configuration = source.busBarConfiguration || ''
            if (parent.mode === 'voltageLevel') dto.voltage_level = parent.mrid
            else dto.substation = parent.mrid

            const result = await window.electronAPI.insertBayEntity(dto)
            if (!result || !result.success) {
                throw new Error(`Could not create Bay "${dto.name}": ${(result && result.message) || 'unknown error'}`)
            }
            await this.ensurePtmOwnership(dto.mrid)
            return { mrid: dto.mrid, parentId: parent.mrid, mode: 'bay', name: dto.name }
        },

        async materializePtmHierarchy(target, hierarchy) {
            if (!hierarchy || target.mode === 'asset') return target
            let current = target

            if (current.mode === 'organisation') {
                if (!hierarchy.substation) throw new Error('The file has no Substation to create under this Organisation')
                current = await this.createPtmSubstation(current, hierarchy.substation)
            }
            if (current.mode === 'substation' && hierarchy.voltageLevel) {
                current = await this.createPtmVoltageLevel(current, hierarchy.voltageLevel)
            }
            if (['substation', 'voltageLevel'].includes(current.mode) && hierarchy.bay) {
                current = await this.createPtmBay(current, hierarchy.bay)
            }
            return current
        },

        async createCircuitBreakerAssetFromPtm(target, preview) {
            const api = window.electronAPI
            const dto = new CircuitBreakerDto()
            dto.properties.mrid = preview.assetMrid
            dto.psrId = target.mrid

            const mapped = applyPtmToCircuitBreakerAssetDto(
                dto,
                preview.asset,
                preview.operatingMechanism
            )
            if (!str(dto.properties.serial_no).trim()) {
                throw new Error('The PTM file has no serial number — cannot create a new Circuit Breaker without one')
            }
            if (!str(dto.properties.apparatus_id).trim()) {
                dto.properties.apparatus_id = str(dto.properties.serial_no).trim() || 'Circuit breaker from PTM'
            }

            ensureCircuitBreakerDtoIds(dto)
            const entity = CircuitBreakerMapper.mapDtoToEntity(dto)
            const rs = await api.insertBreakerEntity(new CircuitBreakerEntity(), entity)
            if (!rs || !rs.success) {
                throw new Error(`Could not create Circuit Breaker: ${(rs && rs.message) || 'unknown error'}`)
            }

            if (api.ensureUserOwnership) {
                const own = await api.ensureUserOwnership(this.$store.state.user.user_id, dto.properties.mrid)
                if (!own || !own.success) {
                    throw new Error('Circuit Breaker was created but ownership could not be recorded')
                }
            }

            return {
                created: true,
                dto,
                appliedCount: mapped.applied.length,
                unitMismatches: mapped.skipped,
            }
        },

        async createTransformerAssetFromPtm(target, preview) {
            const api = window.electronAPI
            const dto = new TransformerDto()
            dto.properties.mrid = preview.assetMrid
            dto.psrId = target.mrid

            const mapped = applyPtmToTransformerAssetDto(dto, preview.asset)
            if (!str(dto.properties.serial_no).trim()) {
                throw new Error(`The ${preview.sourceLabel || 'PTM'} file has no serial number — cannot create a new Transformer without one`)
            }
            if (!str(dto.properties.apparatus_id).trim()) {
                dto.properties.apparatus_id = str(dto.properties.serial_no).trim() || `Transformer from ${preview.sourceLabel || 'PTM'}`
            }

            ensureTransformerDtoIds(dto)
            const entity = TransformerMapper.transformerDtoToEntity(dto)
            const rs = await api.insertTransformerEntity(new TransformerEntity(), entity)
            if (!rs || !rs.success) {
                throw new Error(`Could not create Transformer: ${(rs && rs.message) || 'unknown error'}`)
            }

            if (api.ensureUserOwnership) {
                const ownership = await api.ensureUserOwnership(
                    this.$store.state.user.user_id, dto.properties.mrid
                )
                if (!ownership || !ownership.success) {
                    throw new Error('Transformer was created but ownership could not be recorded')
                }
            }

            return {
                created: true,
                dto,
                appliedCount: mapped.applied.length,
                unitMismatches: mapped.skipped,
            }
        },

        async applyPtmTransformerOverwrite(target, ptmAsset) {
            const api = window.electronAPI
            const existing = await api.getTransformerEntityByMrid(target.mrid, target.parentId)
            if (!existing || !existing.success || !existing.data) {
                throw new Error(`Could not read the existing Transformer: ${(existing && existing.message) || 'not found'}`)
            }

            const oldEntity = existing.data
            const dto = TransformerMapper.transformerEntityToDto(oldEntity)
            const mapped = applyPtmToTransformerAssetDto(dto, ptmAsset)
            ensureTransformerDtoIds(dto)
            const newEntity = TransformerMapper.transformerDtoToEntity(dto)
            const rs = await api.insertTransformerEntity(oldEntity, newEntity)
            if (!rs || !rs.success) {
                throw new Error(`Could not update Transformer: ${(rs && rs.message) || 'unknown error'}`)
            }

            return {
                created: false,
                dto,
                appliedCount: mapped.applied.length,
                unitMismatches: mapped.skipped,
            }
        },

        getSelectedPtmTimingAssessments(preview, mergeSummary) {
            const imports = Array.isArray(preview.timingAssessmentImports)
                ? preview.timingAssessmentImports
                : []
            if (!mergeSummary) return imports

            const importedWorkTasks = mergeSummary.importedWorkTaskIdMap || {}
            return imports.filter(item => Object.prototype.hasOwnProperty.call(
                importedWorkTasks,
                item.workTaskMrid
            ))
        },

        async applyPtmTimingAssessments(target, preview, assetUpdate, imports) {
            const api = window.electronAPI
            let dto = assetUpdate && assetUpdate.dto ? assetUpdate.dto : null

            if (!dto) {
                const duplicate = ((this.ptmDup && this.ptmDup.inTarget) || [])[0] || {}
                const psrId = target.mode === 'asset'
                    ? target.parentId
                    : (duplicate.psr_id || duplicate.parentId || target.mrid)
                const existing = await api.getBreakerEntityByMrid(preview.assetMrid, psrId)
                if (!existing || !existing.success || !existing.data) {
                    throw new Error(
                        `Could not read the Circuit Breaker assessment settings: ${(existing && existing.message) || 'not found'}`
                    )
                }
                dto = CircuitBreakerMapper.mapEntityToDto(existing.data)
            }

            let appliedCount = 0
            const appliedPaths = []
            for (const item of imports) {
                const merged = applyPtmTimingAssessment(dto.assessmentLimits, item.assessment)
                appliedCount += merged.appliedCount
                appliedPaths.push(...merged.appliedPaths)
            }
            if (appliedCount === 0) return { appliedCount, appliedPaths }

            ensureCircuitBreakerDtoIds(dto)
            const result = await api.updateTimingAssessmentLimits({
                assetId: preview.assetMrid,
                assessmentLimits: dto.assessmentLimits,
            })
            if (!result || !result.success) {
                throw new Error(
                    `Could not save O Timing assessment settings: ${(result && result.message) || 'unknown error'}`
                )
            }
            return { appliedCount, appliedPaths }
        },

        async applyPtmCircuitBreakerOverwrite(target, preview) {
            const api = window.electronAPI
            const existing = await api.getBreakerEntityByMrid(target.mrid, target.parentId)
            if (!existing || !existing.success || !existing.data) {
                throw new Error(`Could not read the existing Circuit Breaker: ${(existing && existing.message) || 'not found'}`)
            }

            const oldEntity = existing.data
            const dto = CircuitBreakerMapper.mapEntityToDto(oldEntity)
            const mapped = applyPtmToCircuitBreakerAssetDto(
                dto,
                preview.asset,
                preview.operatingMechanism
            )
            ensureCircuitBreakerDtoIds(dto)
            const newEntity = CircuitBreakerMapper.mapDtoToEntity(dto)
            const rs = await api.insertBreakerEntity(oldEntity, newEntity)
            if (!rs || !rs.success) {
                throw new Error(`Could not update Circuit Breaker: ${(rs && rs.message) || 'unknown error'}`)
            }

            return {
                created: false,
                dto,
                appliedCount: mapped.applied.length,
                unitMismatches: mapped.skipped,
            }
        },

        /**
         * TẠO THIẾT BỊ MỚI từ file PTM, đặt dưới node đang đứng (bay hoặc substation).
         *
         * Dùng đúng đường ghi của màn hình tạo CT bằng tay: dựng `CurrentTransformerDto`,
         * map sang entity, gọi `insertCurrentTransformerEntity`, rồi ghi quyền sở hữu.
         * Không mở đường ghi riêng cho import — thiết bị tạo từ PTM và thiết bị nhập tay
         * phải giống hệt nhau về cấu trúc, nếu không thì mọi thứ đọc chúng phải xử lý hai
         * dạng.
         *
         * `mrid` đã sinh từ lúc xem trước và job cũng đang trỏ vào nó, nên ở đây KHÔNG
         * sinh lại.
         */
        async createCtAssetFromPtm(target, preview) {
            const api = window.electronAPI
            const dto = new CurrentTransformerDto()

            dto.properties.mrid = preview.assetMrid
            // Liên kết node cha đi qua `psrId` -> assetPsr.psr_id. `properties` KHÔNG có
            // trường psr_id nào; gán vào đó thì mapper bỏ qua và thiết bị mọc ở gốc cây.
            dto.psrId = target.mrid

            const { applied, skipped } = applyPtmToCtAssetDto(dto, preview.asset)

            // Serial là thứ chống trùng dựa vào; không có thì thiết bị tạo ra sẽ không bao
            // giờ đối chiếu được với lần import sau. Dừng lại thay vì tạo một node mà mai
            // này thành bản sao câm.
            if (!str(dto.properties.serial_no).trim()) {
                throw new Error('The PTM file has no serial number — cannot create a new asset without one')
            }

            // TÊN HIỂN THỊ TRÊN CÂY chính là `apparatus_id` (mapper: asset.name =
            // properties.apparatus_id). Ánh xạ nameplate đã lấy nó từ ApparatusId, lùi về
            // AssetSystemCode. Cả hai rỗng thì ghép tên gọi thực tế, vì một node không tên
            // trên cây thì không ai tìm ra.
            if (!str(dto.properties.apparatus_id).trim()) {
                const bits = [dto.properties.manufacturer, dto.properties.manufacturer_type, dto.properties.serial_no]
                dto.properties.apparatus_id = bits.map(b => str(b).trim()).filter(Boolean).join(' ') || 'CT from PTM'
            }

            if (preview.coreConfig && preview.coreConfig.config) {
                dto.ctConfiguration = preview.coreConfig.config
            }

            ensureCurrentTransformerDtoIds(dto)
            const entity = CurrentTransformerMapper.mapDtoToEntity(dto)
            const empty = this.buildEmptyOldEntity(entity)
            const rs = await api.insertCurrentTransformerEntity(empty, entity)
            if (!rs || !rs.success) {
                throw new Error(`Could not create asset: ${(rs && rs.message) || 'unknown error'}`)
            }

            // Không có dòng này thì thiết bị tồn tại nhưng KHÔNG thuộc về ai, và mọi truy
            // vấn cây (đều join qua user_identified_object) sẽ không thấy nó.
            if (api.ensureUserOwnership) {
                const own = await api.ensureUserOwnership(this.$store.state.user.user_id, dto.properties.mrid)
                if (!own || !own.success) {
                    console.error('[ptm] ghi quyen so huu that bai:', own && own.message)
                    throw new Error('Asset was created but ownership could not be recorded')
                }
            }

            console.log('[ptm] da tao thiet bi moi', dto.properties.mrid, '| truong nameplate:', applied.length)
            return {
                created: true,
                appliedCount: applied.length,
                unitMismatches: [
                    ...skipped.filter(s => s.reason.indexOf('unit mismatch') === 0),
                    ...((preview.coreConfig && preview.coreConfig.mismatches) || []),
                ],
                notes: (preview.coreConfig && preview.coreConfig.notes) || [],
            }
        },

        /**
         * Ghi đè thông số thiết bị từ file PTM lên asset đang có trên cây.
         *
         * Đọc DTO hiện tại → áp những trường PTM biết → ghi lại. KHÔNG dựng DTO mới:
         * DTO asset CT có cả `ctConfiguration` với 4 lõi và các bảng tap mà PTM không mang
         * theo — dựng mới rồi ghi đè là xoá sạch phần người dùng đã nhập tay.
         *
         * @returns {{ appliedCount, unitMismatches }} để báo lại cho người dùng
         */
        async applyPtmAssetOverwrite(target, ptmAsset) {
            const api = window.electronAPI
            const existing = await api.getCurrentTransformerEntityByMrid(target.mrid, target.parentId)
            if (!existing || !existing.success || !existing.data) {
                // Không đọc được thiết bị thì KHÔNG ghi bừa. Báo và đi tiếp với job —
                // mất phần cập nhật nameplate còn hơn ghi đè lên một entity không rõ.
                console.error('[ptm] khong doc duoc asset de ghi de:', existing && existing.message)
                this.$message.warning('Could not read the existing asset — nameplate was not updated')
                return { appliedCount: 0, unitMismatches: [] }
            }

            const clientEntity = existing.data
            const dto = CurrentTransformerMapper.mapEntityToDto(clientEntity)
            const { applied, skipped } = applyPtmToCtAssetDto(dto, ptmAsset)

            if (applied.length === 0) {
                return { appliedCount: 0, unitMismatches: skipped.filter(s => s.reason.indexOf('unit mismatch') === 0) }
            }

            const newEntity = CurrentTransformerMapper.mapDtoToEntity(dto)
            const rs = await api.insertCurrentTransformerEntity(clientEntity, newEntity)
            if (!rs || !rs.success) {
                throw new Error(`Could not update asset: ${(rs && rs.message) || 'unknown error'}`)
            }

            console.log('[ptm] da cap nhat', applied.length, 'truong cua thiet bi:', applied)
            return {
                appliedCount: applied.length,
                unitMismatches: skipped.filter(s => s.reason.indexOf('unit mismatch') === 0),
            }
        },

        /**
         * `old_entity` rỗng nhưng GIỮ cấu trúc.
         *
         * `insertCurrentTransformerJobEntity` so `entity` với `old_entity` để biết cái gì
         * cần xoá, và nó gọi `.map` trên các mảng — truyền `{}` là nổ ngay. Rỗng hoá mọi
         * mảng, giữ nguyên khung.
         */
        buildEmptyOldEntity(entity) {
            const out = {}
            for (const key of Object.keys(entity)) {
                const value = entity[key]
                if (Array.isArray(value)) out[key] = []
                else if (value && typeof value === 'object') out[key] = { ...value }
                else out[key] = value
            }
            return out
        },

        clonePtmValue(value) {
            return JSON.parse(JSON.stringify(value))
        },

        collectPtmTestRowIds(test) {
            const tables = (test && test.data && test.data.table) || {}
            return Object.keys(tables).reduce((ids, key) => {
                const rows = Array.isArray(tables[key]) ? tables[key] : []
                return ids.concat(rows.map(row => row && row.mrid).filter(Boolean))
            }, [])
        },

        /**
         * Lấy job cũ làm nền và xử lý từng test PTM độc lập.
         * - loại chưa tồn tại: tự động thêm;
         * - keep: giữ test cũ, bỏ bản PTM;
         * - overwrite: thay đúng test được chọn nhưng giữ work-task MRID cũ;
         * - duplicate: nối thêm một work task cùng loại với MRID mới từ bộ chuyển PTM.
         */
        mergePtmTestsIntoJob(existingDto, importedDto, decisions) {
            const dto = this.clonePtmValue(existingDto)
            const importedTests = this.clonePtmValue(importedDto.testList || [])
            const decisionMap = {}
            for (const decision of decisions || []) {
                decisionMap[decision.importIndex] = decision
            }

            const finalTests = Array.isArray(dto.testList) ? dto.testList : []
            const originalExistingTests = finalTests.slice()
            const importedRowIds = []
            const importedWorkTaskIdMap = {}
            let importedCount = 0

            importedTests.forEach((importedTest, importIndex) => {
                const sourceWorkTaskMrid = importedTest.mrid
                const matches = originalExistingTests.filter(test => test.testTypeCode === importedTest.testTypeCode)
                if (matches.length === 0) {
                    finalTests.push(importedTest)
                    importedWorkTaskIdMap[sourceWorkTaskMrid] = importedTest.mrid
                    importedRowIds.push(...this.collectPtmTestRowIds(importedTest))
                    importedCount += 1
                    return
                }

                const decision = decisionMap[importIndex] || { action: 'keep' }
                if (decision.action === 'duplicate') {
                    finalTests.push(importedTest)
                    importedWorkTaskIdMap[sourceWorkTaskMrid] = importedTest.mrid
                    importedRowIds.push(...this.collectPtmTestRowIds(importedTest))
                    importedCount += 1
                    return
                }

                if (decision.action !== 'overwrite') return

                const target = matches.find(test => test.mrid === decision.targetMrid) || matches[0]
                const targetIndex = finalTests.findIndex(test => test.mrid === target.mrid)
                // Work-task MRID là định danh của hạng mục test. Giữ nó để đây là update,
                // còn dataset/value từ PTM có MRID mới và sẽ thay dữ liệu cũ trong transaction.
                importedTest.mrid = target.mrid
                importedWorkTaskIdMap[sourceWorkTaskMrid] = target.mrid
                finalTests.splice(targetIndex, 1, importedTest)
                importedRowIds.push(...this.collectPtmTestRowIds(importedTest))
                importedCount += 1
            })

            dto.testList = finalTests
            dto.properties.mrid = existingDto.properties.mrid
            return {
                dto,
                importedCount,
                importedRowIds: new Set(importedRowIds),
                importedWorkTaskIdMap,
                finalWorkTaskIds: new Set(finalTests.map(test => test.mrid).filter(Boolean)),
                finalRowIds: new Set(finalTests.reduce((ids, test) => {
                    return ids.concat(this.collectPtmTestRowIds(test))
                }, [])),
            }
        },

        /** Keep the procedure-to-asset links in step with the final test list. */
        ensurePtmProcedureAssets(dto, assetMrid) {
            const links = Array.isArray(dto.procedureAsset) ? dto.procedureAsset : []
            const linked = new Set(links.map(item => item && item.procedure_id).filter(Boolean))
            for (const test of dto.testList || []) {
                if (!test.testTypeId || linked.has(test.testTypeId)) continue
                links.push({
                    procedure_id: test.testTypeId,
                    asset_id: assetMrid,
                })
                linked.add(test.testTypeId)
            }
            dto.procedureAsset = links
        },

        mergePtmPointMaps(existingMap, importedMap, finalRowIds, importedRowIds) {
            const out = {}
            for (const rowMrid of Object.keys(existingMap || {})) {
                if (finalRowIds.has(rowMrid)) out[rowMrid] = existingMap[rowMrid]
            }
            for (const rowMrid of Object.keys(importedMap || {})) {
                if (importedRowIds.has(rowMrid)) out[rowMrid] = importedMap[rowMrid]
            }
            return out
        },

        filterPtmPointMap(pointMap, allowedRowIds) {
            const out = {}
            for (const rowMrid of Object.keys(pointMap || {})) {
                if (allowedRowIds.has(rowMrid)) out[rowMrid] = pointMap[rowMrid]
            }
            return out
        },

        mergePtmWorkTaskMaps(existingMap, importedMap, finalWorkTaskIds, importedIdMap) {
            const out = {}
            Object.keys(existingMap || {}).forEach(workTaskMrid => {
                if (finalWorkTaskIds.has(workTaskMrid)) out[workTaskMrid] = existingMap[workTaskMrid]
            })
            Object.keys(importedIdMap || {}).forEach(sourceMrid => {
                const targetMrid = importedIdMap[sourceMrid]
                if (targetMrid && Array.isArray(importedMap[sourceMrid])) {
                    out[targetMrid] = importedMap[sourceMrid]
                }
            })
            return out
        },

        filterPtmWorkTaskMap(workTaskMap, allowedIds) {
            const allowed = new Set(allowedIds || [])
            const out = {}
            Object.keys(workTaskMap || {}).forEach(workTaskMrid => {
                if (allowed.has(workTaskMrid)) out[workTaskMrid] = workTaskMap[workTaskMrid]
            })
            return out
        },
    },
}
