<template>
    <el-dialog
        :title="`Import ${sourceLabel} file`"
        :visible="visible"
        width="min(920px, 94vw)"
        :close-on-click-modal="false"
        append-to-body
        @close="$emit('close')">

        <div v-if="!preview" class="ptm-empty">No file loaded.</div>

        <template v-else>
            <!-- ─── Nguồn ─────────────────────────────────────────────────── -->
            <div class="ptm-section">
                <div class="ptm-row"><span class="k">File</span><span class="v">{{ fileName }}</span></div>
                <div class="ptm-row"><span class="k">Job</span><span class="v">{{ preview.job.name || '(no name)' }}</span></div>
                <div class="ptm-row">
                    <span class="k">Tested by</span>
                    <span class="v">{{ preview.job.tester || '—' }}</span>
                </div>
                <div class="ptm-row">
                    <span class="k">Execution date</span>
                    <span class="v">{{ shortDate(preview.job.executionDate) }}</span>
                </div>
            </div>

            <!-- ─── Thiết bị trong file ───────────────────────────────────── -->
            <div class="ptm-section">
                <div class="ptm-head">Asset</div>
                <div class="ptm-row"><span class="k">Asset type</span><span class="v">{{ preview.assetKind || asset.type || '—' }}</span></div>
                <div class="ptm-row"><span class="k">Serial number</span><span class="v">{{ asset.serialNumber || '—' }}</span></div>
                <div class="ptm-row"><span class="k">Manufacturer</span><span class="v">{{ asset.manufacturer || '—' }}</span></div>
                <div class="ptm-row"><span class="k">Manufacturer type</span><span class="v">{{ asset.manufacturerType || '—' }}</span></div>
                <div class="ptm-row"><span class="k">Import into</span><span class="v">{{ targetLabel }}</span></div>
                <div v-if="preview.hierarchyPath" class="ptm-row">
                    <span class="k">File hierarchy</span><span class="v">{{ preview.hierarchyPath }}</span>
                </div>
            </div>

            <!--
              Tạo thiết bị mới là hành động KHÔNG hoàn tác được bằng một cú bấm, nên nói
              thẳng ra trước: tên gì, serial gì, mấy lõi. Người dùng đứng ở bay và bấm
              import có thể chỉ định đổ job vào — phải thấy rõ là sắp có một node mới.
            -->
            <el-alert v-if="willCreateAsset" type="info" :closable="false" show-icon
                      title="A new asset will be created" class="ptm-alert">
                <div class="ptm-row"><span class="k">Name</span><span class="v">{{ newAssetName }}</span></div>
                <div class="ptm-row"><span class="k">Serial number</span><span class="v">{{ asset.serialNumber || '—' }}</span></div>
                <div class="ptm-row">
                    <span class="k">{{ isCurrentTransformer ? 'Core configuration' : 'Configuration' }}</span>
                    <span class="v">{{ isCurrentTransformer ? coreSummary : assetConfigurationSummary }}</span>
                </div>
                <ul v-if="isCurrentTransformer && coreNotes.length" class="ptm-list">
                    <li v-for="(n, i) in coreNotes" :key="'cn' + i">{{ n }}</li>
                </ul>
                <div v-if="isCurrentTransformer" class="ptm-hint">
                    <template v-if="sourceLabel === 'CPXpert'">
                        Core, tap and "In use" configuration is read from the CPXpert asset profile.
                    </template>
                    <template v-else>
                        "In use" is ticked for taps that were actually measured — the file has no such flag,
                        so check it before saving.
                    </template>
                </div>
            </el-alert>

            <!-- ─── Kết quả đối chiếu trùng ───────────────────────────────── -->
            <el-alert v-if="dup && dup.skippedCheck" type="warning" :closable="false" show-icon
                      title="Cannot check for duplicates"
                      description="This asset has no serial number, so it cannot be matched against existing assets."
                      class="ptm-alert" />

            <el-alert v-else-if="dup && dup.elsewhere && dup.elsewhere.length > 0" type="error" :closable="false" show-icon
                      title="This asset already exists somewhere else" class="ptm-alert">
                <div>
                    Matched on {{ dup.matchedOn.join(' + ') }}. Handle the existing asset before importing —
                    move it here, or rename it if it is a different unit.
                </div>
                <ul class="ptm-list">
                    <li v-for="m in dup.elsewhere" :key="m.mrid">
                        {{ m.name || m.serial_number }} <em>({{ m.kind || 'asset' }})</em>
                    </li>
                </ul>
            </el-alert>

            <!-- ─── Job trùng tên dưới đúng thiết bị đích ─────────────────── -->
            <el-alert v-if="jobDup && jobDup.length > 0" type="warning" :closable="false" show-icon
                      title="A job with this name already exists on this asset" class="ptm-alert">
                <el-radio-group v-model="targetJobMrid" class="ptm-job-targets">
                    <el-radio v-for="j in jobDup" :key="j.mrid" :label="j.mrid">
                        <span>{{ j.name }}</span>
                        <em v-if="j.executionDate">— tested {{ shortDate(j.executionDate) }}</em>
                        <em v-if="j.testedBy"> by {{ j.testedBy }}</em>
                    </el-radio>
                </el-radio-group>
                <el-radio-group v-model="jobAction" class="ptm-radio">
                    <el-radio label="merge">Merge tests into this job — keep its overview and other tests</el-radio>
                    <el-radio label="overwrite">Overwrite it — replace the test data, keep the same job</el-radio>
                    <el-radio label="skip">Skip — do not import this job</el-radio>
                </el-radio-group>
                <!--
                  Nói rõ ghi đè LÀM GÌ. "Overwrite" một mình thì người dùng không biết là
                  thay cả job hay chỉ bổ sung, mà hai cái đó hậu quả khác nhau hẳn.
                -->
                <div class="ptm-hint">
                    <template v-if="jobAction === 'merge'">
                        New test types are added automatically. For an existing type, choose whether
                        to keep it, overwrite one occurrence, or create another test of the same type.
                    </template>
                    <template v-else-if="jobAction === 'overwrite'">
                        Overwriting keeps the same job entry, so it stays linked to the server. Test data
                        inside it is replaced by the file — measurements not in the file are removed.
                    </template>
                    <template v-else>No changes will be made.</template>
                </div>
            </el-alert>

            <el-alert v-if="selectedJob && selectedJob.loadError" type="error" :closable="false" show-icon
                      title="Could not read the selected job" class="ptm-alert">
                <div>{{ selectedJob.loadError }}</div>
            </el-alert>

            <el-alert v-if="jobDupError" type="warning" :closable="false" show-icon
                      title="Could not check for existing jobs" class="ptm-alert">
                <div>{{ jobDupError }} — importing may create a second job with the same name.</div>
            </el-alert>

            <!-- ─── Bài test ──────────────────────────────────────────────── -->
            <div class="ptm-section">
                <div class="ptm-head">
                    Tests
                    <span class="ptm-sub">{{ tests.length }} in file,
                        {{ skipped.length }} unsupported</span>
                </div>

                <el-table v-if="tests.length" :data="mergeRows" size="mini" border max-height="260">
                    <el-table-column prop="name" label="Test" min-width="150" />
                    <el-table-column prop="rows" label="Rows" width="70" align="right" />
                    <el-table-column prop="series" label="Series" width="80" align="right" />
                    <el-table-column prop="dataPoints" label="Data points" width="100" align="right" />
                    <el-table-column v-if="showMergeDecisions" label="Import action" min-width="210">
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.matches.length === 0" type="success" size="mini">
                                Add new test
                            </el-tag>
                            <el-select v-else v-model="testDecisions[scope.row.importIndex].action"
                                       size="mini" class="ptm-action-select">
                                <el-option label="Keep existing" value="keep" />
                                <el-option label="Overwrite existing" value="overwrite" />
                                <el-option label="Create another test" value="duplicate" />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="showMergeDecisions" label="Existing test" min-width="180">
                        <template slot-scope="scope">
                            <span v-if="scope.row.matches.length === 0" class="ptm-muted">Not present</span>
                            <el-select v-else-if="testDecisions[scope.row.importIndex].action === 'overwrite'"
                                       v-model="testDecisions[scope.row.importIndex].targetMrid"
                                       size="mini" class="ptm-action-select">
                                <el-option v-for="match in scope.row.matches" :key="match.mrid"
                                           :label="existingTestLabel(match)" :value="match.mrid" />
                            </el-select>
                            <span v-else class="ptm-muted">{{ scope.row.matches.length }} matching test(s)</span>
                        </template>
                    </el-table-column>
                </el-table>

                <!--
                  Bài bị bỏ vẫn LIỆT KÊ ĐỦ kèm lý do. Bỏ im lặng thì người dùng tưởng file
                  chỉ có bấy nhiêu bài, và không bao giờ biết mình mất gì.
                -->
                <div v-if="skipped.length" class="ptm-skip">
                    <div v-for="(s, i) in skipped" :key="i" class="ptm-skip-row">
                        <i class="el-icon-warning-outline"></i>
                        <b>{{ s.name }}</b><span class="ptm-reason">{{ s.reason }}</span>
                    </div>
                </div>
            </div>
        </template>

        <span slot="footer">
            <el-button @click="$emit('close')">Cancel</el-button>
            <el-button type="primary" :disabled="!canImport" :loading="importing"
                       @click="confirmImport">
                {{ importLabel }}
            </el-button>
        </span>
    </el-dialog>
