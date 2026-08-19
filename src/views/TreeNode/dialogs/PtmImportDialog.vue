<template>
    <el-dialog
        title="Import PTM file"
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
                <div class="ptm-row"><span class="k">Serial number</span><span class="v">{{ asset.serialNumber || '—' }}</span></div>
                <div class="ptm-row"><span class="k">Manufacturer</span><span class="v">{{ asset.manufacturer || '—' }}</span></div>
                <div class="ptm-row"><span class="k">Manufacturer type</span><span class="v">{{ asset.manufacturerType || '—' }}</span></div>
                <div class="ptm-row"><span class="k">Import into</span><span class="v">{{ targetLabel }}</span></div>
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
                <div class="ptm-row"><span class="k">Core configuration</span><span class="v">{{ coreSummary }}</span></div>
                <ul v-if="coreNotes.length" class="ptm-list">
                    <li v-for="(n, i) in coreNotes" :key="'cn' + i">{{ n }}</li>
                </ul>
                <div class="ptm-hint">
                    "In use" is ticked for taps that were actually measured — the file has no such flag,
                    so check it before saving.
                </div>
            </el-alert>

            <!-- ─── Kết quả đối chiếu trùng ───────────────────────────────── -->
            <el-alert v-if="dup && dup.skippedCheck" type="warning" :closable="false" show-icon
                      title="Cannot check for duplicates"
                      description="This asset has no serial number, so it cannot be matched against existing assets."
                      class="ptm-alert" />

            <el-alert v-else-if="dup && dup.elsewhere.length > 0" type="error" :closable="false" show-icon
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

            <!--
              Chỉ hỏi về THIẾT BỊ khi người dùng KHÔNG đứng ở chính thiết bị đó. Đứng ở
              thiết bị nào là đã chọn nó rồi — hỏi thêm "ghi đè hay giữ nguyên" là bắt trả
              lời một câu mà câu trả lời đã nằm trong hành động chọn node.
            -->
            <el-alert v-else-if="askAboutAsset" type="warning" :closable="false" show-icon
                      title="This asset already exists here" class="ptm-alert">
                <div>Matched on {{ dup.matchedOn.join(' + ') }}. Choose what to do:</div>
                <el-radio-group v-model="assetAction" class="ptm-radio">
                    <el-radio label="overwrite">Overwrite the existing asset, attach the job to it</el-radio>
                    <el-radio label="skip">Leave the asset as it is, attach the job to it</el-radio>
                </el-radio-group>
            </el-alert>

            <!-- ─── Job trùng tên dưới đúng thiết bị đích ─────────────────── -->
            <el-alert v-if="jobDup && jobDup.length > 0" type="warning" :closable="false" show-icon
                      title="A job with this name already exists on this asset" class="ptm-alert">
                <ul class="ptm-list">
                    <li v-for="j in jobDup" :key="j.mrid">
                        {{ j.name }}
                        <em v-if="j.executionDate">— tested {{ j.executionDate }}</em>
                        <em v-if="j.testedBy"> by {{ j.testedBy }}</em>
                    </li>
                </ul>
                <el-radio-group v-model="jobAction" class="ptm-radio">
                    <el-radio label="overwrite">Overwrite it — replace the test data, keep the same job</el-radio>
                    <el-radio label="skip">Skip — do not import this job</el-radio>
                </el-radio-group>
                <!--
                  Nói rõ ghi đè LÀM GÌ. "Overwrite" một mình thì người dùng không biết là
                  thay cả job hay chỉ bổ sung, mà hai cái đó hậu quả khác nhau hẳn.
                -->
                <div class="ptm-hint">
                    Overwriting keeps the same job entry, so it stays linked to the server. Test data
                    inside it is replaced by the file — measurements not in the file are removed.
                </div>
            </el-alert>

            <el-alert v-if="jobDupError" type="warning" :closable="false" show-icon
                      title="Could not check for existing jobs" class="ptm-alert">
                <div>{{ jobDupError }} — importing may create a second job with the same name.</div>
            </el-alert>

            <!-- ─── Bài test ──────────────────────────────────────────────── -->
            <div class="ptm-section">
                <div class="ptm-head">
                    Tests
                    <span class="ptm-sub">{{ preview.tests.length }} will be imported,
                        {{ preview.skipped.length }} skipped</span>
                </div>

                <el-table v-if="preview.tests.length" :data="preview.tests" size="mini" border max-height="180">
                    <el-table-column prop="name" label="Test" min-width="150" />
                    <el-table-column prop="rows" label="Rows" width="70" align="right" />
                    <el-table-column prop="curves" label="Curves" width="80" align="right" />
                    <el-table-column prop="points" label="Curve points" width="110" align="right" />
                </el-table>

                <!--
                  Bài bị bỏ vẫn LIỆT KÊ ĐỦ kèm lý do. Bỏ im lặng thì người dùng tưởng file
                  chỉ có bấy nhiêu bài, và không bao giờ biết mình mất gì.
                -->
                <div v-if="preview.skipped.length" class="ptm-skip">
                    <div v-for="(s, i) in preview.skipped" :key="i" class="ptm-skip-row">
                        <i class="el-icon-warning-outline"></i>
                        <b>{{ s.name }}</b><span class="ptm-reason">{{ s.reason }}</span>
                    </div>
                </div>
            </div>
        </template>

        <span slot="footer">
            <el-button @click="$emit('close')">Cancel</el-button>
            <el-button type="primary" :disabled="!canImport" :loading="importing"
                       @click="$emit('confirm', { assetAction, jobAction })">
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
 * đâu — thay vì bấm import rồi mới đọc một bảng lỗi. Ba tình huống trùng cho ra ba hành
 * vi khác nhau, đúng luật đã chốt:
 *
 *   trùng ở nhánh khác   -> CHẶN, phải xử lý trước
 *   trùng ngay tại đây   -> cho chọn ghi đè / bỏ qua
 *   không trùng          -> import thẳng
 */
