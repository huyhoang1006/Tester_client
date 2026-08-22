/* eslint-disable */
import { ptmToCtJobDto } from '@/utils/ptm/ptmToCtJobDto'
import { jobDtoToEntity, JobEntityToDto } from '@/views/Mapping/CurrentTransformerJob'
import { applyPtmToCtAssetDto, buildCtConfigurationFromPtm } from '@/utils/ptm/ptmToCtAssetDto'
import CurrentTransformerDto from '@/views/Dto/CurrentTransformer'
import CTConfigurationDto from '@/views/Dto/CurrentTransformer/CTConfiguration'
import CoreDto from '@/views/Dto/CurrentTransformer/CTConfiguration/CoreDto'
import uuid from '@/utils/uuid'
import * as CurrentTransformerMapper from '@/views/Mapping/CurrentTransformer'
import { startLoading } from '@/utils/loading'

/** Node được phép import vào. Xem giải thích ở handleImportPtmFromContext. */
const PTM_TARGET_MODES = ['asset', 'bay', 'substation']

const str = (v) => (v === null || v === undefined) ? '' : String(v)

/**
 * IMPORT FILE .ptm CỦA OMICRON vào một node đã chọn trên cây.
 *
 * ─── LUẬT ĐÃ CHỐT ───────────────────────────────────────────────────────────
 *
 *   - Chọn một node trên cây rồi import VÀO ĐÓ. Chỉ nhập phần thuộc node đó, bỏ qua
 *     những thứ khác trong file (vị trí, thiết bị ở nhánh khác…).
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
            ptmFileName: '',
            ptmImporting: false,
        }
    },
    methods: {
        /** Vào từ menu chuột phải hoặc thanh công cụ. */
        async handleImportPtmFromContext(node) {
            const target = node || (this.selectedNodes && this.selectedNodes[this.selectedNodes.length - 1])
            if (!target) {
                this.$message.warning('Select the asset to import into first')
                return
            }
            // Hai chỗ đứng hợp lệ, và chúng làm hai việc khác nhau:
            //
            //   asset             -> ghi job vào đúng thiết bị đó (thiết bị đã có sẵn)
            //   substation / bay  -> TẠO thiết bị mới từ file rồi ghi job vào
            //
            // Node khác thì nói rõ đang đứng đâu và cần đứng đâu, thay vì một câu "không
            // hợp lệ" chung chung.
            if (!PTM_TARGET_MODES.includes(target.mode)) {
                this.$message.warning(
                    `Import into an asset, a bay or a substation (currently on "${target.mode || 'node'}")`
                )
                return
            }

            const api = window.electronAPI
            if (!api || !api.importPtm) {
                this.$message.error('PTM import is not available in this build')
                return
            }

            const result = await api.importPtm()
            if (!result || !result.success) {
                if (result && result.message !== 'Import cancelled') {
                    this.$message.error(result ? result.message : 'Could not read PTM file')
                }
                return
            }

            this.ptmRaw = result.data
            this.ptmTargetNode = target
            this.ptmFileName = String(result.data.filePath || '').split(/[\\/]/).pop()

            await this.buildPtmPreview()
            this.ptmDialogVisible = true
        },

        /** Dựng phần xem trước + chạy đối chiếu trùng. Không ghi gì. */
        async buildPtmPreview() {
            const ptm = this.ptmRaw
            const target = this.ptmTargetNode

            // Thiết bị: lấy bản của JOB làm gốc (thông số đúng lúc thử), rồi lấp field
            // rỗng bằng bản kho. Kiểm trên file mẫu: hai bản chỉ khác 3/55 thẻ, và
            // `AssetSystemCode` chỉ có ở bản kho — chọn một bản là mất nó.
            const jobAsset = (ptm.assets || []).find(a => a.exportId === ptm.job.jobAssetId)
            const stockAsset = (ptm.assets || []).find(a => a.exportId === ptm.job.assetId)
            const asset = this.mergePtmAsset(jobAsset, stockAsset)

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
            if (api && api.findPtmDuplicateAsset) {
                const rs = await api.findPtmDuplicateAsset(
                    {
                        serialNumber: asset.serialNumber,
                        manufacturer: asset.manufacturer,
                        manufacturerType: asset.manufacturerType,
                    },
                    this.$store.state.user.user_id,
                    // "Cùng nhánh" tính theo node CHỨA thiết bị: đứng ở asset thì là cha
                    // của nó, đứng ở bay/substation thì chính là node đang đứng.
                    target.mode === 'asset' ? target.parentId : target.mrid
                )
                if (rs && rs.success) this.ptmDup = rs.data
                else console.warn('[ptm] doi chieu trung thiet bi khong chay duoc:', rs && rs.message)
            }

            // ─── BƯỚC 2: CHỐT THIẾT BỊ ĐÍCH ─────────────────────────────
            //
            // Ba trường hợp, và chỉ trường hợp cuối là thật sự tạo thiết bị mới:
            //
            //   đứng ở asset                  -> chính nó
            //   đứng ở bay/trạm, có trùng     -> thiết bị đã có trong nhánh đó
            //   đứng ở bay/trạm, không trùng  -> tạo mới, sinh mrid ngay tại đây
            //
            // `creatingAsset` phải tính theo THỰC TẾ có tạo hay không, không phải theo chỗ
            // đứng — đó là chỗ bản đầu sai.
            const dupInTarget = (this.ptmDup && this.ptmDup.inTarget) || []
            let assetMrid
            let creatingAsset = false
            if (target.mode === 'asset') {
                assetMrid = target.mrid
            } else if (dupInTarget.length > 0) {
                assetMrid = dupInTarget[0].mrid
            } else {
                assetMrid = uuid.newUuid()
                creatingAsset = true
            }

            const { jobDto, curvePoints, kneePoints, skipped } = ptmToCtJobDto(ptm, assetMrid)

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
                                const detail = await api.getCurrentTransformerJobByMrid(j.mrid)
                                if (!detail || !detail.success || !detail.data) {
                                    throw new Error((detail && detail.message) || 'job data not found')
                                }
                                const dto = JobEntityToDto(detail.data)
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
            if (creatingAsset) {
                const ctTest = (ptm.tests || []).find(t => t.type === 'CTExcitationTest')
                coreConfig = buildCtConfigurationFromPtm(ctTest, CTConfigurationDto, CoreDto)
            }

            this.ptmPreview = {
                job: ptm.job,
                asset,
                jobDto,
                curvePoints,
                kneePoints,
                skipped,
                creatingAsset,
                assetMrid,
                coreConfig,
                tests: jobDto.testList.map((t, importIndex) => {
                    const tables = (t.data && t.data.table) || {}
                    const rows = Object.keys(tables).reduce((all, key) => {
                        return all.concat(Array.isArray(tables[key]) ? tables[key] : [])
                    }, [])
                    const rowIds = rows.map(r => r.mrid)
                    const curves = rowIds.filter(id => curvePoints[id]).length
                    const points = rowIds.reduce((sum, id) => sum + ((curvePoints[id] || []).length), 0)
                    const knees = rowIds.reduce((sum, id) => sum + ((kneePoints[id] || []).length), 0)
                    return {
                        importIndex,
                        importedMrid: t.mrid,
                        testTypeCode: t.testTypeCode,
                        name: t.testTypeName || t.testTypeCode,
                        rows: rows.length,
                        curves,
                        points,
                        knees,
                    }
                }),
            }
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

        handlePtmCancel() {
            this.ptmDialogVisible = false
            this.ptmPreview = null
            this.ptmDup = null
            this.ptmJobDup = null
            this.ptmJobDupError = ''
            this.ptmRaw = null
        },

        /**
         * Ghi thật.
         *
         * @param {object} actions quyết định ở cấp asset, job và từng test khi merge.
         *
         *   assetAction  chỉ có nghĩa khi thiết bị trùng và người dùng ĐANG KHÔNG đứng ở
         *                chính thiết bị đó. Đứng ở thiết bị nào là đã chọn nó, không hỏi.
         *   jobAction    chỉ có nghĩa khi có job trùng tên dưới thiết bị đích.
         */
        async handlePtmConfirm(actions) {
            const { assetAction, jobAction, targetJobMrid, testDecisions } = actions || {}
            const preview = this.ptmPreview
            const target = this.ptmTargetNode
            if (!preview || !target) return

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
                    const old = await window.electronAPI.getCurrentTransformerJobByMrid(targetMrid)
                    if (!old || !old.success || !old.data) {
                        throw new Error(`Could not read the existing job to merge: ${(old && old.message) || 'not found'}`)
                    }

                    oldEntity = old.data
                    mergeSummary = this.mergePtmTestsIntoJob(
                        JobEntityToDto(old.data),
                        preview.jobDto,
                        testDecisions || []
                    )
                    dto = mergeSummary.dto
                    mergedTestCount = mergeSummary.importedCount
                    if (mergedTestCount === 0) {
                        throw new Error('No PTM test was selected to add or overwrite')
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
                const dupInTarget = (this.ptmDup && this.ptmDup.inTarget) || []
                const attachedToExisting = !preview.creatingAsset && target.mode !== 'asset'

                let assetUpdate = null
                if (preview.creatingAsset) {
                    reporter.progress('Creating asset from PTM file...')
                    assetUpdate = await this.createCtAssetFromPtm(target, preview)
                } else if (assetAction === 'overwrite') {
                    reporter.progress('Updating existing asset...')
                    // Node của thiết bị đích: đứng ở asset thì là chính nó, còn không thì
                    // là thiết bị trùng tìm được trong nhánh.
                    const assetNode = attachedToExisting
                        ? { mrid: preview.assetMrid, parentId: (dupInTarget[0] || {}).psr_id }
                        : target
                    assetUpdate = await this.applyPtmAssetOverwrite(assetNode, preview.asset)
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
                    const old = await window.electronAPI.getCurrentTransformerJobByMrid(overwriteMrid)
                    if (!old || !old.success || !old.data) {
                        throw new Error(
                            `Could not read the existing job to overwrite it: ${(old && old.message) || 'not found'}`
                        )
                    }
                    overwritingJob = old.data
                    dto.properties.mrid = overwriteMrid
                    oldEntity = overwritingJob
                }

                const entity = jobDtoToEntity(dto)

                // Đường cong đi CÙNG entity, vào cùng một transaction với bảng test. Hai
                // đường ghi riêng thì bảng lưu xong mà đường cong hỏng, không ai chặn.
                if (jobAction === 'merge' && mergeSummary) {
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
                } else {
                    entity.ctExcitationPoints = preview.curvePoints
                    entity.ctExcitationKneePoints = preview.kneePoints || {}
                }

                reporter.progress(
                    jobAction === 'merge'
                        ? 'Merging selected PTM tests into the existing job...'
                        : (overwritingJob ? 'Overwriting the existing job...' : 'Writing job and tests...')
                )

                // Job mới thì `old_entity` rỗng — không có gì để so mà xoá.
                const entityBeforeSave = oldEntity || overwritingJob || this.buildEmptyOldEntity(entity)
                const rs = await window.electronAPI.insertCurrentTransformerJob(entityBeforeSave, entity)

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
                let assetNote = ''
                if (assetUpdate && assetUpdate.created) {
                    const cores = ((preview.coreConfig && preview.coreConfig.config) || {}).cores || '?'
                    assetNote = `, new asset created (${assetUpdate.appliedCount} nameplate field(s), ${cores} core(s))`
                } else if (assetUpdate && assetUpdate.appliedCount > 0) {
                    assetNote = `, ${assetUpdate.appliedCount} asset field(s) updated`
                }
                const verb = jobAction === 'merge'
                    ? 'Merged into the existing job:'
                    : (overwritingJob ? 'Overwrote the existing job with' : 'Imported')
                this.$message.success(
                    `${verb} ${mergedTestCount} PTM test(s), ${curveCount} curve(s), ${pointCount} points, ${kneeCount} knee point(s)${assetNote}`
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
            let importedCount = 0

            importedTests.forEach((importedTest, importIndex) => {
                const matches = originalExistingTests.filter(test => test.testTypeCode === importedTest.testTypeCode)
                if (matches.length === 0) {
                    finalTests.push(importedTest)
                    importedRowIds.push(...this.collectPtmTestRowIds(importedTest))
                    importedCount += 1
                    return
                }

                const decision = decisionMap[importIndex] || { action: 'keep' }
                if (decision.action === 'duplicate') {
                    finalTests.push(importedTest)
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
                finalRowIds: new Set(finalTests.reduce((ids, test) => {
                    return ids.concat(this.collectPtmTestRowIds(test))
                }, [])),
            }
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
    },
}