</template>

<script>
/**
 * Xem trước trước khi import file .ptm.
 *
 * Hộp thoại này tồn tại để người dùng thấy TRƯỚC cái gì sẽ vào, cái gì không, và trùng ở
 * đâu — thay vì bấm import rồi mới đọc một bảng lỗi. Thiết bị hoặc node hierarchy đã có
 * buộc người dùng chọn chính node đó trên cây trước khi mở lại file:
 *
 *   trùng node/thiết bị  -> CHẶN, chọn đúng node rồi import lại
 *   không trùng          -> tạo hierarchy còn thiếu và import
 */
export default {
    name: 'PtmImportDialog',
    props: {
        visible:   { type: Boolean, default: false },
        /** { job, asset, tests: [{name,rows,series,dataPoints}], skipped: [{name,reason}] } */
        preview:   { type: Object, default: null },
        /** Kết quả findDuplicateAsset: { inTarget, elsewhere, matchedOn, skippedCheck } */
        dup:       { type: Object, default: null },
        /** Job trùng TÊN dưới thiết bị đích: [{ mrid, name, executionDate, testedBy }] */
        jobDup:    { type: Array, default: () => [] },
        jobDupError: { type: String, default: '' },
        targetLabel: { type: String, default: '' },
        fileName:  { type: String, default: '' },
        importing: { type: Boolean, default: false },
    },
    data() {
        return {
            // Merge là mặc định an toàn: test mới được thêm, test trùng mặc định giữ bản cũ.
            // Ghi đè toàn job vẫn còn nhưng người dùng phải chủ động chọn.
            jobAction: 'merge',
            targetJobMrid: '',
            testDecisions: {},
        }
    },
    computed: {
        isCircuitBreaker() {
            return !!(this.preview && this.preview.assetType === 'CircuitBreaker')
        },

        isCurrentTransformer() {
            return !!(this.preview && this.preview.assetType === 'CurrentTransformer')
        },

        isTransformer() {
            return !!(this.preview && this.preview.assetType === 'Transformer')
        },

        sourceLabel() {
            return (this.preview && this.preview.sourceLabel) || 'PTM'
        },

        asset() {
            return (this.preview && this.preview.asset) || {}
        },

        tests() {
            return (this.preview && this.preview.tests) || []
        },

        skipped() {
            return (this.preview && this.preview.skipped) || []
        },

        /**
         * `preview.creatingAsset` đã tính đúng ở tầng dựng xem trước — nó đã xét cả việc có
         * thiết bị trùng trong nhánh hay không. Ở đây chỉ đọc lại, không tính lại: trước đó
         * tôi tính lại và hai bên lệch nhau.
         *
         * Vẫn ẩn khi trùng ở nhánh khác, vì lúc đó import bị chặn hoàn toàn.
         */
        willCreateAsset() {
            if (!this.preview || !this.preview.creatingAsset) return false
            if (this.dup && this.dup.elsewhere && this.dup.elsewhere.length > 0) return false
            return true
        },

        newAssetName() {
            const a = this.asset
            const fromFile = String(a.apparatusId || a.assetSystemCode || '').trim()
            if (fromFile) return fromFile
            const bits = [a.manufacturer, a.manufacturerType, a.serialNumber]
            return bits.map(b => String(b || '').trim()).filter(Boolean).join(' ') ||
                (this.isCircuitBreaker
                    ? `Circuit breaker from ${this.sourceLabel}`
                    : (this.isTransformer
                        ? `Transformer from ${this.sourceLabel}`
                        : `CT from ${this.sourceLabel}`))
        },

        assetConfigurationSummary() {
            if (this.isTransformer) {
                const profile = this.asset.transformerProfile || {}
                const windings = profile.windings || []
                const tapChanger = windings.map(winding => winding.tapChanger).find(Boolean)
                const parts = []
                if (profile.numberOfPhases) parts.push(`${profile.numberOfPhases} phase(s)`)
                if (windings.length) parts.push(`${windings.length} winding(s)`)
                if (profile.vectorGroup) parts.push(profile.vectorGroup)
                if (tapChanger) parts.push(`${tapChanger.type || 'tap changer'}, ${(tapChanger.taps || []).length} tap(s)`)
                return parts.join(', ') || 'not available in this file'
            }
            const raw = this.asset.raw || {}
            const value = (key) => raw[key] && raw[key].value
            const parts = []
            if (value('NumberOfPhases')) parts.push(`${value('NumberOfPhases')} phase(s)`)
            if (value('NumberOfInterruptersPerPhase')) {
                parts.push(`${value('NumberOfInterruptersPerPhase')} interrupter(s) per phase`)
            }
            const mechanism = this.preview && this.preview.operatingMechanism
            const mechanismType = mechanism && mechanism.raw && mechanism.raw.Type && mechanism.raw.Type.value
            if (mechanismType) parts.push(`${mechanismType} mechanism`)
            return parts.join(', ') || 'not available in this file'
        },

        coreSummary() {
            const cfg = this.preview && this.preview.coreConfig && this.preview.coreConfig.config
            if (!cfg) return 'not available in this file'
            const taps = (cfg.dataCT || []).map(c => c.taps).join('/')
            return `${cfg.cores} core(s), ${taps} tap terminal(s) per core`
        },

        coreNotes() {
            return (this.preview && this.preview.coreConfig && this.preview.coreConfig.notes) || []
        },
        /** Trùng ở nhánh khác thì KHÔNG cho import — người dùng phải xử lý trước. */
        canImport() {
            if (!this.preview) return false
            if (this.dup && this.dup.elsewhere && this.dup.elsewhere.length > 0) return false
            if (this.tests.length === 0) return false
            if (this.jobDup.length > 0 && this.jobAction === 'merge') {
                if (!this.selectedJob || this.selectedJob.loadError) return false
                return this.mergeChangeCount > 0
            }
            return true
        },

        /** Nút phải nói đúng việc nó sắp làm — 'Import' khi sắp ghi đè là nói thiếu. */
        importLabel() {
            if (this.jobDup.length > 0) {
                if (this.jobAction === 'merge') return `Merge ${this.mergeChangeCount} test(s)`
                return this.jobAction === 'overwrite' ? 'Overwrite job' : 'Skip'
            }
            return 'Import'
        },

        selectedJob() {
            return this.jobDup.find(job => job.mrid === this.targetJobMrid) || null
        },

        showMergeDecisions() {
            return this.jobDup.length > 0 && this.jobAction === 'merge' && !!this.selectedJob
        },

        mergeRows() {
            const existingTests = (this.selectedJob && this.selectedJob.tests) || []
            return this.tests.map(test => ({
                ...test,
                matches: existingTests.filter(existing => existing.testTypeCode === test.testTypeCode),
            }))
        },

        mergeChangeCount() {
            if (!this.showMergeDecisions) return 0
            return this.mergeRows.reduce((count, row) => {
                if (row.matches.length === 0) return count + 1
                const decision = this.testDecisions[row.importIndex]
                return decision && decision.action !== 'keep' ? count + 1 : count
            }, 0)
        },
    },
    watch: {
        visible(open) {
            if (!open) return
            // Đặt lại mỗi lần mở: lần import trước chọn 'overwrite' thì lần này không được
            // mang theo lựa chọn đó, vì file và node đã khác.
            this.jobAction = 'merge'
            this.targetJobMrid = (this.jobDup[0] && this.jobDup[0].mrid) || ''
            this.resetTestDecisions()
        },
        targetJobMrid() {
            this.resetTestDecisions()
        },
    },
    methods: {
        shortDate(value) {
            const m = String(value || '').match(/^(\d{4}-\d{2}-\d{2})/)
            return m ? m[1] : (value || '—')
        },
        resetTestDecisions() {
            const next = {}
            for (const row of this.mergeRows) {
                next[row.importIndex] = {
                    action: 'keep',
                    targetMrid: (row.matches[0] && row.matches[0].mrid) || '',
                }
            }
            this.testDecisions = next
        },
        existingTestLabel(test) {
            const name = test.name || test.testTypeName || test.testTypeCode
            return `${name} (#${test.occurrence})`
        },
        confirmImport() {
            const testDecisions = Object.keys(this.testDecisions).map(key => ({
                importIndex: Number(key),
                action: this.testDecisions[key].action,
                targetMrid: this.testDecisions[key].targetMrid,
            }))
            this.$emit('confirm', {
                jobAction: this.jobAction,
                targetJobMrid: this.targetJobMrid,
                testDecisions,
            })
        },
    },
}
</script>

