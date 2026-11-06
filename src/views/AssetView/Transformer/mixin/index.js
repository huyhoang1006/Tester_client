/* eslint-disable */
import TransformerDataDto from "@/views/Dto/Transformer"
import uuid from "@/utils/uuid"
import * as transformerMapping from "@/views/Mapping/Transformer"
import OldTransformerEndInfo from "@/views/Cim/OldTransformerEndInfo"
import { WindingConnection } from "@/views/Enum/WindingConnection"
import { PhaseCode } from "@/views/Enum/PhaseCode"
import { parseServerVectorGroup } from "@/views/Mapping/ServerToDTO/Transformer/vectorGroup"
import { ensureUniqueAssetBeforeSave } from "@/views/AssetView/mixin/assetDuplicateGuard";
import { askPhaseChange } from "@/utils/phaseChangeDialog";
import {
    DC_WINDING_TEST_CODES, DC_WINDING_TEST_LABELS, phasesOfConfig, removedPhases, affectedTests, applyPhaseChangeToJob
} from "@/utils/dcWindingPhaseChange";
import * as transformerJobMapping from "@/views/Mapping/TransformerJob/index";
import transformerTestMap from "@/config/test-definitions/Transformer";
import * as commonJob from "@/views/JobView/Common/index.js";
export default {
    data() {
        return {
            transformerDto: new TransformerDataDto(),
            oldTransformerDto: new TransformerDataDto(),
            attachmentData: [],
        }
    },
    watch: {
        'transformerDto.winding_configuration.vector_group': {
            deep: true,
            immediate: true,
            handler() {
                this.changeDataBushing()
            }
        },
        'transformerDto.properties.type': {
            deep: true,
            immediate: true,
            handler() {
                this.changeDataBushing()
            }
        },

        'transformerDto.winding_configuration.phases': {
            deep: true,
            immediate: true,
            handler() {
                this.changeDataBushing()
                if (this.hasConfiguredPhase) this.phaseValidationError = false
            }
        },

    },
    methods: {
        onChangeAssetType(value) {
            this.transformerDto.winding_configuration = new TransformerDataDto().winding_configuration
            const hasTertiaryWinding = value === this.$constant.THREE_WINDING ||
                value === this.$constant.WITH_TERT
            if (!hasTertiaryWinding) {
                this.transformerDto.ratings.voltage_ratings =
                    this.transformerDto.ratings.voltage_ratings.filter(item => item.winding !== this.$constant.TERT)
                for (let [index, item] of this.transformerDto.ratings.current_ratings.entries()) {
                    if (item.tert !== undefined) {
                        this.transformerDto.ratings.current_ratings[index].tert.mrid = ''
                        this.transformerDto.ratings.current_ratings[index].tert.data.value = ''
                        this.transformerDto.ratings.current_ratings[index].tert.data.unit = 'A'
                    }
                }
            }

            if (value === this.$constant.TWO_WINDING || value === this.$constant.WITHOUT_TERT) {
                this.transformerDto.impedances.prim_tert = []
                this.transformerDto.impedances.sec_tert = []
            }

            if (value === this.$constant.THREE_WINDING || value === this.$constant.TWO_WINDING) {
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.prim.mrid = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.prim.data.value = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.prim.data.unit = '%'
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.sec.mrid = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.sec.data.value = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.sec.data.unit = '%'
            } else {
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.zero.mrid = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.zero.data.value = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.zero.data.unit = '%'
            }

            if (value === this.$constant.TWO_WINDING || value === this.$constant.WITHOUT_TERT) {
                this.transformerDto.others.winding.tert = ''
            }
        },

        async saveAsset() {
            try {
                if (this.transformerDto.properties.type && this.transformerDto.properties.kind && this.transformerDto.properties.serial_no) {
                    if (!this.hasConfiguredPhase) {
                        this.phaseValidationError = true
                        this.switch = 'Transformer'
                        this.$nextTick(() => {
                            const field = this.$refs.windingConfiguration && this.$refs.windingConfiguration.$el
                            if (field && field.scrollIntoView) field.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        })
                        this.$message.error('Select Number of Phase (1 or 3) before saving.')
                        return { success: false, validation: true }
                    }
                    const data = JSON.parse(JSON.stringify(this.transformerDto));
                    if (!(await ensureUniqueAssetBeforeSave(this, data))) return { success: false, duplicate: true };
                    // Máy 1 pha đổi pha (vd A → B) mà đã có KQTN DC Winding ở pha cũ → hỏi user
                    const phaseChange = await this.confirmDcWindingPhaseChange()
                    if (phaseChange && phaseChange.abort) {
                        this.$message.info('Saving was cancelled')
                        return { success: false, validation: true }
                    }
                    const result = this.checkTransformerDto(data);
                    const oldData = JSON.parse(JSON.stringify(this.oldTransformerDto));
                    const oldResult = this.checkTransformerDto(oldData, { normalizeTransformerEnds: false });
                    const resultEntity = transformerMapping.transformerDtoToEntity(result);
                    const oldResultEntity = transformerMapping.transformerDtoToEntity(oldResult);
                    let rs = await window.electronAPI.insertTransformerEntity(oldResultEntity, resultEntity)
                    if (rs.success) {
                        if (window.electronAPI.ensureUserOwnership) {
                            await window.electronAPI.ensureUserOwnership(this.$store.state.user.user_id, result.properties.mrid)
                        }
                        const testsChanged = phaseChange && phaseChange.mode
                            ? (await this.applyDcWindingPhaseChange(phaseChange)) > 0
                            : false
                        return {
                            success: true,
                            data: rs.data,
                            changed: rs.changed,
                            // Job/test của thiết bị bị sửa/xoá → cây cần tải lại nhánh thiết bị
                            testsChanged
                        };
                    } else {
                        this.$message.error("Error saving transformer entity: " + rs.message);
                        return {
                            success: false,
                            error: rs.error,
                        };
                    }

                } else {
                    this.$message({
                        type: 'warning',
                        message: "Please select the type and kind of Asset and serial number before saving."
                    });
                    return {
                        success: false,
                    };
                }
            } catch (error) {
                console.error("Error saving asset:", error);
                this.$message({
                    success: false,
                    type: 'error',
                    message: "An error occurred while saving the asset."
                });
            }
        },

        /**
         * Asset đổi cấu hình pha (1 pha A → B, hoặc 3 pha → 1 pha) mà các bài DC Winding Res
         * Prim/Sec/Tert đã có kết quả ở pha bị bỏ → cảnh báo, cho chọn (mặc định 1):
         *   1. Move test results to phase mới | 2. Giữ nguyên | 3. Xoá hẳn bài test
         * Cancel / đóng hộp thoại → huỷ lưu asset.
         * Đọc job qua đúng đường mở job (getComparableTests + getTransformerJobByMrid), sửa trên
         * DTO rồi lưu lại bằng insertTransformerJob → không cần thêm API ở main process.
         * @returns null | { abort } | { mode, jobs, removed, newPhases }
         */
        async confirmDcWindingPhaseChange() {
            const api = window.electronAPI
            if (!api || !api.getComparableTests || !api.getTransformerJobByMrid) return null
            const oldWc = (this.oldTransformerDto && this.oldTransformerDto.winding_configuration) || {}
            const newWc = (this.transformerDto && this.transformerDto.winding_configuration) || {}
            const removed = removedPhases(oldWc, newWc)
            const newPhases = phasesOfConfig(newWc)
            if (!removed.length) return null
            const assetMrid = this.transformerDto.properties && this.transformerDto.properties.mrid
            if (!assetMrid) return null

            const jobs = await this.loadDcWindingJobs(assetMrid, removed)
            if (!jobs.length) return null

            const list = jobs.map(job => {
                const tests = affectedTests(job.dto, removed).map(t => DC_WINDING_TEST_LABELS[t.testTypeCode] || t.testTypeCode)
                return `${tests.join(', ')}${job.name ? ` (${job.name})` : ''}`
            }).join('; ')
            const oldPhase = removed.join(', ')
            const newPhase = newPhases.join(', ')
            const fromSingle = phasesOfConfig(oldWc).length === 1
            const choice = await askPhaseChange({
                title: `Test results exist for phase ${oldPhase}`,
                message: `Test results already exist for phase ${oldPhase}: ${list}. The transformer is being changed to phase ${newPhase}. What should happen to these tests?`,
                oldPhase,
                newPhase,
                moveLabel: fromSingle ? `Move test results to phase ${newPhase}` : `Keep only the results of phase ${newPhase}`,
                moveHint: fromSingle
                    ? `Keep all results and relabel them as phase ${newPhase}.`
                    : `Rows of phase ${oldPhase} are removed; rows of phase ${newPhase} keep their results.`
            })
            if (!choice) return { abort: true }
            if (choice === 'keep') return null
            return { mode: choice, jobs, removed, newPhases }
        },

        /** Các job (trên máy này) của thiết bị có bài DC Winding bị ảnh hưởng */
        async loadDcWindingJobs(assetMrid, removed) {
            const api = window.electronAPI
            const workMrids = []
            const names = {}
            for (const code of DC_WINDING_TEST_CODES) {
                const rs = await api.getComparableTests(assetMrid, code, '')
                for (const item of (rs && rs.success && rs.data) || []) {
                    if (!workMrids.includes(item.workMrid)) workMrids.push(item.workMrid)
                    names[item.workMrid] = item.workName || names[item.workMrid] || ''
                }
            }
            const jobs = []
            for (const workMrid of workMrids) {
                const rs = await api.getTransformerJobByMrid(workMrid)
                if (!rs || !rs.success || !rs.data) continue
                const dto = transformerJobMapping.JobEntityToDto(rs.data)
                if (!affectedTests(dto, removed).length) continue
                jobs.push({ workMrid, name: names[workMrid], dto, old: JSON.parse(JSON.stringify(dto)) })
            }
            return jobs
        },

        async applyDcWindingPhaseChange({ mode, jobs, removed, newPhases }) {
            let changedTests = 0
            const failed = []
            for (const job of jobs) {
                try {
                    const changed = applyPhaseChangeToJob(job.dto, {
                        mode,
                        removed,
                        newPhases,
                        rowTemplateOf: code => commonJob.buildEmptyTestRow(transformerTestMap[code].columns)
                    })
                    if (!changed) continue
                    const rs = await window.electronAPI.insertTransformerJob(
                        transformerJobMapping.jobDtoToEntity(job.old),
                        transformerJobMapping.jobDtoToEntity(job.dto)
                    )
                    if (!rs || !rs.success) throw new Error((rs && rs.message) || 'Save failed')
                    changedTests += changed
                } catch (error) {
                    console.error('Apply DC winding phase change failed:', job.workMrid, error)
                    failed.push(job.name || job.workMrid)
                }
            }
            if (failed.length) {
                this.$message.error(`Asset saved, but these jobs could not be updated: ${failed.join(', ')}`)
            } else if (changedTests) {
                this.$message.success(mode === 'delete'
                    ? `${changedTests} DC winding test(s) were deleted`
                    : `DC winding test results were updated to phase ${newPhases.join(', ')}`)
            }
            return changedTests
        },

        loadData(data) {
            this.phaseValidationError = false
            this.repairStructuredVectorGroup(data)
            this.oldTransformerDto = JSON.parse(JSON.stringify(data));
            const surgeArresterTemp = JSON.parse(JSON.stringify(data.surge_arrester))
            data.surge_arrester = {
                prim : [],
                sec : [],
                tert : []
            }
            this.transformerDto = data;
            if (data.attachment && data.attachment.path) {
                this.attachmentData = JSON.parse(data.attachment.path)
            } else {
                this.attachmentData = []
            }
            this.$nextTick(async () => {
                await this.loadSurgeArrester(surgeArresterTemp, this.transformerDto.surge_arrester);
            });
        },

        repairStructuredVectorGroup(data) {
            const windingConfiguration = data && data.winding_configuration
            const vectorGroup = windingConfiguration && windingConfiguration.vector_group
            const tertiary = vectorGroup && vectorGroup.tert
            const requiresTertiary = data && data.properties &&
                (data.properties.type === this.$constant.THREE_WINDING ||
                    data.properties.type === this.$constant.WITH_TERT)

            if (!requiresTertiary || !tertiary || tertiary.i || !windingConfiguration.vector_group_data) return

            const parsed = parseServerVectorGroup(
                windingConfiguration.vector_group_data,
                windingConfiguration.phases,
                data.properties.type
            )
            if (parsed && parsed.vectorGroup && parsed.vectorGroup.tert.i) {
                windingConfiguration.vector_group = parsed.vectorGroup
                windingConfiguration.vector_group_data = parsed.vectorGroupData
            }
        },

        async loadSurgeArrester(surgeTemp, surgeArray) {
            const windingData = ['prim', 'sec', 'tert']

            for (const winding of windingData) {
                for (let i = 0; i < surgeArray[winding].length; i++) {
                    const surgeData = surgeArray[winding][i]

                    const data = surgeTemp[winding]
                        .find(x => x.ratings.pos === surgeData.ratings.pos)

                    if (data != null) {
                        surgeArray[winding][i] = data  // ✅ Gán lại vào mảng
                    }
                }
            }
        },

        async saveCtrS() {
            const data = await this.saveAsset()
            if (data && data.duplicate) return
            if (data && data.success) {
                // Load back the saved entity so the UI shows exactly what was stored
                if (data.data) {
                    // Convert Entity -> DTO before binding to UI
                    const dto = transformerMapping.transformerEntityToDto(data.data)
                    this.loadData(dto)
                }
                this.$message.success("Asset saved successfully")
                this.$emit('reload', { savedData: this.transformerDto, changed: data.changed === true, testsChanged: data.testsChanged === true })
            } else if (!data || (!data.validation && !data.duplicate)) {
                this.$message.error("Failed to save asset")
            }
        },

        async resetForm() {
            this.phaseValidationError = false
            this.transformerDto = new TransformerDataDto(),
                this.oldTransformerDto = new TransformerDataDto(),
                this.attachmentData = []
        },

        checkTransformerDto(data, options = {}) {
            this.checkPsrId(data)
            this.checkOldTransformerEndInfo(data, options.normalizeTransformerEnds !== false)
            this.checkAsset(data)
            this.checkLifecycleDate(data)
            this.checkAssetInfo(data)
            this.checkLocationId(data)
            this.checkAssetPrs(data)
            this.checkProductAssetModel(data)
            this.checkAttachment(data);
            this.checkVoltageRating(data)
            this.checkPowerRating(data)
            this.checkCurrentRating(data)
            this.checkShortCircuitRatings(data)
            this.checkRatedFrequency(data)
            this.checkRefTemperature(data)
            this.checkShortCircuitTest(data)
            this.checkZeroImpedance(data)
            this.checkOther(data)
            this.checkTapChangerId(data)
            this.checkBushing(data)
            this.checkSurgeArrester(data)
            return data;
        },

        checkPsrId(data) {
            if (this.parentData.mrid !== null && this.parentData.mrid !== '' && this.parentData.mrid !== undefined) {
                data.psrId = this.parentData.mrid
            }
        },

        async checkAssetPrs(data) {
            if (data.assetPsrId === null || data.assetPsrId === '') {
                data.assetPsrId = uuid.newUuid();
            }
        },

        checkOldTransformerEndInfo(data, normalize = true) {
            if (!normalize) return

            if (!Array.isArray(data.oldTransformerEndInfo)) {
                data.oldTransformerEndInfo = []
            }

            const hasTertiaryEnd = data.properties.type === this.$constant.THREE_WINDING ||
                data.properties.type === this.$constant.WITH_TERT
            const requiredEndNumbers = hasTertiaryEnd ? [1, 2, 3] : [1, 2]

            for (const endNumber of requiredEndNumbers) {
                const exists = data.oldTransformerEndInfo.some(item => Number(item.end_number) === endNumber)
                if (!exists) {
                    const transformerEndInfo = new OldTransformerEndInfo()
                    transformerEndInfo.mrid = uuid.newUuid()
                    transformerEndInfo.end_number = endNumber
                    data.oldTransformerEndInfo.push(transformerEndInfo)
                }
            }

            if (!hasTertiaryEnd) {
                data.oldTransformerEndInfo = data.oldTransformerEndInfo.filter(item => Number(item.end_number) !== 3)
            }
        },

        checkLocationId(data) {
            if (data.locationId === null || data.locationId === '') {
                data.locationId = this.locationId;
            }
        },

        checkAsset(data) {
            if (data.properties.mrid === null || data.properties.mrid === '') {
                data.properties.mrid = uuid.newUuid()
            }
        },

        checkLifecycleDate(data) {
            if (data.lifecycleDateId === null || data.lifecycleDateId === '') {
                data.lifecycleDateId = uuid.newUuid()
            }
        },

        checkAssetInfo(data) {
            if (data.oldPowerTransformerInfoId === null || data.oldPowerTransformerInfoId === '') {
                data.oldPowerTransformerInfoId = uuid.newUuid()
            }
        },

        checkProductAssetModel(data) {
            if (data.productAssetModelId === null || data.productAssetModelId === '') {
                data.productAssetModelId = uuid.newUuid()
            }
        },

        checkAttachment(data) {
            if (data.attachmentId === null || data.attachmentId === '') {
                if (this.attachmentData.length > 0) {
                    data.attachmentId = uuid.newUuid()
                    data.attachment.id = data.attachmentId
                    data.attachment.name = null
                    data.attachment.path = JSON.stringify(this.attachmentData)
                    data.attachment.type = 'asset'
                    data.attachment.id_foreign = data.properties.mrid
                }
            } else {
                data.attachment.path = JSON.stringify(this.attachmentData)
            }
        },

        checkVoltageRating(data) {
            for (let item of data.ratings.voltage_ratings) {
                if (item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            if (item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                            }
                        }
                    }
                }
            }
        },

        checkPowerRating(data) {
            for (let item of data.ratings.power_ratings) {
                if (item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            if (item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                            }
                        }
                    }
                }
            }
        },

        checkCurrentRating(data) {
            for (let item of data.ratings.current_ratings) {
                if (data.properties.type === this.$constant.WITHOUT_TERT || data.properties.type === this.$constant.TWO_WINDING) {
                    if (item.mrid === null || item.mrid === '') {
                        item.mrid = uuid.newUuid()
                    }
                    for (const key in item) {
                        if (item.hasOwnProperty(key) && key !== 'tert') {
                            if (typeof item[key] === 'object' && item[key] !== null) {
                                if (item[key].mrid === null || item[key].mrid === '') {
                                    item[key].mrid = uuid.newUuid()
                                }
                                if (item[key].data.mrid === null || item[key].data.mrid === '') {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                } else {
                    if (item.mrid === null || item.mrid === '') {
                        item.mrid = uuid.newUuid()
                    }
                    for (const key in item) {
                        if (item.hasOwnProperty(key)) {
                            if (typeof item[key] === 'object' && item[key] !== null) {
                                if (item[key].mrid === null || item[key].mrid === '') {
                                    item[key].mrid = uuid.newUuid()
                                }
                                if (item[key].data.mrid === null || item[key].data.mrid === '') {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                }
            }
        },

        checkShortCircuitRatings(data) {
            if (data.ratings.short_circuit.mrid === null || data.ratings.short_circuit.mrid === '') {
                data.ratings.short_circuit.mrid = uuid.newUuid()
                if (data.ratings.short_circuit.ka.mrid === null || data.ratings.short_circuit.ka.mrid === '') {
                    data.ratings.short_circuit.ka.mrid = uuid.newUuid()
                }
                if (data.ratings.short_circuit.s.mrid === null || data.ratings.short_circuit.s.mrid === '') {
                    data.ratings.short_circuit.s.mrid = uuid.newUuid()
                }
            }
        },

        checkRatedFrequency(data) {
            if (data.ratings.rated_frequency.mrid === null || data.ratings.rated_frequency.mrid === '') {
                data.ratings.rated_frequency.mrid = uuid.newUuid()
            }
        },

        checkRefTemperature(data) {
            if (data.impedances.ref_temp.mrid === null || data.impedances.ref_temp.mrid === '') {
                data.impedances.ref_temp.mrid = uuid.newUuid()
            }
        },

        checkShortCircuitTest(data) {
            for (let item of data.impedances.prim_sec) {
                if (item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            if (item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                                if (item[key].data && (item[key].data.mrid === null || item[key].data.mrid === '')) {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                }
            }

            for (let item of data.impedances.prim_tert) {
                if (item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            if (item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                                if (item[key].data && (item[key].data.mrid === null || item[key].data.mrid === '')) {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                }
            }

            for (let item of data.impedances.sec_tert) {
                if (item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            if (item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                                if (item[key].data && (item[key].data.mrid === null || item[key].data.mrid === '')) {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                }
            }
        },

        checkZeroImpedance(data) {
            if (data.impedances.zero_sequence_impedance.mrid === null || data.impedances.zero_sequence_impedance.mrid === '') {
                data.impedances.zero_sequence_impedance.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.base_power.mrid === null || data.impedances.zero_sequence_impedance.base_power.mrid === '') {
                data.impedances.zero_sequence_impedance.base_power.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.base_power.data.mrid === null || data.impedances.zero_sequence_impedance.base_power.data.mrid === '') {
                data.impedances.zero_sequence_impedance.base_power.data.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.base_voltage.mrid === null || data.impedances.zero_sequence_impedance.base_voltage.mrid === '') {
                data.impedances.zero_sequence_impedance.base_voltage.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.base_voltage.data.mrid === null || data.impedances.zero_sequence_impedance.base_voltage.data.mrid === '') {
                data.impedances.zero_sequence_impedance.base_voltage.data.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.zero_percent.prim.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.prim.mrid === '') {
                data.impedances.zero_sequence_impedance.zero_percent.prim.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.zero_percent.prim.data.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.prim.data.mrid === '') {
                data.impedances.zero_sequence_impedance.zero_percent.prim.data.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.zero_percent.sec.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.sec.mrid === '') {
                data.impedances.zero_sequence_impedance.zero_percent.sec.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.zero_percent.sec.data.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.sec.data.mrid === '') {
                data.impedances.zero_sequence_impedance.zero_percent.sec.data.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.zero_percent.zero.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.zero.mrid === '') {
                data.impedances.zero_sequence_impedance.zero_percent.zero.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.zero_percent.zero.data.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.zero.data.mrid === '') {
                data.impedances.zero_sequence_impedance.zero_percent.zero.data.mrid = uuid.newUuid()
            }
        },

        checkOther(data) {
            if (data.others.mrid === null || data.others.mrid === '') {
                data.others.mrid = uuid.newUuid()
            }
            if (data.others.insulation.weight.mrid === null || data.others.insulation.weight.mrid === '') {
                data.others.insulation.weight.mrid = uuid.newUuid()
            }
            if (data.others.insulation.volume.mrid === null || data.others.insulation.volume.mrid === '') {
                data.others.insulation.volume.mrid = uuid.newUuid()
            }
            if (data.others.total_weight.mrid === null || data.others.total_weight.mrid === '') {
                data.others.total_weight.mrid = uuid.newUuid()
            }
        },

        checkTapChangerId(data) {
            if(data.tap_changers.mode != '') {
                if(data.tap_changers.mrid === null || data.tap_changers.mrid === '') {
                    data.tap_changers.mrid = uuid.newUuid()
                }
                if(data.tap_changers.assetInfoId == null || data.tap_changers.assetInfoId === '') {
                    data.tap_changers.assetInfoId = uuid.newUuid()
                }
                if(data.tap_changers.productAssetModelId == null || data.tap_changers.productAssetModelId === '') {
                    data.tap_changers.productAssetModelId = uuid.newUuid()
                }
                for(const point of data.tap_changers.voltage_table) {
                    if(point.voltage.mrid == null || point.voltage.mrid == '') {
                        point.voltage.mrid = uuid.newUuid()
                    }
                }
            }
        },

        checkBushing(data) {
            const end = ['prim', 'sec', 'tert']
            for(const end_info of end) {
                for(const bushing of data.bushing_data[end_info]) {
                    this.traverseAndFillMrid(bushing)
                    if(bushing.assetInfoId === '' || bushing.assetInfoId === null) {
                        bushing.assetInfoId = uuid.newUuid()
                    }
                    if(bushing.productAssetModelId === '' || bushing.productAssetModelId === null) {
                        bushing.productAssetModelId = uuid.newUuid()
                    }
                    if(bushing.lifecycleDateId === '' || bushing.lifecycleDateId === null) {
                        bushing.lifecycleDateId = uuid.newUuid()
                    }
                }
            }
        },

        checkSurgeArrester(data) {
            for(const surgeArrester of data.surge_arrester.prim) {
                this.traverseAndFillMrid(surgeArrester)
                if(surgeArrester.properties.assetInfoId === '' || surgeArrester.properties.assetInfoId === null) {
                    surgeArrester.properties.assetInfoId = uuid.newUuid()
                }
                if(surgeArrester.properties.lifecycleDateId === '' || surgeArrester.properties.lifecycleDateId === null) {
                    surgeArrester.properties.lifecycleDateId = uuid.newUuid()
                }
                if(surgeArrester.properties.productAssetModelId === '' || surgeArrester.properties.productAssetModelId === null) {
                    surgeArrester.properties.productAssetModelId = uuid.newUuid()
                }
                for(const dataTable of surgeArrester.ratings.table) {
                    if(dataTable.assetInfoId === null || dataTable.assetInfoId === '') {
                        dataTable.assetInfoId = uuid.newUuid()
                    }
                    this.traverseAndFillMrid(dataTable)
                }
            }
            for(const surgeArrester of data.surge_arrester.sec) {
                this.traverseAndFillMrid(surgeArrester)
                if(surgeArrester.properties.assetInfoId === '' || surgeArrester.properties.assetInfoId === null) {
                    surgeArrester.properties.assetInfoId = uuid.newUuid()
                }
                if(surgeArrester.properties.lifecycleDateId === '' || surgeArrester.properties.lifecycleDateId === null) {
                    surgeArrester.properties.lifecycleDateId = uuid.newUuid()
                }
                if(surgeArrester.properties.productAssetModelId === '' || surgeArrester.properties.productAssetModelId === null) {
                    surgeArrester.properties.productAssetModelId = uuid.newUuid()
                }
                for(const dataTable of surgeArrester.ratings.table) {
                    if(dataTable.assetInfoId === null || dataTable.assetInfoId === '') {
                        dataTable.assetInfoId = uuid.newUuid()
                    }
                    this.traverseAndFillMrid(dataTable)
                }
            }
            for(const surgeArrester of data.surge_arrester.tert) {
                this.traverseAndFillMrid(surgeArrester)
                if(surgeArrester.properties.assetInfoId === '' || surgeArrester.properties.assetInfoId === null) {
                    surgeArrester.properties.assetInfoId = uuid.newUuid()
                }
                if(surgeArrester.properties.lifecycleDateId === '' || surgeArrester.properties.lifecycleDateId === null) {
                    surgeArrester.properties.lifecycleDateId = uuid.newUuid()
                }
                if(surgeArrester.properties.productAssetModelId === '' || surgeArrester.properties.productAssetModelId === null) {
                    surgeArrester.properties.productAssetModelId = uuid.newUuid()
                }
                for(const dataTable of surgeArrester.ratings.table) {
                    if(dataTable.assetInfoId === null || dataTable.assetInfoId === '') {
                        dataTable.assetInfoId = uuid.newUuid()
                    }
                    this.traverseAndFillMrid(dataTable)
                }
            }
        },

        changeDataBushing() {
            const bushingTemplate = {
                mrid:'',
                assetInfoId : '',
                productAssetModelId : '',
                lifecycleDateId : '',
                pos: '',
                asset_type: '',
                serial_no: '',
                manufacturer: '',
                manufacturer_type: '',
                manufacturer_year: '',
                insulation_level: {
                    mrid : '',
                    value: '',
                    label: 'kV',
                    unit: 'k|V'
                },
                voltage_l_ground: {
                    mrid : '',
                    value: '',
                    label: 'kV',
                    unit: 'k|V'
                },
                max_system_voltage: {
                    mrid: '',
                    value: '',
                    label: 'kV',
                    unit: 'k|V'
                },
                rate_current: {
                    mrid: '',
                    value: '',
                    label: 'A',
                    unit: 'A'
                },
                df_c1: {
                    mrid: '',
                    value: '',
                    label: '%',
                    unit: '%'
                },
                cap_c1: {
                    mrid: '',
                    value: '',
                    label: 'pF',
                    unit: 'p|F'
                },
                df_c2: {
                    mrid: '',
                    value: '',
                    label: '%',
                    unit: '%'
                },
                cap_c2: {
                    mrid: '',
                    value: '',
                    label: 'pF',
                    unit: 'p|F'
                },
                insulation_type: ''
            }
            if (this.transformerDto.properties.type === this.$constant.TWO_WINDING) {
                if (this.transformerDto.winding_configuration.phases === '1') {
                    this.transformerDto.bushing_data.tert = []
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.prim.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.prim.length < 2) {
                            for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 2; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.prim.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                this.transformerDto.bushing_data.prim.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                            this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.sec.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.sec.length < 2) {
                            for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 2; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.sec.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                            this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                } else if (this.transformerDto.winding_configuration.phases === '3') {
                    this.transformerDto.bushing_data.tert = []
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        if (this.transformerDto.winding_configuration.vector_group.prim === WindingConnection.Yn) {
                            for (let i = 1; i <= 4; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else {
                            for (let i = 1; i <= 3; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        }
                    } else {
                        if (this.transformerDto.winding_configuration.vector_group.prim === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.prim === '') {
                            if (this.transformerDto.bushing_data.prim.length < 4) {
                                for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 4; i++) {
                                    const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                    bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.prim.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                    this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                    this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            }
                        } else {
                            if (this.transformerDto.bushing_data.prim.length < 3) {
                                for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 3; i++) {
                                    const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                    bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.prim.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                    this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                if (this.transformerDto.bushing_data.prim.length === 3) {
                                    for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                        this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                } else {
                                    for (let i = 1; i <= 3; i++) {
                                        this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                    this.transformerDto.bushing_data.prim.splice(3, 1);
                                }
                            }
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        if (this.transformerDto.winding_configuration.vector_group.sec.i === WindingConnection.Yn) {
                            for (let i = 1; i <= 4; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else {
                            for (let i = 1; i <= 3; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        }
                    } else {
                        if (this.transformerDto.winding_configuration.vector_group.sec.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.sec.i === '') {
                            if (this.transformerDto.bushing_data.sec.length < 4) {
                                for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 4; i++) {
                                    const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                    bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.sec.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                    this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                    this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            }
                        } else {
                            if (this.transformerDto.bushing_data.sec.length < 3) {
                                for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 3; i++) {
                                    const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                    bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.sec.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                    this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                if (this.transformerDto.bushing_data.sec.length === 3) {
                                    for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                        this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                } else {
                                    for (let i = 1; i <= 3; i++) {
                                        this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                    this.transformerDto.bushing_data.sec.splice(3, 1);
                                }
                            }
                        }
                    }
                }
            } else if (this.transformerDto.properties.type === this.$constant.THREE_WINDING) {
                if (this.transformerDto.winding_configuration.phases === '1') {
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.prim.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.prim.length < 2) {
                            for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 2; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.prim.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                this.transformerDto.bushing_data.prim.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                            this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.sec.push(bushing);
                        }
                    }
                    else {
                        if (this.transformerDto.bushing_data.sec.length < 2) {
                            for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 2; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.sec.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                            this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.tert.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.tert.push(bushing);
                        }
                    }
                    else {
                        if (this.transformerDto.bushing_data.tert.length < 2) {
                            for (let i = this.transformerDto.bushing_data.tert.length + 1; i <= 2; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.tert.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.tert.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.tert.length; i++) {
                                this.transformerDto.bushing_data.tert.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.tert.length; i++) {
                            this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                } else if (this.transformerDto.winding_configuration.phases === '3') {
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        if (this.transformerDto.winding_configuration.vector_group.prim === WindingConnection.Yn) {
                            for (let i = 1; i <= 4; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else {
                            for (let i = 1; i <= 3; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        }
                    } else {
                        if (this.transformerDto.winding_configuration.vector_group.prim === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.prim === '') {
                            if (this.transformerDto.bushing_data.prim.length < 4) {
                                for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 4; i++) {
                                    const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                    bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.prim.push(bushing);
                                }
                            }
                            for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            }
                        } else {
                            if (this.transformerDto.bushing_data.prim.length < 3) {
                                for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 3; i++) {
                                    const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                    bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.prim.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                    this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                if (this.transformerDto.bushing_data.prim.length === 3) {
                                    for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                        this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                } else {
                                    for (let i = 1; i <= 3; i++) {
                                        this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                    this.transformerDto.bushing_data.prim.splice(3, 1);
                                }
                            }
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        if (this.transformerDto.winding_configuration.vector_group.sec.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.sec.i === '' || this.transformerDto.winding_configuration.vector_group.sec.i === WindingConnection.Zn) {
                            for (let i = 1; i <= 4; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else {
                            for (let i = 1; i <= 3; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        }
                    }
                    else {
                        if (this.transformerDto.winding_configuration.vector_group.sec.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.prim === '' || this.transformerDto.winding_configuration.vector_group.sec.i === WindingConnection.Zn) {
                            if (this.transformerDto.bushing_data.sec.length < 4) {
                                for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 4; i++) {
                                    const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                    bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.sec.push(bushing);
                                }
                            }
                            for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            }
                        } else {
                            if (this.transformerDto.bushing_data.sec.length < 3) {
                                for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 3; i++) {
                                    const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                    bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.sec.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                    this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                if (this.transformerDto.bushing_data.sec.length === 3) {
                                    for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                        this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                } else {
                                    for (let i = 1; i <= 3; i++) {
                                        this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                    this.transformerDto.bushing_data.sec.splice(3, 1);
                                }
                            }
                        }
                    }
                    if (this.transformerDto.bushing_data.tert.length === 0) {
                        if (this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.tert.i === '' || this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Zn) {
                            for (let i = 1; i <= 4; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.tert.push(bushing);
                            }
                        } else {
                            for (let i = 1; i <= 3; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.tert.push(bushing);
                            }
                        }
                    }
                    else {
                        if (this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.tert.i === '' || this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Zn) {
                            if (this.transformerDto.bushing_data.tert.length < 4) {
                                for (let i = this.transformerDto.bushing_data.tert.length + 1; i <= 4; i++) {
                                    const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                    bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.tert.push(bushing);
                                }
                            }
                            for (let i = 1; i <= this.transformerDto.bushing_data.tert.length; i++) {
                                this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            }
                        } else {
                            if (this.transformerDto.bushing_data.tert.length < 3) {
                                for (let i = this.transformerDto.bushing_data.tert.length + 1; i <= 3; i++) {
                                    const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                    bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.tert.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.tert.length; i++) {
                                    this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                if (this.transformerDto.bushing_data.tert.length === 3) {
                                    for (let i = 1; i <= this.transformerDto.bushing_data.tert.length; i++) {
                                        this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                } else {
                                    for (let i = 1; i <= 3; i++) {
                                        this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                    this.transformerDto.bushing_data.tert.splice(3, 1);
                                }
                            }
                        }
                    }
                }
            } else if (this.transformerDto.properties.type === this.$constant.WITH_TERT) {
                if (this.transformerDto.winding_configuration.phases === '1') {
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.prim.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.prim.length < 2) {
                            for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 2; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.prim.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                this.transformerDto.bushing_data.prim.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                            this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        for (let i = 1; i <= 1; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.sec.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.sec.length < 1) {
                            for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 1; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.sec.length > 1) {
                            for (let i = 2; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                            this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.tert.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.tert.push(bushing);
                        }
                    }
                    else {
                        if (this.transformerDto.bushing_data.tert.length < 2) {
                            for (let i = this.transformerDto.bushing_data.tert.length + 1; i <= 2; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.tert.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.tert.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.tert.length; i++) {
                                this.transformerDto.bushing_data.tert.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.tert.length; i++) {
                            this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                } else if (this.transformerDto.winding_configuration.phases === '3') {
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        for (let i = 1; i <= 4; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.prim.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.prim.length < 4) {
                            for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 4; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                            this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        for (let i = 1; i <= 3; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.sec.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.sec.length < 3) {
                            for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 3; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.sec.length > 3) {
                            for (let i = 4; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                            this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.tert.length === 0) {
                        if (this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.tert.i === '' || this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Zn) {
                            for (let i = 1; i <= 4; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.tert.push(bushing);
                            }
                        }
                    } else {
                        if (this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.tert.i === '' || this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Zn) {
                            for (let i = 1; i <= 4; i++) {
                                if (i > this.transformerDto.bushing_data.tert.length) {
                                    const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                    bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.tert.push(bushing);
                                } else {
                                    this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            }
                        } else {
                            if (this.transformerDto.bushing_data.tert.length < 3) {
                                for (let i = this.transformerDto.bushing_data.tert.length + 1; i <= 3; i++) {
                                    const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                    bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.tert.push(bushing);
                                }
                            } else if (this.transformerDto.bushing_data.tert.length > 3) {
                                for (let i = 4; i <= this.transformerDto.bushing_data.tert.length; i++) {
                                    this.transformerDto.bushing_data.tert.splice(i - 1, 1);
                                }
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.tert.length; i++) {
                            this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                }
            } else if (this.transformerDto.properties.type === this.$constant.WITHOUT_TERT) {
                if (this.transformerDto.winding_configuration.phases === '1') {
                    this.transformerDto.bushing_data.tert = [];
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.prim.push(bushing);
                        }

                    } else {
                        if (this.transformerDto.bushing_data.prim.length < 2) {
                            for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 2; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.prim.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                this.transformerDto.bushing_data.prim.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                            this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        for (let i = 1; i <= 1; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.sec.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.sec.length < 1) {
                            for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 1; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.sec.length > 1) {
                            for (let i = 2; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                            this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                } else if (this.transformerDto.winding_configuration.phases === '3') {
                    this.transformerDto.bushing_data.tert = [];
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        for (let i = 1; i <= 4; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.prim.push(bushing);
                        }

                    } else {
                        if (this.transformerDto.bushing_data.prim.length < 4) {
                            for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 4; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.prim.length > 4) {
                            for (let i = 5; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                this.transformerDto.bushing_data.prim.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                            this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        for (let i = 1; i <= 3; i++) {
                            const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                            bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.sec.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.sec.length < 3) {
                            for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 3; i++) {
                                const bushing = JSON.parse(JSON.stringify(bushingTemplate));
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.sec.length > 3) {
                            for (let i = 4; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                            this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                }
            }

            this.changeSurgeArresterData();
        },

        bushingPosReturn(i, end_label, type, phases) {
            const vectorGroup = this.transformerDto.winding_configuration.vector_group
            if (type == this.$constant.TWO_WINDING) {
                if (phases === '1') {
                    if (end_label === 'prim') {
                        if (i == 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.A
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.B
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.C
                            }
                            else {
                                return 1
                            }
                        } else if (i == 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.B
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.C
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.A
                            } else {
                                return 2
                            }
                        }
                    } else if (end_label === 'sec') {
                        if (i == 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.sec === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.a1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.sec === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.b1
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.sec === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.c1
                            }
                            else if (vectorGroup.prim === WindingConnection.I + 'Spare I') {
                                return 3
                            } else {
                                return 5
                            }
                        } else if (i == 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.n1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.n1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.n1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.b1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.c1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.a1
                            } else if (vectorGroup.prim === WindingConnection.I + 'Spare I') {
                                return 4
                            } else {
                                return 6
                            }
                        }
                    }
                } else if (phases === '3') {
                    if (end_label === 'prim') {
                        if (i == 1) {
                            return PhaseCode.A
                        } else if (i == 2) {
                            return PhaseCode.B
                        } else if (i == 3) {
                            return PhaseCode.C
                        } else if (i == 4) {
                            return PhaseCode.N
                        }
                    } else if (end_label === 'sec') {
                        if (i == 1) {
                            return PhaseCode.a1
                        } else if (i == 2) {
                            return PhaseCode.b1
                        } else if (i == 3) {
                            return PhaseCode.c1
                        }
                        else if (i == 4) {
                            return PhaseCode.n1
                        }
                    }
                }
            } else if (type === this.$constant.THREE_WINDING) {
                if (phases === '1') {
                    if (end_label === 'prim') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.A
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.B
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.C
                            }
                            else {
                                return 1
                            }
                        } else if (i === 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.B
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.C
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.A
                            } else {
                                return 2
                            }
                        }
                    } else if (end_label === 'sec') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.a1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.b1
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.c1
                            }
                            else {
                                return 5
                            }
                        } else if (i === 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.n1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.n1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.n1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.b1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.c1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.a1
                            } else {
                                return 6
                            }
                        }
                    } else if (end_label === 'tert') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.tert === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.a2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.tert === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.b2
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.tert === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.c2
                            }
                            else {
                                return 9
                            }
                        } else if (i === 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.n2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.n2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.n2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.b2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.c2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.a2
                            } else {
                                return 10
                            }
                        }
                    }
                } else if (phases === '3') {
                    if (end_label === 'prim') {
                        if (i === 1) {
                            return PhaseCode.A
                        } else if (i === 2) {
                            return PhaseCode.B
                        } else if (i === 3) {
                            return PhaseCode.C
                        } else if (i === 4) {
                            return PhaseCode.N
                        }
                    } else if (end_label === 'sec') {
                        if (i === 1) {
                            return PhaseCode.a1
                        } else if (i === 2) {
                            return PhaseCode.b1
                        } else if (i === 3) {
                            return PhaseCode.c1
                        }
                        else if (i === 4) {
                            return PhaseCode.n1
                        }
                    } else if (end_label === 'tert') {
                        if (i === 1) {
                            return PhaseCode.a2
                        } else if (i === 2) {
                            return PhaseCode.b2
                        } else if (i === 3) {
                            return PhaseCode.c2
                        }
                        else if (i === 4) {
                            return PhaseCode.n2
                        }
                    }
                }

            } else if (type === this.$constant.WITH_TERT) {
                if (phases === '1') {
                    if (end_label === 'prim') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.A
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.B
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.C
                            }
                            else {
                                return 1
                            }
                        } else if (i === 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.B
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.C
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.A
                            } else if (vectorGroup.prim === WindingConnection.I + 'Spare I') {
                                return '2+4'
                            } else {
                                return 2
                            }
                        }
                    } else if (end_label === 'sec') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.a1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.b1
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.c1
                            }
                            else {
                                return 5
                            }
                        }
                    } else if (end_label === 'tert') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.a2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.b2
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.c2
                            }
                            else {
                                return 9
                            }
                        } else if (i === 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.n2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.n2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.n2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.b2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.c2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.a2
                            } else {
                                return 2
                            }
                        }
                    }
                } else if (phases === '3') {
                    if (end_label === 'prim') {
                        if (i === 1) {
                            return PhaseCode.A
                        } else if (i === 2) {
                            return PhaseCode.B
                        } else if (i === 3) {
                            return PhaseCode.C
                        }
                        else if (i === 4) {
                            return PhaseCode.N
                        }
                    } else if (end_label === 'sec') {
                        if (i === 1) {
                            return PhaseCode.a1
                        } else if (i === 2) {
                            return PhaseCode.b1
                        }
                        else if (i === 3) {
                            return PhaseCode.c1
                        }
                    } else if (end_label === 'tert') {
                        if (this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.tert.i === '' || this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Zn) {
                            if (i === 1) {
                                return PhaseCode.a2
                            } else if (i === 2) {
                                return PhaseCode.b2
                            } else if (i === 3) {
                                return PhaseCode.c2
                            }
                            else if (i === 4) {
                                return PhaseCode.n2
                            }
                        }
                        else {
                            if (i === 1) {
                                return PhaseCode.a2
                            } else if (i === 2) {
                                return PhaseCode.b2
                            } else if (i === 3) {
                                return PhaseCode.c2
                            }
                        }
                    }
                }
            } else if (type === this.$constant.WITHOUT_TERT) {
                if (phases === '1') {
                    if (end_label === 'prim') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.A
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.B
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.C
                            }
                            else {
                                return 1
                            }
                        } else if (i === 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.B
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.C
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.A
                            } else if (vectorGroup.prim === WindingConnection.I + 'Spare I') {
                                return '2+4'
                            } else {
                                return 2
                            }
                        }
                    } else if (end_label === 'sec') {
                        if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                            return PhaseCode.a1
                        } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                            return PhaseCode.b1
                        }
                        else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                            return PhaseCode.c1
                        }
                        else if (vectorGroup.prim === WindingConnection.I + 'Spare I') {
                            return 5
                        }
                        else {
                            return 1
                        }
                    }
                } else if (phases === '3') {
                    if (end_label === 'prim') {
                        if (i === 1) {
                            return PhaseCode.A
                        } else if (i === 2) {
                            return PhaseCode.B
                        } else if (i === 3) {
                            return PhaseCode.C
                        } else if (i === 4) {
                            return PhaseCode.N
                        }
                    } else if (end_label === 'sec') {
                        if (i === 1) {
                            return PhaseCode.a1
                        } else if (i === 2) {
                            return PhaseCode.b1
                        } else if (i === 3) {
                            return PhaseCode.c1
                        }
                    }
                }
            }
        },

        changeSurgeArresterData() {
            // ✅ Safe check: Đảm bảo surge_arrester và bushing_data tồn tại
            if (!this.transformerDto.surge_arrester || !this.transformerDto.bushing_data) {
                return
            }
            
            // ✅ Safe check: Đảm bảo prim và sec tồn tại
            if (!this.transformerDto.surge_arrester.prim || !this.transformerDto.bushing_data.prim) {
                return
            }
            
            const surgeArresterTemplate = {
                sign: false,
                properties: {
                    mrid: '',
                    serial_no: '',
                    manufacturer: '',
                    manufacturer_year: '',
                    asset_system_code: '',
                    assetInfoId: '',
                    productAssetModelId: '',
                    lifecycleDateId: ''
                },
                ratings: {
                    pos: '',
                    unit: '',
                    table: []
                }
            }
            //primary
            if (this.transformerDto.surge_arrester.prim.length === 0) {
                for (let i = 0; i < this.transformerDto.bushing_data.prim.length; i++) {
                    const surgeArresterPrim = JSON.parse(JSON.stringify(surgeArresterTemplate))
                    surgeArresterPrim.ratings.pos = this.transformerDto.bushing_data.prim[i].pos;
                    this.transformerDto.surge_arrester.prim.push(surgeArresterPrim)
                }
            } else {
                if (this.transformerDto.surge_arrester.prim.length < this.transformerDto.bushing_data.prim.length) {
                    for (let i = this.transformerDto.surge_arrester.prim.length; i < this.transformerDto.bushing_data.prim.length; i++) {
                        const surgeArresterPrim = JSON.parse(JSON.stringify(surgeArresterTemplate))
                        surgeArresterPrim.ratings.pos = this.transformerDto.bushing_data.prim[i].pos;
                        this.transformerDto.surge_arrester.prim.push(surgeArresterPrim)
                    }
                } else if (this.transformerDto.surge_arrester.prim.length > this.transformerDto.bushing_data.prim.length) {
                    for (let i = this.transformerDto.bushing_data.prim.length; i < this.transformerDto.surge_arrester.prim.length; i++) {
                        this.transformerDto.surge_arrester.prim.splice(i, 1);
                    }
                }
                for (let i = 0; i < this.transformerDto.surge_arrester.prim.length; i++) {
                    this.transformerDto.surge_arrester.prim[i].ratings.pos = this.transformerDto.bushing_data.prim[i].pos;
                }
            }
            //secondary
            // ✅ Safe check: Đảm bảo sec tồn tại
            if (!this.transformerDto.surge_arrester.sec || !this.transformerDto.bushing_data.sec) {
                return
            }
            
            if (this.transformerDto.surge_arrester.sec.length === 0) {
                for (let i = 0; i < this.transformerDto.bushing_data.sec.length; i++) {
                    const surgeArresterSec = JSON.parse(JSON.stringify(surgeArresterTemplate))
                    surgeArresterSec.ratings.pos = this.transformerDto.bushing_data.sec[i].pos;
                    this.transformerDto.surge_arrester.sec.push(surgeArresterSec)
                }
            } else {
                if (this.transformerDto.surge_arrester.sec.length < this.transformerDto.bushing_data.sec.length) {
                    for (let i = this.transformerDto.surge_arrester.sec.length; i < this.transformerDto.bushing_data.sec.length; i++) {
                        const surgeArresterSec = JSON.parse(JSON.stringify(surgeArresterTemplate));
                        surgeArresterSec.ratings.pos = this.transformerDto.bushing_data.sec[i].pos;
                        this.transformerDto.surge_arrester.sec.push(surgeArresterSec)
                    }
                } else if (this.transformerDto.surge_arrester.sec.length > this.transformerDto.bushing_data.sec.length) {
                    for (let i = this.transformerDto.bushing_data.sec.length; i < this.transformerDto.surge_arrester.sec.length; i++) {
                        this.transformerDto.surge_arrester.sec.splice(i, 1);
                    }
                }
                for (let i = 0; i < this.transformerDto.surge_arrester.sec.length; i++) {
                    this.transformerDto.surge_arrester.sec[i].ratings.pos = this.transformerDto.bushing_data.sec[i].pos;
                }
            }
            //tertiary
            if (this.transformerDto.surge_arrester.tert.length === 0) {
                for (let i = 0; i < this.transformerDto.bushing_data.tert.length; i++) {
                    const surgeArresterTert = JSON.parse(JSON.stringify(surgeArresterTemplate))
                    surgeArresterTert.ratings.pos = this.transformerDto.bushing_data.tert[i].pos;
                    this.transformerDto.surge_arrester.tert.push(surgeArresterTert)
                }
            } else {
                if (this.transformerDto.surge_arrester.tert.length < this.transformerDto.bushing_data.tert.length) {
                    for (let i = this.transformerDto.surge_arrester.tert.length; i < this.transformerDto.bushing_data.tert.length; i++) {
                        const surgeArresterTert = JSON.parse(JSON.stringify(surgeArresterTemplate))
                        surgeArresterTert.ratings.pos = this.transformerDto.bushing_data.tert[i].pos;
                        this.transformerDto.surge_arrester.tert.push(surgeArresterTert)
                    }
                } else if (this.transformerDto.surge_arrester.tert.length > this.transformerDto.bushing_data.tert.length) {
                    for (let i = this.transformerDto.bushing_data.tert.length; i < this.transformerDto.surge_arrester.tert.length; i++) {
                        this.transformerDto.surge_arrester.tert.splice(i, 1);
                    }
                }
                for (let i = 0; i < this.transformerDto.surge_arrester.tert.length; i++) {
                    this.transformerDto.surge_arrester.tert[i].ratings.pos = this.transformerDto.bushing_data.tert[i].pos;
                }
            }
        },

        removeShortCircuitTest(mrid) {
            for (let index in this.transformerDto.shortCircuitTestTransformerEndInfo) {
                if (this.transformerDto.shortCircuitTestTransformerEndInfo[index].short_circuit_test_id === mrid) {
                    this.transformerDto.shortCircuitTestTransformerEndInfo.splice(index, 1);
                }
            }
        },

        removeShortCircuitTestArr(mrids) {
            this.transformerDto.shortCircuitTestTransformerEndInfo = this.transformerDto.shortCircuitTestTransformerEndInfo.filter(item => !mrids.includes(item.short_circuit_test_id));
        },

        addShortCircuitTest(mrid) {
            this.transformerDto.shortCircuitTestTransformerEndInfo.push({
                mrid: uuid.newUuid(),
                short_circuit_test_id: mrid,
                transformer_end_info_id: ''
            })
        },

        traverseAndFillMrid(obj) {
            if (Array.isArray(obj)) {
                obj.forEach(item => this.traverseAndFillMrid(item));
            } else if (obj !== null && typeof obj === "object") {
                // Nếu có thuộc tính mrid
                if ("mrid" in obj) {
                    if (!obj.mrid || obj.mrid === "") {
                        obj.mrid = uuid.newUuid();
                    }
                }
                // Duyệt tiếp các key con
                Object.values(obj).forEach(val => this.traverseAndFillMrid(val));
            }
            return obj;
        }
    }
}