export default {
    name: 'PtmImportDialog',
    props: {
        visible:   { type: Boolean, default: false },
        /** { job, asset, tests: [{name,rows,curves,points}], skipped: [{name,reason}] } */
        preview:   { type: Object, default: null },
        /** Kết quả findDuplicateAsset: { inTarget, elsewhere, matchedOn, skippedCheck } */
        dup:       { type: Object, default: null },
        /** Job trùng TÊN dưới thiết bị đích: [{ mrid, name, executionDate, testedBy }] */
        jobDup:    { type: Array, default: () => [] },
        jobDupError: { type: String, default: '' },
        /** true khi người dùng đang đứng ở chính thiết bị đích. */
        onAssetNode: { type: Boolean, default: false },
        targetLabel: { type: String, default: '' },
        fileName:  { type: String, default: '' },
        importing: { type: Boolean, default: false },
    },
    data() {
        return {
            // Thiết bị: mặc định 'overwrite' — nếu đã hỏi tới thì ý định gần như chắc chắn
            // là cập nhật thông số từ file vừa đo.
            assetAction: 'overwrite',
            // Job: mặc định 'skip'. KHÁC thiết bị, và cố ý.
            //
            // Ghi đè job là thay dữ liệu đo và xoá bài test không còn trong file. Ai bấm
            // Import theo phản xạ mà không đọc thì mất số liệu cũ. Mặc định phải là lựa chọn
            // KHÔNG mất gì; muốn ghi đè thì phải tự tay chọn.
            jobAction: 'skip',
        }
    },
    computed: {
        asset() {
            return (this.preview && this.preview.asset) || {}
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
            return bits.map(b => String(b || '').trim()).filter(Boolean).join(' ') || 'CT from PTM'
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
            return this.preview.tests.length > 0
        },

        /**
         * Có hỏi về thiết bị không.
         *
         * KHÔNG hỏi khi người dùng đứng ở chính thiết bị đó: chọn node đã là câu trả lời.
         * Vẫn hỏi khi đứng ở bay/trạm mà tìm thấy thiết bị trùng trong nhánh đó — ở đó
         * thiết bị chưa được chọn tường minh, nên câu hỏi mới có nghĩa.
         */
        askAboutAsset() {
            if (this.onAssetNode) return false
            return !!(this.dup && this.dup.inTarget && this.dup.inTarget.length > 0)
        },

        /** Nút phải nói đúng việc nó sắp làm — 'Import' khi sắp ghi đè là nói thiếu. */
        importLabel() {
            if (this.jobDup.length > 0) {
                return this.jobAction === 'overwrite' ? 'Overwrite job' : 'Skip'
            }
            return 'Import'
        },
    },
    watch: {
        visible(open) {
            if (!open) return
            // Đặt lại mỗi lần mở: lần import trước chọn 'overwrite' thì lần này không được
            // mang theo lựa chọn đó, vì file và node đã khác.
            this.assetAction = 'overwrite'
            this.jobAction = 'skip'
        },
    },
    methods: {
        shortDate(value) {
            const m = String(value || '').match(/^(\d{4}-\d{2}-\d{2})/)
            return m ? m[1] : (value || '—')
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
.ptm-hint { margin-top: 6px; font-size: 12px; color: #909399; }

.ptm-radio { display: block; margin-top: 8px; }
.ptm-radio >>> .el-radio { display: block; margin: 4px 0 0; }

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