<style scoped>
.ptm-empty { padding: 24px; text-align: center; color: #909399; font-size: 13px; }

.ptm-section { margin-bottom: 14px; }

.ptm-head {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 6px;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 4px;
}
.ptm-sub { font-weight: 400; color: #909399; margin-left: 8px; font-size: 12px; }

.ptm-row { display: flex; font-size: 12px; padding: 2px 0; }
.ptm-row .k { width: 150px; flex: none; color: #909399; }
.ptm-row .v { color: #303133; word-break: break-word; }

.ptm-alert { margin-bottom: 14px; }
.ptm-list { margin: 6px 0 0; padding-left: 18px; font-size: 12px; }
.ptm-list em { color: #909399; font-style: normal; }
.ptm-job-targets { display: block; margin-top: 6px; }
.ptm-job-targets >>> .el-radio { display: block; margin: 5px 0 0; }
.ptm-job-targets em { color: #909399; font-style: normal; }
.ptm-hint { margin-top: 6px; font-size: 12px; color: #909399; }

.ptm-radio { display: block; margin-top: 8px; }
.ptm-radio >>> .el-radio { display: block; margin: 4px 0 0; }
.ptm-action-select { width: 100%; }
.ptm-muted { color: #909399; font-size: 12px; }

.ptm-skip { margin-top: 8px; }
.ptm-skip-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 12px;
    color: #606266;
    padding: 2px 0;
}
.ptm-skip-row i { color: #e6a23c; }
.ptm-reason { color: #909399; }
</style>
